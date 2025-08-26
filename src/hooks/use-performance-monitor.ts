import { useEffect, useRef, useCallback } from 'react';
import { performanceMonitor } from '../lib/performance-monitor';

interface UsePerformanceOptions {
  componentName?: string;
  trackRenders?: boolean;
  trackMounts?: boolean;
}

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

  const trackApiCall = useCallback((endpoint: string, promise: Promise<any>) => {
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