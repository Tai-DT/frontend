import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getStrapiImageUrl } from '@/lib/imageUrl';
import { Download, ArrowLeft, ExternalLink, ShoppingCart, ChevronRight, CheckCircle, MonitorSmartphone, Server, Settings, Cpu } from 'lucide-react';
import { Software } from '@/types/software';
import { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type SoftwareResponse = {
  data: Software[];
};

// Data fetching function
async function getSoftwareBySlug(slug: string): Promise<Software | null> {
  try {
    const url = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/software?filters[slug][$eq]=${slug}&populate[0]=seo&populate[1]=details&populate[2]=image&populate[3]=details.image`;
    const response = await fetch(url, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data = (await response.json()) as SoftwareResponse;
    return data.data?.[0] || null;
  } catch (error) {
    console.error('Error fetching software by slug:', error);
    return null;
  }
}

// Metadata generation
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const software = await getSoftwareBySlug(resolvedParams.slug);
  
  if (!software) {
    return {
      title: 'Software Not Found',
      description: 'The requested software page does not exist',
      robots: 'noindex, nofollow'
    };
  }
  
  let mainImage = '/default-software-og.jpg';
  if (software.image && software.image.length > 0 && software.image[0].url) {
    mainImage = getStrapiImageUrl(software.image[0].url) || mainImage;
  }
  
  return {
    title: software.seo?.metaTitle || software.name,
    description: software.seo?.metaDescription || software.description?.substring(0, 160),
    keywords: software.seo?.keywords || software.name,
    alternates: {
      canonical: software.seo?.canonicalURL || `/software/${software.slug}`
    },
    robots: software.seo?.metaRobots || 'index, follow',
    openGraph: {
      title: software.seo?.metaTitle || software.name,
      description: software.seo?.metaDescription || software.description?.substring(0, 160),
      images: [{
        url: mainImage,
        width: 1200,
        height: 630,
        alt: software.image?.[0]?.alternativeText || software.name
      }],
      type: 'article',
      locale: 'vi_VN',
      siteName: 'Audio Tailoc'
    },
    twitter: {
      card: 'summary_large_image',
      title: software.seo?.metaTitle || software.name,
      description: software.seo?.metaDescription || software.description?.substring(0, 160),
      images: [mainImage]
    }
  };
}

// Main page component
export default async function SoftwareDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const software = await getSoftwareBySlug(params.slug);
  
  if (!software) {
    notFound();
  }

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": software.name,
    "description": software.description,
    "image": software.image?.map(img => getStrapiImageUrl(img.url)),
    "applicationCategory": "MusicApplication",
    "operatingSystem": "Windows, MacOS",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "VND",
      "availability": "https://schema.org/InStock"
    },
    "softwareVersion": software.version || "1.0",
    ...(software.seo?.structuredData || {})
  };

  // Extract features and requirements from details
  const features = software.details?.filter(d => !d.name.includes("Yêu cầu") && !d.name.includes("Giới thiệu")) || [];
  const requirements = software.details?.filter(d => d.name.includes("Yêu cầu")) || [];
  const overview = software.details?.filter(d => d.name.includes("Giới thiệu") || d.name.includes("Tổng quan")) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-700 to-yellow-600 py-20 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 0 H40 V40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
            <Link href="/software">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 -ml-3 mb-4 md:mb-0 self-start"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại danh sách phần mềm
              </Button>
            </Link>
            
            {software.version && (
              <Badge className="self-start md:self-auto bg-white/20 text-white hover:bg-white/30 py-1.5 px-3">
                Phiên bản {software.version}
              </Badge>
            )}
          </div>
          
          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">{software.name}</h1>
            <p className="text-lg text-yellow-100 mb-8 max-w-2xl">{software.description}</p>
            
            <div className="flex flex-wrap gap-4">
              <Button className="bg-white text-red-700 hover:bg-yellow-100 font-bold">
                <Download className="mr-2 h-5 w-5" /> Tải xuống phần mềm
              </Button>
              
              <Button variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10">
                <ShoppingCart className="mr-2 h-4 w-4" /> Mua phiên bản cao cấp
              </Button>
            </div>
          </div>
        </div>
        
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-16">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0L60 10C120 20 240 40 360 50C480 60 600 60 720 50C840 40 960 20 1080 15C1200 10 1320 20 1380 25L1440 30V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0V0Z" fill="#FEF9C3"/>
          </svg>
        </div>
      </section>
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-6">
        <nav className="text-sm">
          <ol className="flex flex-wrap items-center">
            <li className="flex items-center">
              <Link href="/" className="text-yellow-700 hover:text-yellow-800">
                Trang chủ
              </Link>
              <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
            </li>
            <li className="flex items-center">
              <Link href="/software" className="text-yellow-700 hover:text-yellow-800">
                Phần mềm
              </Link>
              <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
            </li>
            <li className="text-gray-600 font-medium truncate">
              {software.name}
            </li>
          </ol>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Featured Image */}
          {software.image?.[0]?.url && (
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl mb-12">
              <Image
                src={getStrapiImageUrl(software.image[0].url) || '/default-image.jpg'}
                alt={software.image[0].name || software.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
          )}
          
          {/* Software Details Tabs */}
          <Tabs defaultValue="overview" className="mb-16">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-red-700 data-[state=active]:text-white"
              >
                Tổng quan
              </TabsTrigger>
              <TabsTrigger 
                value="features" 
                className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white"
              >
                Tính năng
              </TabsTrigger>
              <TabsTrigger 
                value="requirements" 
                className="data-[state=active]:bg-red-700 data-[state=active]:text-white"
              >
                Yêu cầu hệ thống
              </TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="focus-visible:outline-none focus-visible:ring-0">
              <Card className="border-yellow-200 border-2">
                <CardContent className="pt-6">
                  <div className="prose max-w-none text-gray-700">
                    {overview.length > 0 ? (
                      overview.map((detail) => (
                        <div key={detail.id} className="mb-8">
                          <h3 className="text-2xl font-bold text-red-700 mb-4">{detail.name}</h3>
                          <p className="whitespace-pre-line text-lg">{detail.description}</p>
                          
                          {detail.image && detail.image[0] && (
                            <div className="relative h-64 my-6 rounded-lg overflow-hidden">
                              <Image
                                src={getStrapiImageUrl(detail.image[0].url) || '/default-image.jpg'}
                                alt={detail.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 768px"
                              />
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div>
                        <h3 className="text-2xl font-bold text-red-700 mb-4">Về phần mềm {software.name}</h3>
                        <p className="whitespace-pre-line text-lg">{software.description}</p>
                        
                        <div className="mt-8 p-6 rounded-lg bg-yellow-50 border border-yellow-200">
                          <h4 className="text-xl font-semibold text-yellow-700 mb-4">Ưu điểm nổi bật</h4>
                          <ul className="space-y-3">
                            <li className="flex items-start">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                              <span>Dễ dàng cài đặt và sử dụng ngay lập tức</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                              <span>Tương thích với nhiều thiết bị và hệ thống</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                              <span>Cập nhật thường xuyên và hỗ trợ kỹ thuật 24/7</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-8 text-center">
                      <Button className="bg-red-700 hover:bg-red-800 text-white text-lg px-8 py-6 rounded-full shadow-lg">
                        <Download className="mr-2 h-5 w-5" /> Tải xuống phiên bản mới nhất
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Features Tab */}
            <TabsContent value="features" className="focus-visible:outline-none focus-visible:ring-0">
              {features.length > 0 ? (
                <div className="space-y-8">
                  {features.map((feature, index) => (
                    <Card key={feature.id} className={`overflow-hidden border-2 ${index % 2 === 0 ? 'border-red-200' : 'border-yellow-200'}`}>
                      <div className="md:flex">
                        {feature.image && feature.image[0] && (
                          <div className="md:w-2/5">
                            <div className="relative h-64 md:h-full">
                              <Image
                                src={getStrapiImageUrl(feature.image[0].url) || '/default-image.jpg'}
                                alt={feature.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 384px"
                              />
                            </div>
                          </div>
                        )}
                        
                        <div className={`p-8 md:w-${feature.image && feature.image[0] ? '3/5' : 'full'}`}>
                          <div className="flex items-center mb-4">
                            {index % 4 === 0 && <MonitorSmartphone className="mr-3 h-6 w-6 text-red-600" />}
                            {index % 4 === 1 && <Server className="mr-3 h-6 w-6 text-yellow-700" />}
                            {index % 4 === 2 && <Settings className="mr-3 h-6 w-6 text-red-600" />}
                            {index % 4 === 3 && <Cpu className="mr-3 h-6 w-6 text-yellow-700" />}
                            <h3 className={`text-2xl font-bold ${index % 2 === 0 ? 'text-red-700' : 'text-yellow-700'}`}>
                              {feature.name}
                            </h3>
                          </div>
                          
                          <p className="text-gray-700 whitespace-pre-line text-lg mb-6">{feature.description}</p>
                          
                          {feature.price && (
                            <div className={`p-5 rounded-lg ${index % 2 === 0 ? 'bg-red-50' : 'bg-yellow-50'} mt-6`}>
                              <p className="font-medium text-xl">
                                Giá: <span className={`${index % 2 === 0 ? 'text-red-700' : 'text-yellow-700'} font-bold`}>{feature.price}</span>
                              </p>
                              <Button className={`mt-4 ${index % 2 === 0 ? 'bg-red-700 hover:bg-red-800' : 'bg-yellow-600 hover:bg-yellow-700'} text-white`}>
                                <ShoppingCart className="mr-2 h-4 w-4" /> Mua ngay
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-yellow-200 border-2 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-700 mb-4">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-yellow-700 mb-4">Chưa có thông tin tính năng</h3>
                    <p className="text-gray-700">Hiện tại chưa có thông tin tính năng chi tiết cho phần mềm này. Vui lòng quay lại sau.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Requirements Tab */}
            <TabsContent value="requirements" className="focus-visible:outline-none focus-visible:ring-0">
              <Card className="border-red-200 border-2 shadow-xl rounded-xl">
                <CardContent className="p-8">
                  {requirements.length > 0 ? (
                    requirements.map((detail) => (
                      <div key={detail.id} className="mt-6">
                        <h4 className="text-xl font-semibold mb-4 text-yellow-600">{detail.name}</h4>
                        <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-100">
                          <p className="whitespace-pre-line text-gray-700 text-lg">{detail.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-100">
                      <p className="text-gray-700">Không có thông tin yêu cầu hệ thống cụ thể. Vui lòng liên hệ với chúng tôi để biết thêm chi tiết.</p>
                    </div>
                  )}

                  <div className="mt-8 flex justify-center">
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2">
                      <ExternalLink className="mr-2 h-4 w-4" /> Xem thêm thông tin kỹ thuật
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Download CTA */}
        <div className="bg-gradient-to-r from-red-600 to-yellow-500 p-10 rounded-xl shadow-2xl mt-16 text-center text-white">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">Bạn đã sẵn sàng sử dụng?</h3>
          <p className="mb-8 text-xl text-yellow-100 max-w-xl mx-auto">Tải xuống phần mềm ngay hôm nay hoặc liên hệ với chúng tôi để được tư vấn thêm!</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/contact">
              <Button variant="outline" className="text-white border-white border-2 hover:bg-white/20 font-bold px-8 py-6 rounded-full shadow-lg">
                Liên hệ hỗ trợ
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}