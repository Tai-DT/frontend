"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, PhoneCall } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStrapiImageUrl } from '@/lib/imageUrl';
import axiosInstance from '@/lib/axiosInstance';
import Head from 'next/head';
import { ShareButtons } from '@/components/ShareButtons';

// Define your interfaces (ImageData, ImageFormats, ImageFormat, ServiceDetail, Service)
// exactly as you had them in your original code
interface ImageFormat {
    ext: string;
    url: string;
    hash: string;
    mime: string;
    size: number;
    width: number;
    height: number;
}

interface ImageFormats {
    large?: ImageFormat;
    small?: ImageFormat;
    medium?: ImageFormat;
    thumbnail?: ImageFormat;
}

interface ImageData {
    id: number;
    name: string;
    url: string;
    width: number;
    height: number;
    formats?: ImageFormats | null;
    hash?: string;
    ext?: string;
    mime?: string;
    size?: number;
}

interface ServiceDetail {
    id: number;
    name: string;
    description: string;
    id_youtube_video?: string | null;
    price?: string;
    image?: ImageData[];
}

interface Service {
    id: number;
    name: string;
    slug: string;
    description: string;
    id_youtube_video?: string | null;
    image: ImageData[];
    details: ServiceDetail[];
    seo?: SeoData | null;
}
interface SeoData {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
    canonicalURL?: string;
    metaRobots?: string;
    metaViewport?: string;
    structuredData?: Record<string, unknown>;
}

// Removed unused interface

// This function is used in the useEffect hook for fetching service data
async function getService(slug: string): Promise<Service | null> {
  try {
      const response = await axiosInstance.get<{ data: Service[] }>(
          `/api/services?filters[slug][$eq]=${slug}&populate=*`
      );
      return response.data.data?.[0] || null;
  } catch (error) {
      console.error('Error fetching service:', error);
      return null;
  }
}

