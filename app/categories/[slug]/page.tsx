import { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";
import { Product } from "@/types/products";

interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  products: Product[];
  icon: {
    url: string;
  };
}

interface CategoryPageProps {
  params: Promise<{ 
    slug: string;
  }>;
}

interface ApiResponse {
  data: Array<{
    id: number;
    documentId: string;
    name: string;
    slug: string;
    products: Product[];
    icon: {
      url: string;
    };
  }>;
}
const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

export const dynamicParams = false;

async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(
      `${API_URL}/api/categories?populate[0]=products&populate[1]=products.image`,
      {
        next: { revalidate: 60 },
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch categories: ${res.status}`);
    }

    const data: ApiResponse = await res.json();

    return data.data.map((item) => ({
      id: item.id,
      documentId: item.documentId,
      name: item.name,
      slug: item.slug,
      products: item.products,
      icon: {
        url: item.icon?.url || '',
      }
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function generateStaticParams() {
  const categories = await fetchCategories();
  
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const categories = await fetchCategories();
  const currentCategory = categories.find((category) => category.slug === resolvedParams.slug);

  if (!currentCategory) {
    return {
      title: 'Không tìm thấy danh mục - Audio Tài Lộc',
      description: 'Danh mục bạn đang tìm kiếm không tồn tại.',
    };
  }

  return {
    title: `${currentCategory.name} - Audio Tài Lộc`,
    description: `Khám phá bộ sưu tập ${currentCategory.name} chất lượng cao tại Audio Tài Lộc`,
    openGraph: {
      title: `${currentCategory.name} - Audio Tài Lộc`,
      description: `Khám phá bộ sưu tập ${currentCategory.name} chất lượng cao tại Audio Tài Lộc`,
      type: 'website',
      locale: 'vi_VN',
    },
    alternates: {
      canonical: `/categories/${currentCategory.slug}`,
    }
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const categories = await fetchCategories();
  const currentCategory = categories.find((category) => category.slug === resolvedParams.slug);

  if (!currentCategory) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold text-red-600">Không tìm thấy danh mục</h1>
        <p className="mt-4 text-gray-600">Danh mục bạn đang tìm kiếm không tồn tại.</p>
        <Link href="/categories" className="mt-6 text-yellow-600 hover:underline">
          Xem tất cả danh mục
        </Link>
      </div>
    );
  }

  const hasProducts = currentCategory.products && currentCategory.products.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Improved SEO H1 with breadcrumbs */}
      <div className="mb-8">
        <nav className="flex text-sm text-gray-500 mb-2">
          <Link href="/" className="hover:text-red-600">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <Link href="/categories" className="hover:text-red-600">
            Danh mục
          </Link>
          <span className="mx-2">/</span>
          <span className="text-yellow-700">{currentCategory.name}</span>
        </nav>
        <h1 className="text-3xl font-bold text-red-600">{currentCategory.name}</h1>
        <p className="mt-2 text-gray-600">
          Khám phá các sản phẩm {currentCategory.name} chất lượng cao tại Audio Tài Lộc
        </p>
      </div>
      
      {!hasProducts ? (
        <div className="text-center py-12 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-gray-600">Hiện không có sản phẩm nào trong danh mục này.</p>
          <Link href="/products" className="mt-4 inline-block text-red-600 hover:underline">
            Xem tất cả sản phẩm
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-4 text-gray-600">Hiển thị {currentCategory.products.length} sản phẩm</p>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {currentCategory.products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}