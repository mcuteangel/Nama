import { useState, useMemo, useCallback, useRef, useEffect } from 'react';

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
  return useMemo(() => computationFn(), deps);
}

/**
 * Hook for creating stable callback functions
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: unknown[]
): T {
  return useCallback(callback, deps);
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
 * Hook for performance monitoring
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
 * Hook for optimizing list filtering and sorting
 */
export function useOptimizedList<T>(
  items: T[],
  filterFn: (item: T) => boolean,
  sortFn?: (a: T, b: T) => number,
  searchTerm?: string
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
  }, [items, filterFn, sortFn, searchTerm]);
}

