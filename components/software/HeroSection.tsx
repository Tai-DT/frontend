"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-red-600 to-yellow-500 py-16 md:py-24 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-pattern-overlay"></div>
      </div>
      <motion.div 
        className="container mx-auto px-4 text-center relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1 
          className="text-4xl md:text-6xl font-bold mb-6"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Phần Mềm Chuyên Nghiệp
        </motion.h1>
        <motion.p 
          className="text-lg md:text-xl text-yellow-100 max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Cung cấp giải pháp phần mềm toàn diện về hệ thống âm thanh, thiết bị karaoke và dịch vụ liên quan
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Link href="#software-list">
            <Button className="bg-white text-red-600 hover:bg-yellow-100 font-bold px-8 py-6 shadow-lg rounded-full transform transition hover:scale-105">
              Khám phá ngay
            </Button>
          </Link>
        </motion.div>
      </motion.div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-yellow-50 clip-wave"></div>
    </section>
  );
}
