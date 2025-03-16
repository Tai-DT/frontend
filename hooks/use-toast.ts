// /hooks/use-toast.ts
import * as React from 'react';

export const useToast = () => {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([]);
  const toast = (options: ToasterToast) => {
    setToasts((prev) => [...prev, options]);
  };
  return { toast, toasts };
};

export type ToasterToast = {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
  action?: React.ReactNode;
  id: string;
};
