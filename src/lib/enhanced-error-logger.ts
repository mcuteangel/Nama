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
  context?: Record<string, any>;
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

  private clearLocalErrors() {
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