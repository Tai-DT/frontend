import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function safeRender(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number' && isNaN(value)) return '';
  return String(value);
}
export function safeRenderHtml(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number' && isNaN(value)) return '';
  return String(value);
}

/**
 * Format a number consistently across server and client
 * Always use vi-VN locale for consistency
 */
export function formatNumber(value: number | string): string {
  if (value === null || value === undefined) return '0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  return num.toLocaleString('vi-VN'); // Vietnamese locale uses period as thousand separator
}

// Update format currency to use the consistent formatter
export function formatCurrency(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0 ₫';
  }
  return formatNumber(value) + ' ₫';
}

/**
 * Format a date to a readable string format
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}