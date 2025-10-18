import React from 'react';
import { useTranslation } from 'react-i18next';
import { ToastContext, ToastState } from './toast-context';

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

/**
 * useToast - Hook for using Toast notifications with i18n support
 */
export function useToast() {
  const { t } = useTranslation();
  const context = React.useContext(ToastContext);
  
  if (!context) {
    throw new Error(t('toast.must_use_in_provider'));
  }

  const { addToast } = context;

  const toast = {
    success: (message: string, options?: Partial<Omit<ToastState, 'id' | 'variant'>>) => {
      addToast({
        variant: 'success' as ToastVariant,
        title: t('toast.titles.success'),
        description: message,
        ...options
      });
    },
    error: (message: string, options?: Partial<Omit<ToastState, 'id' | 'variant'>>) => {
      addToast({
        variant: 'error' as ToastVariant,
        title: t('toast.titles.error'),
        description: message,
        ...options
      });
    },
    warning: (message: string, options?: Partial<Omit<ToastState, 'id' | 'variant'>>) => {
      addToast({
        variant: 'warning' as ToastVariant,
        title: t('toast.titles.warning'),
        description: message,
        ...options
      });
    },
    info: (message: string, options?: Partial<Omit<ToastState, 'id' | 'variant'>>) => {
      addToast({
        variant: 'info' as ToastVariant,
        title: t('toast.titles.info'),
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