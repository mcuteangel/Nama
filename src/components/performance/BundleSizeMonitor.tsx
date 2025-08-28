import React, { useEffect, useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ModernButton } from '@/components/ui/modern-button';
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Package,
  Zap,
  Clock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BundleMetrics {
  totalSize: number;
  gzipSize: number;
  chunks: ChunkInfo[];
  loadTime: number;
  timestamp: Date;
}

interface ChunkInfo {
  name: string;
  size: number;
  gzipSize: number;
  modules: string[];
  isLazy: boolean;
}

interface PerformanceThresholds {
  bundleSize: number;
  chunkSize: number;
  loadTime: number;
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  bundleSize: 500 * 1024, // 500KB
  chunkSize: 100 * 1024,  // 100KB
  loadTime: 3000,         // 3 seconds
};

export const BundleSizeMonitor: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<BundleMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [thresholds] = useState<PerformanceThresholds>(DEFAULT_THRESHOLDS);

  // Simulate bundle metrics collection (in real implementation, this would come from build data)
  useEffect(() => {
    const collectMetrics = async () => {
      setIsLoading(true);
      
      // Simulate API call to collect bundle metrics
      const mockMetrics: BundleMetrics = {
        totalSize: 420 * 1024, // 420KB
        gzipSize: 130 * 1024,  // 130KB
        loadTime: 2500,
        timestamp: new Date(),
        chunks: [
          {
            name: 'main',
            size: 180 * 1024,
            gzipSize: 65 * 1024,
            modules: ['App.tsx', 'main.tsx', 'router'],
            isLazy: false,
          },
          {
            name: 'contacts',
            size: 95 * 1024,
            gzipSize: 28 * 1024,
            modules: ['ContactList.tsx', 'ContactForm.tsx', 'ContactDetail.tsx'],
            isLazy: true,
          },
          {
            name: 'vendor',
            size: 145 * 1024,
            gzipSize: 37 * 1024,
            modules: ['react', 'react-dom', '@tanstack/react-query'],
            isLazy: false,
          },
        ],
      };

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMetrics(mockMetrics);
      setIsLoading(false);
    };

    collectMetrics();
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getBundleStatus = useMemo(() => {
    if (!metrics) return { status: 'unknown', color: 'gray', icon: Package };
    
    const isOverSize = metrics.totalSize > thresholds.bundleSize;
    const isSlowLoad = metrics.loadTime > thresholds.loadTime;
    
    if (isOverSize || isSlowLoad) {
      return { status: 'warning', color: 'orange', icon: AlertTriangle };
    }
    
    return { status: 'good', color: 'green', icon: CheckCircle };
  }, [metrics, thresholds]);

  const getChunkStatus = (chunk: ChunkInfo) => {
    if (chunk.size > thresholds.chunkSize) {
      return { status: 'warning', color: 'orange' };
    }
    return { status: 'good', color: 'green' };
  };

  const compressionRatio = useMemo(() => {
    if (!metrics || metrics.totalSize === 0) return 0;
    return ((metrics.totalSize - metrics.gzipSize) / metrics.totalSize) * 100;
  }, [metrics]);

  const exportReport = () => {
    if (!metrics) return;
    
    const report = {
      timestamp: metrics.timestamp.toISOString(),
      totalSize: formatBytes(metrics.totalSize),
      gzipSize: formatBytes(metrics.gzipSize),
      compressionRatio: `${compressionRatio.toFixed(1)}%`,
      loadTime: `${metrics.loadTime}ms`,
      chunks: metrics.chunks.map(chunk => ({
        name: chunk.name,
        size: formatBytes(chunk.size),
        gzipSize: formatBytes(chunk.gzipSize),
        modules: chunk.modules.length,
        isLazy: chunk.isLazy,
      })),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bundle-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <ModernCard variant="glass" className="w-full rounded-xl p-6">
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('bundle_monitor.title', 'Bundle Size Monitor')}
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </ModernCardContent>
      </ModernCard>
    );
  }

  if (!metrics) {
    return null;
  }

  const StatusIcon = getBundleStatus.icon;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <ModernCard variant="glass" className="rounded-xl p-6">
        <ModernCardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <ModernCardTitle>{t('bundle_monitor.title', 'Bundle Size Monitor')}</ModernCardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getBundleStatus.color === 'green' ? 'default' : 'destructive'}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {getBundleStatus.status === 'good' 
                  ? t('bundle_monitor.status_good', 'Optimal') 
                  : t('bundle_monitor.status_warning', 'Needs Attention')
                }
              </Badge>
              <ModernButton variant="outline" size="sm" onClick={exportReport}>
                <Download className="h-4 w-4 mr-2" />
                {t('bundle_monitor.export', 'Export Report')}
              </ModernButton>
            </div>
          </div>
          <ModernCardDescription>
            {t('bundle_monitor.description', 'Real-time monitoring of bundle size and performance metrics')}
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bundle Size */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-500" />
                <span className="font-medium">{t('bundle_monitor.total_size', 'Total Size')}</span>
              </div>
              <div className="text-2xl font-bold">{formatBytes(metrics.totalSize)}</div>
              <Progress 
                value={(metrics.totalSize / thresholds.bundleSize) * 100} 
                className="h-2"
              />
              <div className="text-sm text-gray-500">
                {t('bundle_monitor.threshold', 'Threshold')}: {formatBytes(thresholds.bundleSize)}
              </div>
            </div>

            {/* Compression */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-500" />
                <span className="font-medium">{t('bundle_monitor.compression', 'Compression')}</span>
              </div>
              <div className="text-2xl font-bold">{compressionRatio.toFixed(1)}%</div>
              <div className="text-sm text-gray-500">
                {t('bundle_monitor.gzip_size', 'Gzipped')}: {formatBytes(metrics.gzipSize)}
              </div>
            </div>

            {/* Load Time */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="font-medium">{t('bundle_monitor.load_time', 'Load Time')}</span>
              </div>
              <div className="text-2xl font-bold">{metrics.loadTime}ms</div>
              <Progress 
                value={(metrics.loadTime / thresholds.loadTime) * 100} 
                className="h-2"
              />
              <div className="text-sm text-gray-500">
                {t('bundle_monitor.target', 'Target')}: &lt; {thresholds.loadTime}ms
              </div>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Chunks Analysis */}
      <ModernCard variant="glass" className="rounded-xl p-6">
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t('bundle_monitor.chunks_analysis', 'Chunks Analysis')}
          </ModernCardTitle>
          <ModernCardDescription>
            {t('bundle_monitor.chunks_description', 'Detailed breakdown of bundle chunks and their impact')}
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="space-y-4">
            {metrics.chunks.map((chunk, index) => {
              const chunkStatus = getChunkStatus(chunk);
              return (
                <div key={chunk.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={chunk.isLazy ? 'secondary' : 'default'} className="text-xs">
                        {chunk.isLazy ? t('bundle_monitor.lazy', 'Lazy') : t('bundle_monitor.eager', 'Eager')}
                      </Badge>
                      <span className="font-medium">{chunk.name}</span>
                      <span className="text-sm text-gray-500">
                        ({chunk.modules.length} {t('bundle_monitor.modules', 'modules')})
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-mono">{formatBytes(chunk.size)}</span>
                      <div className={`w-2 h-2 rounded-full bg-${chunkStatus.color}-500`} />
                    </div>
                  </div>
                  <Progress 
                    value={(chunk.size / metrics.totalSize) * 100} 
                    className="h-1"
                  />
                  <div className="text-xs text-gray-500 flex justify-between">
                    <span>{t('bundle_monitor.gzipped', 'Gzipped')}: {formatBytes(chunk.gzipSize)}</span>
                    <span>{((chunk.size / metrics.totalSize) * 100).toFixed(1)}% {t('bundle_monitor.of_total', 'of total')}</span>
                  </div>
                  {index < metrics.chunks.length - 1 && <Separator className="mt-4" />}
                </div>
              );
            })}
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Performance Insights */}
      <ModernCard variant="glass" className="rounded-xl p-6">
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t('bundle_monitor.insights', 'Performance Insights')}
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="space-y-3">
            {metrics.totalSize > thresholds.bundleSize && (
              <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                <div>
                  <div className="font-medium text-orange-800">
                    {t('bundle_monitor.size_warning', 'Bundle size exceeds recommended threshold')}
                  </div>
                  <div className="text-sm text-orange-600">
                    {t('bundle_monitor.size_recommendation', 'Consider code splitting or removing unused dependencies')}
                  </div>
                </div>
              </div>
            )}
            
            {compressionRatio < 60 && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Zap className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-800">
                    {t('bundle_monitor.compression_tip', 'Compression could be improved')}
                  </div>
                  <div className="text-sm text-blue-600">
                    {t('bundle_monitor.compression_recommendation', 'Consider enabling Brotli compression or optimizing assets')}
                  </div>
                </div>
              </div>
            )}
            
            {getBundleStatus.status === 'good' && (
              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <div className="font-medium text-green-800">
                    {t('bundle_monitor.performance_good', 'Excellent performance!')}
                  </div>
                  <div className="text-sm text-green-600">
                    {t('bundle_monitor.performance_message', 'Your bundle is optimized and meets all performance thresholds')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ModernCardContent>
      </ModernCard>
    </div>
  );
});

BundleSizeMonitor.displayName = 'BundleSizeMonitor';

export default BundleSizeMonitor;