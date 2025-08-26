import { QueryClient, DefaultOptions, MutationCache, QueryCache } from '@tanstack/react-query';
import { toast } from 'sonner';

// Default query options with optimized caching and retry strategies
const queryConfig: DefaultOptions = {
  queries: {
    // Stale time: 5 minutes (data is considered fresh for 5 minutes)
    staleTime: 5 * 60 * 1000,
    
    // Cache time: 10 minutes (unused data is garbage collected after 10 minutes)
    gcTime: 10 * 60 * 1000, // formerly cacheTime
    
    // Retry configuration
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.status >= 400 && error?.status < 500) {
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
    
    // Disable refetch on window focus for mobile to save battery
    refetchOnWindowFocus: () => {
      // Check if device is mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      return !isMobile;
    },
  },
  mutations: {
    // Retry mutations up to 2 times
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.status >= 400 && error?.status < 500) {
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
  onError: (error: any, query) => {
    console.error('Query error:', error, query);
    
    // Don't show toast for background refetches
    if (query.meta?.silent) {
      return;
    }
    
    // Show user-friendly error messages
    const errorMessage = getErrorMessage(error);
    
    // Only show error toast if it's not a network error during background refetch
    if (!query.state.isFetching || query.state.error) {
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
  onError: (error: any, variables, context, mutation) => {
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
  
  onSuccess: (data, variables, context, mutation) => {
    // Show success message for important mutations
    if (mutation.meta?.showSuccessToast) {
      const successMessage = mutation.meta.successMessage || 'Operation completed successfully';
      toast.success(successMessage, {
        duration: 3000,
      });
    }
    
    // Log successful mutations in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Mutation success:', mutation.options.mutationKey, data);
    }
  },
  
  onSettled: (data, error, variables, context, mutation) => {
    // Invalidate related queries after mutations
    if (mutation.meta?.invalidates) {
      const queryClient = mutation.meta.queryClient;
      const invalidatePatterns = Array.isArray(mutation.meta.invalidates) 
        ? mutation.meta.invalidates 
        : [mutation.meta.invalidates];
      
      invalidatePatterns.forEach(pattern => {
        queryClient?.invalidateQueries({ queryKey: pattern });
      });
    }
  },
});

// Utility function to extract user-friendly error messages
function getErrorMessage(error: any): string {
  // Handle Supabase errors
  if (error?.message) {
    // Common Supabase error patterns
    if (error.message.includes('JWT')) {
      return 'Session expired. Please log in again.';
    }
    if (error.message.includes('permission')) {
      return 'You do not have permission to perform this action.';
    }
    if (error.message.includes('network')) {
      return 'Network error. Please check your connection.';
    }
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    return error.message;
  }
  
  // Handle HTTP status codes
  if (error?.status) {
    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication required. Please log in.';
      case 403:
        return 'Access denied. You do not have permission.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Conflict. The resource already exists or has been modified.';
      case 422:
        return 'Validation error. Please check your input.';
      case 429:
        return 'Too many requests. Please wait and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return `Request failed with status ${error.status}`;
    }
  }
  
  // Generic network errors
  if (error?.code === 'NETWORK_ERROR' || !navigator.onLine) {
    return 'Network error. Please check your connection.';
  }
  
  // Fallback
  return 'An unexpected error occurred. Please try again.';
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
    list: (filters: Record<string, any>) => [...queryKeys.contacts.lists(), { filters }] as const,
    details: () => [...queryKeys.contacts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.contacts.details(), id] as const,
    search: (term: string) => [...queryKeys.contacts.all, 'search', term] as const,
  },
  
  // Group-related queries
  groups: {
    all: ['groups'] as const,
    lists: () => [...queryKeys.groups.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.groups.lists(), { filters }] as const,
    details: () => [...queryKeys.groups.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.groups.details(), id] as const,
  },
  
  // User-related queries
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.users.lists(), { filters }] as const,
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
  (window as any).queryClient = queryClient;
  (window as any).queryKeys = queryKeys;
  (window as any).queryUtils = queryUtils;
}

export default queryClient;