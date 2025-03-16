export interface TransactionItem {
  name: string;
  quantity: number;
  price: number;
}

export interface OrderInfo {
  id: number;
  orderCode: string;
  amount: number;
  description: string;
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'MAINTENANCE';
  paymentMethod: 'cod' | 'bank';
  buyerName: string;
  buyerEmail?: string | null;
  buyerPhone: string;
  buyerAddress: string;
  transactions: {
    items: TransactionItem[];
  };
  checkoutUrl?: string | null;
  qrCode?: string | null;
  paymentLinkId?: string | null;
  payosError?: string | null;
  maintenanceMessage?: string;
}

export interface PaymentData {
  amount: number;
  description: string;
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
  paymentMethod: 'cod' | 'bank';
  buyerName: string;
  buyerEmail?: string | null;
  buyerPhone: string;
  buyerAddress: string;
  transactions: {
    items: TransactionItem[];
  };
}