// components/OrderSummary.tsx
import { CartItem } from '@/types/cart';

interface OrderSummaryProps {
  items: CartItem[];
  totalAmount: number;
}

export function OrderSummary({ items, totalAmount }: OrderSummaryProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Đơn hàng của bạn</h2>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between">
            <span>
              {item.name} x {item.quantity || 1}
            </span>
            <span>{(item.price * (item.quantity || 1)).toLocaleString()} VND</span>
          </div>
        ))}
      </div>
      <div className="border-t pt-4">
        <div className="flex justify-between font-semibold">
          <span>Tổng cộng</span>
          <span>{totalAmount.toLocaleString()} VND</span>
        </div>
      </div>
    </div>
  );
}