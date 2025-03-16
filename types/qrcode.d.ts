declare module 'qrcode.react' {
    import { ComponentType } from 'react';
    export const QRCode: ComponentType<{ value: string; size?: number; level?: 'L' | 'M' | 'Q' | 'H'; bgColor?: string; fgColor?: string; includeMargin?: boolean; }>;
  }
  