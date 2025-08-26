import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, queryKeys, queryUtils, networkUtils } from '@/lib/react-query-config';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

const mockToast = vi.mocked(require('sonner').toast);

describe('React Query Integration', () => {
  let testQueryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create fresh query client for each test
    testQueryClient = new QueryClient({
      defaultOptions: {
        queries: { 
          retry: false, 
          cacheTime: 0,
          staleTime: 0,
        },
        mutations: { retry: false },
      },
    });
  });

  afterEach(() => {
    testQueryClient.clear();
  });

  describe('Query Keys Factory', () => {
    it('generates consistent contact query keys', () => {
      const allContactsKey = queryKeys.contacts.all;
      const contactsListKey = queryKeys.contacts.lists();
      const contactDetailKey = queryKeys.contacts.detail('123');
      const contactSearchKey = queryKeys.contacts.search('john');

      expect(allContactsKey).toEqual(['contacts']);
      expect(contactsListKey).toEqual(['contacts', 'list']);
      expect(contactDetailKey).toEqual(['contacts', 'detail', '123']);
      expect(contactSearchKey).toEqual(['contacts', 'search', 'john']);
    });

    it('generates consistent group query keys', () => {
      const allGroupsKey = queryKeys.groups.all;
      const groupsListKey = queryKeys.groups.lists();
      const groupDetailKey = queryKeys.groups.detail('456');

      expect(allGroupsKey).toEqual(['groups']);
      expect(groupsListKey).toEqual(['groups', 'list']);
      expect(groupDetailKey).toEqual(['groups', 'detail', '456']);
    });

    it('generates filtered list keys correctly', () => {
      const filteredContactsKey = queryKeys.contacts.list({ search: 'test', status: 'active' });
      const filteredGroupsKey = queryKeys.groups.list({ category: 'work' });

      expect(filteredContactsKey).toEqual(['contacts', 'list', { filters: { search: 'test', status: 'active' } }]);
      expect(filteredGroupsKey).toEqual(['groups', 'list', { filters: { category: 'work' } }]);
    });
  });

  describe('Query Configuration', () => {
    it('applies correct default settings', () => {
      const TestComponent = () => {
        const query = useQuery({
          queryKey: ['test'],
          queryFn: () => Promise.resolve('test data'),
        });

        return <div>{query.isLoading ? 'Loading' : query.data}</div>;
      };

      render(
        <QueryClientProvider client={testQueryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      expect(screen.getByText('Loading')).toBeInTheDocument();
    });

    it('handles query errors with toast notifications', async () => {
      const errorQuery = vi.fn().mockRejectedValue(new Error('Test error'));

      const TestComponent = () => {
        const query = useQuery({
          queryKey: ['error-test'],
          queryFn: errorQuery,
        });

        return <div>{query.error ? 'Error occurred' : 'No error'}</div>;
      };

      render(
        <QueryClientProvider client={testQueryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Error occurred')).toBeInTheDocument();
      });

      // Should show error toast
      expect(mockToast.error).toHaveBeenCalledWith(
        'Test error',
        expect.objectContaining({
          duration: 5000,
        })
      );
    });

    it('handles successful queries without notifications', async () => {
      const successQuery = vi.fn().mockResolvedValue('Success data');

      const TestComponent = () => {
        const query = useQuery({
          queryKey: ['success-test'],
          queryFn: successQuery,
        });

        return <div>{query.data || 'Loading'}</div>;
      };

      render(
        <QueryClientProvider client={testQueryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Success data')).toBeInTheDocument();
      });

      // Should not show success toast for queries
      expect(mockToast.success).not.toHaveBeenCalled();
    });
  });

  describe('Mutation Configuration', () => {
    it('handles mutation errors with toast notifications', async () => {
      const errorMutation = vi.fn().mockRejectedValue(new Error('Mutation failed'));

      const TestComponent = () => {
        const mutation = useMutation({
          mutationFn: errorMutation,
        });

        React.useEffect(() => {
          mutation.mutate();
        }, []);

        return <div>{mutation.error ? 'Mutation error' : 'No error'}</div>;
      };

      render(
        <QueryClientProvider client={testQueryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Mutation error')).toBeInTheDocument();
      });

      expect(mockToast.error).toHaveBeenCalledWith(
        'Mutation failed',
        expect.objectContaining({
          duration: 5000,
        })
      );
    });

    it('shows success toast for mutations with showSuccessToast meta', async () => {
      const successMutation = vi.fn().mockResolvedValue('Success');

      const TestComponent = () => {
        const mutation = useMutation({
          mutationFn: successMutation,
          meta: {
            showSuccessToast: true,
            successMessage: 'Operation completed!',
          },
        });

        React.useEffect(() => {
          mutation.mutate();
        }, []);

        return <div>{mutation.data ? 'Success' : 'Loading'}</div>;
      };

      render(
        <QueryClientProvider client={testQueryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Success')).toBeInTheDocument();
      });

      expect(mockToast.success).toHaveBeenCalledWith(
        'Operation completed!',
        expect.objectContaining({
          duration: 3000,
        })
      );
    });
  });

  describe('Query Utils', () => {
    beforeEach(() => {
      // Use the actual queryClient for utils tests
      testQueryClient = queryClient;
    });

    it('invalidates contact queries correctly', async () => {
      const spy = vi.spyOn(testQueryClient, 'invalidateQueries');

      await act(async () => {
        queryUtils.invalidateContact('123');
      });

      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.contacts.detail('123') });
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.contacts.lists() });
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.statistics.contacts() });

      spy.mockRestore();
    });

    it('invalidates group queries correctly', async () => {
      const spy = vi.spyOn(testQueryClient, 'invalidateQueries');

      await act(async () => {
        queryUtils.invalidateGroup('456');
      });

      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.groups.detail('456') });
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.groups.lists() });
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.contacts.lists() });

      spy.mockRestore();
    });

    it('clears all queries', async () => {
      const spy = vi.spyOn(testQueryClient, 'clear');

      await act(async () => {
        queryUtils.clearAll();
      });

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('sets and gets query data', () => {
      const testData = { id: '1', name: 'Test Contact' };
      const queryKey = queryKeys.contacts.detail('1');

      queryUtils.setQueryData(queryKey, testData);
      const retrievedData = queryUtils.getQueryData(queryKey);

      expect(retrievedData).toEqual(testData);
    });

    it('removes specific queries', async () => {
      const spy = vi.spyOn(testQueryClient, 'removeQueries');
      const queryKey = queryKeys.contacts.detail('1');

      await act(async () => {
        queryUtils.removeQueries(queryKey);
      });

      expect(spy).toHaveBeenCalledWith({ queryKey });
      spy.mockRestore();
    });
  });

  describe('Network Utils', () => {
    beforeEach(() => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
    });

    it('detects online status', () => {
      expect(networkUtils.isOnline()).toBe(true);

      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      expect(networkUtils.isOnline()).toBe(false);
    });

    it('resumes queries when back online', async () => {
      const resumeSpy = vi.spyOn(testQueryClient, 'resumePausedMutations');
      const invalidateSpy = vi.spyOn(testQueryClient, 'invalidateQueries');

      await act(async () => {
        networkUtils.resumeQueries();
      });

      expect(resumeSpy).toHaveBeenCalled();
      expect(invalidateSpy).toHaveBeenCalled();

      resumeSpy.mockRestore();
      invalidateSpy.mockRestore();
    });
  });

  describe('Error Message Extraction', () => {
    it('handles Supabase JWT errors', async () => {
      const jwtError = new Error('JWT expired');
      const errorQuery = vi.fn().mockRejectedValue(jwtError);

      const TestComponent = () => {
        const query = useQuery({
          queryKey: ['jwt-error'],
          queryFn: errorQuery,
        });

        return <div>{query.error ? 'Error' : 'Loading'}</div>;
      };

      render(
        <QueryClientProvider client={testQueryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
      });

      expect(mockToast.error).toHaveBeenCalledWith(
        'Session expired. Please log in again.',
        expect.any(Object)
      );
    });

    it('handles permission errors', async () => {
      const permissionError = new Error('permission denied');
      const errorQuery = vi.fn().mockRejectedValue(permissionError);

      const TestComponent = () => {
        const query = useQuery({
          queryKey: ['permission-error'],
          queryFn: errorQuery,
        });

        return <div>{query.error ? 'Error' : 'Loading'}</div>;
      };

      render(
        <QueryClientProvider client={testQueryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
      });

      expect(mockToast.error).toHaveBeenCalledWith(
        'You do not have permission to perform this action.',
        expect.any(Object)
      );
    });

    it('handles HTTP status errors', async () => {
      const httpError = { status: 404, message: 'Not found' };
      const errorQuery = vi.fn().mockRejectedValue(httpError);

      const TestComponent = () => {
        const query = useQuery({
          queryKey: ['http-error'],
          queryFn: errorQuery,
        });

        return <div>{query.error ? 'Error' : 'Loading'}</div>;
      };

      render(
        <QueryClientProvider client={testQueryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
      });

      expect(mockToast.error).toHaveBeenCalledWith(
        'Resource not found.',
        expect.any(Object)
      );
    });

    it('handles network errors', async () => {
      const networkError = { code: 'NETWORK_ERROR' };
      const errorQuery = vi.fn().mockRejectedValue(networkError);

      const TestComponent = () => {
        const query = useQuery({
          queryKey: ['network-error'],
          queryFn: errorQuery,
        });

        return <div>{query.error ? 'Error' : 'Loading'}</div>;
      };

      render(
        <QueryClientProvider client={testQueryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
      });

      expect(mockToast.error).toHaveBeenCalledWith(
        'Network error. Please check your connection.',
        expect.any(Object)
      );
    });
  });

  describe('Retry Logic', () => {
    it('does not retry on 4xx client errors', async () => {
      const clientError = { status: 400, message: 'Bad request' };
      const errorQuery = vi.fn().mockRejectedValue(clientError);

      const TestComponent = () => {
        const query = useQuery({
          queryKey: ['client-error'],
          queryFn: errorQuery,
        });

        return <div>{query.error ? 'Error' : 'Loading'}</div>;
      };

      render(
        <QueryClientProvider client={testQueryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
      });

      // Should only be called once (no retries)
      expect(errorQuery).toHaveBeenCalledTimes(1);
    });

    it('retries on server errors', async () => {
      let callCount = 0;
      const serverError = { status: 500, message: 'Server error' };
      const retryQuery = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(serverError);
        }
        return Promise.resolve('success');
      });

      const TestComponent = () => {
        const query = useQuery({
          queryKey: ['server-error'],
          queryFn: retryQuery,
          retry: 3,
        });

        return <div>{query.data || (query.error ? 'Error' : 'Loading')}</div>;
      };

      render(
        <QueryClientProvider client={testQueryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('success')).toBeInTheDocument();
      });

      expect(retryQuery).toHaveBeenCalledTimes(3);
    });
  });

  describe('Development Tools', () => {
    it('exposes query client globally in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Re-import to trigger development setup
      require('@/lib/react-query-config');

      expect((window as any).queryClient).toBeDefined();
      expect((window as any).queryKeys).toBeDefined();
      expect((window as any).queryUtils).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });
  });
});