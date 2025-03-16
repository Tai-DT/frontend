// components/PaymentModal.tsx
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
  } from '@/components/ui/dialog';
  import { Button } from '@/components/ui/button';
  import { useRouter } from 'next/navigation';
  import { useEffect, useCallback } from 'react';
  
  type Props = {
    checkoutUrl: string;
    orderInfo: {
      orderCode: string;
      amount: number;
      buyerName: string;
      buyerPhone: string;
      buyerAddress: string;
      buyerEmail?: string;
    } | null;
    showModal: boolean;
    onClose: () => void;
    paymentMethod: string;
  };
  
  export function PaymentModal({
    checkoutUrl,
    orderInfo,
    showModal,
    onClose,
    paymentMethod,
  }: Props) {
    const router = useRouter();
    const handlePaymentSuccess = useCallback(() => {
       onClose();
         if (orderInfo && orderInfo.orderCode) {
              router.push(`/orders?orderCode=${orderInfo.orderCode}`);
          }
      }, [onClose, router, orderInfo]);
  
      const handlePaymentFail = useCallback(() => {
        onClose();
         }, [onClose]);
      
         const handleCancel = useCallback(() => {
           onClose();
          router.push(`/order?orderCode=${orderInfo?.orderCode}`);
        }, [onClose, router, orderInfo]);
  
    useEffect(() => {
      const handleIframeEvent = (
        event: MessageEvent<{
          type: string;
          data: { status: 'SUCCESS' | 'FAILED' };
        }>
      ) => {
        if (event.origin !== process.env.NEXT_PUBLIC_PAYOS_DOMAIN) return;
  
        const { type, data } = event.data;
  
        switch (type) {
          case 'paymentStatus':
            if (data.status === 'SUCCESS') {
              handlePaymentSuccess();
            } else if (data.status === 'FAILED') {
              handlePaymentFail();
            }
            break;
          default:
            console.warn('Unhandled event from iframe:', event);
            break;
        }
      };
  
      window.addEventListener('message', handleIframeEvent);
      return () => window.removeEventListener('message', handleIframeEvent);
    }, [handlePaymentSuccess, handlePaymentFail]);
  
    return (
      <Dialog open={showModal} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thanh toán đơn hàng</DialogTitle>
          </DialogHeader>
          {paymentMethod === 'bank' && (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="md:w-1/2">
                <iframe
                  src={checkoutUrl}
                  width="100%"
                  height="500px"
                  title="Payment Gateway"
                  className="border rounded-lg"
                />
              </div>
              <div className="md:w-1/2">
                {orderInfo && (
                  <div className="bg-white rounded-lg shadow p-6 space-y-4">
                    <h2 className="text-xl font-semibold">
                      Thông tin đơn hàng
                    </h2>
                    <div>
                      <p>
                        Mã đơn hàng:{' '}
                        <strong>{orderInfo.orderCode}</strong>
                      </p>
                      <p>
                        Tổng tiền:{' '}
                        <strong>
                          {orderInfo.amount.toLocaleString()} VND
                        </strong>
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        Thông tin khách hàng:
                      </h3>
                      <p>Họ tên: {orderInfo.buyerName}</p>
                      <p>Số điện thoại: {orderInfo.buyerPhone}</p>
                      <p>Địa chỉ: {orderInfo.buyerAddress}</p>
                      {orderInfo.buyerEmail && (
                        <p>Email: {orderInfo.buyerEmail}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
             <Button onClick={handleCancel} variant="destructive">
              Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }