'use client';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/types/products';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { PackageX } from 'lucide-react';
import Link from 'next/link';

interface ProductListProps {
  title?: string;
  products: Product[];
  gridClass?: string;
  emptyMessage?: ReactNode;
  className?: string;
}

export function ProductList({ 
  title,
  products,
  gridClass = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  emptyMessage = 'Không có sản phẩm nào',
  className = ''
}: ProductListProps) {
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (!products || products.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center py-16 px-4 text-center"
      >
        <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <PackageX className="h-8 w-8 text-gray-400" />
        </div>
        {typeof emptyMessage === 'string' ? (
          <p className="text-gray-500 font-medium">{emptyMessage}</p>
        ) : (
          emptyMessage
        )}
      </motion.div>
    );
  }

  return (
    <section className={`w-full ${className}`}>
      {title && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8"
        >
          <h2 className="section-title text-2xl sm:text-3xl font-bold relative inline-block">
            {title}
            <span className="absolute -bottom-1 left-0 w-2/3 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full"></span>
          </h2>
        </motion.div>
      )}
      
      <motion.div 
        className={`grid ${gridClass} gap-3 md:gap-5`}
        variants={container}
        initial="hidden"
        animate="show"
      >
        {products.map((product) => (
          <motion.div 
            key={product.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
            }}
          >
            <ProductCard 
              product={product} 
              className="w-full h-full"
            />
          </motion.div>
        ))}
      </motion.div>
      <div className="mt-8 text-center">
        <Link href="/products" className="btn-primary inline-block px-6 py-2 rounded-md">
          Xem tất cả
        </Link>
      </div>
    </section>
  );
}