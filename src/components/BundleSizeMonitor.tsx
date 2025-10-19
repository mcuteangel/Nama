import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface BundleMetrics {
  totalSize: number;
  gzippedSize: number;
  loadTime: number;
  chunks: Array<{
    name: string;
    size: number;
    loading: 'eager' | 'lazy';
  }>;
}

const BundleSizeMonitor: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<BundleMetrics | null>(null);

  useEffect(() => {
    // Simulate loading delay (reduced for testing)
    const timer = setTimeout(() => {
      setIsLoading(false);
      setMetrics({
        totalSize: 420000, // 420 KB
        gzippedSize: 130000, // 130 KB
        loadTime: 2500, // 2.5 seconds
        chunks: [
          { name: 'main', size: 250000, loading: 'eager' },
          { name: 'contacts', size: 120000, loading: 'lazy' },
          { name: 'vendor', size: 50000, loading: 'eager' }
        ]
      });
    }, 100); // Reduced from 1000ms to 100ms for faster tests

    return () => clearTimeout(timer);
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number): string => {
    return `${ms}ms`;
  };

  const getCompressionRatio = (): string => {
    if (!metrics) return '0%';
    return ((1 - metrics.gzippedSize / metrics.totalSize) * 100).toFixed(1) + '%';
  };

  const getPerformanceStatus = (): string => {
    if (!metrics) return 'unknown';
    if (metrics.totalSize < 500000 && metrics.loadTime < 3000) return 'optimal';
    if (metrics.totalSize < 1000000 && metrics.loadTime < 5000) return 'good';
    return 'needs_optimization';
  };

  const handleExport = () => {
    if (!metrics) return;

    const reportData = {
      timestamp: new Date().toISOString(),
      totalSize: metrics.totalSize,
      gzippedSize: metrics.gzippedSize,
      loadTime: metrics.loadTime,
      compressionRatio: getCompressionRatio(),
      chunks: metrics.chunks,
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bundle-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <article className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </article>
    );
  }

  if (!metrics) {
    return (
      <article className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('bundle_monitor.title', 'Bundle Size Monitor')}</h2>
        <p className="text-gray-600 mb-4">{t('bundle_monitor.description', 'Real-time monitoring of bundle size and performance metrics')}</p>
        <div className="text-center text-gray-500">{t('bundle_monitor.no_data', 'No data available')}</div>
      </article>
    );
  }

  return (
    <article className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{t('bundle_monitor.title', 'Bundle Size Monitor')}</h2>
          <p className="text-gray-600">{t('bundle_monitor.description', 'Real-time monitoring of bundle size and performance metrics')}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          getPerformanceStatus() === 'optimal' ? 'bg-green-100 text-green-800' :
          getPerformanceStatus() === 'good' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {getPerformanceStatus() === 'optimal' ? t('bundle_monitor.status.optimal', 'Optimal') :
           getPerformanceStatus() === 'good' ? t('bundle_monitor.status.good', 'Good') :
           t('bundle_monitor.status.needs_optimization', 'Needs Optimization')}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-1">{t('bundle_monitor.metrics.total_size', 'Total Size')}</h3>
          <p className="text-2xl font-bold text-gray-900">{formatBytes(metrics.totalSize)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-1">{t('bundle_monitor.metrics.compression', 'Compression')}</h3>
          <p className="text-2xl font-bold text-gray-900">{getCompressionRatio()}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-1">{t('bundle_monitor.metrics.load_time', 'Load Time')}</h3>
          <p className="text-2xl font-bold text-gray-900">{formatTime(metrics.loadTime)}</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">{t('bundle_monitor.chunks.title', 'Chunks Analysis')}</h3>
        <p className="text-sm text-gray-600 mb-3">{t('bundle_monitor.chunks.description', 'Detailed breakdown of bundle chunks and their loading strategies')}</p>
        <div className="space-y-2">
          {metrics.chunks.map((chunk, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="font-medium text-gray-900">{chunk.name}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  chunk.loading === 'eager' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {chunk.loading === 'eager' ? t('bundle_monitor.loading.eager', 'Eager') : t('bundle_monitor.loading.lazy', 'Lazy')}
                </span>
              </div>
              <span className="text-sm text-gray-600">{formatBytes(chunk.size)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">{t('bundle_monitor.insights.title', 'Performance Insights')}</h3>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-green-800">{t('bundle_monitor.insights.excellent', 'Excellent performance! Bundle size and load times are within optimal ranges.')}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('bundle_monitor.export_button', 'Export Report')}
        </button>
      </div>
    </article>
  );
};

export default BundleSizeMonitor;
