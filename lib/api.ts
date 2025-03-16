// fetchGlobalData.ts

import axiosInstance from '@/lib/axiosInstance';
import { AxiosError } from "axios";
import { FooterData, SeoData, NavbarData } from "@/types/global";

interface GlobalResponse {
  footer: FooterData;
  defaultSeo: SeoData;
  navbar: NavbarData;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to build a query string for Strapi
function buildStrapiQuery(query: { [key: string]: unknown }): string {
  const params = new URLSearchParams();

  // Handle arrays (e.g., populate fields) properly.
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(`${key}[]`, item));
    } else {
      params.append(key, value as string);
    }
  });

  return params.toString();
}

async function fetchAPIWithRetry(endpoint: string, retries = MAX_RETRIES) {
  try {
    const res = await axiosInstance.get(endpoint, { 
      timeout: 10000,
      headers: {
        'Accept': 'application/json'
      }
    });
    return res.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    // Retry logic for connection and timeout errors, as well as 503/504 status codes
    if (retries > 0 && (
      axiosError.code === 'ECONNRESET' ||
      axiosError.code === 'ETIMEDOUT' ||
      axiosError.response?.status === 503 ||
      axiosError.response?.status === 504
    )) {
      console.warn(`Retrying ${endpoint}, attempts left: ${retries}`);
      await delay(RETRY_DELAY);
      return fetchAPIWithRetry(endpoint, retries - 1);
    }

    // Error handling: Log detailed error info and throw
    console.error(`API Error [${endpoint}]:`, {
      code: axiosError.code,
      status: axiosError.response?.status
    });
    
    throw new Error(`Failed to fetch ${endpoint}${retries === 0 ? ' (Max retries)' : ''}`);
  }
}

export async function fetchGlobalData(): Promise<GlobalResponse> {
  const populateFields = [
    "footer",
    "footer.social_media_links",
    "footer.policy_links.link",
    "seo",
    "seo.metaImage",
    "navbar",
    "navbar.left_navbar_items.child_items",
    "navbar.right_navbar_items",
    "navbar.sub_navbar.image",
  ];

  try {
    const query = buildStrapiQuery({ populate: populateFields });
    const data = await fetchAPIWithRetry(`/api/global?${query}`);

    if (!data?.data) throw new Error('Invalid API response structure');
    
    return {
      footer: data.data.footer,
      defaultSeo: data.data.seo,
      navbar: data.data.navbar,
    };
  } catch (error) {
    console.error('Global data fetch error:', error);
    throw new Error('Failed to load global content');
  }
}

export async function submitContactForm(formData: {
  name: string;
  gmail: string;
  phone: string;
  topic: string;
  description: string;
}) {
  const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
  
  try {
    const response = await fetch(`${apiUrl}/api/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add Authorization header if needed for your API
        // 'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: formData
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to submit form');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting contact form:', error);
    throw error;
  }
}
