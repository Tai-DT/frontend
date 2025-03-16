import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ProjectData } from "@/types/projects";
import { getStrapiImageUrl } from '@/lib/imageUrl';
import axiosInstance from '@/lib/axiosInstance';
import { Metadata } from 'next';
import { AxiosError } from 'axios';

// SEO interfaces
interface SEOData {
  id: number;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  metaRobots: string;
  structuredData: Record<string, unknown>;
  metaViewport: string;
  canonicalURL: string;
}

interface ProjectsPageData {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  SEO: SEOData;
}

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

async function fetchWithRetry<T>(
  url: string,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (retries > 0 && (
      axiosError.code === 'ECONNRESET' ||
      axiosError.code === 'ETIMEDOUT' ||
      axiosError.response?.status === 503 ||
      axiosError.response?.status === 504
    )) {
      console.warn(`Retrying request to ${url}. Attempts remaining: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, INITIAL_RETRY_DELAY));
      return fetchWithRetry(url, retries - 1);
    }

    console.error('Request failed:', {
      url,
      error: axiosError.message,
      code: axiosError.code,
      retries
    });
    throw error;
  }
}

// Generate structured data from projects
function generateStructuredData(projects: ProjectData[]): Record<string, unknown> {
  // Create an ItemList structured data
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Dự Án Âm Thanh Đã Hoàn Thành - Audio Tài Lộc",
    "description": "Khám phá loạt dự án âm thanh & karaoke đã hoàn thiện, minh chứng cho năng lực thi công chuyên nghiệp",
    "numberOfItems": projects.length,
    "itemListElement": projects.map((project, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Service",
        "name": project.name,
        "description": project.description,
        "image": project.image && project.image.length > 0 ? getStrapiImageUrl(project.image[0].url) : "",
        "url": `https://audiotailoc.com/projects/${project.slug}`,
        "provider": {
          "@type": "Organization",
          "name": "Audio Tài Lộc",
          "url": "https://audiotailoc.com"
        },
        "offers": project.price ? {
          "@type": "Offer",
          "price": project.price,
          "priceCurrency": "VND"
        } : undefined
      }
    }))
  };
}

// Enhanced function to fetch and process SEO data
async function getSEOData(): Promise<SEOData | null> {
  try {
    const response = await fetchWithRetry<{ 
      data: ProjectsPageData 
    }>('/api/projects-page?populate=*');
    
    // Check if data and SEO exist in the response
    if (!response.data || !response.data.SEO) {
      console.warn('Projects page SEO data structure is not as expected:', response);
      return null;
    }
    
    return response.data.SEO;
  } catch (error) {
    console.error('Error fetching projects page SEO data:', error);
    return null;
  }
}

// Fetch projects data
async function fetchProjects(): Promise<ProjectData[]> {
  try {
    const response = await axiosInstance.get('/api/projects?populate=*');
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

// Dynamic metadata generation
export async function generateMetadata(): Promise<Metadata> {
  const [seoData, projects] = await Promise.all([
    getSEOData(),
    fetchProjects()
  ]);
  
  // Generate structured data from projects
  const structuredData = generateStructuredData(projects);
  
  // Return metadata from the API with generated structured data
  return {
    title: seoData?.metaTitle,
    description: seoData?.metaDescription,
    keywords: seoData?.keywords,
    robots: seoData?.metaRobots,
    alternates: {
      canonical: seoData?.canonicalURL || '/projects'
    },
    // Add our generated structured data
    other: {
      'script:ld+json': JSON.stringify(structuredData)
    }
  };
}

// Add separate viewport export
export async function generateViewport() {
  const seoData = await getSEOData();
  
  return {
    viewport: seoData?.metaViewport || 'width=device-width, initial-scale=1'
  };
}

export const revalidate = 60; // Revalidate data every 60 seconds

const ProjectsPage = async () => {
  const projects = await fetchProjects();

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-8">
        Không thể tải danh sách dự án. Vui lòng thử lại sau.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Enhanced SEO heading with more descriptive text */}
      <header className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
          Dự Án Âm Thanh Nổi Bật - Audio Tài Lộc
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Khám phá các dự án thiết kế và lắp đặt âm thanh chuyên nghiệp mà chúng tôi đã thực hiện.
          Từ phòng karaoke, hội trường đến hệ thống âm thanh sân khấu và giải trí tại gia.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.slug}`}
            className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-xl transition-shadow duration-300 ease-in-out"
          >
            <div className="relative overflow-hidden aspect-w-16 aspect-h-9">
              {project.image && project.image.length > 0 ? (
                <Image
                  src={getStrapiImageUrl(project.image[0].url) || "/placeholder-project-list.png"}
                  alt={project.image[0].alternativeText || project.name}
                  width={500}
                  height={341}
                  className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Không có hình ảnh</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-1 group-hover:text-indigo-600">
                {project.name}
              </h2>
              <p className="text-gray-700 line-clamp-2">{project.description}</p>
              {project.price && (
                <p className="mt-2 text-indigo-600 font-semibold">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(project.price)}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;