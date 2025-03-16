'use client';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircle, RefreshCw, Home } from 'lucide-react';

export default function PaymentFailedPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg p-6 space-y-4 border border-red-300"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center"
        >
          <div className="bg-red-50 p-4 rounded-full">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>
        </motion.div>
        
        <h1 className="text-2xl font-bold text-center text-red-600">Thanh toán thất bại!</h1>
        
        <Alert variant="destructive" className="border-red-300 bg-red-50">
          <AlertTitle className="text-red-800 font-semibold">Không thể hoàn tất thanh toán</AlertTitle>
          <AlertDescription className="text-red-700">
            Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
          </AlertDescription>
        </Alert>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button onClick={() => router.push('/checkout')} className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2">
            <RefreshCw className="h-5 w-5" /> Thử lại
          </Button>
          <Button onClick={() => router.push('/')} variant="outline" className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 flex items-center gap-2">
            <Home className="h-5 w-5" /> Về trang chủ
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}