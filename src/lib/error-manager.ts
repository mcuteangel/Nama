import React from 'react';
import i18n from '@/integrations/i18n';

type ErrorType = 'success' | 'error' | 'info' | 'warning';

// Error pattern constants for message matching
const ERROR_PATTERNS = {
  EDGE_FUNCTION_REQUEST: 'Failed to send a request to the Edge Function',
  SESSION_ERROR: 'Session error',
  NO_ACTIVE_SESSION: 'No active session',
  EDGE_FUNCTION_ERROR: 'Edge Function error',
  INVALID_RESPONSE_FORMAT: 'Invalid response format',
} as const;

interface ErrorDetails {
  message: string;
  stack?: string;
  component?: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'ui' | 'api' | 'auth' | 'ai' | 'performance' | 'unknown';
  context?: Record<string, unknown>;
}

class EnhancedErrorLogger {
  private sessionId: string;
  private userId?: string;
  private errorQueue: ErrorDetails[] = [];
  private isOnline = navigator.onLine;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupNetworkListeners();
    this.setupUnhandledErrorListeners();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private setupUnhandledErrorListeners() {
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        component: 'global',
        severity: 'high',
        category: 'ui',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        component: 'global',
        severity: 'high',
        category: 'unknown',
        context: {
          reason: event.reason
        }
      });
    });
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  logError(error: Partial<ErrorDetails>) {
    const errorDetails: ErrorDetails = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      component: error.component || 'unknown',
      userId: this.userId,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      severity: error.severity || 'medium',
      category: error.category || 'unknown',
      context: error.context
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error [${errorDetails.severity}]`);
      console.error(errorDetails.message);
      if (errorDetails.stack) console.error(errorDetails.stack);
      console.log('Context:', errorDetails.context);
      console.groupEnd();
    }

    // Add to queue
    this.errorQueue.push(errorDetails);

    // Attempt to send immediately if online
    if (this.isOnline) {
      this.flushErrorQueue();
    }

    // Store in localStorage as backup
    this.storeErrorLocally(errorDetails);
  }

  private async flushErrorQueue() {
    if (this.errorQueue.length === 0) return;

    const errorsToSend = [...this.errorQueue];
    this.errorQueue = [];

    try {
      await this.sendErrorsToServer(errorsToSend);
      this.clearLocalErrors();
    } catch (error) {
      // Re-add to queue if sending failed
      this.errorQueue.unshift(...errorsToSend);
      console.warn('Failed to send errors to server:', error);
    }
  }

  private async sendErrorsToServer(errors: ErrorDetails[]) {
    // TODO: Implement server error logging endpoint
    // Temporarily disabled to prevent 404 errors
    console.log('Error logging to server disabled (endpoint not implemented):', errors);
    return; // Skip server logging for now
    
    // Send to Supabase Edge Function for logging
    const response = await fetch('/api/log-errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ errors })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  }

  private storeErrorLocally(error: ErrorDetails) {
    try {
      const stored = localStorage.getItem('nama_error_logs');
      const errors = stored ? JSON.parse(stored) : [];
      errors.push(error);
      
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('nama_error_logs', JSON.stringify(errors));
    } catch (e) {
      console.warn('Failed to store error locally:', e);
    }
  }

  clearLocalErrors() {
    try {
      localStorage.removeItem('nama_error_logs');
    } catch (e) {
      console.warn('Failed to clear local errors:', e);
    }
  }

  getStoredErrors(): ErrorDetails[] {
    try {
      const stored = localStorage.getItem('nama_error_logs');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }
}

export const errorLogger = new EnhancedErrorLogger();
export type { ErrorDetails };

// Unified Error Manager - combines all error handling functionality
export const ErrorManager = {
  logError: (error: unknown, context?: Record<string, unknown>) => {
    if (error instanceof Error) {
      errorLogger.logError({
        message: error.message,
        stack: error.stack,
        component: context?.component as string,
        severity: 'medium',
        category: 'unknown',
        context
      });
    } else {
      console.error("An error occurred:", error, context);
    }
  },

  notifyUser: (message: string, type: ErrorType = 'error') => {
    // TODO: این تابع باید در کامپوننت‌ها با استفاده از useToastHelpers استفاده شود
    console.warn(`ErrorManager.notifyUser called with ${type} message: ${message}. Please use useToastHelpers hook in React components instead.`);
  },

  getErrorMessage: (error: unknown): string => {
    const t = i18n.t;
    
    if (error instanceof Error) {
      const message = error.message;
      
      // Handle common Supabase/Edge Function errors with translation keys
      if (message.includes(ERROR_PATTERNS.EDGE_FUNCTION_REQUEST)) {
        return t('errors.edge_function_connection');
      }
      if (message.includes(ERROR_PATTERNS.SESSION_ERROR) || message.includes(ERROR_PATTERNS.NO_ACTIVE_SESSION)) {
        return t('errors.session_expired');
      }
      if (message.includes(ERROR_PATTERNS.EDGE_FUNCTION_ERROR)) {
        return t('errors.server_processing_error');
      }
      if (message.includes(ERROR_PATTERNS.INVALID_RESPONSE_FORMAT)) {
        return t('errors.invalid_response_format');
      }
      
      return message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return t('errors.generic_error');
  },

  // Set user ID for error tracking
  setUserId: (userId: string) => {
    errorLogger.setUserId(userId);
  },

  // Get stored errors
  getStoredErrors: () => {
    return errorLogger.getStoredErrors();
  },

  // Clear stored errors
  clearStoredErrors: () => {
    errorLogger.clearLocalErrors();
  }
};

// Legacy compatibility exports
export const handleError = (error: Error, errorInfo?: React.ErrorInfo, context?: Record<string, unknown>) => {
  ErrorManager.logError(error, { ...context, errorInfo });
  ErrorManager.notifyUser('An error occurred. Please try again.', 'error');
};

export const createErrorLogger = () => ({
  logError: (error: Error, context?: Record<string, unknown>) => {
    ErrorManager.logError(error, context);
  },
  getErrors: () => ErrorManager.getStoredErrors(),
  clearErrors: () => ErrorManager.clearStoredErrors(),
});

export const createErrorHandler = () => {
  return (error: Error) => {
    throw error;
  };
};