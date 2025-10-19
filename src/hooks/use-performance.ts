import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { performanceMonitor } from '../lib/performance-monitor';

interface UsePerformanceOptions {
  componentName?: string;
  trackRenders?: boolean;
  trackMounts?: boolean;
}

/**
 * Hook for debouncing values to prevent excessive re-renders
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for memoizing expensive computations with dependency array
 */
export function useExpensiveComputation<T>(
  computationFn: () => T,
  deps: unknown[]
): T {
  return useMemo(() => computationFn(), [computationFn, ...deps]);
}

/**
 * Hook for creating stable callback functions
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: unknown[]
): T {
  return useCallback((...args: Parameters<T>) => callback(...args), deps) as T;
}

/**
 * Hook for throttling function calls
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        return callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          lastCall.current = Date.now();
          callback(...args);
        }, delay - (now - lastCall.current));
      }
    },
    [callback, delay]
  ) as T;
}

/**
 * Hook for performance monitoring - Enhanced version that includes component tracking
 */
export function usePerformanceMonitor(name: string, enabled: boolean = false) {
  const startTime = useRef<number>();

  useEffect(() => {
    if (enabled && typeof performance !== 'undefined') {
      startTime.current = performance.now();
      return () => {
        if (startTime.current) {
          const duration = performance.now() - startTime.current;
          console.log(`Performance [${name}]: ${duration.toFixed(2)}ms`);
        }
      };
    }
  }, [name, enabled]);

  const measure = useCallback((label?: string) => {
    if (enabled && typeof performance !== 'undefined' && startTime.current) {
      const duration = performance.now() - startTime.current;
      console.log(`Performance [${name}${label ? ` - ${label}` : ''}]: ${duration.toFixed(2)}ms`);
      startTime.current = performance.now(); // Reset for next measurement
    }
  }, [name, enabled]);

  return { measure };
}

/**
 * Enhanced performance hook that integrates with the performance monitor system
 */
export function usePerformance(options: UsePerformanceOptions = {}) {
  const {
    componentName = 'UnknownComponent',
    trackRenders = true,
    trackMounts = true
  } = options;

  const renderStartTime = useRef<number>(0);
  const mountStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  // Track component mount time
  useEffect(() => {
    if (trackMounts) {
      mountStartTime.current = performance.now();
      
      return () => {
        const mountDuration = performance.now() - mountStartTime.current;
        performanceMonitor.trackComponentRender(`${componentName}.mount`, mountDuration);
      };
    }
  }, [componentName, trackMounts]);

  // Track render performance
  useEffect(() => {
    if (trackRenders) {
      const renderDuration = performance.now() - renderStartTime.current;
      renderCount.current += 1;
      
      if (renderCount.current > 1) { // Skip first render (mount)
        performanceMonitor.trackComponentRender(
          `${componentName}.render`,
          renderDuration
        );
      }
    }
  });

  // Mark render start
  if (trackRenders) {
    renderStartTime.current = performance.now();
  }

  const trackApiCall = useCallback((endpoint: string, promise: Promise<unknown>) => {
    const startTime = performance.now();
    
    return promise
      .then(result => {
        const duration = performance.now() - startTime;
        performanceMonitor.trackApiCall(endpoint, duration, true);
        return result;
      })
      .catch(error => {
        const duration = performance.now() - startTime;
        performanceMonitor.trackApiCall(endpoint, duration, false);
        throw error;
      });
  }, []);

  const trackUserAction = useCallback((action: string, fn?: () => void | Promise<void>) => {
    const startTime = performance.now();
    
    const complete = () => {
      const duration = performance.now() - startTime;
      performanceMonitor.trackUserAction(`${componentName}.${action}`, duration);
    };

    if (fn) {
      const result = fn();
      if (result instanceof Promise) {
        return result.finally(complete);
      } else {
        complete();
        return result;
      }
    } else {
      complete();
    }
  }, [componentName]);

  return {
    trackApiCall,
    trackUserAction,
    renderCount: renderCount.current
  };
}

/**
 * Hook for optimizing list filtering and sorting
 */
export function useOptimizedList<T>(
  items: T[],
  filterFn: (item: T) => boolean,
  sortFn?: (a: T, b: T) => number,
  _searchTerm?: string
) {
  return useMemo(() => {
    let result = items;
    
    // Apply filtering
    if (filterFn) {
      result = result.filter(filterFn);
    }
    
    // Apply sorting
    if (sortFn) {
      result = [...result].sort(sortFn);
    }
    
    return result;
  }, [items, filterFn, sortFn]);
}

