import { create } from 'zustand';

interface Item {
  product_code: string;
  id: number;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image: string;
}

interface CheckoutState {
  items: Item[];
  formData: {
    fullName: string;
    phone: string;
    address: string;
    email?: string;
  };
  addItem: (item: Item) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  setFormData: (data: { fullName: string; phone: string; address: string; email?: string }) => void;
  getTotalAmount: () => number;
}

const useCheckoutStore = create<CheckoutState>((set, get) => ({
  items: [],
  formData: {
    fullName: '',
    phone: '',
    address: '',
    email: '',
  },
  addItem: (item) =>
    set((state) => {
      const existingItemIndex = state.items.findIndex((i) => i.id === item.id);

      if (existingItemIndex > -1) {
        const updatedItems = state.items.map((i, index) => {
          if (index === existingItemIndex) {
            return { ...i, quantity: i.quantity + item.quantity };
          }
          return i;
        });
        return { items: updatedItems };
      } else {
        // Đảm bảo item mới có product_code
        return { items: [...state.items, { ...item, product_code: item.product_code }] };
      }
    }),
  removeItem: (id: number) =>
    set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
  updateQuantity: (id, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity } : item,
      ),
    })),
  setFormData: (data) => set({ formData: data }),
  getTotalAmount: () => {
    const total = get().items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    return Math.round(total); // Làm tròn tổng tiền
  },
}));

export { useCheckoutStore };