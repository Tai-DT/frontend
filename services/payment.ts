import axiosInstance from '@/lib/axiosInstance';
import type { PaymentData, OrderInfo, TransactionItem } from '@/types/payment';

export async function createPayment(paymentData: PaymentData): Promise<OrderInfo> {
  try {
    // Ensure required fields exist
    if (!paymentData.amount || !paymentData.buyerName || !paymentData.buyerPhone) {
      throw new Error('Missing required payment information');
    }

    // Properly structure the request data for API
    const payload = {
      data: {
        ...paymentData,
        transactions: paymentData.transactions || { items: [] }
      }
    };

    console.log('Sending payment request with payload:', payload);
    
    const response = await axiosInstance.post('/api/payments', payload);
    
    if (!response.data) {
      throw new Error('Invalid response from payment API');
    }
    
    console.log('Payment API response:', response.data);
    
    const orderInfo = response.data;
    
    // Handle payment gateway errors
    if (orderInfo.payosError) {
      if (orderInfo.payosError.includes('Cổng thanh toán không tồn tại')) {
        return {
          ...orderInfo,
          paymentStatus: 'MAINTENANCE',
          maintenanceMessage: 'Hệ thống thanh toán đang bảo trì. Vui lòng chọn thanh toán khi nhận hàng (COD).'
        } as OrderInfo;
      } else {
        console.error(`Payment gateway error: ${orderInfo.payosError}`);
        throw new Error(orderInfo.payosError || 'Payment gateway error');
      }
    }
    
    // Validate checkout URL for bank payments
    if (paymentData.paymentMethod === 'bank' && !orderInfo.checkoutUrl) {
      console.error('Missing checkout URL for bank payment:', orderInfo);
      throw new Error('Không thể kết nối đến cổng thanh toán. Vui lòng thử lại sau.');
    }
    
    return orderInfo;
  } catch (error) {
    console.error('Payment creation failed:', error);
    throw error;
  }
}

