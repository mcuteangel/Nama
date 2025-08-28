import { performanceMonitor } from '@/lib/performance-monitor';

/**
 * Performance monitoring configuration utilities
 * Use these functions to control logging behavior during development
 */

// Declare the global window extension
declare global {
  interface Window {
    PerformanceConfig: typeof PerformanceConfig;
  }
}

const PerformanceConfig = {
  // Disable all performance logging
  disableLogging: () => {
    performanceMonitor.updateConfig({ 
      enableLogging: false,
      logLevel: 'none' 
    });
    console.log('✅ Performance logging disabled');
  },

  // Enable only important logs (navigation, web vitals, user actions)
  enableImportantOnly: () => {
    performanceMonitor.updateConfig({ 
      enableLogging: true,
      logLevel: 'important' 
    });
    console.log('✅ Performance logging set to important metrics only');
  },

  // Enable only error logging
  enableErrorsOnly: () => {
    performanceMonitor.updateConfig({ 
      enableLogging: true,
      logLevel: 'errors' 
    });
    console.log('✅ Performance logging set to errors only');
  },

  // Enable all logging (including API calls)
  enableAllLogging: () => {
    performanceMonitor.updateConfig({ 
      enableLogging: true,
      logLevel: 'all' 
    });
    console.log('⚠️ Performance logging set to ALL (may be verbose)');
  },

  // Enable API tracking (disabled by default to prevent spam)
  enableApiTracking: () => {
    performanceMonitor.updateConfig({ 
      enableApiTracking: true 
    });
    console.log('⚠️ API tracking enabled (may cause console spam)');
  },

  // Disable API tracking
  disableApiTracking: () => {
    performanceMonitor.updateConfig({ 
      enableApiTracking: false 
    });
    console.log('✅ API tracking disabled');
  },

  // Add custom filters to exclude specific metrics from logging
  addLogFilter: (filter: string) => {
    const currentConfig = performanceMonitor.getConfig();
    const newFilters = [...currentConfig.logFilters, filter];
    performanceMonitor.updateConfig({ 
      logFilters: newFilters 
    });
    console.log(`✅ Added log filter: ${filter}`);
  },

  // Remove all filters
  clearLogFilters: () => {
    performanceMonitor.updateConfig({ 
      logFilters: [] 
    });
    console.log('✅ All log filters cleared');
  },

  // Get current configuration
  getConfig: () => {
    const config = performanceMonitor.getConfig();
    console.log('📊 Current Performance Monitor Config:', config);
    return config;
  },

  // Get performance metrics summary
  getSummary: () => {
    const summary = performanceMonitor.getMetricsSummary();
    console.log('📈 Performance Metrics Summary:', summary);
    return summary;
  },

  // Clear all collected metrics
  clearMetrics: () => {
    performanceMonitor.clearMetrics();
    console.log('🗑️ Performance metrics cleared');
  }
};

// Make it available globally in development
if (process.env.NODE_ENV === 'development') {
  window.PerformanceConfig = PerformanceConfig;
  console.log('🔧 Performance config utilities available at: window.PerformanceConfig');
  console.log('   Examples:');
  console.log('   - PerformanceConfig.disableLogging()');
  console.log('   - PerformanceConfig.enableImportantOnly()');
  console.log('   - PerformanceConfig.getConfig()');
}

export { PerformanceConfig };
export default PerformanceConfig;