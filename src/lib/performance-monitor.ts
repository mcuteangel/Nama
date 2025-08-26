interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  userId?: string;
  sessionId: string;
  url: string;
  userAgent: string;
  metadata?: Record<string, any>;
}

interface NavigationTiming {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
}

class PerformanceMonitor {
  private sessionId: string;
  private userId?: string;
  private metrics: PerformanceMetric[] = [];
  private observer?: PerformanceObserver;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupPerformanceObserver();
    this.trackNavigationTiming();
    this.trackWebVitals();
  }

  private generateSessionId(): string {
    return `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  private setupPerformanceObserver() {
    if (typeof PerformanceObserver === 'undefined') return;

    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.recordMetric({
          name: entry.name,
          value: entry.duration,
          metadata: {
            entryType: entry.entryType,
            startTime: entry.startTime
          }
        });
      });
    });

    this.observer.observe({ entryTypes: ['navigation', 'resource', 'measure', 'paint'] });
  }

  private trackNavigationTiming() {
    if (typeof performance === 'undefined' || !performance.timing) return;

    window.addEventListener('load', () => {
      const timing = performance.timing;
      const navigationStart = timing.navigationStart;

      const metrics = {
        loadTime: timing.loadEventEnd - navigationStart,
        domContentLoaded: timing.domContentLoadedEventEnd - navigationStart,
        firstByte: timing.responseStart - navigationStart,
        domInteractive: timing.domInteractive - navigationStart
      };

      Object.entries(metrics).forEach(([name, value]) => {
        this.recordMetric({ name: `navigation.${name}`, value });
      });
    });
  }

  private trackWebVitals() {
    // First Contentful Paint (FCP)
    this.observeEntry('paint', (entry) => {
      if (entry.name === 'first-contentful-paint') {
        this.recordMetric({
          name: 'web-vitals.fcp',
          value: entry.startTime
        });
      }
    });

    // Largest Contentful Paint (LCP)
    this.observeEntry('largest-contentful-paint', (entry) => {
      this.recordMetric({
        name: 'web-vitals.lcp',
        value: entry.startTime
      });
    });

    // First Input Delay (FID)
    this.observeEntry('first-input', (entry) => {
      this.recordMetric({
        name: 'web-vitals.fid',
        value: entry.processingStart - entry.startTime
      });
    });

    // Cumulative Layout Shift (CLS)
    this.observeEntry('layout-shift', (entry) => {
      if (!entry.hadRecentInput) {
        this.recordMetric({
          name: 'web-vitals.cls',
          value: entry.value
        });
      }
    });
  }

  private observeEntry(entryType: string, callback: (entry: any) => void) {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(callback);
      });
      observer.observe({ entryTypes: [entryType] });
    } catch (e) {
      // Silently fail if entry type not supported
    }
  }

  recordMetric(metric: Partial<PerformanceMetric>) {
    const fullMetric: PerformanceMetric = {
      name: metric.name || 'unknown',
      value: metric.value || 0,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      metadata: metric.metadata
    };

    this.metrics.push(fullMetric);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance: ${fullMetric.name} = ${fullMetric.value.toFixed(2)}ms`);
    }

    // Send to analytics if online
    if (navigator.onLine) {
      this.sendMetric(fullMetric);
    }
  }

  private async sendMetric(metric: PerformanceMetric) {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metric })
      });
    } catch (error) {
      console.warn('Failed to send performance metric:', error);
    }
  }

  // Component-specific performance tracking
  trackComponentRender(componentName: string, renderTime: number) {
    this.recordMetric({
      name: `component.${componentName}.render`,
      value: renderTime,
      metadata: { type: 'component-render' }
    });
  }

  trackApiCall(endpoint: string, duration: number, success: boolean) {
    this.recordMetric({
      name: `api.${endpoint}`,
      value: duration,
      metadata: { 
        type: 'api-call',
        success,
        endpoint 
      }
    });
  }

  trackUserAction(action: string, duration?: number) {
    this.recordMetric({
      name: `user.${action}`,
      value: duration || 0,
      metadata: { type: 'user-action' }
    });
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getMetricsSummary() {
    const summary = {
      totalMetrics: this.metrics.length,
      avgLoadTime: 0,
      avgApiTime: 0,
      errorRate: 0
    };

    const loadTimeMetrics = this.metrics.filter(m => m.name.includes('navigation.loadTime'));
    const apiMetrics = this.metrics.filter(m => m.name.includes('api.'));
    
    if (loadTimeMetrics.length > 0) {
      summary.avgLoadTime = loadTimeMetrics.reduce((sum, m) => sum + m.value, 0) / loadTimeMetrics.length;
    }

    if (apiMetrics.length > 0) {
      summary.avgApiTime = apiMetrics.reduce((sum, m) => sum + m.value, 0) / apiMetrics.length;
      const failedApis = apiMetrics.filter(m => m.metadata?.success === false);
      summary.errorRate = (failedApis.length / apiMetrics.length) * 100;
    }

    return summary;
  }

  clearMetrics() {
    this.metrics = [];
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();
export type { PerformanceMetric, NavigationTiming };