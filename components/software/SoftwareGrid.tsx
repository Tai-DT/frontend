"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getStrapiImageUrl } from '@/lib/imageUrl';
import { Service } from '@/types/services';

interface SoftwareGridProps {
  services: Service[];
}

export default function SoftwareGrid({ services }: SoftwareGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="software-list" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-3xl md:text-5xl font-bold mb-16 text-center text-red-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="relative">
            Danh Sách Phần Mềm
            <span className="absolute -bottom-3 left-0 right-0 h-1 bg-yellow-500"></span>
          </span>
        </motion.h2>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {services.map((service) => (
            <motion.div key={service.id} variants={itemVariants}>
              <Link href={`/services/${service.slug}`}>
                <Card className="h-full hover:shadow-2xl transition-all duration-500 border-2 border-yellow-200 overflow-hidden group rounded-xl bg-white">
                  <CardHeader className="p-0">
                    {service.image?.[0] && (
                      <div className="relative w-full h-52 overflow-hidden">
                        <Image
                          src={getStrapiImageUrl(service.image[0].url) || "/placeholder-service.png"}
                          alt={service.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80" />
                        <Badge className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-3 py-1">
                          Mới
                        </Badge>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="pt-6 relative z-10">
                    <h3 className="text-2xl font-bold mb-3 text-red-600 group-hover:text-red-700 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-gray-700 line-clamp-3 mb-4">{service.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-yellow-200">
                      {service.details.length > 0 && (
                        <p className="text-sm text-yellow-600 font-medium">
                          {service.details.length} gói dịch vụ
                        </p>
                      )}
                      <span className="inline-flex items-center text-red-600 font-medium group-hover:translate-x-1 transition-transform">
                        Xem chi tiết <ChevronRight className="h-4 w-4 ml-1" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
