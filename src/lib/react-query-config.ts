import { QueryClient, DefaultOptions, MutationCache, QueryCache } from '@tanstack/react-query';
import { toast } from 'sonner';
import i18n from '@/integrations/i18n';

// Types for mutation meta
interface MutationMeta {
  silent?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
  invalidates?: string | readonly unknown[] | readonly unknown[][];
  queryClient?: QueryClient;
}

// Default query options with optimized caching and retry strategies
const queryConfig: DefaultOptions = {
  queries: {
    // Stale time: 5 minutes (data is considered fresh for 5 minutes)
    staleTime: 5 * 60 * 1000,
    
    // Cache time: 10 minutes (unused data is garbage collected after 10 minutes)
    gcTime: 10 * 60 * 1000, // formerly cacheTime
    
    // Retry configuration
    retry: (failureCount: number, error: unknown) => {
      // Don't retry on 4xx errors (client errors)
      const errorWithStatus = error as { status?: number };
      if (errorWithStatus.status && errorWithStatus.status >= 400 && errorWithStatus.status < 500) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    
    // Exponential backoff with jitter
    retryDelay: (attemptIndex) => {
      const baseDelay = Math.min(1000 * 2 ** attemptIndex, 30000);
      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.1 * baseDelay;
      return baseDelay + jitter;
    },
    
    // Refetch configuration
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
    
    // Network-aware settings
    networkMode: 'online',
  },
  mutations: {
    // Retry mutations up to 2 times
    retry: (failureCount: number, error: unknown) => {
      // Don't retry on 4xx errors (client errors)
      const errorWithStatus = error as { status?: number };
      if (errorWithStatus.status && errorWithStatus.status >= 400 && errorWithStatus.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    
    // Exponential backoff for mutations
    retryDelay: (attemptIndex) => {
      return Math.min(1000 * 2 ** attemptIndex, 5000);
    },
    
    // Network mode for mutations
    networkMode: 'online',
  },
};

// Enhanced error handling for queries
const queryCache = new QueryCache({
  onError: (error: unknown, query) => {
    console.error('Query error:', error, query);
    
    // Don't show toast for background refetches
    if (query.meta?.silent) {
      return;
    }
    
    // Show user-friendly error messages
    const errorMessage = getErrorMessage(error);
    
    // Only show error toast if it's not a network error during background refetch
    if (query.state.status !== 'pending' || query.state.error) {
      toast.error(errorMessage, {
        duration: 5000,
        id: `query-error-${query.queryHash}`, // Prevent duplicate toasts
      });
    }
  },
  
  onSuccess: (data, query) => {
    // Log successful queries in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Query success:', query.queryKey, data);
    }
  },
});

// Enhanced error handling for mutations
const mutationCache = new MutationCache({
  onError: (error: unknown, _variables, _context, mutation) => {
    console.error('Mutation error:', error, mutation);
    
    // Don't show toast for silent mutations
    if (mutation.meta?.silent) {
      return;
    }
    
    const errorMessage = getErrorMessage(error);
    toast.error(errorMessage, {
      duration: 5000,
      id: `mutation-error-${Date.now()}`,
    });
  },
  
  onSuccess: (data, _variables, _context, mutation) => {
    // Show success message for important mutations
    if (mutation.meta?.showSuccessToast) {
      const successMessage = (mutation.meta as MutationMeta).successMessage ?? i18n.t('common.operation_completed_successfully');
      toast.success(successMessage, {
        duration: 3000,
      });
    }
    
    // Log successful mutations in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Mutation success:', mutation.options.mutationKey, data);
    }
  },
  
  onSettled: (_data, _error, _variables, _context, mutation) => {
    // Invalidate related queries after mutations
    if (mutation.meta?.invalidates) {
      const queryClient = (mutation.meta as MutationMeta).queryClient;
      const invalidatePatterns = Array.isArray(mutation.meta.invalidates) 
        ? mutation.meta.invalidates 
        : [mutation.meta.invalidates];
      
      invalidatePatterns.forEach(pattern => {
        if (queryClient && typeof queryClient.invalidateQueries === 'function') {
          queryClient.invalidateQueries({ queryKey: pattern });
        }
      });
    }
  },
});

// Utility function to extract user-friendly error messages
function getErrorMessage(error: unknown): string {
  // Handle Supabase errors
  if (error && typeof error === 'object' && 'message' in error) {
    const errorObj = error as { message: string };
    // Common Supabase error patterns
    if (errorObj.message.includes('JWT')) {
      return i18n.t('common.session_expired');
    }
    if (errorObj.message.includes('permission')) {
      return i18n.t('common.permission_denied');
    }
    if (errorObj.message.includes('network')) {
      return i18n.t('common.network_error');
    }
    if (errorObj.message.includes('timeout')) {
      return i18n.t('common.request_timeout');
    }
    return errorObj.message;
  }

  // Handle HTTP status codes
  if (error && typeof error === 'object' && 'status' in error) {
    const errorObj = error as { status: number };
    switch (errorObj.status) {
      case 400:
        return i18n.t('common.invalid_request');
      case 401:
        return i18n.t('common.authentication_required');
      case 403:
        return i18n.t('common.access_denied');
      case 404:
        return i18n.t('common.resource_not_found');
      case 409:
        return i18n.t('common.conflict_error');
      case 422:
        return i18n.t('common.validation_error');
      case 429:
        return i18n.t('common.too_many_requests');
      case 500:
        return i18n.t('common.server_error');
      case 503:
        return i18n.t('common.service_unavailable');
      default:
        return i18n.t('common.request_failed_with_status', { status: errorObj.status });
    }
  }

  // Generic network errors
  if (error && typeof error === 'object' && 'code' in error) {
    const errorObj = error as { code: string };
    if (errorObj.code === 'NETWORK_ERROR' || !navigator.onLine) {
      return i18n.t('common.network_error');
    }
  }

  // Fallback
  return i18n.t('common.unexpected_error');
}

// Create the QueryClient with enhanced configuration
export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
  queryCache,
  mutationCache,
});

