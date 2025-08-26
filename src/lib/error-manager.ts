import { toast } from "sonner";
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

export const ErrorManager = {
  logError: (error: unknown, context?: Record<string, unknown>) => {
    console.error("An error occurred:", error, context);
    // Optionally send to an external logging service
  },

  notifyUser: (message: string, type: ErrorType = 'error') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'info':
        toast.info(message);
        break;
      case 'warning':
        toast.warning(message);
        break;
      default:
        toast(message);
    }
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
};