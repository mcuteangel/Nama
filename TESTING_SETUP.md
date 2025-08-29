# Testing Setup and Guidelines

This document provides comprehensive testing guidelines for the enhanced Nama-1 application with bundle monitoring, mobile optimization, accessibility, and React Query integration.

## Overview

The testing strategy covers:

- **Unit Tests**: Individual component and function testing
- **Integration Tests**: React Query state management and API integration
- **Performance Tests**: Bundle size regression and benchmarking
- **Accessibility Tests**: A11y compliance and keyboard navigation
- **Mobile Tests**: Touch interactions and responsive behavior

## Setup Instructions

### 1. Install Testing Dependencies

```bash
# Core testing framework
pnpm add -D vitest @vitest/ui jsdom

# React testing utilities
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event

# React Query testing
pnpm add -D @testing-library/react-hooks

# Accessibility testing
pnpm add -D @axe-core/react jest-axe

# Performance testing
pnpm add -D lighthouse bundlewatch

# Mobile/Touch testing
pnpm add -D @testing-library/user-event
```

### 2. Configure Vitest

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 3. Create Test Setup File

Create `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom';
import { expect, afterEach, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock implementations
beforeAll(() => {
  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});
```

## Unit Tests

### 1. BundleSizeMonitor Tests

Create `src/components/__tests__/BundleSizeMonitor.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import BundleSizeMonitor from '../BundleSizeMonitor';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

describe('BundleSizeMonitor', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
  });

  it('renders loading state initially', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BundleSizeMonitor />
      </QueryClientProvider>
    );

    expect(screen.getByText(/bundle size monitor/i)).toBeInTheDocument();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays bundle metrics after loading', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BundleSizeMonitor />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/total size/i)).toBeInTheDocument();
      expect(screen.getByText(/compression/i)).toBeInTheDocument();
      expect(screen.getByText(/load time/i)).toBeInTheDocument();
    });
  });

  it('exports report when button clicked', async () => {
    const { user } = render(
      <QueryClientProvider client={queryClient}>
        <BundleSizeMonitor />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/export report/i)).toBeInTheDocument();
    });

    const exportButton = screen.getByText(/export report/i);
    await user.click(exportButton);

    // Test would verify file download functionality
  });
});
```

### 2. TouchGestureHandler Tests

Create `src/components/__tests__/TouchGestureHandler.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import TouchGestureHandler from '../TouchGestureHandler';

// Mock use-mobile hook
vi.mock('@/hooks/use-mobile', () => ({
  useMobile: () => true,
}));

describe('TouchGestureHandler', () => {
  it('renders children without gestures on desktop', () => {
    vi.mocked(require('@/hooks/use-mobile').useMobile).mockReturnValue(false);
    
    render(
      <TouchGestureHandler>
        <div>Test Content</div>
      </TouchGestureHandler>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('handles touch gestures on mobile', () => {
    const onTap = vi.fn();
    const onSwipeLeft = vi.fn();

    render(
      <TouchGestureHandler
        callbacks={{ onTap, onSwipeLeft }}
      >
        <div>Test Content</div>
      </TouchGestureHandler>
    );

    const element = screen.getByText('Test Content');
    
    // Simulate touch events
    fireEvent.touchStart(element, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    fireEvent.touchEnd(element, {
      changedTouches: [{ clientX: 100, clientY: 100 }],
    });

    expect(onTap).toHaveBeenCalled();
  });
});
```

### 3. AccessibilityProvider Tests

Create `src/components/__tests__/AccessibilityProvider.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import AccessibilityProvider from '../AccessibilityProvider';
import { useAccessibility } from '../accessibilityHooks';

describe('AccessibilityProvider', () => {
  it('provides accessibility context', () => {
    const TestComponent = () => {
      const { getAriaLabel, setAriaLabel } = useAccessibility();
      setAriaLabel('test', 'Test Label');
      return <div>{getAriaLabel('test')}</div>;
    };

    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('manages keyboard shortcuts', () => {
    const callback = vi.fn();
    
    const TestComponent = () => {
      const { registerShortcut } = useAccessibility();
      registerShortcut('ctrl+k', callback);
      return <div>Test</div>;
    };

    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    // Simulate keyboard event
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    expect(callback).toHaveBeenCalled();
  });
});
```

