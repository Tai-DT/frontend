// This file re-exports the useToast hook for compatibility
// If you're using shadcn/ui toast component, this ensures consistent imports

import {  ToastActionElement, ToastProps } from "./toast";
import { create } from 'zustand';

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

interface ToastStore {
  toasts: ToasterToast[];
  addToast: (toast: Omit<ToasterToast, "id">) => void;
  removeToast: (id: string) => void;
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2, 9);
    
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    return id;
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));

// Re-export toast types for convenience
export type { ToastProps } from "./toast";

// Helper function to display toast, matching shadcn/ui API
export function toast({ title, description, action, ...props }: Omit<ToasterToast, "id">) {
  return useToast.getState().addToast({ title, description, action, ...props });
}
