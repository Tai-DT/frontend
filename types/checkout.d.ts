export interface CartItem {

  id: string;

  name: string;

  slug: string;

  price: number;

  quantity: number;

  image: string;

  [key: string]: string | number; // Specify a more specific type

};

export interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  note?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Order {
  id?: string;
  items: CartItem[];
  customer: CheckoutFormData;
  totalAmount: number;
  paymentMethod: string;
  status?: 'pending' | 'paid' | 'cancelled';
}
export interface PaymentData {
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  paymentMethod: string;
}
export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}
export interface PaymentResponse {
  success: boolean;
  message: string;
  orderCode?: string;
  paymentUrl?: string;
}
export interface OrderFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: 'cod' | 'bank' | 'momo';
}
export interface CheckoutStore {
  // State
  items: CartItem[];
  formData: FormData;
  
  // Actions
  getTotalAmount: () => number;
  getTotalItems: () => number;
  setFormData: (data: Partial<FormData>) => void;
  updateFormData: (data: Partial<FormData>) => void;  // Add this line
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  resetStore: () => void;
}