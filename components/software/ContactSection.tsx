"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactSection() {
  return (
    <section className="relative">
      <div className="absolute top-0 left-0 right-0 h-20 bg-yellow-50 transform rotate-180 clip-wave"></div>
      <div className="bg-gradient-to-r from-red-600 to-yellow-500 py-20 md:py-24 text-white">
        <motion.div 
          className="container mx-auto px-4 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-3xl md:text-5xl font-bold mb-6"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Cần Tư Vấn Thêm?
          </motion.h2>
          <motion.p 
            className="text-lg md:text-xl text-yellow-100 mb-8 max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ bạn 24/7 với các giải pháp phần mềm tốt nhất
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Link href="/lien-he">
              <Button className="bg-white text-red-600 hover:bg-yellow-100 font-bold px-8 py-6 rounded-full shadow-lg transform transition hover:scale-105">
                <Phone className="mr-2 h-5 w-5" /> Liên Hệ Ngay
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
