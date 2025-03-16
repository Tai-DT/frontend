// utils/format.ts
export function formatCurrency(
    value: number | string, 
    options?: {
      currency?: 'VND' | 'USD' | 'EUR';
      locale?: string;
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
    }
  ): string {
    // Chuyển đổi giá trị sang số
    const numericValue = typeof value === 'string' 
      ? parseFloat(value.replace(/[^0-9.-]+/g,"")) 
      : value;
  
    // Cấu hình mặc định
    const defaultOptions = {
      currency: 'VND',
      locale: 'vi-VN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    };
  
    // Merge options
    const formatOptions = { ...defaultOptions, ...options };
  
    try {
      return new Intl.NumberFormat(formatOptions.locale, {
        style: 'currency',
        currency: formatOptions.currency,
        minimumFractionDigits: formatOptions.minimumFractionDigits,
        maximumFractionDigits: formatOptions.maximumFractionDigits
      }).format(numericValue);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `${numericValue} ${formatOptions.currency}`;
    }
  }
  
  // Các hàm hỗ trợ bổ sung
  export function formatNumber(
    value: number | string, 
    options?: {
      locale?: string;
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
    }
  ): string {
    // Chuyển đổi giá trị sang số
    const numericValue = typeof value === 'string' 
      ? parseFloat(value.replace(/[^0-9.-]+/g,"")) 
      : value;
  
    // Cấu hình mặc định
    const defaultOptions = {
      locale: 'vi-VN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    };
  
    // Merge options
    const formatOptions = { ...defaultOptions, ...options };
  
    try {
      return new Intl.NumberFormat(formatOptions.locale, {
        minimumFractionDigits: formatOptions.minimumFractionDigits,
        maximumFractionDigits: formatOptions.maximumFractionDigits
      }).format(numericValue);
    } catch (error) {
      console.error('Error formatting number:', error);
      return `${numericValue}`;
    }
  }
  
  // Các hàm tiện ích khác
  export const currencyUtils = {
    // Chuyển đổi tiền tệ
    convert: (
      value: number, 
      fromCurrency: 'VND' | 'USD' | 'EUR', 
      toCurrency: 'VND' | 'USD' | 'EUR',
      exchangeRates: Record<string, number>
    ) => {
      try {
        const baseValue = value / exchangeRates[fromCurrency];
        return baseValue * exchangeRates[toCurrency];
      } catch (error) {
        console.error('Currency conversion error:', error);
        return value;
      }
    },
  
    // So sánh giá
    comparePrice: (price1: number, price2: number) => {
      return price1 - price2;
    },
  
    // Tính giảm giá
    calculateDiscount: (originalPrice: number, discountedPrice: number) => {
      if (originalPrice <= 0) return 0;
      return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
    }
  };
  export function safeRender(value: string | number | boolean | null | undefined): string {
    // Handle various edge cases
    if (value === null || value === undefined) return '';
    if (typeof value === 'number' && isNaN(value)) return '';
    if (typeof value === 'boolean') return value.toString();
    return String(value).trim();
  }
  
  export function safeCurrency(value: number): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '0 ₫';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  }