// Query key factory for consistent key generation
export const queryKeys = {
  // Contact-related queries
  contacts: {
    all: ['contacts'] as const,
    lists: () => [...queryKeys.contacts.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.contacts.lists(), { filters }] as const,
    details: () => [...queryKeys.contacts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.contacts.details(), id] as const,
    search: (term: string) => [...queryKeys.contacts.all, 'search', term] as const,
  },
  
  // Group-related queries
  groups: {
    all: ['groups'] as const,
    lists: () => [...queryKeys.groups.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.groups.lists(), { filters }] as const,
    details: () => [...queryKeys.groups.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.groups.details(), id] as const,
  },
  
  // User-related queries
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    profile: (id: string) => [...queryKeys.users.all, 'profile', id] as const,
  },
  
  // Settings-related queries
  settings: {
    all: ['settings'] as const,
    user: (userId: string) => [...queryKeys.settings.all, 'user', userId] as const,
    app: () => [...queryKeys.settings.all, 'app'] as const,
  },
  
  // Statistics-related queries
  statistics: {
    all: ['statistics'] as const,
    contacts: () => [...queryKeys.statistics.all, 'contacts'] as const,
    dashboard: () => [...queryKeys.statistics.all, 'dashboard'] as const,
  },
  
  // AI-related queries
  ai: {
    all: ['ai'] as const,
    suggestions: () => [...queryKeys.ai.all, 'suggestions'] as const,
    models: () => [...queryKeys.ai.all, 'models'] as const,
  },
  
  // Custom fields
  customFields: {
    all: ['customFields'] as const,
    templates: () => [...queryKeys.customFields.all, 'templates'] as const,
    template: (id: string) => [...queryKeys.customFields.templates(), id] as const,
  },
};

// Utility functions for query management
export const queryUtils = {
  // Invalidate all queries related to a specific contact
  invalidateContact: (contactId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.contacts.detail(contactId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.contacts.lists() });
    queryClient.invalidateQueries({ queryKey: queryKeys.statistics.contacts() });
  },
  
  // Invalidate all queries related to a specific group
  invalidateGroup: (groupId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(groupId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.groups.lists() });
    queryClient.invalidateQueries({ queryKey: queryKeys.contacts.lists() });
  },
  
  // Clear all caches (useful for logout)
  clearAll: () => {
    queryClient.clear();
  },
  
  // Remove specific queries from cache
  removeQueries: (queryKey: readonly unknown[]) => {
    queryClient.removeQueries({ queryKey });
  },
  
  // Set query data programmatically
  setQueryData: <T>(queryKey: readonly unknown[], data: T) => {
    queryClient.setQueryData(queryKey, data);
  },
  
  // Get cached query data
  getQueryData: <T>(queryKey: readonly unknown[]): T | undefined => {
    return queryClient.getQueryData<T>(queryKey);
  },
};

// Network status management
export const networkUtils = {
  // Check if online
  isOnline: () => navigator.onLine,
  
  // Resume paused queries when back online
  resumeQueries: () => {
    queryClient.resumePausedMutations();
    queryClient.invalidateQueries();
  },
  
  // Pause queries when offline
  pauseQueries: () => {
    // Queries will automatically pause when networkMode is 'online' and device goes offline
  },
};

// Development tools
if (process.env.NODE_ENV === 'development') {
  // Make queryClient available globally for debugging
  (window as typeof window & {
    queryClient: typeof queryClient;
    queryKeys: typeof queryKeys;
    queryUtils: typeof queryUtils;
  }).queryClient = queryClient;
  (window as typeof window & {
    queryClient: typeof queryClient;
    queryKeys: typeof queryKeys;
    queryUtils: typeof queryUtils;
  }).queryKeys = queryKeys;
  (window as typeof window & {
    queryClient: typeof queryClient;
    queryKeys: typeof queryKeys;
    queryUtils: typeof queryUtils;
  }).queryUtils = queryUtils;
}

export default queryClient;