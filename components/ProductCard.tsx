'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import { Product } from '@/types/products';
import { useCart } from '@/hooks/useCart';
import { getStrapiImageUrl } from '@/lib/imageUrl';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface ExtendedProduct extends Product {
  discount?: number;
}

interface ProductCardProps {
  product: ExtendedProduct;
  showActions?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  showActions = true,
  className = ''
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  const firstImage = product.image?.[0];
  const imageUrl = getStrapiImageUrl(firstImage?.url) || '/placeholder.png';
  const secondImage = product.image?.[1] ? getStrapiImageUrl(product.image[1].url) : null;

  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(product.price ? parseFloat(product.price.toString()) : 0);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price ? parseFloat(product.price.toString()) : 0,
      image: imageUrl,
      slug: product.slug,
      quantity: 1,
      product_code: product.product_code || '' // Fixed: Handle undefined product_code
    });

    // Animation feedback could be added here
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className={`h-full ${className}`}
    >
      <Card 
        className={`relative w-full h-full flex flex-col overflow-hidden transition-all duration-300 
        hover:shadow-xl group border border-gray-200/50 hover:border-red-400/30 rounded-xl`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Like button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            setIsLiked(!isLiked);
          }}
          title="Add to favorites"
          aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
          className="absolute top-3 right-3 z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0"
        >
          <Heart 
            className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'} transition-colors duration-300`}
          />
        </button>
        
        <CardHeader className="p-0 relative flex-shrink-0">
          <Link href={`/products/${product.slug}`} className="block overflow-hidden">
            <div className="relative w-full pb-[100%] overflow-hidden">
              {/* Primary image */}
              <Image
                src={imageUrl}
                alt={firstImage?.alternativeText || product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 
                  ${isHovered && secondImage ? 'opacity-0' : 'opacity-100'}`}
                priority
              />
              
              {/* Secondary image (if available) */}
              {secondImage && (
                <Image
                  src={secondImage}
                  alt={`${product.name} alternative view`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 
                    ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                />
              )}
              
              {/* Gradients and badges */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 
                group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {product.featured && (
                <Badge variant="destructive" className="absolute top-3 left-3 z-10 font-medium bg-gradient-to-r 
                  from-red-500 to-orange-500 text-white shadow-md py-1 px-2 animate-pulse">
                  Nổi bật
                </Badge>
              )}
              
              {(product.discount ?? 0) > 0 && (
                <div className="absolute top-3 right-3 z-10 shadow-md">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500 rounded-full blur-sm opacity-30 animate-pulse"></div>
                    <Badge variant="secondary" className="relative font-medium bg-green-500 
                      text-white py-1 px-2 rounded-full">
                      -{product.discount}%
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </Link>
        </CardHeader>

        <CardContent className="flex-grow p-4 space-y-3 bg-gradient-to-b from-gray-50/50 to-white">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start gap-2">
              <Link href={`/products/${product.slug}`} className="block group-hover:text-primary transition-colors">
                <h3 className="font-bold text-sm sm:text-base">
                  {product.name}
                </h3>
              </Link>
            </div>
            
            {product.category?.name && (
              <Badge variant="outline" className="text-xs self-start bg-red-500/5 border-red-500/20 text-red-500/90">
                {product.category.name}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <motion.span 
              className="text-red-600 font-bold text-base sm:text-lg bg-red-50 px-2 py-0.5 rounded"
              initial={false}
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
            >
              {formattedPrice}
            </motion.span>
          </div>
        </CardContent>

        {showActions && (
          <CardFooter className="flex flex-col sm:flex-row justify-between p-3 sm:p-4 pt-0 mt-auto space-y-2 sm:space-y-0 sm:space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full sm:w-1/2 border-yellow-500/50 text-yellow-600 hover:bg-yellow-50 
                transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group" 
              asChild
            >
              <Link href={`/products/${product.slug}`}>
                <span className="absolute inset-0 bg-gradient-to-r from-yellow-100 to-yellow-50 w-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                <span className="relative flex items-center justify-center">
                  <Eye className="mr-2 h-4 w-4" /> Chi tiết
                </span>
              </Link>
            </Button>
            <Button 
              size="sm" 
              className="w-full sm:w-1/2 bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-500 
                hover:to-yellow-400 shadow-sm hover:shadow transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group" 
              onClick={handleAddToCart}
            >
              <span className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
              <span className="relative flex items-center justify-center">
                <ShoppingCart className="mr-2 h-4 w-4" /> Mua ngay
              </span>
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}