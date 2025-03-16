"use client"

import { useEffect } from "react"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts, removeToast } = useToast()

  useEffect(() => {
    const timers = toasts.map(toast => {
      // Only set timers for toasts that aren't explicitly set to be persistent
      if (toast.duration !== Infinity) {
        const timer = setTimeout(() => {
          removeToast(toast.id)
        }, toast.duration || 5000)
        
        return timer
      }
      return null
    }).filter(Boolean) as NodeJS.Timeout[]
    
    // Clean up all timers when component unmounts or toasts change
    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [toasts, removeToast])

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props} onOpenChange={() => removeToast(id)}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
