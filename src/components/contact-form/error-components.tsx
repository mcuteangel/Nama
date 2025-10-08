import React from 'react';
import { AlertCircle } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';

interface FormErrorDisplayProps {
  error: boolean;
  errorMessage: string;
  retryCount: number;
  onRetry?: () => void;
  isSubmitting?: boolean;
}

export const FormErrorDisplay: React.FC<FormErrorDisplayProps> = ({
  error,
  errorMessage,
  retryCount,
  onRetry,
  isSubmitting = false
}) => {
  if (!error) return null;

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
          <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">خطا در ذخیره</h3>
          <p className="text-red-700 dark:text-red-300 text-sm">{errorMessage}</p>
        </div>
      </div>
      {retryCount > 0 && onRetry && (
        <GlassButton
          variant="ghost"
          size="sm"
          onClick={onRetry}
          disabled={isSubmitting}
          className="text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 text-sm"
          aria-describedby="form-error-message"
          aria-label="تلاش مجدد برای ذخیره فرم"
        >
          تلاش مجدد ({retryCount} از ۳)
        </GlassButton>
      )}
    </div>
  );
};

interface ProgressIndicatorProps {
  isSubmitting: boolean;
  message?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  isSubmitting,
  message = "در حال ذخیره..."
}) => {
  if (!isSubmitting) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">{message}</h3>
          <p className="text-blue-700 dark:text-blue-300 text-sm">لطفاً صبر کنید</p>
        </div>
      </div>
    </div>
  );
};

interface SimpleErrorProps {
  error: string | null;
}

export const SimpleError: React.FC<SimpleErrorProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-4">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <p>{error}</p>
      </div>
    </div>
  );
};
