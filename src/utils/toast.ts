import { ToastContext } from "@/components/ui/toast-context";
import React from 'react';
import { useTranslation } from 'react-i18next';

export const useToastHelpers = () => {
  const context = React.useContext(ToastContext);
  const { t } = useTranslation();

  const showSuccess = (message: string) => {
    if (context) {
      context.addToast({
        variant: 'success',
        title: t('toast.success_title'),
        description: message,
        duration: 5000
      });
    }
  };

  const showError = (message: string) => {
    if (context) {
      context.addToast({
        variant: 'error',
        title: t('toast.error_title'),
        description: message,
        duration: 5000
      });
    }
  };

  const showInfo = (message: string) => {
    if (context) {
      context.addToast({
        variant: 'info',
        title: t('toast.info_title'),
        description: message,
        duration: 5000
      });
    }
  };

  const showLoading = (message: string): string => {
    if (context) {
      const id = Math.random().toString(36).substr(2, 9);
      context.addToast({
        variant: 'info',
        title: t('toast.loading_title'),
        description: message,
        duration: 3000
      });
      return id;
    }
    return '';
  };

  const dismissToast = (toastId: string | number) => {
    if (context) {
      context.removeToast(toastId.toString());
    }
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showLoading,
    dismissToast
  };
};

// برای سازگاری با کدهای موجود، توابع ساده هم نگه می‌داریم اما استفاده از آن‌ها را محدود می‌کنیم
export const showSuccess = (_message: string) => {
  console.warn('showSuccess should be used within a React component with useToastHelpers hook');
};

export const showError = (_message: string) => {
  console.warn('showError should be used within a React component with useToastHelpers hook');
};

export const showLoading = (_message: string): string | number => {
  console.warn('showLoading should be used within a React component with useToastHelpers hook');
  return '';
};

export const dismissToast = (_toastId: string | number) => {
  console.warn('dismissToast should be used within a React component with useToastHelpers hook');
};