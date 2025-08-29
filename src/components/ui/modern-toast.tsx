import React, { useCallback, useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModernButton } from './modern-button';
import { ToastContext, ToastState } from './toast-context';

export interface ToastProps {
  id: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss: (id: string) => void;
}

/**
 * Toast - کامپوننت نمایش پیام‌های موقت
 * @param id - شناسه یکتا Toast
 * @param variant - نوع Toast (success, error, warning, info)
 * @param title - عنوان پیام
 * @param description - متن پیام
 * @param duration - مدت زمان نمایش (میلی‌ثانیه)
 * @param action - اکشن اختیاری با label و onClick
 * @param onDismiss - تابع dismiss کردن Toast
 */
export function Toast({
  id,
  variant = 'default',
  title,
  description,
  duration = 5000,
  action,
  onDismiss
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => onDismiss(id), 300);
  }, [id, onDismiss]);

  useEffect(() => {
    // ورود با انیمیشن
    const enterTimer = setTimeout(() => setIsVisible(true), 100);
    
    // خروج خودکار
    const exitTimer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [duration, handleDismiss]);

  const variants = {
    default: {
      bgClass: 'glass-advanced',
      borderClass: 'border-border',
      iconColor: 'text-foreground',
      icon: Info
    },
    success: {
      bgClass: 'bg-gradient-success',
      borderClass: 'border-green-500/20',
      iconColor: 'text-green-600 dark:text-green-400',
      icon: CheckCircle
    },
    error: {
      bgClass: 'bg-gradient-danger',
      borderClass: 'border-red-500/20',
      iconColor: 'text-red-600 dark:text-red-400',
      icon: AlertCircle
    },
    warning: {
      bgClass: 'bg-gradient-warning',
      borderClass: 'border-yellow-500/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      icon: AlertTriangle
    },
    info: {
      bgClass: 'bg-gradient-info',
      borderClass: 'border-blue-500/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      icon: Info
    }
  };

  const { bgClass, borderClass, iconColor, icon: Icon } = variants[variant];

  return (
    <div
      className={cn(
        'pointer-events-auto relative flex w-full max-w-sm items-center space-x-4 rounded-xl border p-4 shadow-lg transition-all duration-300',
        bgClass,
        borderClass,
        isVisible && !isLeaving ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
      )}
      role="alert"
      aria-live="polite"
    >
      {/* آیکن */}
      <div className="flex-shrink-0">
        <Icon className={cn('h-5 w-5', iconColor)} />
      </div>

      {/* محتوا */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-sm font-semibold text-foreground">
            {title}
          </p>
        )}
        {description && (
          <p className="text-sm text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>

      {/* اکشن */}
      {action && (
        <div className="flex-shrink-0">
          <ModernButton
            variant="ghost"
            size="sm"
            onClick={action.onClick}
            className="h-8 px-3 text-xs"
          >
            {action.label}
          </ModernButton>
        </div>
      )}

      {/* دکمه بستن */}
      <ModernButton
        variant="ghost"
        size="icon"
        onClick={handleDismiss}
        className="h-6 w-6 flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </ModernButton>

      {/* Progress bar */}
      <div 
        className="absolute bottom-0 left-0 h-1 bg-primary/30 rounded-b-xl"
        style={{
          animation: `toastProgress ${duration}ms linear forwards`
        }}
      />
    </div>
  );
}

export interface ToastProviderProps {
  children: React.ReactNode;
}

/**
 * ToastProvider - ارائه‌دهنده Context برای مدیریت Toast ها
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const addToast = (toast: Omit<ToastState, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            {...toast}
            onDismiss={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}



// CSS Animation برای progress bar
const toastProgressStyles = `
@keyframes toastProgress {
  from { width: 100%; }
  to { width: 0%; }
}
`;

// اضافه کردن styles به head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = toastProgressStyles;
  document.head.appendChild(style);
}