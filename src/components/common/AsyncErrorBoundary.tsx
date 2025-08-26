import React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Database, Wifi } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { queryClient } from '@/lib/react-query-config';
import { ErrorManager } from '@/lib/error-manager';

/**
 * Props for AsyncErrorBoundary component
 */
interface AsyncErrorBoundaryProps {
  children: React.ReactNode;
  /** Custom fallback component for async errors */
  fallback?: React.ComponentType<FallbackProps>;
  /** Callback fired when error is reset */
  onReset?: () => void;
  /** Custom error filter to determine if error should be caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Fallback component specifically designed for async operation errors
 * 
 * Features:
 * - Network connectivity check
 * - React Query cache clearing
 * - User-friendly error messages
 * - Retry functionality with exponential backoff
 * 
 * @param props - FallbackProps from react-error-boundary
 * @returns JSX element representing the async error fallback
 */
function AsyncErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const { t } = useTranslation();
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  // Monitor network connectivity
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Handles retry with exponential backoff
   */
  const handleRetry = React.useCallback(async () => {
    setIsRetrying(true);
    
    try {
      // Clear React Query cache to force fresh data fetch
      await queryClient.clear();
      
      // Exponential backoff: wait longer for each retry
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      setRetryCount(prev => prev + 1);
      resetErrorBoundary();
    } catch (retryError) {
      console.error('Retry failed:', retryError);
      ErrorManager.logError(retryError as Error, { 
        component: 'AsyncErrorFallback', 
        action: 'retry',
        retryCount 
      });
    } finally {
      setIsRetrying(false);
    }
  }, [resetErrorBoundary, retryCount]);

  /**
   * Determines the error type and appropriate message
   */
  const getErrorInfo = React.useMemo(() => {
    const errorMessage = error.message.toLowerCase();
    
    if (!isOnline) {
      return {
        type: 'network',
        icon: Wifi,
        title: t('error.network_offline', 'No Internet Connection'),
        description: t('error.network_offline_desc', 'Please check your internet connection and try again.')
      };
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return {
        type: 'network',
        icon: Wifi,
        title: t('error.network_error', 'Network Error'),
        description: t('error.network_error_desc', 'Unable to connect to the server. Please try again.')
      };
    }
    
    if (errorMessage.includes('timeout')) {
      return {
        type: 'timeout',
        icon: RefreshCw,
        title: t('error.timeout_error', 'Request Timeout'),
        description: t('error.timeout_error_desc', 'The request took too long to complete. Please try again.')
      };
    }
    
    return {
      type: 'data',
      icon: Database,
      title: t('error.data_error', 'Data Loading Error'),
      description: t('error.data_error_desc', 'Failed to load data. Please try again.')
    };
  }, [error.message, isOnline, t]);

  const IconComponent = getErrorInfo.icon;

  return (
    <div className="flex items-center justify-center p-8">
      <Card className="w-full max-w-md" role="alert">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full">
            <IconComponent className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-lg text-orange-600 dark:text-orange-400">
            {getErrorInfo.title}
          </CardTitle>
          <CardDescription>
            {getErrorInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Network status indicator */}
          {!isOnline && (
            <div className="flex items-center justify-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <Wifi className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
              <span className="text-sm text-red-600 dark:text-red-400">
                {t('error.offline_mode', 'You are currently offline')}
              </span>
            </div>
          )}
          
          {/* Retry information */}
          {retryCount > 0 && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              {t('error.retry_attempt', 'Retry attempt: {{count}}', { count: retryCount })}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleRetry} 
              disabled={isRetrying}
              className="w-full"
              aria-label={t('error.retry_operation', 'Retry the failed operation')}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? t('error.retrying', 'Retrying...') : t('error.try_again', 'Try Again')}
            </Button>
            
            {retryCount >= 3 && (
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full"
              >
                {t('error.reload_page', 'Reload Page')}
              </Button>
            )}
          </div>
          
          {/* Development error details */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400">
                {t('error.technical_details', 'Technical Details')}
              </summary>
              <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto max-h-32">
                {error.message}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * AsyncErrorBoundary component for handling async operation errors
 * 
 * This component provides specialized error handling for asynchronous operations
 * such as API calls, data fetching, and other async tasks. It includes:
 * - Network connectivity monitoring
 * - React Query cache management
 * - Exponential backoff retry logic
 * - User-friendly error categorization
 * 
 * @param props - AsyncErrorBoundaryProps
 * @returns JSX element wrapping children with async error boundary
 */
export function AsyncErrorBoundary({ 
  children, 
  fallback = AsyncErrorFallback, 
  onReset,
  onError 
}: AsyncErrorBoundaryProps) {
  
  const handleError = React.useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    // Log error to our error management system
    ErrorManager.logError(error, {
      component: 'AsyncErrorBoundary',
      errorInfo,
      timestamp: new Date().toISOString()
    });
    
    // Call custom error handler if provided
    onError?.(error, errorInfo);
  }, [onError]);

  return (
    <ErrorBoundary
      FallbackComponent={fallback}
      onError={handleError}
      onReset={onReset}
      resetKeys={[navigator.onLine]} // Reset when network connectivity changes
    >
      {children}
    </ErrorBoundary>
  );
}

export default AsyncErrorBoundary;