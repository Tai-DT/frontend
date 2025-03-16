// hooks/useCart.ts
import { useCheckoutStore } from '@/store/useCheckoutStore';

export type CheckoutItem = {
  id: number;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image: string;
  product_code: string;
  
};

export function formatCurrency(value: number): string {
    if (value == null || isNaN(value)) {
        return "0 ₫";
    }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value);
}

export function useCart() {
    const {
        items,
        addItem,
        removeItem,
        updateQuantity,
    } = useCheckoutStore();

    const addToCart = (item: CheckoutItem) => {
      
        addItem(item);
    };

    const updateItemQuantity = (id: number, quantity: number) => {
        updateQuantity(id, quantity);
    };

    const removeFromCart = (id: number) => {
        removeItem(id);
    };
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

    const canProceedToCheckout = () => totalItems > 0;


    return {
      items,
      totalItems,
      totalPrice,
      addToCart,
      updateItemQuantity,
      removeFromCart,
      canProceedToCheckout,
       formatCurrency
    };
}