import React from 'react';
import { ToastContext, ToastState } from './toast-context';

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';



/**
 * useToast - Hook برای استفاده از Toast
 */
export function useToast() {
  const context = React.useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const { addToast } = context;

  const toast = {
    success: (message: string, options?: Partial<Omit<ToastState, 'id' | 'variant'>>) => {
      addToast({
        variant: 'success' as ToastVariant,
        title: 'موفق',
        description: message,
        ...options
      });
    },
    error: (message: string, options?: Partial<Omit<ToastState, 'id' | 'variant'>>) => {
      addToast({
        variant: 'error' as ToastVariant,
        title: 'خطا',
        description: message,
        ...options
      });
    },
    warning: (message: string, options?: Partial<Omit<ToastState, 'id' | 'variant'>>) => {
      addToast({
        variant: 'warning' as ToastVariant,
        title: 'هشدار',
        description: message,
        ...options
      });
    },
    info: (message: string, options?: Partial<Omit<ToastState, 'id' | 'variant'>>) => {
      addToast({
        variant: 'info' as ToastVariant,
        title: 'اطلاع',
        description: message,
        ...options
      });
    },
    custom: (options: Omit<ToastState, 'id'>) => {
      addToast(options);
    }
  };

  return { toast };
}

export { ToastContext };