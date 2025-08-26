import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useContactExtractor } from '../use-contact-extractor';
import { SessionContextProvider } from '../../integrations/supabase/auth';

// Mock Supabase
const mockInvoke = vi.fn();
vi.mock('../../integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: mockInvoke
    },
    auth: {
      getSession: vi.fn(() => Promise.resolve({ 
        data: { 
          session: { 
            access_token: 'mock-token',
            user: { id: 'user-123' }
          } 
        }, 
        error: null 
      })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    }
  }
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider supabaseClient={null as any}>
        {children}
      </SessionContextProvider>
    </QueryClientProvider>
  );
};

describe('useContactExtractor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should extract contact information successfully', async () => {
    const mockResponse = {
      data: { ai_suggestion_id: 'suggestion-123' },
      error: null
    };
    mockInvoke.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useContactExtractor(), {
      wrapper: TestWrapper
    });

    const testText = 'John Doe, phone: 1234567890, email: john@example.com';
    
    await waitFor(async () => {
      const response = await result.current.enqueueContactExtraction(testText);
      expect(response.success).toBe(true);
      expect(response.suggestionId).toBe('suggestion-123');
    });

    expect(mockInvoke).toHaveBeenCalledWith('extract-contact-info', {
      body: JSON.stringify({ text: testText })
    });
  });

  it('should handle extraction errors gracefully', async () => {
    const mockError = new Error('Network error');
    mockInvoke.mockRejectedValue(mockError);

    const { result } = renderHook(() => useContactExtractor(), {
      wrapper: TestWrapper
    });

    const testText = 'Invalid contact text';
    
    await waitFor(async () => {
      const response = await result.current.enqueueContactExtraction(testText);
      expect(response.success).toBe(false);
      expect(response.error).toContain('Network error');
    });
  });

  it('should handle Supabase function errors', async () => {
    const mockResponse = {
      data: null,
      error: { message: 'Function execution failed' }
    };
    mockInvoke.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useContactExtractor(), {
      wrapper: TestWrapper
    });

    const testText = 'Test contact text';
    
    await waitFor(async () => {
      const response = await result.current.enqueueContactExtraction(testText);
      expect(response.success).toBe(false);
      expect(response.error).toContain('Function execution failed');
    });
  });

  it('should require authentication', async () => {
    // Mock no session
    vi.mocked(require('../../integrations/supabase/client').supabase.auth.getSession)
      .mockResolvedValue({ data: { session: null }, error: null });

    const { result } = renderHook(() => useContactExtractor(), {
      wrapper: TestWrapper
    });

    const testText = 'Test contact text';
    
    await waitFor(async () => {
      const response = await result.current.enqueueContactExtraction(testText);
      expect(response.success).toBe(false);
      expect(response.error).toContain('authentication');
    });
  });

  it('should handle empty text input', async () => {
    const { result } = renderHook(() => useContactExtractor(), {
      wrapper: TestWrapper
    });

    await waitFor(async () => {
      const response = await result.current.enqueueContactExtraction('');
      expect(response.success).toBe(false);
      expect(response.error).toContain('empty');
    });
  });

  it('should track loading state correctly', async () => {
    mockInvoke.mockImplementation(() => new Promise(resolve => 
      setTimeout(() => resolve({ data: { ai_suggestion_id: 'test' }, error: null }), 100)
    ));

    const { result } = renderHook(() => useContactExtractor(), {
      wrapper: TestWrapper
    });

    expect(result.current.isLoading).toBe(false);

    const promise = result.current.enqueueContactExtraction('Test text');
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    await promise;

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle malformed response data', async () => {
    const mockResponse = {
      data: { invalid_field: 'unexpected_data' },
      error: null
    };
    mockInvoke.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useContactExtractor(), {
      wrapper: TestWrapper
    });

    const testText = 'Test contact text';
    
    await waitFor(async () => {
      const response = await result.current.enqueueContactExtraction(testText);
      expect(response.success).toBe(false);
      expect(response.error).toContain('Invalid response');
    });
  });
});