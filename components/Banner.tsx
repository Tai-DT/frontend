"use client";

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { type CarouselApi } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface BannerData {
  id: number;
  Header: string;
  Subheader: string | null;
  CTA: string;
  url: string;
  image: { url: string; width: number; height: number }[];
}

interface BannerProps {
  banners: BannerData[];
}

const Banner: React.FC<BannerProps> = ({ banners }) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Define the slide duration constant - this makes it easy to keep everything in sync
  const SLIDE_DURATION = 5000; // 3 seconds to match autoplay delay

  const plugin = useRef(
    Autoplay({ 
      delay: SLIDE_DURATION, 
      stopOnInteraction: true,
      stopOnMouseEnter: true,
      rootNode: (emblaRoot) => emblaRoot.parentElement,
    })
  );

  // Track carousel state
  useEffect(() => {
    if (!api) return;
    
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
      setProgress(0); // Reset progress when slide changes
    });
    
    // Cleanup
    return () => {
      api.off("select", () => {});
    };
  }, [api]);

  // Progress bar animation
  useEffect(() => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    
    if (api) {
      const updateFrequency = 40; // Update every 40ms for smooth animation
      const incrementValue = 100 / (SLIDE_DURATION / updateFrequency); // Calculate increment to finish in exactly SLIDE_DURATION ms
      
      progressInterval.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 0;
          return prev + incrementValue; // Increment to match slide duration
        });
      }, updateFrequency);
    }
    
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [current, api]);

  if (!banners?.length) return null;

  return (
    <div className="relative w-full">
      <Carousel
        plugins={[plugin.current]}
        className="w-full overflow-hidden rounded-xl"
        setApi={setApi}
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        opts={{
          loop: true,  // This is the key setting that enables looping
          align: "start",
        }}
      >
        <CarouselContent>
          {banners.map((banner: BannerData, index: number) => (
            <CarouselItem key={banner.id} className="overflow-hidden">
              <BannerSlide banner={banner} index={index} isCurrent={index === current} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 z-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300" />
        <CarouselNext className="right-4 z-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300" />
      </Carousel>
      
      {/* Progress indicators */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 mb-2 z-20">
        {Array.from({ length: count }).map((_, index) => (
          <div 
            key={index}
            className="relative h-1.5 bg-white/30 rounded-full overflow-hidden"
            style={{ width: `${100 / count - 1}%`, maxWidth: '100px' }}
            onClick={() => api?.scrollTo(index)}
          >
            {index === current && (
              <motion.div 
                className="absolute inset-0 bg-primary"
                style={{ width: `${progress}%` }}
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const BannerSlide: React.FC<{ banner: BannerData; index: number; isCurrent: boolean }> = ({ banner, index, isCurrent }) => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });
  
  const imageRef = useRef<HTMLDivElement>(null);
  
  // Handle parallax effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageRef.current) return;
    
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    
    imageRef.current.style.transform = `scale(1.05) translate(${x * 20}px, ${y * 20}px)`;
  };
  
  const handleMouseLeave = () => {
    if (imageRef.current) {
      imageRef.current.style.transform = 'scale(1) translate(0px, 0px)';
    }
  };

  return (
    <motion.div 
      ref={ref}
      className="relative w-full overflow-hidden rounded-xl"
      style={{ height: "clamp(300px, 50vw, 600px)" }} // Responsive height
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0 }}
      animate={{ opacity: inView ? 1 : 0 }}
      transition={{ duration: 0.7 }}
    >
      <AnimatePresence>
        <motion.div 
          ref={imageRef}
          className="absolute inset-0 transition-transform duration-500 ease-out"
          animate={
            isCurrent 
              ? { scale: [1, 1.05], transition: { duration: 3, ease: "linear" }} // Match to 3 seconds
              : { scale: 1 }
          }
        >
          <Image
            src={banner.image[0]?.url}
            alt={banner.Header}
            fill
            priority={index === 0}
            loading={index === 0 ? "eager" : "lazy"}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end justify-start p-4 md:p-8">
        <motion.div 
          className="text-white max-w-xl backdrop-blur-sm bg-black/30 p-4 md:p-6 rounded-xl border border-white/10 shadow-xl"
          initial={{ y: 100, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : { y: 100, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.h2 
            className="text-2xl md:text-4xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
            initial={{ x: -50, opacity: 0 }}
            animate={inView ? { x: 0, opacity: 1 } : { x: -50, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {banner.Header}
          </motion.h2>
          
          {banner.Subheader && (
            <motion.p 
              className="text-gray-200 mb-3 md:mb-5 text-base md:text-xl"
              initial={{ x: -50, opacity: 0 }}
              animate={inView ? { x: 0, opacity: 1 } : { x: -50, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {banner.Subheader}
            </motion.p>
          )}
          
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={inView ? { x: 0, opacity: 1 } : { x: -50, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Button
              variant="default"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all duration-300 transform hover:scale-105 shadow-lg"
              asChild
            >
              <Link href={banner.url}>
                {banner.CTA}
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Banner;