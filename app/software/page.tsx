import { Metadata } from 'next';
import axiosInstance from '@/lib/axiosInstance';
import { Service } from '@/types/services';
import { AxiosError } from 'axios';
import HeroSection from '@/components/software/HeroSection';
import SoftwareGrid from '@/components/software/SoftwareGrid';
import ContactSection from '@/components/software/ContactSection';
import { getStrapiImageUrl } from '@/lib/imageUrl';

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

interface SoftwaresPageData {
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

async function getSEOData(): Promise<SEOData | null> {
  try {
    const response = await fetchWithRetry<{ 
      data: SoftwaresPageData 
    }>('/api/softwares-page?populate=*');
    
    // Check if data and SEO exist in the response
    if (!response.data || !response.data.SEO) {
      console.warn('Software page SEO data structure is not as expected:', response);
      return null;
    }
    
    return response.data.SEO;
  } catch (error) {
    console.error('Error fetching software page SEO data:', error);
    return null;
  }
}

// Generate structured data from software list
function generateStructuredData(softwares: Service[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Phần Mềm Âm Thanh Chuyên Nghiệp - Audio Tài Lộc",
    "description": "Khám phá các phần mềm điều khiển vang số, mixer, phân tích âm thanh, tối ưu hệ thống karaoke và sân khấu.",
    "numberOfItems": softwares.length,
    "itemListElement": softwares.map((software, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "SoftwareApplication",
        "name": software.name,
        "description": software.description,
        "image": software.image && software.image.length > 0 ? getStrapiImageUrl(software.image[0].url) : "",
        "url": `https://audiotailoc.com/software/${software.slug}`,
        "applicationCategory": "MusicApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "VND"
        },
        "operatingSystem": "Windows, macOS",
        "softwareVersion": "Latest"
      }
    }))
  };
}

// Fetch software data
async function getSoftwares(): Promise<Service[]> {
  try {
    const response = await axiosInstance.get<{ data: Service[] }>('/api/softwares?populate=*');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching software data:', error);
    return [];
  }
}

// Dynamic metadata generation
export async function generateMetadata(): Promise<Metadata> {
  const [seoData, softwares] = await Promise.all([
    getSEOData(),
    getSoftwares()
  ]);
  
  // Generate structured data from software list
  const structuredData = generateStructuredData(softwares);
  
  // Return metadata from the API with generated structured data
  return {
    title: seoData?.metaTitle,
    description: seoData?.metaDescription,
    keywords: seoData?.keywords,
    robots: seoData?.metaRobots,
    alternates: {
      canonical: seoData?.canonicalURL || '/software'
    },
    // Add the generated structured data
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

async function getServices(): Promise<Service[]> {
  try {
    const response = await axiosInstance.get<{ data: Service[] }>('/api/softwares?populate[0]=seo&populate[1]=details&populate[2]=image');
    return response.data.data;
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu dịch vụ:', error);
    return [];
  }
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <main className="min-h-screen bg-yellow-50">
      {/* Client components with animations */}
      <HeroSection />
      <SoftwareGrid services={services} />
      <ContactSection />
    </main>
  );
}

// Add this to your global CSS
// .clip-wave {
//   clip-path: polygon(0% 0%, 300% 0%, 0% 100%);
// }