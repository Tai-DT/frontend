// components/cart/checkout-button.tsx
'use client';

import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CheckoutButtonProps {
  variant?: 'default' | 'outline';
  className?: string;
  children?: React.ReactNode;
  totalPrice: number;
}

export function CheckoutButton({
  variant = 'default',
  className = '',
  children
}: CheckoutButtonProps) {
  const { canProceedToCheckout } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    if (canProceedToCheckout()) {
      router.push('/checkout');
    } else {
      toast.error('Giỏ hàng của bạn đang trống', {
        description: 'Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn('checkout-button', className)}
    >
      <Button 
        onClick={handleCheckout}
        variant={variant}
        className={className}
      >
        {children || (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" /> 
            Thanh Toán
          </>
        )}
      </Button>
    </motion.div>
  );
}