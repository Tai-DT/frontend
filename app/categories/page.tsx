// app/categories/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package2 } from 'lucide-react';
import { categoryService } from '@/lib/apiCategory';
import { getStrapiImageUrl } from '@/lib/imageUrl';
import { AxiosError } from 'axios';
import axiosInstance from '@/lib/axiosInstance';

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

interface CategoriesPageData {
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


// Create a fallback implementation for when the Categories Page API endpoint isn't available
async function fetchCategoriesPage() {
  try {
    // First attempt - standard API path for single types
    const response = await fetchWithRetry<{ data: CategoriesPageData }>(
      '/api/categorie-page?populate=SEO'
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching categories page:', error);
    try {
      // Second attempt - alternative API path (could be a collection type)
      const altResponse = await fetchWithRetry<{ data: CategoriesPageData[] }>(
        '/api/categorie-pages?populate=SEO'
      );
      return altResponse.data?.[0];
    } catch (secondError) {
      console.error('Both API attempts failed for categories page', secondError);
      return null;
    }
  }
}

// Dynamic metadata generation
export async function generateMetadata(): Promise<Metadata> {
  // Try to get categories page data first
  const categoriesPage = await fetchCategoriesPage();
  const seoData = categoriesPage?.SEO || null;
  
  // Default metadata if SEO data cannot be fetched
  const defaultMetadata: Metadata = {
    title: 'Tất cả danh mục - CAudio',
    description: 'Xem danh sách tất cả các danh mục sản phẩm tại CAudio',
    alternates: {
      canonical: '/categories'
    }
  };

  if (!seoData) {
    console.log('Using default metadata - SEO data not available');
    return defaultMetadata;
  }

  // Return dynamic metadata from the API
  return {
    title: seoData.metaTitle || defaultMetadata.title,
    description: seoData.metaDescription || defaultMetadata.description,
    keywords: seoData.keywords || undefined,
    robots: seoData.metaRobots || undefined,
    alternates: {
      canonical: seoData.canonicalURL || '/categories'
    },
    // Add structured data if available
    ...(seoData.structuredData && Object.keys(seoData.structuredData).length > 0 && {
      other: {
        'script:ld+json': JSON.stringify(seoData.structuredData),
      },
    }),
  };
}

// Add separate viewport export
export async function generateViewport() {
  const categoriesPage = await fetchCategoriesPage();
  const seoData = categoriesPage?.SEO || null;
  
  return {
    viewport: seoData?.metaViewport || 'width=device-width, initial-scale=1'
  };
}

export default async function AllCategoriesPage() {
  const categories = await categoryService.getAll();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-red-600">Danh Mục Sản Phẩm</h1>

      <Card className="border border-yellow-200">
        <CardHeader className="bg-yellow-50">
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Package2 className="w-5 h-5 text-yellow-600" />
            Danh Sách Danh Mục
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:bg-yellow-50"
                >
                  <div className="relative w-6 h-6 flex-shrink-0">
                    <Image
                      src={getStrapiImageUrl(category.icon?.url) || '/default-image.png'}
                      alt={category.name}
                      fill
                      className="object-contain"
                      sizes="24px"
                    />
                  </div>
                  <span className="truncate">{category.name}</span>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}