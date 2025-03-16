'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from 'react-toastify';
import { Product } from '@/types/products';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { getStrapiImageUrl } from '@/lib/imageUrl';

interface AddToCartButtonProps {
  product: Product;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
}

export function AddToCartButton({ product, className, variant = 'default' }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = () => {
    setIsLoading(true);
    
    // Get the image URL correctly
    const imageUrl = product.image && product.image.length > 0 ? getStrapiImageUrl(product.image[0].url) : '';
    
    // Simulate a small delay for visual feedback
    setTimeout(() => {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price ? parseFloat(product.price) : 0, // Fixed: Handle undefined price
        image: imageUrl,
        slug: product.slug,
        quantity: 1,
        product_code: product.product_code || '', // Fixed: Handle undefined product_code
      });
      
      toast.success('Đã thêm sản phẩm vào giỏ hàng!', {
        position: 'bottom-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      setIsLoading(false);
    }, 600);
  };

  const buttonClasses = cn(
    "relative overflow-hidden group",
    variant === 'default' ? "bg-gradient-to-r from-red-600 to-yellow-500 text-white hover:from-red-700 hover:to-yellow-600" : "",
    variant === 'outline' ? "border-2 border-red-500 text-red-600 hover:bg-red-50" : "",
    variant === 'secondary' ? "bg-yellow-500 hover:bg-yellow-600 text-red-900" : "",
    className
  );

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        onClick={handleAddToCart}
        className={buttonClasses}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            Đang thêm...
          </div>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4 group-hover:animate-bounce" /> 
            <span className="relative">
              Thêm vào giỏ
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white/60 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </span>
          </>
        )}
      </Button>
    </motion.div>
  );
}