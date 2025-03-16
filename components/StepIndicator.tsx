import { CheckCircle } from "lucide-react";

type Step = 'delivery' | 'payment' | 'order';

interface StepIndicatorProps {
  activeStep: Step;
  completedSteps: Record<Step, boolean>;
}

export function StepIndicator({ activeStep, completedSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
          activeStep === 'delivery' 
            ? 'bg-red-600 border-red-600 text-white' 
            : completedSteps.delivery 
              ? 'bg-green-600 border-green-600 text-white' 
              : 'border-gray-300 text-gray-300'
        }`}>
          {completedSteps.delivery ? <CheckCircle className="h-4 w-4" /> : 1}
        </div>
        <span className={`ml-2 ${
          activeStep === 'delivery' 
            ? 'text-red-600 font-semibold' 
            : completedSteps.delivery 
              ? 'text-green-600 font-semibold' 
              : 'text-gray-400'
        }`}>Giao hàng</span>
      </div>
      
      <div className={`w-12 h-1 mx-2 ${completedSteps.delivery ? 'bg-green-600' : 'bg-gray-300'}`}></div>
      
      <div className="flex items-center">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
          activeStep === 'payment' 
            ? 'bg-red-600 border-red-600 text-white' 
            : completedSteps.payment 
              ? 'bg-green-600 border-green-600 text-white' 
              : 'border-gray-300 text-gray-300'
        }`}>
          {completedSteps.payment ? <CheckCircle className="h-4 w-4" /> : 2}
        </div>
        <span className={`ml-2 ${
          activeStep === 'payment' 
            ? 'text-red-600 font-semibold' 
            : completedSteps.payment 
              ? 'text-green-600 font-semibold' 
              : 'text-gray-400'
        }`}>Thanh toán</span>
      </div>
      
      <div className={`w-12 h-1 mx-2 ${completedSteps.payment ? 'bg-green-600' : 'bg-gray-300'}`}></div>
      
      <div className="flex items-center">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
          activeStep === 'order' 
            ? 'bg-red-600 border-red-600 text-white' 
            : completedSteps.order 
              ? 'bg-green-600 border-green-600 text-white' 
              : 'border-gray-300 text-gray-300'
        }`}>
          {completedSteps.order ? <CheckCircle className="h-4 w-4" /> : 3}
        </div>
        <span className={`ml-2 ${
          activeStep === 'order' 
            ? 'text-red-600 font-semibold' 
            : completedSteps.order 
              ? 'text-green-600 font-semibold' 
              : 'text-gray-400'
        }`}>Đơn hàng</span>
      </div>
    </div>
  );
}
