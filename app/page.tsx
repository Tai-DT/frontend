import React, { Suspense } from 'react';
import {
  getNewProducts,
  getBestSellerProducts,
  getForeverSpecialProducts,
  getFeaturedProducts,
} from '@/lib/apiProduct';
import { ProductList } from '@/components/ProductList';
import Banner from '@/components/Banner';
import { getServices } from '@/lib/apiService';
import { ServiceList } from '@/components/ServiceList';
import { getBanners } from '@/lib/apiBanner';
import './globals.css';

// Improved banner skeleton with animation
const BannerSkeleton = () => (
  <div className="w-full h-[clamp(300px,50vw,600px)] bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-lg relative overflow-hidden">
    <div className="absolute bottom-8 left-8 w-1/3 h-32 bg-white/20 rounded-lg animate-pulse"></div>
  </div>
);

// Tạo skeleton cho danh sách sản phẩm
const ProductListSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-10 bg-gray-200 rounded w-1/3"></div>
    <div className="grid grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-64 bg-gray-200 rounded"></div>
      ))}
    </div>
  </div>
);

// Component Home
export default async function Home() {
  // Fetch dữ liệu banner
  const banners = await getBanners();

  return (
    <>
      {/* Hero section with special background */}
      <section className="hero-bg w-full pt-8 pb-12 md:py-16">
        <div className="container mx-auto px-0 md:px-4">
          <div className="w-full max-w-7xl mx-auto">
            <Suspense fallback={<BannerSkeleton />}>
              <Banner banners={banners} />
            </Suspense>
          </div>
        </div>
      </section>
      
      <main className="flex flex-col container mx-auto px-0 md:px-4 py-6 md:py-12">
        {/* Welcome section with visible heading that's semantically an H2 */}
        <section className="text-center my-4 md:my-8 section-bg p-4 md:p-8 relative audio-decor">
          <h1 className="section-title text-3xl font-bold mx-auto text-red-500">Chào mừng đến với Audio Tài Lộc</h1>
        </section>

        <div className="space-y-8 md:space-y-12 py-4 md:py-8">
          <div className="section-bg p-3 md:p-6">
            <Suspense fallback={<ProductListSkeleton />}>
              <BestSellerProductsSection />
            </Suspense>
          </div>
          
          <div className="section-bg-alt p-3 md:p-6">
            <Suspense fallback={<ProductListSkeleton />}>
              <NewProductsProductsSection />
            </Suspense>
          </div>
          
          <div className="section-bg p-3 md:p-6">
            <Suspense fallback={<ProductListSkeleton />}>
              <ForeverSpecialProductsSection />
            </Suspense>
          </div>
          
          <div className="section-bg-alt p-3 md:p-6">
            <Suspense fallback={<ProductListSkeleton />}>
              <FeaturedProductsSection />
            </Suspense>
          </div>
          
          <div className="section-bg p-3 md:p-6 relative audio-decor">
            <Suspense fallback={<ProductListSkeleton />}>
              <ServicesSection />
            </Suspense>
          </div>
          {/* Các phần khác */}
        </div>
      </main>
    </>
  );
}

// Các component khác
async function BestSellerProductsSection() {
  const bestSellerProducts = await getBestSellerProducts();
  return <ProductList title="Sản phẩm bán chạy" products={bestSellerProducts} />;
}
async function NewProductsProductsSection() {
  const newProductsProductsSection = await getNewProducts();
  return <ProductList title="Sản phẩm mới" products={newProductsProductsSection} />;
}
async function ForeverSpecialProductsSection() {
  const foreverSpecialProducts = await getForeverSpecialProducts();
  return <ProductList title="Sản phẩm đặc biệt" products={foreverSpecialProducts} />;
}
async function FeaturedProductsSection() {
  const featuredProducts = await getFeaturedProducts();
  return <ProductList title="Sản phẩm nổi bật" products={featuredProducts} />;
}
async function ServicesSection() {
  const services = await getServices();
  return <ServiceList title="Dịch vụ của chúng tôi" services={services} />;
}