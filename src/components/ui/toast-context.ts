import React from 'react';
import { ToastProps } from './modern-toast';

export interface ToastState extends Omit<ToastProps, 'onDismiss'> {
  id: string;
}

// Toast Context
export const ToastContext = React.createContext<{
  toasts: ToastState[];
  addToast: (toast: Omit<ToastState, 'id'>) => void;
  removeToast: (id: string) => void;
} | null>(null);