import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getStrapiImageUrl } from '@/lib/imageUrl';
import { AxiosError } from 'axios';
import axiosInstance from '@/lib/axiosInstance';
import { Button } from '@/components/ui/button';

// Types
interface ImageFormat {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  size: number;
  width: number;
  height: number;
}

interface ImageData {
  id: number;
  name: string;
  url: string;
  formats?: {
    small?: ImageFormat;
    thumbnail?: ImageFormat;
  };
}

interface ServiceDetail {
  id: number;
  name: string;
  description: string;
  id_youtube_video: string;
  price: string;
}

interface Service {
  id: number;
  name: string;
  slug: string;
  description: string;
  id_youtube_video: string;
  image: ImageData[];
  details: ServiceDetail[];
}

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

interface ServicesPageData {
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

// Generate structured data from services
function generateStructuredData(services: Service[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Dịch Vụ Âm Thanh - Audio Tài Lộc",
    "description": "Cung cấp dịch vụ sửa chữa, cho thuê, thi công lắp đặt và thanh lý dàn karaoke chuyên nghiệp.",
    "numberOfItems": services.length,
    "itemListElement": services.map((service, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Service",
        "name": service.name,
        "description": service.description,
        "image": service.image && service.image.length > 0 ? getStrapiImageUrl(service.image[0].url) : "",
        "url": `https://audiotailoc.com/services/${service.slug}`,
        "provider": {
          "@type": "Organization",
          "name": "Audio Tài Lộc",
          "url": "https://audiotailoc.com"
        },
        "serviceOutput": {
          "@type": "Thing",
          "name": `Hệ thống ${service.name} âm thanh chuyên nghiệp`
        },
        "serviceType": `Dịch vụ ${service.name} âm thanh`
      }
    }))
  };
}

async function getServices(): Promise<Service[]> {
  try {
    const response = await fetchWithRetry<{ data: Service[] }>('/api/services?populate=*');
    return response.data;
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

async function getSEOData(): Promise<SEOData | null> {
  try {
    const response = await fetchWithRetry<{ data: ServicesPageData }>('/api/services-page?populate=*');
    
    // Check if data and SEO exist in the response
    if (!response.data || !response.data.SEO) {
      console.warn('SEO data structure is not as expected:', response);
      return null;
    }
    
    return response.data.SEO;
  } catch (error) {
    console.error('Error fetching SEO data:', error);
    return null;
  }
}

// Dynamic metadata generation
export async function generateMetadata(): Promise<Metadata> {
  const [seoData, services] = await Promise.all([
    getSEOData(),
    getServices()
  ]);
  
  // Generate structured data from services
  const structuredData = generateStructuredData(services);
  
  // Return metadata from the API with generated structured data
  return {
    title: seoData?.metaTitle,
    description: seoData?.metaDescription,
    keywords: seoData?.keywords,
    robots: seoData?.metaRobots,
    alternates: {
      canonical: seoData?.canonicalURL || '/services'
    },
    // Add structured data
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

export default async function ServicesPage() {
  const services = await getServices();

  // Show a fallback UI if no services are available
  if (!services.length) {
    return (
      <main className="min-h-screen bg-gray-50">
        <section className="bg-white py-12 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Dịch Vụ Âm Thanh Chuyên Nghiệp - Audio Tài Lộc
            </h1>
            <p className="text-lg text-gray-600 mx-auto max-w-3xl">
              Hiện tại chúng tôi đang cập nhật danh sách dịch vụ. Vui lòng quay lại sau hoặc liên hệ với chúng tôi để được tư vấn trực tiếp.
            </p>
            <Link
              href="/contact"
              className="inline-block mt-8 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Liên Hệ Ngay
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-yellow-50">
      {/* Hero Section - Enhanced with new design */}
      <section className="bg-gradient-to-r from-red-700 to-yellow-600 py-16 md:py-24 text-white relative">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-pattern-overlay"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Dịch Vụ Âm Thanh Chuyên Nghiệp
          </h1>
          <p className="text-lg md:text-xl text-yellow-100 max-w-3xl mx-auto mb-8">
            Chúng tôi cung cấp đa dạng các dịch vụ âm thanh chất lượng cao từ tư vấn, lắp đặt, 
            cho thuê đến bảo trì hệ thống âm thanh chuyên nghiệp cho gia đình và doanh nghiệp.
          </p>
          <Button 
            className="bg-white text-red-700 hover:bg-yellow-50 font-bold px-8 py-6 rounded-full shadow-lg transform transition hover:scale-105"
          >
            Khám phá ngay
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-yellow-50 clip-wave"></div>
      </section>

      {/* Breadcrumb navigation for better SEO */}
      <div className="container mx-auto px-4 py-6">
        <nav className="text-sm text-red-700">
          <ol className="flex flex-wrap">
            <li className="flex items-center">
              <Link href="/" className="hover:text-yellow-700 transition-colors">
                Trang chủ
              </Link>
              <span className="mx-2 text-yellow-600">/</span>
            </li>
            <li className="text-yellow-700 font-medium">
              Dịch vụ
            </li>
          </ol>
        </nav>
      </div>

      {/* Services Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Link href={`/services/${service.slug}`} key={service.id}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-yellow-200">
                  <CardHeader>
                    {service.image?.[0] && (
                      <div className="relative w-full h-48 mb-4 overflow-hidden rounded-t">
                        <Image
                          src={getStrapiImageUrl(service.image[0].url) || "/placeholder-service.png"}
                          alt={service.name}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <CardTitle className="text-xl text-red-700">{service.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 line-clamp-3">{service.description}</p>
                    <div className="mt-4">
                      {service.details.length > 0 && (
                        <p className="text-sm text-gray-500">
                          {service.details.length} service options available
                        </p>
                      )}
                      <span className="inline-block mt-2 text-yellow-600 hover:text-yellow-700">
                        Learn more →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section> 
    </main>
  );
}