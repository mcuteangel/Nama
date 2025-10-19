import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
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

type LoadingType = 'eager' | 'lazy';

interface BundleMetrics {
  totalSize: number;
  gzipSize: number;
  gzippedSize?: number; // Made optional with ?
  loadTime: number;
  timestamp?: Date;
  chunks: (ChunkInfo | ChunkInfoSimple)[];
}

interface ChunkInfo {
  name: string;
  size: number;
  gzipSize: number;
  modules: string[];
  isLazy: boolean;
}

// Simplified chunk interface from the other component
interface ChunkInfoSimple {
  name: string;
  size: number;
  loading?: LoadingType; // Made optional with ?
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

export const BundleSizeMonitor = React.memo(() => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<BundleMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [thresholds] = useState<PerformanceThresholds>(DEFAULT_THRESHOLDS);
  
  // Simulate loading metrics (from the simpler component)
  useEffect(() => {
    if (metrics) return;
    
    const timer = setTimeout(() => {
      setMetrics({
        totalSize: 420000, // 420 KB
        gzipSize: 130000,  // 130 KB
        gzippedSize: 130000, // For backward compatibility
        loadTime: 2500,    // 2.5 seconds
        timestamp: new Date(),
        chunks: [
          { name: 'main', size: 250000, gzipSize: 80000, modules: ['main'], isLazy: false },
          { name: 'vendor', size: 120000, gzipSize: 40000, modules: ['vendor'], isLazy: false },
          { name: 'contacts', size: 50000, gzipSize: 10000, modules: ['contacts'], isLazy: true }
        ]
      });
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [metrics]);
  
  // Format bytes helper (from the simpler component)
  const formatBytes = useCallback((bytes: number): string => {
    if (bytes === 0) return `0 ${t('bundle_monitor.units.bytes')}`;
    const k = 1024;
    const sizes = [
      t('bundle_monitor.units.bytes'),
      t('bundle_monitor.units.kilobytes'),
      t('bundle_monitor.units.megabytes'),
      t('bundle_monitor.units.gigabytes')
    ];
    const i = Math.min(
      Math.floor(Math.log(bytes) / Math.log(k)),
      sizes.length - 1
    );
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }, [t]);
  
  // Format time helper (from the simpler component)
  const formatTime = useCallback((ms: number): string => {
    return `${ms}ms`;
  }, []);

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

  const compressionRatio = useMemo(() => {
    if (!metrics || metrics.totalSize === 0) return 0;
    const gzipSize = metrics.gzipSize || metrics.gzippedSize || 0;
    return ((metrics.totalSize - gzipSize) / metrics.totalSize) * 100;
  }, [metrics]);

  const exportReport = useCallback(() => {
    if (!metrics) return;
    
    const report = {
      timestamp: metrics.timestamp?.toISOString() || new Date().toISOString(),
      totalSize: metrics.totalSize,
      gzipSize: metrics.gzipSize || metrics.gzippedSize,
      compressionRatio: compressionRatio,
      loadTime: metrics.loadTime,
      chunks: metrics.chunks.map(chunk => {
        // For ChunkInfoSimple, we'll determine laziness from the loading prop
        const isChunkInfo = 'isLazy' in chunk;
        const isLazy = isChunkInfo ? chunk.isLazy : chunk.loading === 'lazy';
        const loading = isChunkInfo ? (chunk.isLazy ? 'lazy' : 'eager') : chunk.loading;
        
        return {
          name: chunk.name,
          size: chunk.size,
          gzipSize: isChunkInfo ? chunk.gzipSize : undefined,
          modules: isChunkInfo ? chunk.modules : [],
          isLazy,
          loading
        };
      }),
    };

    const blob = new Blob([JSON.stringify({
      ...report,
      totalSize: formatBytes(report.totalSize),
      gzipSize: formatBytes(report.gzipSize || 0),
      compressionRatio: `${compressionRatio.toFixed(1)}${t('common.percentage_symbol')}`,
      loadTime: formatTime(report.loadTime),
      chunks: report.chunks.map(chunk => ({
        ...chunk,
        size: formatBytes(chunk.size),
        gzipSize: chunk.gzipSize !== undefined ? formatBytes(chunk.gzipSize) : t('common.na'),
        modules: Array.isArray(chunk.modules) ? chunk.modules.length : t('common.na')
      }))
    }, null, 2)], { type: 'application/json' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${t('bundle_monitor.export.filename', 'bundle-report')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [metrics, compressionRatio, formatBytes, formatTime]);

  const getBundleStatus = useMemo(() => {
    if (!metrics) return { status: 'unknown', color: 'gray', icon: Package };
    
    const isOverSize = metrics.totalSize > thresholds.bundleSize;
    const isSlowLoad = metrics.loadTime > thresholds.loadTime;
    
    if (isOverSize || isSlowLoad) {
      return { status: 'warning', color: 'orange', icon: AlertTriangle };
    }
    
    return { status: 'good', color: 'green', icon: CheckCircle };
  }, [metrics, thresholds]);

  const getChunkStatus = (chunk: ChunkInfo | ChunkInfoSimple) => {
    // For ChunkInfoSimple, we don't have size thresholds, so always return good
    if (!('isLazy' in chunk)) {
      return { status: 'good', color: 'green' };
    }
    
    // For ChunkInfo, apply size thresholds
    if (chunk.size > thresholds.chunkSize) {
      return { status: 'warning', color: 'orange' };
    }
    return { status: 'good', color: 'green' };
  };

  // Render chunk item based on type

  if (isLoading) {
    return (
      <ModernCard variant="glass" className="w-full rounded-xl p-6">
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('bundle_monitor.title')}
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted/50 rounded animate-pulse" />
            <div className="h-4 bg-muted/50 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted/50 rounded animate-pulse w-1/2" />
          </div>
        </ModernCardContent>
      </ModernCard>
    );
  }

  if (!metrics) {
    return (
      <ModernCard variant="glass" className="w-full rounded-xl p-6">
        <ModernCardHeader>
          <ModernCardTitle>{t('bundle_monitor.title')}</ModernCardTitle>
          <ModernCardDescription>
            {t('bundle_monitor.description')}
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent className="text-center text-muted-foreground">
          {t('bundle_monitor.no_data')}
        </ModernCardContent>
      </ModernCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <ModernCard variant="glass" className="rounded-xl p-6">
        <ModernCardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <ModernCardTitle>{t('bundle_monitor.title')}</ModernCardTitle>
            </div>
            <div className="flex items-center gap-2">
              {getBundleStatus.icon && <getBundleStatus.icon className={`h-5 w-5 ${getBundleStatus.color}-500`} />}
              <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${
                getBundleStatus.status === 'optimal' ? 'bg-green-100 text-green-800' :
                getBundleStatus.status === 'good' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {getBundleStatus.status === 'optimal' ? t('bundle_monitor.status.optimal') :
                 getBundleStatus.status === 'good' ? t('bundle_monitor.status.good') :
                 t('bundle_monitor.status.needs_optimization')}
              </span>
            </div>
          </div>
          <ModernCardDescription>
            {t('bundle_monitor.description')}
          </ModernCardDescription>
        </ModernCardHeader>
        
        <ModernCardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Size */}
            <div className="bg-background/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('bundle_monitor.metrics.total_size')}
                </span>
                <Package className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">
                {formatBytes(metrics.totalSize)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {t('bundle_monitor.gzipped')}: {formatBytes(metrics.gzipSize || metrics.gzippedSize || 0)}
              </div>
            </div>

            {/* Compression */}
            <div className="bg-background/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('bundle_monitor.metrics.compression')}
                </span>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">
                {`${compressionRatio.toFixed(1)}${t('common.percentage_symbol')}`}
              </div>
              <div className="mt-1">
                <Progress value={Math.min(compressionRatio, 100)} className="h-2" />
              </div>
            </div>

            {/* Load Time */}
            <div className="bg-background/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('bundle_monitor.metrics.load_time')}
                </span>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">
                {formatTime(metrics.loadTime)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {metrics.loadTime < thresholds.loadTime ? (
                  <span className="text-green-500 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {t('bundle_monitor.within_threshold')}
                  </span>
                ) : (
                  <span className="text-amber-500 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {t('bundle_monitor.above_threshold')}
                  </span>
                )}
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
            {t('bundle_monitor.chunks.title')}
          </ModernCardTitle>
          <ModernCardDescription>
            {t('bundle_monitor.chunks.description')}
          </ModernCardDescription>
        </ModernCardHeader>
        
        <ModernCardContent>
          <div className="space-y-3">
            {metrics.chunks.map((chunk, index) => {
              if ('loading' in chunk) {
                // Handle simplified chunk format
                return (
                  <div key={index} className="p-3 bg-background/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{chunk.name}</span>
                        <Badge variant={chunk.loading === 'lazy' ? 'outline' : 'default'} className="text-xs">
                          {chunk.loading === 'lazy' 
                            ? t('bundle_monitor.loading.lazy') 
                            : t('bundle_monitor.loading.eager')}
                        </Badge>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{formatBytes(chunk.size)}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              
              // Handle detailed chunk format
              const status = getChunkStatus(chunk);
              const isLazy = 'isLazy' in chunk ? chunk.isLazy : chunk.loading === 'lazy';
              const gzipSize = 'gzipSize' in chunk ? chunk.gzipSize : undefined;
              const modules = 'modules' in chunk ? chunk.modules : [];
              
              return (
                <div key={index} className="p-3 bg-background/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{chunk.name}</span>
                      {isLazy && (
                        <Badge variant="outline" className="text-xs">
                          {t('bundle_monitor.loading.lazy')}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm">
                        <span className="font-medium">{formatBytes(chunk.size)}</span>
                        {gzipSize !== undefined && (
                          <span className="text-muted-foreground text-xs ml-2">
                            ({formatBytes(gzipSize)} {t('bundle_monitor.gzipped')})
                          </span>
                        )}
                      </div>
                      <div className={`h-2 w-2 rounded-full ${
                        status.status === 'good' ? 'bg-green-500' : 
                        status.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{t('bundle_monitor.modules')}: {modules.length}</span>
                      <span>{t('bundle_monitor.percentage_of_total', { value: Math.round((chunk.size / metrics.totalSize) * 100) })}</span>
                    </div>
                    <Progress 
                      value={(chunk.size / metrics.totalSize) * 100} 
                      className="h-2"
                    />
                  </div>
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
            {t('bundle_monitor.insights.title')}
          </ModernCardTitle>
          <ModernCardDescription>
            {t('bundle_monitor.insights.description')}
          </ModernCardDescription>
        </ModernCardHeader>
        
        <ModernCardContent className="space-y-4">
          {metrics.totalSize > thresholds.bundleSize ? (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-200">
                    {t('bundle_monitor.size_warning')}
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    {t('bundle_monitor.size_recommendation')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">
                    {t('bundle_monitor.performance_good')}
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    {t('bundle_monitor.performance_message')}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {compressionRatio < 60 ? (
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-purple-800 dark:text-purple-200">
                    {t('bundle_monitor.compression_tip')}
                  </h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                    {t('bundle_monitor.compression_recommendation')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">
                    {t('bundle_monitor.compression_good')}
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    {t('bundle_monitor.compression_good_message')}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {!metrics.chunks.some(chunk => 'isLazy' in chunk ? chunk.isLazy : chunk.loading === 'lazy') && metrics.chunks.length > 1 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">
                    {t('bundle_monitor.lazy_loading_title')}
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {t('bundle_monitor.lazy_loading_message')}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={exportReport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {t('bundle_monitor.export_button')}
            </button>
          </div>
        </ModernCardContent>
      </ModernCard>;
    </div>
  );
});

BundleSizeMonitor.displayName = 'BundleSizeMonitor';

export default BundleSizeMonitor;