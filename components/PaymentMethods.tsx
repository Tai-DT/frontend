import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface PaymentMethodsProps {
  selectedPayment: 'cod' | 'bank' | null;
  onPaymentChange: (value: 'cod' | 'bank') => void;
  disableBank?: boolean;
}

export function PaymentMethods({
  selectedPayment,
  onPaymentChange,
  disableBank = false,
}: PaymentMethodsProps) {
  return (
    <div className="space-y-4">
      {!selectedPayment && (
        <Alert variant="default" className="bg-yellow-50 border-yellow-200 text-yellow-800 mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vui lòng chọn phương thức thanh toán
          </AlertDescription>
        </Alert>
      )}
      
      <RadioGroup
        value={selectedPayment || undefined}
        onValueChange={(value: 'cod' | 'bank') => onPaymentChange(value)}
        className="space-y-4"
      >
        <div className={`flex items-center space-x-2 border p-4 rounded-md ${selectedPayment === 'cod' ? 'border-red-500 bg-red-50' : ''}`}>
          <RadioGroupItem value="cod" id="cod" />
          <Label htmlFor="cod" className="flex flex-col cursor-pointer w-full">
            <span className="font-semibold">Thanh toán khi nhận hàng (COD)</span>
            <span className="text-sm text-gray-500">
              Bạn sẽ thanh toán khi nhận được hàng
            </span>
          </Label>
        </div>
        
        <div className={`flex items-center space-x-2 border p-4 rounded-md ${disableBank ? 'opacity-50' : ''} ${selectedPayment === 'bank' ? 'border-red-500 bg-red-50' : ''}`}>
          <RadioGroupItem value="bank" id="bank" disabled={disableBank} />
          <Label htmlFor="bank" className="flex flex-col cursor-pointer w-full">
            <div className="flex items-center">
              <span className="font-semibold">Chuyển khoản ngân hàng</span>
              {disableBank && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Tạm dừng</span>}
            </div>
            <span className="text-sm text-gray-500">
              Thanh toán trực tuyến qua cổng thanh toán PayOS
            </span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}