import { useState, useCallback } from 'react';
import { ErrorManager } from '@/lib/error-manager';

interface UseErrorHandlerOptions {
  maxRetries?: number;
  retryDelay?: number;
  showToast?: boolean;
  customErrorMessage?: string;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export function useErrorHandler(initialError: Error | null = null, options?: UseErrorHandlerOptions) {
  const [error, setError] = useState<Error | null>(initialError);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastOperation, setLastOperation] = useState<(() => Promise<void>) | null>(null);

  const {
    maxRetries = 0,
    retryDelay = 0,
    showToast = false,
    customErrorMessage,
    onError: onErrorHandler,
    onSuccess: onSuccessHandler,
  } = options || {};

  const executeAsync = useCallback(async <T>(
    asyncFunction: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T | undefined> => {
    setIsLoading(true);
    setError(null);
    setErrorMessage('');
    setLastOperation(() => asyncFunction); // Store the function for retry

    try {
      const result = await asyncFunction();
      onSuccessHandler?.();
      setRetryCount(0); // Reset retry count on success
      return result;
    } catch (err: any) {
      const errMessage = customErrorMessage || ErrorManager.getErrorMessage(err);
      setError(err);
      setErrorMessage(errMessage);
      ErrorManager.logError(err, context);
      if (showToast) {
        ErrorManager.notifyUser(errMessage, 'error');
      }
      onErrorHandler?.(err);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [customErrorMessage, onErrorHandler, onSuccessHandler, showToast]);

  const retry = useCallback(async () => {
    if (lastOperation && retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setIsLoading(true);
      setError(null);
      setErrorMessage('');
      
      if (retryDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }

      try {
        await lastOperation();
        onSuccessHandler?.();
        setRetryCount(0); // Reset retry count on success
      } catch (err: any) {
        const errMessage = customErrorMessage || ErrorManager.getErrorMessage(err);
        setError(err);
        setErrorMessage(errMessage);
        ErrorManager.logError(err, { ...options?.onError, retryAttempt: retryCount + 1 });
        if (showToast) {
          ErrorManager.notifyUser(errMessage, 'error');
        }
        onErrorHandler?.(err);
      } finally {
        setIsLoading(false);
      }
    } else if (retryCount >= maxRetries) {
      ErrorManager.notifyUser("حداکثر تعداد تلاش مجدد انجام شده است.", "warning");
    }
  }, [lastOperation, retryCount, maxRetries, retryDelay, customErrorMessage, onErrorHandler, onSuccessHandler, showToast, options]);

  return {
    error,
    errorMessage,
    isLoading,
    retryCount,
    retry,
    executeAsync,
    setError, // Allow external setting of error for specific cases
  };
}