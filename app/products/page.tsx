import React from 'react';
import { ProductCard } from '@/components/ProductCard';
import { Card, CardContent } from '@/components/ui/card';
import { Metadata } from 'next';
import { Product, Category, ProductResponse, CategoryResponse } from '@/types/products';
import axiosInstance from '@/lib/axiosInstance';
import { PackageSearch } from 'lucide-react';
import { CategorySidebar } from '@/./components/CategorySidebar';
import { MobileCategoryNav } from '@/./components/MobileCategoryNav';
import { AxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

interface ProductPageData {
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

// Create function to generate structured data for products collection
function generateStructuredData(products: Product[]): Record<string, unknown> {
  // Create an ItemList structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Danh sách sản phẩm âm thanh Audio Tài Lộc",
    "description": "Khám phá toàn bộ thiết bị âm thanh: loa karaoke, micro, mixer, dàn karaoke chính hãng",
    "numberOfItems": products.length,
    "itemListElement": products.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": product.name,
        "description": product.description || `Sản phẩm ${product.name} chính hãng tại Audio Tài Lộc`,
        "sku": product.product_code || "",
        "brand": {
          "@type": "Brand",
          "name": product.category?.name || "Audio Tài Lộc"
        },
        "image": product.image?.[0]?.url || "",
        "url": `https://audiotailoc.com/products/${product.slug}`,
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": "VND",
          "availability": "https://schema.org/InStock",
          "url": `https://audiotailoc.com/products/${product.slug}`
        }
      }
    }))
  };

  return structuredData;
}

// Enhanced function to fetch and process SEO data
async function fetchProductPageSEO(): Promise<ProductPageData | null> {
  try {
    // First try the correct endpoint based on the API response provided
    const response = await fetchWithRetry<{ data: ProductPageData }>(
      '/api/product-page?populate=SEO'
    );
    
    if (!response.data || !response.data.SEO) {
      console.warn('Product page SEO data structure is not as expected:', response);
      return null;
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching product page SEO data:', error);
    return null;
  }
}

// Dynamic metadata generation - update the parameter type
export async function generateMetadata(): Promise<Metadata> {
  const [productPageData, productsData] = await Promise.all([
    fetchProductPageSEO(),
    fetchProducts()
  ]);
  
  const seoData = productPageData?.SEO || null;
  
  // Generate structured data from products
  const structuredData = generateStructuredData(productsData.products);
  
  // Return metadata from the API with generated structured data
  return {
    title: seoData?.metaTitle,
    description: seoData?.metaDescription,
    keywords: seoData?.keywords,
    robots: seoData?.metaRobots,
    alternates: {
      canonical: seoData?.canonicalURL || '/products'
    },
    // Add structured data
    other: {
      'script:ld+json': JSON.stringify(structuredData),
    }
  };
}

// Add separate viewport export with updated parameter type
export async function generateViewport() {
  const productPageData = await fetchProductPageSEO();
  const seoData = productPageData?.SEO || null;
  
  return {
    viewport: seoData?.metaViewport || 'width=device-width, initial-scale=1'
  };
}

// Updated to include pagination parameters
async function fetchProducts(page = 1): Promise<{products: Product[], pagination: {total: number, pageCount: number, page: number}}> {
    try {
        const pageSize = 10; // Show 10 products per page instead of 2
        const response = await axiosInstance.get<ProductResponse>('/api/products', {
            params: {
                'populate[0]': 'image',
                'populate[1]': 'category',
                'populate[2]': 'perks',
                'populate[3]': 'details',
                'populate[4]': 'details.image',
                'populate[5]': 'seo',
                sort: 'createdAt:desc',
                'pagination[page]': page,
                'pagination[pageSize]': pageSize,
            },
        });
        return {
            products: response.data.data,
            pagination: {
                total: response.data.meta.pagination.total,
                pageCount: response.data.meta.pagination.pageCount,
                page: response.data.meta.pagination.page
            }
        };
    } catch (error) {
        console.error('Error fetching products:', error);
        return {
            products: [],
            pagination: {
                total: 0,
                pageCount: 0,
                page: 1
            }
        };
    }
}

async function fetchAllCategories(): Promise<Category[]> {
    try {
        const response = await axiosInstance.get<CategoryResponse>(
            '/api/categories',
            {
                params: {
                    'populate[0]': 'icon',
                    sort: 'name:asc',
                },
            }
        );
        return response.data.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

const EmptyState = () => {
    return (
        <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <PackageSearch className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">
                    Chưa có sản phẩm
                </p>
                <p className="text-sm text-muted-foreground">
                    Hiện chưa có sản phẩm nào.
                </p>
            </CardContent>
        </Card>
    );
};

// Fix the page component definition to use Next.js 14 pattern
export default async function AllProductsPage() {
    const currentPage = 1;
    const [productsData, categories] = await Promise.all([
        fetchProducts(currentPage),
        fetchAllCategories(),
    ]);
    
    const { products, pagination } = productsData;
    const { total, pageCount, page } = pagination;

    const hasPrevPage = page > 1;
    const hasNextPage = page < pageCount;

    const getPaginationLink = (pageNum: number) => {
        return `/products?page=${pageNum}`;
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    Sản phẩm âm thanh chất lượng cao
                </h1>
                <p className="text-gray-600 mt-2">
                    Khám phá bộ sưu tập thiết bị âm thanh chính hãng với đầy đủ phụ kiện và chế độ bảo hành
                </p>
            </div>
            
            <div className="grid grid-cols-12 gap-6">
                {/* Mobile Category Navigation */}
                <div className="col-span-12 lg:hidden">
                    <MobileCategoryNav
                      categories={categories}
                    />
                </div>

                {/* Sidebar Categories */}
                <div className="hidden lg:block lg:col-span-3">
                  <CategorySidebar 
                    categories={categories}
                    className="sticky top-4"
                   />
                </div>

                {/* Products Grid */}
                <div className="col-span-12 lg:col-span-9">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">
                            Tất cả sản phẩm
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Hiển thị {products.length} / {total} sản phẩm
                        </p>
                    </div>

                    {products.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                    
                    {/* Pagination Controls - Only show when total products > 10 */}
                    {total > 10 && pageCount > 1 && (
                        <div className="flex justify-center items-center space-x-4 mt-8">
                            <Button 
                                variant="outline" 
                                disabled={!hasPrevPage}
                                asChild
                            >
                                <Link href={getPaginationLink(page - 1)}>
                                    <ChevronLeft className="mr-1 h-4 w-4" />
                                    Trước
                                </Link>
                            </Button>
                            
                            <div className="text-sm">
                                Trang {page} / {pageCount}
                            </div>
                            
                            <Button 
                                variant="outline" 
                                disabled={!hasNextPage}
                                asChild
                            >
                                <Link href={getPaginationLink(page + 1)}>
                                    Sau
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}