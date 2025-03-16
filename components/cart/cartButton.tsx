// components/cart/cart-button.tsx
'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

export function CartButton() {
  const { items, totalItems, totalPrice, removeFromCart, updateItemQuantity } = useCart();

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(value);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Giỏ Hàng</SheetTitle>
        </SheetHeader>
        
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ShoppingCart className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">Giỏ hàng của bạn đang trống</p>
            <Link href="/products" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <ScrollArea className="flex-grow pr-4">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center border-b py-4 last:border-b-0"
                >
                  
                  <div className="flex-grow">
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    <p className="text-blue-600 font-bold">
                      {formatCurrency(item.price)}
                    </p>
                    
                    <div className="flex items-center mt-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 mr-2"
                        onClick={() => updateItemQuantity(item.id, (item.quantity ?? 0) - 1)}
                      >
                        -
                      </Button>
                      <span>{item.quantity}</span>
                      <Button 
                        variant="outline" size="icon" 
                        className="h-8 w-8 ml-2"
                        onClick={() => updateItemQuantity(item.id, (item.quantity ?? 0) + 1)}
                      >
                        +
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="ml-4"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
            <div className="p-4">
              <h4 className="font-semibold">Tổng cộng: {formatCurrency(totalPrice)}</h4>
              <Link href="/checkout" className="mt-4 block w-full text-center bg-blue-500 text-white rounded py-2 hover:bg-blue-600">
                Thanh toán
              </Link>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}