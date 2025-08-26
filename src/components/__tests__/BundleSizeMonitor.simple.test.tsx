import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BundleSizeMonitor from '../BundleSizeMonitor';

describe('BundleSizeMonitor - Simple Tests', () => {
  const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
      queries: { retry: false, cacheTime: 0 },
      mutations: { retry: false },
    },
  });

  it('renders without crashing', () => {
    const queryClient = createTestQueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <BundleSizeMonitor />
      </QueryClientProvider>
    );

    expect(screen.getByText('Bundle Size Monitor')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    const queryClient = createTestQueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <BundleSizeMonitor />
      </QueryClientProvider>
    );

    // Check for loading skeleton elements
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('has proper heading structure', () => {
    const queryClient = createTestQueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <BundleSizeMonitor />
      </QueryClientProvider>
    );

    const title = screen.getByText('Bundle Size Monitor');
    expect(title).toBeInTheDocument();
    
    const description = screen.getByText(/real-time monitoring/i);
    expect(description).toBeInTheDocument();
  });
});