export async function verifyPaymentStatus(orderCode: string): Promise<OrderInfo> {
  try {
    if (!orderCode) {
      console.error('No order code provided to verifyPaymentStatus');
      return createFallbackOrderInfo('unknown');
    }
    
    console.log(`Verifying payment status for order: ${orderCode}`);
    
    // First, try to get the payment data using direct URL query parameters
    let response;
    try {
      // Log the request URL and headers for debugging
      const apiUrl = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/payments`;
      console.log(`Making request to: ${apiUrl} with filters[orderCode]=${orderCode}`);
      
      response = await axiosInstance.get(`/api/payments`, {
        params: {
          'populate': '*',
          'filters[orderCode][$eq]': orderCode
        }
      });
      
      // Log the entire response for debugging
      console.log(`API response status for ${orderCode}: ${response.status}`);
      if (response.data) {
        const jsonStr = JSON.stringify(response.data);
        console.log(`Raw API response for ${orderCode} (truncated): ${jsonStr.substring(0, 500)}${jsonStr.length > 500 ? '...' : ''}`);
      } else {
        console.log(`Empty response data for ${orderCode}`);
      }
    } catch (fetchError) {
      console.error(`Error fetching payment data for ${orderCode}:`, fetchError);
      return createFallbackOrderInfo(orderCode);
    }
    
    // Debug the response structure with more details
    const responseStructure = {
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
      hasDataArray: response.data?.data ? Array.isArray(response.data.data) : false,
      dataLength: response.data?.data ? response.data.data.length : 0,
      firstRecord: response.data?.data?.[0] ? 
        { 
          id: response.data.data[0].id, 
          hasAttributes: !!response.data.data[0].attributes,
          attributeKeys: response.data.data[0].attributes ? Object.keys(response.data.data[0].attributes) : []
        } : 
        'No valid records',
      meta: response.data?.meta ? JSON.stringify(response.data.meta) : 'No meta data'
    };
    console.log('API Response structure:', JSON.stringify(responseStructure, null, 2));
    
    // Handle empty or invalid response
    if (!response.data || !response.data.data || !Array.isArray(response.data.data) || response.data.data.length === 0) {
      console.log(`No matching payment records found for order code: ${orderCode}`);
      
      // Try alternative endpoints in sequence
      const orderInfo = await tryAlternativeEndpoints(orderCode);
      if (orderInfo) return orderInfo;
      
      return createFallbackOrderInfo(orderCode);
    }
    
    // Process the first matching payment record
    const payment = response.data.data[0];
    return processPaymentRecord(payment, orderCode) || createFallbackOrderInfo(orderCode);
    
  } catch (error) {
    console.error('Error verifying payment status:', error);
    return createFallbackOrderInfo(orderCode);
  }
}

// New helper function to try alternative endpoints
async function tryAlternativeEndpoints(orderCode: string): Promise<OrderInfo | null> {
  // Try direct fetch first
  try {
    console.log(`Attempting direct fetch for order code: ${orderCode}`);
    const directResponse = await axiosInstance.get(`/api/payments/find-by-code/${orderCode}`);
    if (directResponse.data && directResponse.data.data) {
      console.log(`Direct fetch successful for ${orderCode}`);
      return processPaymentRecord(directResponse.data.data, orderCode);
    }
  } catch (directError) {
    console.error(`Direct fetch failed for ${orderCode}:`, directError);
  }
  
  // Try verify endpoint next
  try {
    console.log(`Attempting verify endpoint for order code: ${orderCode}`);
    const verifyResponse = await axiosInstance.get(`/api/payments/verify/${orderCode}`);
    if (verifyResponse.data) {
      console.log(`Verify endpoint successful for ${orderCode}`);
      return verifyResponse.data;
    }
  } catch (verifyError) {
    console.error(`Verify endpoint failed for ${orderCode}:`, verifyError);
  }
  
  return null;
}

// Helper function to process a payment record
function processPaymentRecord(payment: { id?: number; attributes?: Record<string, unknown> }, orderCode: string): OrderInfo | null {
  // Add defensive checks with more detailed logging
  if (!payment) {
    console.error(`Payment record is undefined or null for order code: ${orderCode}`);
    return createFallbackOrderInfo(orderCode);
  }
  
  if (!payment.id || Object.keys(payment).length === 0) {
    console.error(`Payment record is empty for order code: ${orderCode}`);
    return createFallbackOrderInfo(orderCode);
  }
  
  if (!payment.attributes || Object.keys(payment.attributes).length === 0) {
    console.error(`Payment record has no valid attributes for order code: ${orderCode}. Record:`, payment);
    
    // If we at least have an ID, create a minimal record with ID
    if (payment.id) {
      return {
        id: payment.id,
        orderCode: orderCode,
        amount: 0,
        description: 'Order with minimal information',
        paymentStatus: 'PENDING',
        paymentMethod: 'cod',
        buyerName: 'Customer',
        buyerEmail: null,
        buyerPhone: '',
        buyerAddress: '',
        checkoutUrl: null,
        qrCode: null,
        paymentLinkId: null,
        transactions: { items: [] }
      };
    }
    
    return createFallbackOrderInfo(orderCode);
  }
  
  const attributes = payment.attributes;
  
  // Ensure orderCode exists in attributes or use the provided one
  if (!attributes.orderCode) {
    console.warn(`Payment record missing orderCode in attributes for: ${orderCode}`);
    attributes.orderCode = orderCode;
  }
  
  // Create order info object with safe defaults
  const orderInfo: OrderInfo = {
    id: payment.id || 0,
    orderCode: attributes.orderCode as string,
    amount: Number(attributes.amount || 0),
    description: typeof attributes.description === 'string' ? attributes.description : 'Order',
    paymentStatus: (attributes.paymentStatus === 'SUCCESS' || 
                   attributes.paymentStatus === 'FAILED' || 
                   attributes.paymentStatus === 'MAINTENANCE') ? 
                   attributes.paymentStatus : 'PENDING',
    paymentMethod: (attributes.paymentMethod === 'bank' ? 'bank' : 'cod'),
    buyerName: typeof attributes.buyerName === 'string' ? attributes.buyerName : 'Customer',
    buyerEmail: typeof attributes.buyerEmail === 'string' ? attributes.buyerEmail : null,
    buyerPhone: typeof attributes.buyerPhone === 'string' ? attributes.buyerPhone : '',
    buyerAddress: typeof attributes.buyerAddress === 'string' ? attributes.buyerAddress : '',
    checkoutUrl: typeof attributes.checkoutUrl === 'string' ? attributes.checkoutUrl : null,
    qrCode: typeof attributes.qrCode === 'string' ? attributes.qrCode : null,
    paymentLinkId: typeof attributes.paymentLinkId === 'string' ? attributes.paymentLinkId : null,
    transactions: { items: [] }
  };
  
  // Process transactions data if available
  try {
    if (attributes.transactions) {
      orderInfo.transactions = parseTransactions(attributes.transactions);
    }
  } catch (e) {
    console.warn('Error parsing transactions data:', e);
  }
  
  return orderInfo;
}

// Helper function to create a fallback order info when API data is missing
function createFallbackOrderInfo(orderCode: string): OrderInfo {
  console.log(`Creating fallback order info for: ${orderCode}`);
  
  return {
    id: 0,
    orderCode: orderCode || 'unknown',
    amount: 0,
    description: 'Fallback order information',
    paymentStatus: 'PENDING',
    paymentMethod: 'cod',
    buyerName: 'Customer',
    buyerEmail: null,
    buyerPhone: '',
    buyerAddress: '',
    checkoutUrl: null,
    qrCode: null,
    paymentLinkId: null,
    transactions: { items: [] }
  };
}

// Define a type for transactions object
type TransactionItems = { items: TransactionItem[] };

// Helper to safely parse transactions
function parseTransactions(transactions: unknown): { items: TransactionItem[] } {
  if (!transactions) {
    return { items: [] };
  }
  
  try {
    // Handle string transaction data
    if (typeof transactions === 'string') {
      try {
        transactions = JSON.parse(transactions);
      } catch (parseError) {
        console.error('Error parsing transaction string:', parseError);
        return { items: [] };
      }
    }
    
    // Process object or array based transaction data
    if (transactions && typeof transactions === 'object') {
      // Case: { items: [...] }
      if ('items' in transactions && Array.isArray((transactions as TransactionItems).items)) {
        return { 
          items: (transactions as TransactionItems).items.map(item => item as TransactionItem)
        };
      } 
      // Case: Direct array
      else if (Array.isArray(transactions)) {
        return { items: transactions.map(item => item as TransactionItem) };
      }
    }
  } catch (e) {
    console.error('Error processing transactions:', e);
  }
  
  return { items: [] };
}

export async function regeneratePaymentLink(orderCode: string): Promise<{ checkoutUrl: string }> {
  try {
    if (!orderCode) {
      throw new Error('Order code is required for regenerating payment link');
    }
    
    const response = await axiosInstance.post('/api/payments/create-link', { 
      orderCode 
    });
    
    if (!response.data || !response.data.checkoutUrl) {
      throw new Error('Failed to generate payment link: Invalid response');
    }
    
    return response.data;
  } catch (error) {
    console.error('Payment link regeneration failed:', error);
    throw error;
  }
}

// Improved function to fetch payment details
export async function fetchPaymentDetails(orderCode: string): Promise<OrderInfo> {
  try {
    if (!orderCode) {
      throw new Error('Order code is required to fetch payment details');
    }
    
    console.log(`Fetching payment details for order: ${orderCode}`);
    
    // Try direct API endpoint first (most reliable)
    try {
      const directResponse = await axiosInstance.get(`/api/payments/find-by-code/${orderCode}`);
      if (directResponse.data && directResponse.data.data) {
        console.log(`Direct fetch successful for ${orderCode}`);
        const result = processPaymentRecord(directResponse.data.data, orderCode);
        if (!result) {
          throw new Error('Failed to process payment record');
        }
        return result;
      }
    } catch (directError) {
      console.error(`Direct fetch failed for ${orderCode}, trying alternative endpoint:`, directError);
    }
    
    // Try standard Strapi endpoint with filters
    const response = await axiosInstance.get('/api/payments', {
      params: {
        'populate': '*',
        'filters[orderCode][$eq]': orderCode
      }
    });

    if (!response.data || !response.data.data || response.data.data.length === 0) {
      throw new Error('No payment details found for the provided order code');
    }

    const payment = response.data.data[0];
    const orderInfo = processPaymentRecord(payment, orderCode);
    if (!orderInfo) {
      throw new Error('Failed to process payment record');
    }
    return orderInfo;
  } catch (error) {
    console.error('Error fetching payment details:', error);
    throw error;
  }
}