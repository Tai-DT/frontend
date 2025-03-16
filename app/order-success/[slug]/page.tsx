import { OrderInfo } from '@/types/payment';
import OrderSuccessClient from './OrderSuccessClient';
import { fetchPaymentDetails } from '@/services/payment';

// Update interface to match the pattern used in categories page
interface OrderSuccessPageProps {
  params: Promise<{ 
    slug: string;
  }>;
}

// Updated to use the dedicated fetchPaymentDetails function
async function fetchOrderInfo(orderCode: string): Promise<OrderInfo> {
    console.log('Starting order fetch attempt for:', orderCode);
    
    if (!orderCode) {
        console.error('Invalid order code provided');
        return createPlaceholderOrder('unknown');
    }
    
    // Always provide a fallback for development or when real data fails
    function createPlaceholderOrder(code: string): OrderInfo {
        console.log('Creating placeholder order for:', code);
        return {
            id: 0,
            orderCode: code,
            amount: 0,
            description: 'Order information placeholder',
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

    try {
        console.log(`Fetching order info for: ${orderCode}`);
        const result = await fetchPaymentDetails(orderCode);
        
        // Log the order info for debugging
        console.log(`Order info received for ${orderCode}: ID=${result.id}, Status=${result.paymentStatus}`);
        return result;
    } catch (error) {
        console.error('Error fetching order data:', error);
        return createPlaceholderOrder(orderCode);
    }
}

// Page component with enhanced error handling and fixed type issue
export default async function Page({ params }: OrderSuccessPageProps) {
    // Resolve the params Promise to get the slug
    const resolvedParams = await params;
    const orderCode = resolvedParams.slug;
    console.log('Processing order success page for order:', orderCode);
    
    // fetchOrderInfo always returns a valid OrderInfo object now
    const orderInfo = await fetchOrderInfo(orderCode);
    
    // Use ID=0 as an indicator that we're using a fallback order
    const fetchError = orderInfo.id === 0; 
    
    // Always render the client component with valid order info
    return <OrderSuccessClient 
        orderInfo={orderInfo} 
        orderCode={orderCode} 
        fetchError={fetchError} 
    />;
}