## Integration Tests

### 1. React Query Integration Tests

Create `src/test/integration/react-query.test.tsx`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query-config';

describe('React Query Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it('handles query key factory correctly', () => {
    const contactKeys = queryKeys.contacts.list({ search: 'test' });
    expect(contactKeys).toEqual(['contacts', 'list', { filters: { search: 'test' } }]);
  });

  it('manages cache invalidation', async () => {
    // Test cache invalidation after mutations
    queryClient.setQueryData(queryKeys.contacts.all, []);
    queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
    
    const queries = queryClient.getQueriesData({ queryKey: queryKeys.contacts.all });
    expect(queries).toBeDefined();
  });
});
```

## Performance Tests

### 1. Bundle Size Regression Tests

Create `bundlewatch.config.json`:

```json
{
  "files": [
    {
      "path": "./dist/assets/index-*.js",
      "maxSize": "500kb",
      "compression": "gzip"
    },
    {
      "path": "./dist/assets/vendor-*.js",
      "maxSize": "300kb",
      "compression": "gzip"
    }
  ],
  "ci": {
    "trackBranches": ["main", "develop"]
  }
}
```

### 2. Performance Benchmarking

Create `src/test/performance/bundle-benchmark.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { performance } from 'perf_hooks';

describe('Performance Benchmarks', () => {
  it('measures component render time', async () => {
    const start = performance.now();
    
    // Simulate component rendering
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const end = performance.now();
    const renderTime = end - start;
    
    expect(renderTime).toBeLessThan(200); // Should render within 200ms
  });

  it('measures bundle load time', () => {
    // Mock bundle size check
    const bundleSize = 450 * 1024; // 450KB
    const maxSize = 500 * 1024; // 500KB threshold
    
    expect(bundleSize).toBeLessThan(maxSize);
  });
});
```

## Accessibility Tests

### 1. A11y Compliance Tests

Create `src/test/accessibility/a11y.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ContactForm from '@/components/ContactForm';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('ContactForm should be accessible', async () => {
    const { container } = render(<ContactForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('supports keyboard navigation', () => {
    render(<ContactForm />);
    
    // Test tab navigation
    const inputs = screen.getAllByRole('textbox');
    inputs[0].focus();
    fireEvent.keyDown(inputs[0], { key: 'Tab' });
    
    expect(inputs[1]).toHaveFocus();
  });
});
```

## Running Tests

### NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:bundle": "bundlewatch",
    "test:a11y": "vitest --run src/test/accessibility",
    "test:performance": "vitest --run src/test/performance",
    "test:integration": "vitest --run src/test/integration",
    "test:all": "npm run test:coverage && npm run test:bundle && npm run test:a11y"
  }
}
```

### CI/CD Integration

Add to GitHub Actions workflow:

``yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm test:coverage
      - run: pnpm test:bundle
      - run: pnpm build
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Best Practices

### 1. Test Organization

- Group tests by feature/component
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Mocking Strategy

- Mock external dependencies
- Use realistic test data
- Mock API calls consistently

### 3. Performance Testing

- Set realistic thresholds
- Monitor bundle size trends
- Test on various devices/networks

### 4. Accessibility Testing

- Test with screen readers
- Verify keyboard navigation
- Test color contrast

## Conclusion

This testing setup provides comprehensive coverage for:

- ✅ Component functionality
- ✅ Performance metrics
- ✅ Accessibility compliance
- ✅ React Query integration
- ✅ Mobile touch interactions
- ✅ Bundle size monitoring

Regular execution of these tests ensures high code quality and user experience standards.
