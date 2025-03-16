'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { OrderInfo } from '@/types/payment'; // Re-import OrderInfo for Client Component if needed

interface OrderSuccessContentProps {
    orderInfo: OrderInfo;
}

const OrderSuccessContent: React.FC<OrderSuccessContentProps> = ({ orderInfo }) => {
    const router = useRouter();
    const [countdown, setCountdown] = useState<number>(10);


    useEffect(() => {
        if (orderInfo?.paymentStatus === 'SUCCESS' || orderInfo?.paymentMethod === 'cod') {
            const timer = setInterval(() => {
                setCountdown((prevCountdown) => prevCountdown - 1);
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [orderInfo]);

    useEffect(() => {
        if (countdown <= 0) {
            router.push('/');
        }
    }, [countdown, router]);


    return (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h1 className="text-2xl font-bold mb-4">Đặt hàng thành công!</h1>
            <p className="mb-4">
                Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được ghi nhận.
            </p>
            {orderInfo && (
                <div className="space-y-4">
                    <p>
                        Mã đơn hàng: <strong className="font-medium">{orderInfo.orderCode}</strong>
                    </p>
                    <p>
                        Trạng thái thanh toán:{' '}
                        <strong
                            className={
                                orderInfo.paymentStatus === 'SUCCESS' ||
                                    orderInfo.paymentMethod === 'cod'
                                    ? 'text-green-500'
                                    : 'text-yellow-500'
                            }
                        >
                            {orderInfo.paymentStatus === 'SUCCESS' ||
                                orderInfo.paymentMethod === 'cod'
                                ? 'Thành công'
                                : orderInfo.paymentStatus === 'PENDING'
                                    ? 'Đang chờ'
                                    : 'Thất bại'}
                        </strong>
                    </p>
                    <p>
                        Tổng tiền:{' '}
                        <strong className="font-medium">
                            {orderInfo.amount.toLocaleString()} VND
                        </strong>
                    </p>
                    <div>
                        <h3 className="font-semibold text-lg">
                            Thông tin khách hàng:
                        </h3>
                        <p>Họ tên: {orderInfo.buyerName}</p>
                        <p>Số điện thoại: {orderInfo.buyerPhone}</p>
                        <p>Địa chỉ: {orderInfo.buyerAddress}</p>
                        {orderInfo.buyerEmail && (
                            <p>Email: {orderInfo.buyerEmail}</p>
                        )}
                    </div>
                    <p className="mb-2">
                        Trang sẽ tự động chuyển về trang chủ sau{' '}
                        <span className="font-bold text-red-500">{countdown}</span> giây
                    </p>
                </div>
            )}
        </div>
    );
};

export default OrderSuccessContent;