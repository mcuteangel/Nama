import { useState, useCallback } from 'react';
import { ErrorManager } from '@/lib/error-manager';

interface UseErrorHandlerOptions<TResult = unknown> {
  maxRetries?: number;
  retryDelay?: number;
  showToast?: boolean;
  customErrorMessage?: string;
  onError?: (error: Error) => void;
  onSuccess?: (result: TResult) => void;
}

export function useErrorHandler<TResult = unknown>(initialError: Error | null = null, options?: UseErrorHandlerOptions<TResult>) {
  const [error, setError] = useState<Error | null>(initialError);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastOperation, setLastOperation] = useState<(() => Promise<TResult>) | null>(null);

  const {
    maxRetries = 0,
    retryDelay = 0,
    showToast = false,
    customErrorMessage,
    onError: onErrorHandler,
    onSuccess: onSuccessHandler,
  } = options || {};

  const executeAsync = useCallback(async (
    asyncFunction: () => Promise<TResult>, // Changed T to TResult
    context?: Record<string, any>
  ): Promise<TResult | undefined> => { // Changed T to TResult
    setIsLoading(true);
    setError(null);
    setErrorMessage('');
    setLastOperation(() => asyncFunction); // No cast needed

    try {
      const result = await asyncFunction();
      onSuccessHandler?.(result);
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
        const result = await lastOperation();
        onSuccessHandler?.(result);
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
    setError,
  };
}