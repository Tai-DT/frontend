"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import GoogleMap from "@/components/GoogleMap";
import ContactFormAPI from '@/components/contact/ContactFormAPI';
import FAQAccordion from '@/components/contact/FAQAccordion';
import SocialLinks from '@/components/contact/SocialLinks';
import Image from "next/image";
import axiosInstance from "@/lib/axiosInstance";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, MapPin, Clock } from "lucide-react";

type Image = {
  id: number;
  url: string;
  name: string;
};

type ContactItem = {
  id: number;
  name: string;
  description: string;
};

type FAQItem = {
  id: number;
  heading: string;
  sub_heading: string;
};

type AboutData = {
  name: string;
  description: string;
  link_google_map: string;
  contact: ContactItem[];
  image: Image[] | null;
  FAQ?: FAQItem[];
  seo?: {
    structuredData?: {
      sameAs?: string[];
    };
  };
};

const AboutPage = () => {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get("/api/about?populate=*");
        setAboutData({
          ...data.data,
          image: data.data.image || [],
          FAQ: data.data.FAQ || [],
        });
      } catch (error) {
        console.error("Failed to fetch about data:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Card className="overflow-hidden border-yellow-200 shadow-md">
          <CardContent className="pt-6 text-center">
            <Skeleton className="w-full h-5 mb-2 bg-yellow-100" />
            <Skeleton className="w-full h-5 mb-2 bg-yellow-100" />
            <Skeleton className="w-3/4 h-5 mx-auto bg-yellow-100" />
          </CardContent>
        </Card>
        
        {/* Add skeleton for the large center image */}
        <div className="flex justify-center my-8">
          <Skeleton className="w-full max-w-3xl h-80 rounded-lg bg-yellow-100" />
        </div>
        
        <Skeleton className="w-full h-64 bg-yellow-100" />
        
        <Card className="overflow-hidden border-yellow-200">
          <CardHeader>
            <Skeleton className="w-48 h-8 bg-yellow-100" />
          </CardHeader>
          <CardContent className="bg-muted rounded-b-lg">
            <div className="space-y-4">
              <Skeleton className="w-full h-16 bg-yellow-100" />
              <Skeleton className="w-full h-16 bg-yellow-100" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !aboutData) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Card className="border-red-200 shadow-md">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Đã xảy ra lỗi</h2>
            <p className="text-gray-700 mb-6">Không thể tải thông tin về chúng tôi. Vui lòng thử lại sau.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-6 py-2 rounded-md transition-colors"
            >
              Tải lại trang
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { description, link_google_map, contact, image = [], FAQ = [] } = aboutData;
  const logo = image?.[0];

  // Find contact details and SEO data
  const getContactByName = (name: string) => {
    return contact.find(item => item.name.toLowerCase().includes(name.toLowerCase()))?.description || '';
  };
  
  const address = getContactByName('địa chỉ');
  const facebookUrl = getContactByName('facebook');
  const zaloContact = getContactByName('zalo');
  const tiktokUrl = getContactByName('tiktok');
  const youtubeUrl = aboutData.seo?.structuredData?.sameAs?.find(url => url.includes('youtube')) || 
                     "https://www.youtube.com/audiotailoc";

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-yellow-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-yellow-500 py-16 md:py-24 relative">
        <div className="absolute inset-0 bg-opacity-20 bg-pattern-overlay"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">Về Audio Tài Lộc</h1>
          <p className="text-lg md:text-xl text-yellow-100 max-w-2xl mx-auto">
            Chuyên cung cấp loa và thiết bị âm thanh chuyên nghiệp với chất lượng cao và giá cả hợp lý
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-yellow-50 clip-wave"></div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* About Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-yellow-200 shadow-md overflow-hidden">
            <CardContent className="pt-6 text-center">
              <p className="text-lg text-gray-700 leading-relaxed">
                {description}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Large Featured Image - Adjusted for better proportions */}
        {logo && (
          <motion.div 
            className="flex justify-center my-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative w-full max-w-4xl rounded-lg overflow-hidden shadow-xl">
              <Image
                src={logo.url}
                alt={logo.name || "Audio Tài Lộc"}
                width={1920}
                height={1080}
                className="w-full max-h-[600px] object-contain mx-auto"
                style={{ objectPosition: 'center' }}
                priority
              />
            </div>
          </motion.div>
        )}

        <Separator className="my-8 bg-yellow-300" />

        {/* Contact and Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            {/* Contact Info Card */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="shadow-lg border-yellow-200">
                <CardHeader className="bg-yellow-50">
                  <CardTitle className="text-2xl text-yellow-800">Thông tin liên hệ</CardTitle>
                </CardHeader>
                
                <CardContent className="pt-6 space-y-4">
                  {/* Phone */}
                  <div className="flex items-start space-x-3">
                    <div className="bg-red-100 p-3 rounded-full text-red-600 inline-flex">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-gray-700 font-medium">Số điện thoại</h3>
                      <p className="text-lg font-bold text-red-600">{zaloContact}</p>
                      <p className="text-sm text-gray-500">Gọi cho chúng tôi bất kỳ lúc nào</p>
                    </div>
                  </div>
                  
                  {/* Address */}
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600 inline-flex">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-gray-700 font-medium">Địa chỉ</h3>
                      <p className="text-lg font-bold text-blue-600">{address}</p>
                      <p className="text-sm text-gray-500">Ghé thăm showroom của chúng tôi</p>
                    </div>
                  </div>
                  
                  {/* Working Hours */}
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 p-3 rounded-full text-green-600 inline-flex">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-gray-700 font-medium">Giờ làm việc</h3>
                      <p className="font-bold text-green-600">Thứ 2 - Thứ 7: 8:00 - 18:00</p>
                      <p className="font-bold text-green-600">Chủ nhật: 9:00 - 16:00</p>
                      <p className="text-sm text-gray-500">Mở cửa tất cả các ngày trong tuần</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <SocialLinks 
                facebookUrl={facebookUrl}
                tiktokUrl={tiktokUrl}
                youtubeUrl={youtubeUrl}
              />
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <ContactFormAPI />
          </motion.div>
        </div>

        {/* Google Map Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="border-yellow-200 shadow-md overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-yellow-500 to-red-500">
              <CardTitle className="text-2xl font-bold text-white">Vị trí của chúng tôi</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-b-md overflow-hidden h-[400px]">
                <GoogleMap mapLink={link_google_map} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="shadow-lg border-yellow-200">
            <CardHeader className="bg-yellow-50">
              <CardTitle className="text-2xl text-yellow-800">Câu Hỏi Thường Gặp</CardTitle>
              <CardDescription>Những câu hỏi khách hàng thường thắc mắc</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <FAQAccordion faqs={FAQ} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;