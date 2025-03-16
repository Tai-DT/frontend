'use client';
import { useCart } from '@/hooks/useCart';
import { safeRender } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CheckoutButton } from '@/components/cart/checkout-button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { CartItem } from '@/types/cart'; // Assuming you have CartItem type
import Image from 'next/image'; // Import next/image
import { getStrapiImageUrl } from '@/lib/imageUrl'; // Import your utility function

export default function CartPage() {
  const {
    items,
    totalItems = 0,
    totalPrice = 0,
    updateItemQuantity,
    removeFromCart,
    formatCurrency,
  } = useCart();

  const shippingFee = 30000; // Phí vận chuyển cố định
  const totalOrderPrice = (totalPrice || 0) + shippingFee;

  // Error handling (example - adjust based on your useCart implementation)
  if (!items) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Error loading cart data.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingCart className="mx-auto h-24 w-24 text-yellow-300 mb-6" />
        <h1 className="text-2xl font-bold mb-4 text-red-600">Giỏ hàng trống</h1>
        <Link href="/products">
          <Button className="bg-red-600 hover:bg-red-700 text-white">Tiếp tục mua sắm</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 text-red-600">
        Giỏ Hàng ({safeRender(totalItems)} sản phẩm)
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Danh sách sản phẩm */}
        <div className="md:col-span-2 space-y-6">
          {items.map((item: CartItem) => (
            <Card key={item.id} className="w-full border border-yellow-200">
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="relative w-24 h-24 shrink-0">
                  {item.image && (
                    <Image
                      src={getStrapiImageUrl(item.image)}
                      alt={safeRender(item.name) || 'Product Image'}
                      width={90}
                      height={90}
                      layout="responsive"
                      className="object-cover rounded-md w-full h-full"
                    />
                  )}
                </div>

                <div className="flex-grow">
                  <Link
                    href={`/products/${safeRender(item.slug)}`}
                    className="text-lg font-semibold hover:text-red-600"
                  >
                    {safeRender(item.name)}
                  </Link>
                  <p className="text-yellow-600">
                    {formatCurrency(item.price || 0)}
                  </p>
                   <p className="text-gray-600">
                       Product Code: {item.product_code}
                   </p>
                </div>

                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      updateItemQuantity(item.id, (item.quantity || 1) - 1)
                    }
                    disabled={!(item?.quantity) || item?.quantity <= 1}
                    className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-bold">
                    {safeRender(item.quantity)}
                  </span>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      updateItemQuantity(item.id, (item.quantity || 0) + 1)
                    }
                    className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="font-bold text-lg">
                  {formatCurrency((item.price || 0) * (item.quantity || 1))}
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order summary */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                {safeRender('Order Summary')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <span>Total Items:</span>
                <span>{safeRender(totalItems)}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee:</span>
                <span>{formatCurrency(shippingFee)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>{formatCurrency(totalOrderPrice)}</span>
              </div>
              <CheckoutButton totalPrice={totalOrderPrice} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}