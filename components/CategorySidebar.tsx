"use client"

import React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Category as BaseCategory } from '@/types/products';
import { Package2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

// Extend the base Category type with productCount
interface Category extends BaseCategory {
  productCount?: number;
}
import Image from 'next/image';
import { getStrapiImageUrl } from '@/lib/imageUrl';
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface CategorySidebarProps {
  categories: Category[];
  className?: string;
}

export function CategorySidebar({
  categories,
  className = "",
}: CategorySidebarProps) {
  const pathname = usePathname();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <Card className={`${className} overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300`}>
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Package2 className="w-5 h-5 text-primary" />
          Danh Mục Sản Phẩm
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <motion.div 
            className="py-2"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item}>
              <Link
                href="/products"
                className={`flex items-center gap-2 px-4 py-3 transition-all hover:bg-accent group ${
                  pathname === '/products' 
                    ? 'bg-primary/10 text-primary font-medium border-l-4 border-primary' 
                    : 'border-l-4 border-transparent'
                }`}
              >
                <Package2 className={`w-5 h-5 ${pathname === '/products' ? 'text-primary' : 'group-hover:text-primary transition-colors'}`} />
                <span>Tất cả sản phẩm</span>
                <Badge variant="outline" className="ml-auto py-0 h-6 opacity-60">
                  {categories.reduce((acc, cat) => acc + (cat.productCount || 0), 0)}
                </Badge>
              </Link>
            </motion.div>
            
            {categories.map((category) => (
              <motion.div key={category.id} variants={item}>
                <Link
                  href={`/categories/${category.slug}`}
                  className={`flex items-center gap-2 px-4 py-3 transition-all hover:bg-accent group ${
                    pathname === `/categories/${category.slug}` 
                      ? 'bg-primary/10 text-primary font-medium border-l-4 border-primary' 
                      : 'border-l-4 border-transparent'
                  }`}
                >
                  <div className={`relative w-5 h-5 flex-shrink-0 overflow-hidden ${
                    pathname === `/categories/${category.slug}` ? 'scale-110' : 'group-hover:scale-110'
                  } transition-transform`}>
                    {category.icon ? (
                      <Image
                        src={getStrapiImageUrl(category.icon.url) || "/placeholder-image.png"}
                        alt={category.name}
                        fill
                        className="object-contain"
                        sizes="100%"
                      />
                    ) : (
                      <Package2 className="w-5 h-5" />
                    )}
                  </div>
                  <span className="truncate">{category.name}</span>
                  {(category.productCount ?? 0) > 0 && (
                    <Badge variant="outline" className="ml-auto py-0 h-6 opacity-60">
                      {category.productCount ?? 0}
                    </Badge>
                  )}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}