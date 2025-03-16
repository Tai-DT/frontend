import axios from 'axios';

// Interface cho kết quả tạo thanh toán
interface PaymentResult {
  success: boolean;
  checkoutUrl?: string;
  message?: string;
}

// Hàm tạo thanh toán
export const createPayment = async ({
  amount,
  description,
  orderCode,
  buyerName,
  buyerEmail,
  buyerPhone,
  buyerAddress
}: {
  amount: number;
  description: string;
  orderCode: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAddress: string;
}): Promise<PaymentResult> => {
  try {
    // Gửi request tạo thanh toán đến Strapi
    const response = await axios.post('/api/payments', {
      data: {
        amount,
        description,
        orderCode,
        buyerName,
        buyerEmail,
        buyerPhone,
        buyerAddress
      }
    });

    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo thanh toán.'
    };
  }
};