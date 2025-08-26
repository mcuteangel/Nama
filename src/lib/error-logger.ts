import { toast } from 'sonner';
import { queryClient } from '@/lib/react-query-config';

// Error context type for additional error information
export type ErrorContext = Record<string, string | number | boolean | null | undefined>;

export interface ErrorInfo {
  error: Error;
  errorBoundary?: string;
  errorInfo?: React.ErrorInfo;
  context?: ErrorContext;
}

export interface StoredErrorInfo extends ErrorInfo {
  timestamp: string;
}

// Error logging service
export class ErrorLogger {
  private static instance: ErrorLogger;
  private errors: StoredErrorInfo[] = [];

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  logError(errorInfo: ErrorInfo) {
    this.errors.push({
      ...errorInfo,
      timestamp: new Date().toISOString(),
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', errorInfo.error);
      console.error('Error Info:', errorInfo.errorInfo);
      console.error('Context:', errorInfo.context);
      console.groupEnd();
    }

    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorService(errorInfo);
    }
  }

  private async sendToErrorService(errorInfo: ErrorInfo) {
    try {
      // Replace with your error reporting service (e.g., Sentry, LogRocket, etc.)
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: errorInfo.error.message,
          stack: errorInfo.error.stack,
          boundary: errorInfo.errorBoundary,
          context: errorInfo.context,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error('Failed to send error to service:', err);
    }
  }

  getErrors(): StoredErrorInfo[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }
}

export const errorLogger = ErrorLogger.getInstance();

// Error handler function
export function handleError(error: Error, errorInfo: React.ErrorInfo, context?: ErrorContext) {
  errorLogger.logError({
    error,
    errorInfo,
    context,
    errorBoundary: (context?.boundary as string) || 'unknown',
  });

  // Show toast notification
  toast.error('An error occurred. Please try again.', {
    duration: 5000,
    id: 'error-boundary',
  });
}

// Hook functions that can be imported elsewhere
export function createErrorHandler() {
  return (error: Error) => {
    throw error;
  };
}

export function createErrorLogger() {
  return {
    logError: (error: Error, context?: ErrorContext) => {
      errorLogger.logError({ error, context });
    },
    getErrors: () => errorLogger.getErrors(),
    clearErrors: () => errorLogger.clearErrors(),
  };
}