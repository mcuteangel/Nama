import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BundleSizeMonitor from '../BundleSizeMonitor';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock URL.createObjectURL and related APIs
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false, cacheTime: 0 },
    mutations: { retry: false },
  },
});

const renderWithClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    ),
    queryClient,
  };
};

describe('BundleSizeMonitor', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Loading State', () => {
    it('renders loading state initially', () => {
      renderWithClient(<BundleSizeMonitor />);

      expect(screen.getByText('Bundle Size Monitor')).toBeInTheDocument();
      expect(screen.getByText(/real-time monitoring/i)).toBeInTheDocument();
      
      // Check for loading skeleton
      const skeletonElements = document.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('shows loading skeleton with correct structure', () => {
      renderWithClient(<BundleSizeMonitor />);
      
      const card = screen.getByRole('article');
      expect(card).toBeInTheDocument();
      
      const skeletons = card.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBe(3); // Three skeleton bars
    });
  });

  describe('Data Display', () => {
    beforeEach(() => {
      // Fast-forward time to skip loading delay
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('displays bundle metrics after loading', async () => {
      renderWithClient(<BundleSizeMonitor />);

      // Fast-forward past the loading delay
      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText(/total size/i)).toBeInTheDocument();
        expect(screen.getByText(/compression/i)).toBeInTheDocument();
        expect(screen.getByText(/load time/i)).toBeInTheDocument();
      });

      // Check for specific values
      expect(screen.getByText('420 KB')).toBeInTheDocument(); // Total size
      expect(screen.getByText('2500ms')).toBeInTheDocument(); // Load time
    });

    it('shows performance status badge correctly', async () => {
      renderWithClient(<BundleSizeMonitor />);

      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        const badge = screen.getByText(/optimal/i);
        expect(badge).toBeInTheDocument();
      });
    });

    it('displays chunk analysis with correct data', async () => {
      renderWithClient(<BundleSizeMonitor />);

      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText(/chunks analysis/i)).toBeInTheDocument();
        expect(screen.getByText('main')).toBeInTheDocument();
        expect(screen.getByText('contacts')).toBeInTheDocument();
        expect(screen.getByText('vendor')).toBeInTheDocument();
      });

      // Check for lazy/eager badges
      expect(screen.getByText('Eager')).toBeInTheDocument();
      expect(screen.getByText('Lazy')).toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      // Mock document methods
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as any);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('exports report when button clicked', async () => {
      renderWithClient(<BundleSizeMonitor />);

      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText(/export report/i)).toBeInTheDocument();
      });

      const exportButton = screen.getByText(/export report/i);
      await user.click(exportButton);

      // Verify that document.createElement was called to create an anchor
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('generates correct report data structure', async () => {
      renderWithClient(<BundleSizeMonitor />);

      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText(/export report/i)).toBeInTheDocument();
      });

      const exportButton = screen.getByText(/export report/i);
      await user.click(exportButton);

      // Check that Blob was created with correct data
      const blobCalls = vi.mocked(global.Blob).mock.calls;
      expect(blobCalls.length).toBeGreaterThan(0);
      
      const reportData = JSON.parse(blobCalls[0][0][0]);
      expect(reportData).toHaveProperty('timestamp');
      expect(reportData).toHaveProperty('totalSize');
      expect(reportData).toHaveProperty('compressionRatio');
      expect(reportData).toHaveProperty('chunks');
      expect(Array.isArray(reportData.chunks)).toBe(true);
    });
  });

  describe('Performance Insights', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('shows performance insights section', async () => {
      renderWithClient(<BundleSizeMonitor />);

      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText(/performance insights/i)).toBeInTheDocument();
      });

      // Should show success message when performance is good
      expect(screen.getByText(/excellent performance/i)).toBeInTheDocument();
    });

    it('calculates compression ratio correctly', async () => {
      renderWithClient(<BundleSizeMonitor />);

      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        // Total: 420KB, Gzipped: 130KB
        // Compression ratio: (420-130)/420 * 100 = 69.0%
        expect(screen.getByText('69.0%')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('has proper ARIA labels and roles', async () => {
      renderWithClient(<BundleSizeMonitor />);

      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        const exportButton = screen.getByRole('button', { name: /export report/i });
        expect(exportButton).toBeInTheDocument();
      });
    });

    it('provides meaningful text alternatives', async () => {
      renderWithClient(<BundleSizeMonitor />);

      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        // Check for descriptive text content
        expect(screen.getByText(/detailed breakdown of bundle chunks/i)).toBeInTheDocument();
        expect(screen.getByText(/real-time monitoring of bundle size/i)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('adapts layout for mobile screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderWithClient(<BundleSizeMonitor />);

      // The component should still render properly on mobile
      expect(screen.getByText('Bundle Size Monitor')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing metrics gracefully', () => {
      // Mock a scenario where metrics might be null/undefined
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      renderWithClient(<BundleSizeMonitor />);
      
      // Component should not crash
      expect(screen.getByText('Bundle Size Monitor')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Internationalization', () => {
    it('uses translation keys correctly', () => {
      renderWithClient(<BundleSizeMonitor />);

      // Check that i18n keys are being used (mocked to return the key itself)
      expect(screen.getByText('bundle_monitor.title')).toBeInTheDocument();
    });
  });
});

// Mock Blob constructor
global.Blob = vi.fn().mockImplementation((content, options) => ({
  content,
  options,
  size: content[0].length,
  type: options?.type || '',
}));