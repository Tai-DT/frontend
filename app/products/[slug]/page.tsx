import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Product } from '@/types/products'
import axiosInstance from '@/lib/axiosInstance'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type ProductResponse = {
  data: Product[]
}

async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const response = await axiosInstance.get<ProductResponse>('/api/products', {
      params: {
        filters: { slug: { $eq: slug } },
        populate: {
          image: { fields: ['url', 'alternativeText'] },
          details: { populate: ['image'] },
          category: { fields: ['name'] },
          seo: { populate: '*' }
        }
      }
    })
    return response.data.data[0] || null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const product = await fetchProductBySlug(params.slug);

  if (!product) {
    return {
      title: 'Sản phẩm không tồn tại',
      description: 'Không tìm thấy sản phẩm theo yêu cầu',
      robots: 'noindex, nofollow'
    };
  }

  const seo = product.seo || {}
  const mainImage = product.image?.[0]?.url || '/default-og.jpg'

  return {
    title: seo.metaTitle || product.name,
    description: seo.metaDescription || product.description?.substring(0, 160),
    keywords: seo.keywords || '',
    alternates: {
      canonical:  `${process.env.FRONTEND_URL}/products/${product.slug}`
    },
    openGraph: {
      title: seo.metaTitle || product.name,
      description: seo.metaDescription || product.description?.substring(0, 160),
      images: [
        {
          url: mainImage,
          width: 1200,
          height: 630,
          alt: product.image?.[0]?.alternativeText || product.name
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.metaTitle || product.name,
      description: seo.metaDescription || product.description?.substring(0, 160),
      images: [mainImage]
    }
  }
}

export async function generateStaticParams() {
  try {
    const response = await axiosInstance.get<ProductResponse>('/api/products', {
      params: {
        fields: ['slug'],
        pagination: { limit: -1 }
      }
    })
    return response.data.data.map((product) => ({ slug: product.slug }))
  } catch (error) {
    console.error('Error generating static paths:', error)
    return []
  }
}

// Update the page component signature to handle Promise params

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const product = await fetchProductBySlug(params.slug);

  if (!product) notFound();

  const { name, description, price, image, category, perks, details, id_youtube_video } = product;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    productID: product.id,
    sku: product.product_code,
    name: name,
    image: image?.map(img => img.url),
    description: description,
    brand: {
      "@type": "Brand",
      name: "AudioTailoc"
    },
    offers: {
      "@type": "Offer",
      url: `${process.env.FRONTEND_URL}/products/${params.slug}`,
      priceCurrency: "VND",
      price: price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition"
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "128"
    }
  };

  // The return statement of the Page component

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Navigation and Breadcrumbs */}
      <div className="mb-6">
        <nav className="flex flex-wrap text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-blue-600">
            Sản phẩm
          </Link>
          <span className="mx-2">/</span>
          {category && (
            <>
              <Link href={`/categories/${category.slug}`} className="hover:text-blue-600 truncate max-w-[100px] sm:max-w-none">
                {category.name}
              </Link>
              <span className="mx-2">/</span>
            </>
          )}
          <span className="text-gray-700 truncate max-w-[150px] sm:max-w-none">{name}</span>
        </nav>

        <div className="flex flex-wrap justify-between items-center gap-2">
          <Link
            href="/products"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm"
            aria-label="Quay lại trang sản phẩm"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Quay lại
          </Link>
          {category && (
            <Badge variant="outline" className="text-xs sm:text-sm">
              {category.name}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image Gallery */}
        <Card className="border-none shadow-none">
          <CardContent className="p-4 space-y-4">
            <div className="relative aspect-square">
              <Image
                src={image?.[0]?.url || '/placeholder-product.png'}
                alt={image?.[0]?.alternativeText || name}
                fill
                priority
                className="object-cover rounded-lg shadow-md"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            
            {/* Thumbnail gallery */}
            {image && image.length > 1 && (
              <div className="grid grid-cols-5 gap-2 mt-4">
                {image.map((img, index) => (
                  <div key={index} className="relative aspect-square cursor-pointer rounded-md overflow-hidden border-2 hover:border-blue-500">
                    <Image
                      src={img.url || '/placeholder-thumbnail.png'}
                      alt={`${name} - image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="20vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Information */}
        <Card className="border-none shadow-none">
          <CardContent className="p-4 space-y-8">
            {/* H1 Heading */}
            <div>
              <h1 
                className="text-3xl font-bold text-gray-900" 
                itemProp="name"
              >
                {name}
              </h1>
              {product.product_code && (
                <p className="text-sm text-gray-500 mt-1">
                  Mã sản phẩm: <span itemProp="sku">{product.product_code}</span>
                </p>
              )}
            </div>

            {/* Description */}
            {description && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Mô tả</h2>
                <p className="text-gray-700">{description}</p>
              </div>
            )}

            {/* Product Perks */}
            {perks && perks.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Đặc điểm nổi bật</h2>
                <ul className="space-y-2">
                  {perks.map((perk, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-green-500 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">{perk.text}</p>
                        {perk.description && (
                          <p className="text-sm text-gray-500">{perk.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* YouTube Video Embed */}
            {id_youtube_video && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-3">Video giới thiệu</h2>
                <div className="relative pt-[56.25%]">
                  <iframe 
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    src={`https://www.youtube.com/embed/${id_youtube_video}`}
                    title={`${name} - Video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {/* Price and Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <p className="text-2xl font-bold text-primary" itemProp="price">
                {price ? 
                  new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(parseFloat(price)) 
                  : 'Liên hệ'}
              </p>
              <AddToCartButton product={product} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Details Section */}
      {details && details.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Thông tin chi tiết</h2>
          <div className="space-y-8">
            {details.map((detail) => (
              <Card key={detail.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">{detail.name}</h3>
                  
                  {detail.image && detail.image.url && (
                    <div className="relative h-64 mb-4 rounded-lg overflow-hidden">
                      <Image
                        src={detail.image.url}
                        alt={detail.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 768px"
                      />
                    </div>
                  )}
                  
                  <p className="text-gray-700 whitespace-pre-line">{detail.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Related Products - You can add this later */}
    </div>
  );
}