import { toast } from "sonner";

export const ErrorManager = {
  logError: (error: unknown, context?: Record<string, any>) => {
    console.error("An error occurred:", error, context);
    // Optionally send to an external logging service
  },

  notifyUser: (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'error') => {
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
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'خطای ناشناخته رخ داد.';
  },
};