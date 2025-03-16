'use client';
import { useState, useEffect, useCallback } from 'react';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingCart, CreditCard, Truck, ArrowRight, CheckCircle } from 'lucide-react';
import AddressForm from '@/components/AddressForm';
import { PaymentMethods } from '@/components/PaymentMethods';
import { OrderSummary } from '@/components/OrderSummary';
import { createPayment } from '@/services/payment';
import type { PaymentData, OrderInfo } from '@/types/payment';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

type Step = 'delivery' | 'payment' | 'order';
type PaymentMethod = 'cod' | 'bank' | null;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, formData, getTotalAmount } = useCheckoutStore();
  const [isLoading, setIsLoading] = useState(false);
  // Initialize with null to force user selection
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isBankPaymentAvailable, setIsBankPaymentAvailable] = useState(true);
  
  // Track active step and completion status
  const [activeStep, setActiveStep] = useState<Step>('delivery');
  const [completedSteps, setCompletedSteps] = useState<Record<Step, boolean>>({
    delivery: false,
    payment: false,
    order: false
  });

  // Validate if delivery step is complete - Using useCallback to memoize the function
  const validateDeliveryStep = useCallback((): boolean => {
    return !!(formData.fullName && formData.phone && formData.address);
  }, [formData.fullName, formData.phone, formData.address]);

  // Validate if payment step is complete - Using useCallback
  const validatePaymentStep = useCallback((): boolean => {
    // Explicitly check that payment method is not null
    return selectedPayment !== null;
  }, [selectedPayment]);

  // Validate if order step is complete - Using useCallback
  const validateOrderStep = useCallback((): boolean => {
    return items.length > 0 && getTotalAmount() > 0;
  }, [items, getTotalAmount]);

  // Effect to check step completion when relevant data changes
  useEffect(() => {
    setCompletedSteps(prev => ({
      ...prev,
      delivery: validateDeliveryStep()
    }));
  }, [validateDeliveryStep]);

  useEffect(() => {
    setCompletedSteps(prev => ({
      ...prev,
      payment: validatePaymentStep()
    }));
  }, [validatePaymentStep]);

  useEffect(() => {
    setCompletedSteps(prev => ({
      ...prev,
      order: validateOrderStep()
    }));
  }, [validateOrderStep]);

  // Add this effect to update checkout store with address form data
  useEffect(() => {
    if (formData) {
      useCheckoutStore.setState({ formData });
    }
  }, [formData]);

  const moveToNextStep = () => {
    // Validate current step before moving to next
    let canProceed = false;
    
    switch (activeStep) {
      case 'delivery':
        canProceed = validateDeliveryStep();
        if (!canProceed) {
          toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
        } else {
          setActiveStep('payment');
          setCompletedSteps(prev => ({ ...prev, delivery: true }));
        }
        break;
      case 'payment':
        canProceed = validatePaymentStep();
        if (!canProceed) {
          toast.error('Vui lòng chọn phương thức thanh toán');
        } else {
          setActiveStep('order');
          setCompletedSteps(prev => ({ ...prev, payment: true }));
        }
        break;
      case 'order':
        canProceed = validateOrderStep();
        if (!canProceed) {
          toast.error('Đơn hàng không hợp lệ');
        } else {
          setCompletedSteps(prev => ({ ...prev, order: true }));
          // All steps are now complete - ready for final submission
        }
        break;
    }
  };

  const handleStepChange = (step: Step) => {
    // Only allow going to steps that are either completed or the next available step
    const stepOrder: Step[] = ['delivery', 'payment', 'order'];
    const currentIndex = stepOrder.indexOf(activeStep);
    const targetIndex = stepOrder.indexOf(step);
    
    // Allow going backward or to the next step only
    if (targetIndex <= currentIndex || 
        (targetIndex === currentIndex + 1 && completedSteps[activeStep])) {
      setActiveStep(step);
    } else {
      // Prevent jumping ahead
      toast.warning('Vui lòng hoàn thành bước hiện tại trước');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    // Final validation before submission
    if (!completedSteps.delivery || !completedSteps.payment || !completedSteps.order || !selectedPayment) {
      toast.error('Vui lòng hoàn thành tất cả các bước trước khi đặt hàng');
      return;
    }

    setIsLoading(true);

    try {
      const total = getTotalAmount();
      if (!total || total <= 0) {
        throw new Error('Tổng tiền phải lớn hơn 0');
      }

      // Prepare complete payment data with all required fields
      const paymentData: PaymentData = {
        amount: Math.round(total),
        description: `Thanh toán đơn hàng - ${formData.fullName}`,
        paymentStatus: 'PENDING',
        paymentMethod: selectedPayment, // Safely use selectedPayment as we validated it's not null
        buyerName: formData.fullName.trim(),
        buyerPhone: formData.phone.trim(),
        buyerAddress: formData.address.trim(),
        buyerEmail: formData.email?.trim() || null,
        transactions: {
          items: items.map((item) => ({
            name: item.name,
            quantity: Number(item.quantity),
            price: Number(item.price),
          })),
        },
      };

      console.log('Submitting order with data:', paymentData);

      const response: OrderInfo = await createPayment(paymentData);
      console.log('Payment response received:', response);
      
      if (!response) {
        throw new Error('No response received from payment API');
      }
      
      // Save order code to localStorage for reference
      localStorage.setItem('lastOrderCode', response.orderCode);
      
      // Handle different payment methods
      if (selectedPayment === 'cod') {
        toast.success('Đơn hàng đã được tạo thành công.');
        // For COD, clear cart and redirect to success page
        useCheckoutStore.setState({ items: [] });
        router.push(`/order-success/${response.orderCode}`);
      } else if (selectedPayment === 'bank') {
        if (response.checkoutUrl) {
          // For bank payment with successful PayOS link
          toast.success('Đang chuyển đến trang thanh toán...');
          console.log('Redirecting to payment URL:', response.checkoutUrl);
          // Clear cart before redirecting
          useCheckoutStore.setState({ items: [] });
          // Use window.open to open in a new tab
          window.open(response.checkoutUrl, '_blank');
          // Also redirect the current page to order success
          router.push(`/order-success/${response.orderCode}`);
        } else if (response.paymentStatus === 'MAINTENANCE') {
          // Handle maintenance mode
          setIsBankPaymentAvailable(false);
          setSelectedPayment('cod');
          setPaymentError(response.maintenanceMessage || 'Thanh toán trực tuyến hiện không khả dụng. Đã chuyển sang phương thức COD.');
          toast.warning('Thanh toán trực tuyến đang bảo trì, vui lòng chọn COD.');
        } else {
          console.error('Invalid response format:', response);
          setPaymentError('Không nhận được URL thanh toán. Vui lòng thử lại sau.');
          toast.error('Không thể tạo liên kết thanh toán');
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      
      // Handle payment gateway error specially
      if (errorMessage.includes('Hệ thống thanh toán đang bảo trì')) {
        setIsBankPaymentAvailable(false);
        setSelectedPayment('cod');
        setPaymentError('Thanh toán trực tuyến hiện không khả dụng. Đã chuyển sang phương thức COD.');
        toast.error('Thanh toán trực tuyến đang bảo trì, vui lòng chọn COD.');
      } else {
        setPaymentError(`Đã xảy ra lỗi khi xử lý đơn hàng: ${errorMessage}`);
        toast.error('Đã xảy ra lỗi khi xử lý đơn hàng.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Return early if no items in cart
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 text-center border border-yellow-200"
        >
          <motion.div 
            initial={{ scale: 0.5 }}
            animate={{ scale: 1, rotate: [0, 10, 0, -10, 0] }}
            transition={{ duration: 0.7 }}
            className="mx-auto mb-6 bg-yellow-50 p-6 rounded-full w-24 h-24 flex items-center justify-center"
          >
            <ShoppingCart className="h-12 w-12 text-yellow-400" />
          </motion.div>
          
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">Giỏ hàng trống</h2>
          <p className="mb-6 text-gray-600">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
          
          <Button 
            onClick={() => router.push('/')} 
            className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            Tiếp tục mua sắm
          </Button>
        </motion.div>
      </div>
    );
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { 
        delay: i * 0.1, 
        duration: 0.5 
      }
    })
  };

  // Check if all steps are completed to enable final submission
  const allStepsCompleted = completedSteps.delivery && completedSteps.payment && completedSteps.order;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-bold mb-6 text-red-600 text-center"
      >
        Thanh toán đơn hàng
      </motion.h1>
      
      <div className="mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${activeStep === 'delivery' ? 'bg-red-600 border-red-600 text-white' : completedSteps.delivery ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 text-gray-300'}`}>
              {completedSteps.delivery ? <CheckCircle className="h-4 w-4" /> : 1}
            </div>
            <span className={`ml-2 ${activeStep === 'delivery' ? 'text-red-600 font-semibold' : completedSteps.delivery ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>Giao hàng</span>
          </div>
          <div className={`w-12 h-1 mx-2 ${completedSteps.delivery ? 'bg-green-600' : 'bg-gray-300'}`}></div>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${activeStep === 'payment' ? 'bg-red-600 border-red-600 text-white' : completedSteps.payment ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 text-gray-300'}`}>
              {completedSteps.payment ? <CheckCircle className="h-4 w-4" /> : 2}
            </div>
            <span className={`ml-2 ${activeStep === 'payment' ? 'text-red-600 font-semibold' : completedSteps.payment ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>Thanh toán</span>
          </div>
          <div className={`w-12 h-1 mx-2 ${completedSteps.payment ? 'bg-green-600' : 'bg-gray-300'}`}></div>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${activeStep === 'order' ? 'bg-red-600 border-red-600 text-white' : completedSteps.order ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 text-gray-300'}`}>
              {completedSteps.order ? <CheckCircle className="h-4 w-4" /> : 3}
            </div>
            <span className={`ml-2 ${activeStep === 'order' ? 'text-red-600 font-semibold' : completedSteps.order ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>Đơn hàng</span>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <Tabs value={activeStep} onValueChange={(value) => handleStepChange(value as Step)} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="delivery" className={`data-[state=active]:bg-red-600 data-[state=active]:text-white ${completedSteps.delivery ? 'text-green-600' : ''}`}>
              <Truck className="w-4 h-4 mr-2" /> Giao hàng
              {completedSteps.delivery && <CheckCircle className="h-3 w-3 ml-1 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="payment" className={`data-[state=active]:bg-red-600 data-[state=active]:text-white ${completedSteps.payment ? 'text-green-600' : ''}`}>
              <CreditCard className="w-4 h-4 mr-2" /> Thanh toán
              {completedSteps.payment && <CheckCircle className="h-3 w-3 ml-1 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="order" className={`data-[state=active]:bg-red-600 data-[state=active]:text-white ${completedSteps.order ? 'text-green-600' : ''}`}>
              <ShoppingCart className="w-4 h-4 mr-2" /> Đơn hàng
              {completedSteps.order && <CheckCircle className="h-3 w-3 ml-1 text-green-500" />}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="delivery" className="space-y-4">
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              <Card className="border border-yellow-200 shadow-md">
                <CardHeader className="bg-yellow-50 border-b border-yellow-100">
                  <CardTitle className="text-yellow-800">Thông tin giao hàng</CardTitle>
                  <CardDescription>Nhập thông tin người nhận hàng</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <AddressForm
                    renderAsForm={false}
                    setFormData={(data) =>
                      useCheckoutStore.setState({
                        formData: {
                          ...formData,
                          ...data,
                          email: data.email || '',
                        },
                      })
                    }
                  />
                </CardContent>
                <CardFooter className="bg-gray-50 flex justify-end p-4">
                  <Button 
                    onClick={moveToNextStep}
                    disabled={!validateDeliveryStep()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Tiếp theo <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="payment" className="space-y-4">
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              <Card className="border border-yellow-200 shadow-md">
                <CardHeader className="bg-yellow-50 border-b border-yellow-100">
                  <CardTitle className="text-yellow-800">Phương thức thanh toán</CardTitle>
                  <CardDescription>Chọn phương thức thanh toán phù hợp</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {!isBankPaymentAvailable && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                      <p className="font-medium">Thanh toán trực tuyến tạm thời không khả dụng</p>
                      <p>Vui lòng sử dụng phương thức thanh toán khi nhận hàng (COD).</p>
                    </div>
                  )}
                  <PaymentMethods
                    selectedPayment={selectedPayment}
                    onPaymentChange={setSelectedPayment}
                    disableBank={!isBankPaymentAvailable}
                  />
                </CardContent>
                <CardFooter className="bg-gray-50 flex justify-end p-4 space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleStepChange('delivery')}
                  >
                    Quay lại
                  </Button>
                  <Button 
                    onClick={moveToNextStep}
                    disabled={!validatePaymentStep()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Tiếp theo <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="order" className="space-y-4">
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              custom={2}
            >
              <Card className="border border-yellow-200 shadow-md">
                <CardHeader className="bg-yellow-50 border-b border-yellow-100">
                  <CardTitle className="text-yellow-800">Chi tiết đơn hàng</CardTitle>
                  <CardDescription>Xem lại đơn hàng của bạn</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <OrderSummary items={items} totalAmount={getTotalAmount()} />
                </CardContent>
                <CardFooter className="bg-gray-50 flex justify-end p-4 space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleStepChange('payment')}
                  >
                    Quay lại
                  </Button>
                  <Button 
                    onClick={moveToNextStep}
                    disabled={!validateOrderStep()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Xác nhận đơn hàng
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
                  
        {paymentError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            {paymentError}
          </div>
        )}
                  
        <Separator />
                  
        <div className="flex justify-center">
          <Button
            type="submit"
            className={`px-8 py-6 text-lg shadow-lg ${allStepsCompleted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'}`}
            disabled={isLoading || !allStepsCompleted}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              'Hoàn tất đặt hàng'
            )}
          </Button>
        </div>

        {!allStepsCompleted && (
          <div className="text-center text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
            Bạn cần hoàn thành tất cả các bước trước khi đặt hàng
          </div>
        )}
      </form>
    </div>
  );
}