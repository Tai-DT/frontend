import { CartItem } from './cart';

export interface FormData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  province: string;
  district: string;
  ward: string;
}

export interface CheckoutStore {
  // State
  items: CartItem[];
  formData: FormData;
  
  // Actions
  getTotalAmount: () => number;
  resetStore: () => void;
  setFormData: (data: Partial<FormData>) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
}