const ServicePage = () => {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  useEffect(() => {
    if (!slug) return;
    
    const fetchService = async () => {
      try {
        setLoading(true);
        const serviceData = await getService(slug);
        setService(serviceData);
      } catch (error) {
        console.error('Error fetching service:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [slug]);

  // For SEO - we'll use Next.js Head component instead
  // This is a client-side only solution, proper SEO requires server components
  const pageTitle = service?.name ? `${service.name} | Audio Tài Lộc` : 'Dịch vụ | Audio Tài Lộc';
  const pageDescription = service?.description?.substring(0, 160) || 'Dịch vụ âm thanh chuyên nghiệp tại Audio Tài Lộc';

  // Loading state with yellow and red themed skeleton
  if (loading) {
    return (
      <>
        <Head>
          <title>Đang tải... | Audio Tài Lộc</title>
        </Head>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <Skeleton className="h-10 w-10 rounded-full bg-yellow-200" />
              <Skeleton className="h-5 w-24 ml-2 bg-yellow-200" />
            </div>
            
            <Skeleton className="h-12 w-3/4 mb-4 bg-yellow-200" />
            
            <div className="aspect-video relative w-full mb-8">
              <Skeleton className="absolute inset-0 rounded-lg bg-yellow-200" />
            </div>
            
            <Skeleton className="h-6 w-full mb-2 bg-yellow-200" />
            <Skeleton className="h-6 w-5/6 mb-2 bg-yellow-200" />
            <Skeleton className="h-6 w-4/6 mb-8 bg-yellow-200" />
            
            <div className="space-y-8 mt-10">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-8 w-40 bg-yellow-200" />
                <Skeleton className="h-10 w-32 rounded-md bg-red-200" />
              </div>

              {[1, 2].map((idx) => (
                <Card key={idx} className="overflow-hidden border-yellow-200 mb-8">
                  <div className="p-0">
                    <Skeleton className="h-64 w-full bg-yellow-200" />
                  </div>
                  <div className="p-6">
                    <Skeleton className="h-7 w-1/3 mb-4 bg-yellow-200" />
                    <Skeleton className="h-4 w-full mb-2 bg-yellow-200" />
                    <Skeleton className="h-4 w-5/6 mb-2 bg-yellow-200" />
                    <Skeleton className="h-4 w-4/6 mb-2 bg-yellow-200" />
                    <div className="mt-4">
                      <Skeleton className="h-8 w-36 rounded-md bg-red-200" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Not found state
  if (!service) {
    return (
      <>
        <Head>
          <title>Không tìm thấy dịch vụ | Audio Tài Lộc</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="container mx-auto px-4 py-16 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="w-full max-w-lg border-red-200 shadow-lg">
              <CardHeader className="bg-red-50 border-b border-red-200">
                <CardTitle className="text-red-600">Không tìm thấy dịch vụ</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-6">
                  Dịch vụ bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
                </p>
                <Button 
                  onClick={() => router.push('/services')} 
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  Xem tất cả dịch vụ
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </>
    );
  }

  const { name, description, image, details, id_youtube_video } = service;
  
  // Construct the current URL for sharing
  const currentUrl = typeof window !== 'undefined' 
    ? `${window.location.href}`
    : '';

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {service.seo?.keywords && <meta name="keywords" content={service.seo.keywords} />}
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Back button with breadcrumb */}
          <motion.div 
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={() => router.back()}
              variant="ghost"
              className="text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800 -ml-3 self-start"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
            
            <nav className="text-sm breadcrumbs mt-2 sm:mt-0">
              <ol className="flex flex-wrap">
                <li className="flex items-center">
                  <Link href="/" className="text-yellow-700 hover:text-yellow-800">
                    Trang chủ
                  </Link>
                  <span className="mx-2 text-gray-400">/</span>
                </li>
                <li className="flex items-center">
                  <Link href="/services" className="text-yellow-700 hover:text-yellow-800">
                    Dịch vụ
                  </Link>
                  <span className="mx-2 text-gray-400">/</span>
                </li>
                <li className="text-gray-600 font-medium truncate">
                  {name}
                </li>
              </ol>
            </nav>
          </motion.div>

          {/* Service Header */}
          <motion.div 
            className="mb-8 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <motion.h1 
              className="text-3xl md:text-4xl font-bold mb-4 text-red-700"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.3 }}
            >
              {name}
            </motion.h1>
            
            {/* Featured image */}
            {image && image.length > 0 && (
              <div className="relative w-full aspect-video mb-6 rounded-lg overflow-hidden shadow-lg">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={getStrapiImageUrl(image[activeImageIndex].url) || "/placeholder-service.png"}
                      alt={name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 768px"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
                
                {/* Image navigation dots */}
                {image.length > 1 && (
                  <motion.div 
                    className="absolute bottom-4 left-0 right-0 flex justify-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    {image.map((_, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-3 h-3 rounded-full ${
                          idx === activeImageIndex ? "bg-yellow-500" : "bg-white/70 hover:bg-white"
                        } transition-all`}
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.2 }}
                        aria-label={`Show image ${idx + 1}`}
                      />
                    ))}
                  </motion.div>
                )}
                
                {/* Add a zoom effect indicator */}
                <motion.div
                  className="absolute top-4 right-4 bg-white/80 rounded-full p-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    <line x1="11" y1="8" x2="11" y2="14"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                </motion.div>
              </div>
            )}

            <motion.p 
              className="text-lg text-gray-700 mb-6 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {description}
            </motion.p>

            {/* Quick action buttons */}
            <motion.div 
              className="flex flex-wrap gap-4 justify-center mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-red-700 hover:bg-red-800 text-white shadow-md">
                  <PhoneCall className="mr-2 h-4 w-4" />  <Link href="/about" className="text-white hover:text-yellow-100 transition-colors">
                    Liên hệ ngay
                  </Link>
                </Button>
              </motion.div>
              
              {/* Replace the simple Share button with ShareButtons component */}
              <ShareButtons url={currentUrl} title={name} className="mt-2" />
            </motion.div>

            {/* YouTube video */}
            {id_youtube_video && id_youtube_video.trim() !== '' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="mb-8 overflow-hidden border-yellow-200 shadow-lg">
                  <CardContent className="p-0">
                    <div className="aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${id_youtube_video}?autoplay=0&controls=1`}
                        title={`${name} video`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>

          {/* ...existing code with service details tabs enhanced with animations... */}
          {details && details.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Tabs defaultValue="overview" className="w-full mb-8" onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 mb-8">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
                    Tổng quan
                  </TabsTrigger>
                  <TabsTrigger value="pricing" className="data-[state=active]:bg-red-700 data-[state=active]:text-white">
                    Bảng giá
                  </TabsTrigger>
                  <TabsTrigger value="all" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
                    Tất cả
                  </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Tab content remains the same */}
                    {/* ...existing TabsContent components... */}
                    <TabsContent value="overview">
                      <Card className="border-yellow-200 shadow-lg">
                        <CardHeader className="bg-yellow-50 border-b border-yellow-100">
                          <CardTitle className="text-yellow-700">Giới thiệu dịch vụ</CardTitle>
                          <CardDescription>Thông tin chi tiết về dịch vụ {name}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 prose max-w-none">
                          <p className="text-gray-700">{description}</p>
                          {details.slice(0, 1).map((detail) => (
                            <div key={detail.id} className="mt-6">
                              <h3 className="text-xl font-semibold mb-2 text-red-700">{detail.name}</h3>
                              <p className="whitespace-pre-line">{detail.description}</p>
                            </div>
                          ))}
                          <div className="mt-6">
                            <Button 
                              onClick={() => setActiveTab("all")} 
                              className="bg-yellow-600 hover:bg-yellow-700 text-white"
                            >
                              Xem tất cả chi tiết
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="pricing">
                      <Card className="border-yellow-200 shadow-lg">
                        <CardHeader className="bg-red-50 border-b border-red-100">
                          <CardTitle className="text-red-700">Bảng giá dịch vụ</CardTitle>
                          <CardDescription>Chi phí cho các gói dịch vụ</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="divide-y divide-red-100">
                            {details.map((detail) => (
                              <div key={detail.id} className="py-4 first:pt-0 last:pb-0">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                  <h3 className="text-lg font-semibold text-red-700">{detail.name}</h3>
                                  {detail.price && (
                                    <Badge className="bg-yellow-600 hover:bg-yellow-700 text-white mt-2 sm:mt-0 px-3 py-1 text-sm">
                                      {detail.price}
                                    </Badge>
                                  )}
                                </div>
                                <p className="mt-2 text-gray-600 line-clamp-2">{detail.description}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="all">
                      <div className="space-y-8">
                        {details.map((detail) => (
                          <Card key={detail.id} className="overflow-hidden border-yellow-200 shadow-lg">
                            <CardHeader className="bg-yellow-50 border-b border-yellow-100">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                <CardTitle className="text-yellow-700">{detail.name}</CardTitle>
                                {detail.price && (
                                  <Badge className="bg-red-700 hover:bg-red-800 text-white mt-2 sm:mt-0">
                                    {detail.price}
                                  </Badge>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="p-6">
                              {detail.image && detail.image[0] && detail.image[0].url && (
                                <div className="relative h-64 mb-6 rounded-lg overflow-hidden shadow-md">
                                  <Image
                                    src={getStrapiImageUrl(detail.image[0].url) || "/placeholder.png"}
                                    alt={`${detail.name} image`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 768px"
                                  />
                                </div>
                              )}
                              <div className="prose max-w-none">
                                <p className="text-gray-700 whitespace-pre-line">{detail.description}</p>
                              </div>

                              {detail.id_youtube_video && detail.id_youtube_video.trim() !== '' && (
                                <div className="mt-6">
                                  <h4 className="text-lg font-medium mb-3 text-red-600">Video demo</h4>
                                  <div className="aspect-video rounded-lg overflow-hidden">
                                    <iframe
                                      title={`${detail.name} video`}
                                      src={`https://www.youtube.com/embed/${detail.id_youtube_video}?autoplay=0&controls=1`}
                                      className="w-full h-full"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                    />
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </motion.div>
          )}
          
          {/* Call to action */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            className="mt-12"
          >
            <Card className="bg-gradient-to-r from-yellow-600 to-red-700 text-white shadow-xl">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Bạn cần hỗ trợ thêm?</h2>
                <p className="mb-6 text-yellow-100">
                  Đội ngũ chuyên viên của chúng tôi luôn sẵn sàng hỗ trợ và tư vấn giúp bạn lựa chọn dịch vụ phù hợp nhất
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-white text-red-700 hover:bg-yellow-50">
                      <Link href="/about" className="text-red-700 hover:text-red-800 transition-colors">
                        Liên hệ để biết chi tiết
                      </Link>
                    </Button>
                  </motion.div>
                </div>
            
                {/* Add share buttons to the call to action section too */}
                <div className="mt-6 flex justify-center">
                  <ShareButtons url={currentUrl} title={name} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default ServicePage;