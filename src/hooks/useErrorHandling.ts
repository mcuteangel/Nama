import React from 'react';
import { createErrorLogger } from '@/lib/error-logger';

// Hook to programmatically trigger error boundary
export function useErrorHandler() {
  return React.useCallback((error: Error) => {
    throw error;
  }, []);
}

// Hook to access error logger
export function useErrorLogger() {
  return React.useMemo(() => createErrorLogger(), []);
}