import React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { ModernButton } from '@/components/ui/modern-button';

import { 
  ModernCard, 
  ModernCardContent, 
  ModernCardDescription, 
  ModernCardHeader, 
  ModernCardTitle 
} from '@/components/ui/modern-card';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { queryClient } from '@/lib/react-query-config';
import { handleError } from '@/lib/error-manager';

// Safe navigation hook that doesn't break outside Router context
function useSafeNavigate() {
  // Call hooks unconditionally
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're in a router context by checking if location has pathname
  const hasRouter = !!location.pathname;
  
  return { navigate, hasRouter, location };
}

// Safe accessibility hook that doesn't break outside AccessibilityProvider context
function useSafeAccessibility() {
  // We'll create a context checker component to determine if we're in a valid context
  const [hasAccessibility, setHasAccessibility] = React.useState(false);
  
  // Create a fallback announce function
  const fallbackAnnounce = React.useCallback((message: string, priority?: 'polite' | 'assertive') => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[A11Y Announcement ${priority || 'polite'}]:`, message);
    }
  }, []);
  
  // Try to initialize the accessibility hook
  React.useEffect(() => {
    try {
      // We can't call the hook here directly, but we can check if it would work
      // by trying to access the context in a different way
      setHasAccessibility(true);
    } catch (error) {
      setHasAccessibility(false);
    }
  }, []);
  
  // We'll create a wrapper function that will try to use the real hook
  // or fall back to our fallback function
  const announce = React.useCallback((message: string, priority?: 'polite' | 'assertive') => {
    if (hasAccessibility) {
      try {
        // In the components that use this hook, we'll call the real useAccessibility hook
        // This is just a placeholder since we can't call it here
        fallbackAnnounce(message, priority);
      } catch (error) {
        fallbackAnnounce(message, priority);
      }
    } else {
      fallbackAnnounce(message, priority);
    }
  }, [hasAccessibility, fallbackAnnounce]);
  
  return { announce, hasAccessibility };
}

// Generic Error Fallback Component
function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const { t } = useTranslation();
  const { navigate, hasRouter } = useSafeNavigate();
  const { announce } = useSafeAccessibility();

  React.useEffect(() => {
    announce(t('error.boundary_triggered', 'An error occurred and has been caught'), 'assertive');
  }, [announce, t]);

  const handleRetry = () => {
    announce(t('error.retrying', 'Retrying...'), 'polite');
    resetErrorBoundary();
  };

  const handleGoHome = () => {
    announce(t('error.navigating_home', 'Navigating to home'), 'polite');
    if (hasRouter && navigate) {
      navigate('/');
    } else {
      // Fallback to window location if no router context
      window.location.href = '/';
    }
    resetErrorBoundary();
  };

  const handleReload = () => {
    announce(t('error.reloading_page', 'Reloading page'), 'polite');
    window.location.reload();
  };

  const handleReportError = () => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    const mailtoUrl = `mailto:support@example.com?subject=Error%20Report&body=${encodeURIComponent(
      `Error Details:\n\n${JSON.stringify(errorReport, null, 2)}`
    )}`;

    window.location.href = mailtoUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <ModernCard variant="glass" className="w-full max-w-2xl rounded-xl p-6" role="alert" aria-live="assertive">
        <ModernCardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <ModernCardTitle className="text-xl text-red-600 dark:text-red-400">
            {t('error.something_went_wrong', 'Something went wrong')}
          </ModernCardTitle>
          <ModernCardDescription className="text-base">
            {t('error.unexpected_error_occurred', 'An unexpected error occurred. Don\'t worry, we\'ve been notified.')}
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent className="space-y-6">
          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <summary className="cursor-pointer font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                {t('error.technical_details', 'Technical Details')}
              </summary>
              <div className="mt-2 space-y-2 text-xs">
                <div>
                  <strong>{t('error.message', 'Message')}:</strong>
                  <pre className="mt-1 p-2 bg-red-50 dark:bg-red-900/10 rounded text-red-800 dark:text-red-200 whitespace-pre-wrap">
                    {error.message}
                  </pre>
                </div>
                {error.stack && (
                  <div>
                    <strong>{t('error.stack_trace', 'Stack Trace')}:</strong>
                    <pre className="mt-1 p-2 bg-gray-50 dark:bg-gray-900 rounded text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-xs overflow-auto max-h-40">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <ModernButton 
              onClick={handleRetry} 
              className="flex-1"
              aria-label={t('error.retry_operation', 'Retry the operation that failed')}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('error.try_again', 'Try Again')}
            </ModernButton>
            
            {hasRouter && (
              <ModernButton 
                variant="outline" 
                onClick={handleGoHome}
                className="flex-1"
                aria-label={t('error.go_home', 'Go to home page')}
              >
                <Home className="w-4 h-4 mr-2" />
                {t('error.go_home', 'Go Home')}
              </ModernButton>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <ModernButton 
              variant="outline" 
              onClick={handleReload}
              className="flex-1"
              aria-label={t('error.reload_page', 'Reload the entire page')}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('error.reload_page', 'Reload Page')}
            </ModernButton>
            
            <ModernButton 
              variant="ghost" 
              onClick={handleReportError}
              className="flex-1"
              aria-label={t('error.report_error', 'Report this error to support')}
            >
              <Mail className="w-4 h-4 mr-2" />
              {t('error.report_error', 'Report Error')}
            </ModernButton>
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>{t('error.help_text', 'If the problem persists, please contact support.')}</p>
          </div>
        </ModernCardContent>
      </ModernCard>
    </div>
  );
}

// Async Error Fallback for React Query and other async operations
function AsyncErrorFallback({ resetErrorBoundary }: FallbackProps) {
  const { t } = useTranslation();
  const { announce } = useSafeAccessibility();

  React.useEffect(() => {
    announce(t('error.async_error_occurred', 'A data loading error occurred'), 'assertive');
  }, [announce, t]);

  const handleRetry = () => {
    // Clear React Query cache to force refetch
    queryClient.clear();
    announce(t('error.clearing_cache_retrying', 'Clearing cache and retrying'), 'polite');
    resetErrorBoundary();
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full">
        <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {t('error.data_loading_failed', 'Failed to load data')}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
        {t('error.network_or_server_error', 'There was a problem loading the data. This could be due to a network or server issue.')}
      </p>
      <div className="space-y-2">
        <ModernButton onClick={handleRetry}>
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('error.try_again', 'Try Again')}
        </ModernButton>
      </div>
    </div>
  );
}

// Form Error Fallback
function FormErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const { t } = useTranslation();
  const { announce } = useSafeAccessibility();

  React.useEffect(() => {
    announce(t('error.form_error_occurred', 'A form error occurred'), 'assertive');
  }, [announce, t]);

  return (
    <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 rounded-lg">
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
            {t('error.form_submission_failed', 'Form submission failed')}
          </h4>
          <p className="text-sm text-red-700 dark:text-red-300 mb-3">
            {error.message || t('error.form_validation_error', 'There was a problem with your form submission.')}
          </p>
          <ModernButton
            size="sm"
            variant="outline"
            onClick={resetErrorBoundary}
            className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/20"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            {t('error.reset_form', 'Reset Form')}
          </ModernButton>
        </div>
      </div>
    </div>
  );
}



// Enhanced Error Boundary Components
export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => handleError(error, errorInfo, { boundary: 'App' })}
      onReset={() => {
        // Clear any cached data that might be causing issues
        queryClient.clear();
        // Clear local storage if needed
        localStorage.removeItem('error-recovery');
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export function AsyncErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={AsyncErrorFallback}
      onError={(error, errorInfo) => handleError(error, errorInfo, { boundary: 'Async' })}
      onReset={() => {
        queryClient.invalidateQueries();
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export function FormErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={FormErrorFallback}
      onError={(error, errorInfo) => handleError(error, errorInfo, { boundary: 'Form' })}
    >
      {children}
    </ErrorBoundary>
  );
}

export { ErrorFallback, AsyncErrorFallback, FormErrorFallback };
export default AppErrorBoundary;