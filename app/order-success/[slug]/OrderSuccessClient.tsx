/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { OrderInfo } from '@/types/payment';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { fetchPaymentDetails } from '@/services/payment';
import { Loader2, AlertTriangle, RefreshCw, CheckCircle, Clock, Download, Heart } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { generateOrderPdf } from '@/lib/pdfGenerator';
import { motion } from 'framer-motion';

type OrderSuccessClientProps = {
  orderInfo: OrderInfo | null;
  orderCode: string;
  fetchError?: boolean;
};

const OrderSuccessClient = ({
  orderInfo: initialOrderInfo,
  orderCode,
  fetchError = false
}: OrderSuccessClientProps) => {
  // State management
  const router = useRouter();
  const [countdown, setCountdown] = useState<number>(60);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(initialOrderInfo);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    fetchError ? 'Không thể tải thông tin đơn hàng đầy đủ từ máy chủ.' : null
  );
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  // Memoized function for fetching order data
  const fetchOrderData = useCallback(async () => {
    if (!orderCode) {
      setErrorMsg('Mã đơn hàng không hợp lệ.');
      setIsLoading(false);
      return;
    }

    try {
      console.log(`Fetching payment info for: ${orderCode}`);
      const data = await fetchPaymentDetails(orderCode);

      if (data) {
        setOrderInfo(data);
        setErrorMsg(null);
        setRetryCount(0);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to fetch order info:', error);
      return false;
    }
  }, [orderCode]);

  // Handles manual refresh of payment status
  const refreshPaymentStatus = useCallback(async () => {
    if (!orderCode) return;
    
    setIsRefreshing(true);
    setErrorMsg(null);
    
    try {
      const success = await fetchOrderData();
      if (!success) {
        setErrorMsg('Không thể cập nhật thông tin đơn hàng.');
      }
    } catch (_error) {
      setErrorMsg('Có lỗi xảy ra khi cập nhật thông tin.');
    } finally {
      setIsRefreshing(false);
    }
  }, [orderCode, fetchOrderData]);

  // Generates PDF with type-safe handling
  const handleDownloadPdf = useCallback(async () => {
    if (!orderInfo) return;
    
    try {
      setIsPdfGenerating(true);
      
      // Create a valid OrderInfo object with explicit null handling
      const validOrderInfo: OrderInfo = {
        id: orderInfo.id,
        orderCode: orderInfo.orderCode,
        amount: orderInfo.amount,
        description: orderInfo.description,
        paymentStatus: orderInfo.paymentStatus,
        paymentMethod: orderInfo.paymentMethod,
        buyerName: orderInfo.buyerName,
        buyerEmail: orderInfo.buyerEmail === undefined ? null : orderInfo.buyerEmail,
        buyerPhone: orderInfo.buyerPhone,
        buyerAddress: orderInfo.buyerAddress,
        checkoutUrl: orderInfo.checkoutUrl || null,
        qrCode: orderInfo.qrCode || null,
        paymentLinkId: orderInfo.paymentLinkId || null,
        transactions: {
          items: orderInfo.transactions?.items || []
        },
        ...(orderInfo.maintenanceMessage && { maintenanceMessage: orderInfo.maintenanceMessage }),
        ...(orderInfo.payosError && { payosError: orderInfo.payosError })
      };
      
      await generateOrderPdf(validOrderInfo);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setIsPdfGenerating(false);
    }
  }, [orderInfo]);

  // Automatic countdown timer & redirect for completed orders
  useEffect(() => {
    if (orderInfo?.paymentStatus === 'SUCCESS' || 
        (orderInfo?.paymentMethod === 'cod' && orderInfo.paymentStatus !== 'FAILED')) {
      const timer = setInterval(() => {
        setCountdown(prev => (prev <= 1 ? 0 : prev - 1));
        
        if (countdown <= 1) {
          router.push('/');
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [countdown, orderInfo?.paymentStatus, orderInfo?.paymentMethod, router]);

  // Automatic data fetching for pending/problematic orders
  useEffect(() => {
    const needsRefresh = 
      fetchError || 
      orderInfo?.paymentStatus === 'PENDING' || 
      orderInfo?.paymentStatus === 'FAILED' || 
      !orderInfo?.paymentMethod || 
      (orderInfo?.paymentMethod !== 'cod' && orderInfo?.paymentMethod !== 'bank');
    
    if (needsRefresh && orderCode) {
      const shouldShowLoading = !orderInfo || orderInfo.paymentStatus === 'FAILED';
      if (shouldShowLoading) setIsLoading(true);
      
      const timer = setTimeout(async () => {
        const success = await fetchOrderData();
        
        if (!success && retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
        } else if (!success) {
          if (!orderInfo) {
            setErrorMsg('Không thể tìm thấy thông tin đơn hàng.');
          } else {
            setErrorMsg('Không thể cập nhật thông tin đơn hàng.');
          }
          setIsLoading(false);
        }
      }, retryCount > 0 ? retryCount * 1000 : 500);
      
      return () => clearTimeout(timer);
    }
  }, [orderInfo, orderCode, fetchError, retryCount, fetchOrderData]);

  // Reset loading state when max retries reached
  useEffect(() => {
    if (retryCount >= MAX_RETRIES) {
      setIsLoading(false);
    }
  }, [retryCount]);
  
  // Determine if order has incomplete info
  const isIncompleteOrder = !orderInfo || 
    orderInfo.paymentStatus === 'FAILED' || 
    !orderInfo.paymentMethod || 
    (orderInfo.paymentMethod !== 'cod' && orderInfo.paymentMethod !== 'bank');
  
  // Loading state UI
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-yellow-200 shadow-lg p-6 text-center"
        >
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Đang tải thông tin đơn hàng
            {retryCount > 0 ? ` (Lần thử ${retryCount}/${MAX_RETRIES})` : ''}
          </h2>
          <p>Vui lòng chờ trong giây lát...</p>
          
          <motion.div 
            className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div 
              className="bg-gradient-to-r from-yellow-400 to-red-500 h-full rounded-full"
              initial={{ width: "5%" }}
              animate={{ width: "95%" }}
              transition={{ duration: 15, ease: "linear" }}
            />
          </motion.div>
        </motion.div>
      </div>
    );
  }
  
  // Incomplete order UI
  if (isIncompleteOrder) {
    const displayOrder = orderInfo || {
      id: 0,
      orderCode,
      amount: 0,
      description: 'Thông tin đơn hàng',
      paymentStatus: 'PENDING',
      paymentMethod: 'cod',
      buyerName: 'Khách hàng',
      buyerEmail: null,
      buyerPhone: '',
      buyerAddress: '',
      checkoutUrl: null,
      qrCode: null,
      paymentLinkId: null,
      transactions: { items: [] }
    };
    
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-yellow-200 shadow-lg p-6 space-y-4"
        >
          <h1 className="text-2xl font-bold mb-4">Thông tin đơn hàng</h1>
          
          {errorMsg && (
            <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <AlertTitle>Thông báo</AlertTitle>
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}
          
          <Card className="border-yellow-100 shadow-sm">
            <CardContent className="p-4 bg-yellow-50">
              <motion.div
                initial={{ x: -5, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="py-2">
                  Mã đơn hàng: <strong className="font-medium">{displayOrder.orderCode}</strong>
                </p>
                <p className="py-2">
                  Trạng thái: <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">Đang kiểm tra</Badge>
                </p>
                
                <div className="mt-3 text-gray-700">
                  <p>Chúng tôi đang xác nhận thông tin đơn hàng của bạn.</p>
                  <p className="mt-1">Vui lòng làm mới trang để kiểm tra trạng thái mới nhất.</p>
                </div>
              </motion.div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between mt-4">
            <Button onClick={() => router.push('/')} 
              className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              Về trang chủ
            </Button>
            <Button 
              onClick={refreshPaymentStatus} 
              variant="outline" 
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 shadow-md hover:shadow-lg transition-all"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang kiểm tra
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Kiểm tra trạng thái
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main order success UI
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-yellow-200 shadow-lg p-6 space-y-4"
      >
        {/* Order Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {orderInfo.paymentStatus === 'SUCCESS' ? 
              'Đặt hàng thành công!' : 
              'Thông tin đơn hàng'}
          </h1>
          
          {orderInfo.paymentStatus === 'SUCCESS' && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="h-8 w-8 text-yellow-500" />
            </motion.div>
          )}
          
          {orderInfo.paymentStatus === 'PENDING' && (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="text-yellow-500"
            >
              <Clock className="h-8 w-8" />
            </motion.div>
          )}
        </div>
        
        {/* Thank You Message (for successful orders) */}
        {orderInfo.paymentStatus === 'SUCCESS' && (
          <motion.div 
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-yellow-50 border border-yellow-100 rounded-md p-4 text-yellow-800"
          >
            <div className="flex items-center mb-2">
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="h-5 w-5 mr-2 text-red-600" />
              </motion.div>
              <h3 className="text-lg font-medium text-yellow-800">Cảm ơn quý khách!</h3>
            </div>
            <p>Đơn hàng của quý khách đã được đặt thành công. Chúng tôi sẽ xử lý đơn hàng trong thời gian sớm nhất.</p>
            <p className="mt-1">Quý khách sẽ nhận được thông báo khi đơn hàng được giao.</p>
          </motion.div>
        )}
        
        {/* Error Messages */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Thông báo</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}
        
        {/* Order Summary */}
        <Card className="border-yellow-100 shadow-md">
          <CardHeader className="bg-yellow-50 border-b border-yellow-100">
            <CardTitle className="text-yellow-800">Chi tiết đơn hàng</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="p-2 rounded-md hover:bg-yellow-50 transition-all">
                <p className="text-gray-500 text-sm">Mã đơn hàng:</p>
                <p className="font-medium text-black">{orderInfo.orderCode}</p>
              </div>
              
              <div className="p-2 rounded-md hover:bg-yellow-50 transition-all">
                <p className="text-gray-500 text-sm">Trạng thái:</p>
                <Badge className={
                  orderInfo.paymentStatus === 'SUCCESS' 
                    ? 'bg-yellow-500 text-white' 
                    : orderInfo.paymentStatus === 'PENDING'
                    ? 'bg-yellow-400 text-black'
                    : 'bg-red-500 text-white'
                }>
                  {orderInfo.paymentStatus === 'SUCCESS'
                    ? 'Thành công'
                    : orderInfo.paymentStatus === 'PENDING'
                    ? 'Đang chờ'
                    : 'Thất bại'}
                </Badge>
              </div>
              
              <div className="p-2 rounded-md hover:bg-yellow-50 transition-all">
                <p className="text-gray-500 text-sm">Phương thức thanh toán:</p>
                <p className="font-medium">
                  {orderInfo.paymentMethod === 'bank' ? 'Chuyển khoản ngân hàng' : 'Thanh toán khi nhận hàng (COD)'}
                </p>
              </div>
              
              <div className="p-2 rounded-md hover:bg-yellow-50 transition-all">
                <p className="text-gray-500 text-sm">Tổng tiền:</p>
                <p className="font-bold text-red-600">
                  {formatNumber(orderInfo.amount)} VND
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Customer Information */}
        {orderInfo.buyerName && (
          <Card className="border-yellow-100 shadow-md">
            <CardHeader className="bg-yellow-50 border-b border-yellow-100">
              <CardTitle className="text-yellow-800">Thông tin khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <dl className="space-y-2">
                <div className="flex border-b border-gray-100 pb-2">
                  <dt className="w-1/3 text-gray-500">Họ tên:</dt>
                  <dd className="w-2/3 font-medium">{orderInfo.buyerName}</dd>
                </div>
                {orderInfo.buyerPhone && (
                  <div className="flex border-b border-gray-100 pb-2">
                    <dt className="w-1/3 text-gray-500">Số điện thoại:</dt>
                    <dd className="w-2/3 font-medium">{orderInfo.buyerPhone}</dd>
                  </div>
                )}
                {orderInfo.buyerEmail && (
                  <div className="flex border-b border-gray-100 pb-2">
                    <dt className="w-1/3 text-gray-500">Email:</dt>
                    <dd className="w-2/3 font-medium">{orderInfo.buyerEmail}</dd>
                  </div>
                )}
                {orderInfo.buyerAddress && (
                  <div className="flex border-b border-gray-100 pb-2">
                    <dt className="w-1/3 text-gray-500">Địa chỉ:</dt>
                    <dd className="w-2/3 font-medium">{orderInfo.buyerAddress}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        )}
        
        {/* Bank Payment Instructions */}
        {orderInfo.paymentMethod === 'bank' && 
         orderInfo.paymentStatus === 'PENDING' && 
         orderInfo.checkoutUrl && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-lg font-semibold text-red-700 mb-2">Thông tin thanh toán</h3>
            <p className="mb-3">Vui lòng hoàn tất thanh toán để hoàn thành đơn hàng của bạn.</p>
            <div className="flex gap-3">
              <Button 
                onClick={() => window.open(orderInfo.checkoutUrl!, '_blank', 'noopener,noreferrer')}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Mở trang thanh toán
              </Button>
              <Button
                onClick={refreshPaymentStatus}
                variant="outline"
                className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang kiểm tra
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Kiểm tra trạng thái
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
        {/* Order Items List */}
        {orderInfo.transactions?.items?.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Sản phẩm đã đặt:</h3>
            <ul className="divide-y divide-gray-200">
              {orderInfo.transactions.items.map((item, index) => (
                <li key={index} className="py-3">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">SL: {item.quantity}</p>
                    </div>
                    <p className="font-medium">{formatNumber(item.price)} VNĐ</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Action Buttons */}
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-between gap-3 mt-6"
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button 
              onClick={() => router.push('/')} 
              className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              Về trang chủ
            </Button>
          </motion.div>
          
          <Button 
            onClick={handleDownloadPdf}
            variant="outline"
            className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 shadow-md hover:shadow-lg transition-all"
            disabled={isPdfGenerating}
          >
            {isPdfGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tạo PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Tải đơn hàng (PDF)
              </>
            )}
          </Button>
          
          {orderInfo.paymentStatus === 'PENDING' && (
            <Button 
              onClick={refreshPaymentStatus} 
              variant="outline" 
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang kiểm tra
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Kiểm tra trạng thái
                </>
              )}
            </Button>
          )}
        </motion.div>
        
        {/* Automatic Redirect Notice */}
        {orderInfo.paymentStatus === 'SUCCESS' && (
          <p className="text-center text-gray-500">
            Trang sẽ tự động chuyển hướng sau {countdown} giây...
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default OrderSuccessClient;