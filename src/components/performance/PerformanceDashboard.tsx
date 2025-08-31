import React, { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GlassButton } from "@/components/ui/glass-button";
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { 
  Activity,
  Zap,
  Eye,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
// import { getCLS, getFCP, getFID, getLCP, getTTFB, Metric } from 'web-vitals';

interface WebVitalsData {
  CLS: number | null;  // Cumulative Layout Shift
  FCP: number | null;  // First Contentful Paint
  FID: number | null;  // First Input Delay
  LCP: number | null;  // Largest Contentful Paint
  TTFB: number | null; // Time to First Byte
}

interface WebVitalMetric {
  name: keyof WebVitalsData;
  value: number;
}

interface PerformanceMetric {
  name: string;
  value: number | null;
  threshold: number;
  unit: string;
  status: 'good' | 'needs-improvement' | 'poor' | 'unknown';
  description: string;
  icon: React.ComponentType<{ className?: string; }>;
}

const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  FID: { good: 100, poor: 300 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
};

export const PerformanceDashboard: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const [webVitals, setWebVitals] = useState<WebVitalsData>({
    CLS: null,
    FCP: null,
    FID: null,
    LCP: null,
    TTFB: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const getMetricStatus = (name: keyof WebVitalsData, value: number | null): PerformanceMetric['status'] => {
    if (value === null) return 'unknown';
    
    const threshold = THRESHOLDS[name];
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const handleMetric = useCallback((metric: WebVitalMetric) => {
    setWebVitals(prev => ({
      ...prev,
      [metric.name]: metric.value,
    }));
    setLastUpdated(new Date());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // جمع‌آوری Web Vitals metrics
    // getCLS(handleMetric);
    // getFCP(handleMetric);
    // getFID(handleMetric);
    // getLCP(handleMetric);
    // getTTFB(handleMetric);

    // تایمر برای بروزرسانی وضعیت loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [handleMetric]);

  const refreshMetrics = () => {
    setIsLoading(true);
    // در واقعیت، اینجا می‌توانیم metrics جدید جمع‌آوری کنیم
    setTimeout(() => {
      setIsLoading(false);
      setLastUpdated(new Date());
    }, 1000);
  };

  const performanceMetrics: PerformanceMetric[] = [
    {
      name: 'CLS',
      value: webVitals.CLS,
      threshold: THRESHOLDS.CLS.good,
      unit: '',
      status: getMetricStatus('CLS', webVitals.CLS),
      description: t('performance.cls_description', 'Measures visual stability during page load'),
      icon: Eye,
    },
    {
      name: 'FCP',
      value: webVitals.FCP,
      threshold: THRESHOLDS.FCP.good,
      unit: 'ms',
      status: getMetricStatus('FCP', webVitals.FCP),
      description: t('performance.fcp_description', 'Time until first content appears'),
      icon: Zap,
    },
    {
      name: 'FID',
      value: webVitals.FID,
      threshold: THRESHOLDS.FID.good,
      unit: 'ms',
      status: getMetricStatus('FID', webVitals.FID),
      description: t('performance.fid_description', 'Responsiveness to first user interaction'),
      icon: Activity,
    },
    {
      name: 'LCP',
      value: webVitals.LCP,
      threshold: THRESHOLDS.LCP.good,
      unit: 'ms',
      status: getMetricStatus('LCP', webVitals.LCP),
      description: t('performance.lcp_description', 'Time to load largest content element'),
      icon: Clock,
    },
    {
      name: 'TTFB',
      value: webVitals.TTFB,
      threshold: THRESHOLDS.TTFB.good,
      unit: 'ms',
      status: getMetricStatus('TTFB', webVitals.TTFB),
      description: t('performance.ttfb_description', 'Server response time'),
      icon: TrendingUp,
    },
  ];

  const getStatusColor = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'good': return 'green';
      case 'needs-improvement': return 'yellow';
      case 'poor': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'good': return CheckCircle;
      case 'needs-improvement': return AlertCircle;
      case 'poor': return AlertCircle;
      default: return Clock;
    }
  };

  const overallScore = performanceMetrics.reduce((score, metric) => {
    if (metric.status === 'good') return score + 20;
    if (metric.status === 'needs-improvement') return score + 10;
    if (metric.status === 'poor') return score + 0;
    return score;
  }, 0);

  const exportData = () => {
    const data = {
      timestamp: lastUpdated.toISOString(),
      webVitals,
      overallScore,
      metrics: performanceMetrics.map(metric => ({
        name: metric.name,
        value: metric.value,
        threshold: metric.threshold,
        status: metric.status,
        unit: metric.unit,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
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
            <Activity className="h-5 w-5" />
            {t('performance.title', 'Performance Dashboard')}
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

  return (
    <div className="space-y-6">
      {/* نمای کلی عملکرد */}
      <ModernCard variant="glass" className="rounded-xl p-6">
        <ModernCardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <ModernCardTitle>{t('performance.title', 'Performance Dashboard')}</ModernCardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={overallScore >= 80 ? 'default' : overallScore >= 60 ? 'secondary' : 'destructive'}>
                {t('performance.score', 'Score')}: {overallScore}/100
              </Badge>
              <GlassButton variant="outline" size="sm" onClick={refreshMetrics} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {t('performance.refresh', 'Refresh')}
              </GlassButton>
              <GlassButton variant="outline" size="sm" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                {t('performance.export', 'Export')}
              </GlassButton>
            </div>
          </div>
          <ModernCardDescription>
            {t('performance.description', 'Real-time Web Vitals and performance metrics monitoring')}
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{t('performance.overall_health', 'Overall Performance Health')}</span>
              <span className="text-sm text-gray-500">
                {t('performance.last_updated', 'Last updated')}: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
            <Progress value={overallScore} className="h-3" />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>{t('performance.poor', 'Poor')}</span>
              <span>{t('performance.good', 'Good')}</span>
              <span>{t('performance.excellent', 'Excellent')}</span>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* معیارهای Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {performanceMetrics.map((metric) => {
          const StatusIcon = getStatusIcon(metric.status);
          const MetricIcon = metric.icon;
          
          return (
            <ModernCard variant="glass" className="rounded-xl p-6" key={metric.name}>
              <ModernCardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MetricIcon className="h-4 w-4 text-blue-500" />
                    <ModernCardTitle className="text-lg">{metric.name}</ModernCardTitle>
                  </div>
                  <StatusIcon className={`h-4 w-4 text-${getStatusColor(metric.status)}-500`} />
                </div>
                <ModernCardDescription className="text-sm">
                  {metric.description}
                </ModernCardDescription>
              </ModernCardHeader>
              <ModernCardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {metric.value !== null 
                        ? `${metric.value.toFixed(metric.name === 'CLS' ? 3 : 0)}${metric.unit}` 
                        : t('performance.measuring', 'Measuring...')
                      }
                    </span>
                    <Badge variant={
                      metric.status === 'good' ? 'default' :
                      metric.status === 'needs-improvement' ? 'secondary' : 'destructive'
                    }>
                      {metric.status === 'good' && t('performance.good', 'Good')}
                      {metric.status === 'needs-improvement' && t('performance.needs_improvement', 'Needs Improvement')}
                      {metric.status === 'poor' && t('performance.poor', 'Poor')}
                      {metric.status === 'unknown' && t('performance.unknown', 'Unknown')}
                    </Badge>
                  </div>
                  
                  {metric.value !== null && (
                    <>
                      <Progress 
                        value={Math.min((metric.value / (metric.threshold * 2)) * 100, 100)} 
                        className="h-2"
                      />
                      <div className="text-xs text-gray-500">
                        {t('performance.threshold', 'Good threshold')}: ≤ {metric.threshold}{metric.unit}
                      </div>
                    </>
                  )}
                </div>
              </ModernCardContent>
            </ModernCard>
          );
        })}
      </div>

      {/* بینش‌های عملکرد */}
      <ModernCard variant="glass" className="rounded-xl p-6">
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t('performance.insights', 'Performance Insights')}
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="space-y-3">
            {overallScore >= 80 && (
              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <div className="font-medium text-green-800">
                    {t('performance.excellent_performance', 'Excellent Performance!')}
                  </div>
                  <div className="text-sm text-green-600">
                    {t('performance.excellent_message', 'Your application meets all performance standards')}
                  </div>
                </div>
              </div>
            )}

            {performanceMetrics.some(m => m.status === 'poor') && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                <div>
                  <div className="font-medium text-red-800">
                    {t('performance.critical_issues', 'Critical Performance Issues Detected')}
                  </div>
                  <div className="text-sm text-red-600">
                    {t('performance.critical_message', 'Some metrics are in the poor range and need immediate attention')}
                  </div>
                </div>
              </div>
            )}

            {performanceMetrics.some(m => m.status === 'needs-improvement') && 
             !performanceMetrics.some(m => m.status === 'poor') && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-800">
                    {t('performance.room_for_improvement', 'Room for Improvement')}
                  </div>
                  <div className="text-sm text-yellow-600">
                    {t('performance.improvement_message', 'Some metrics can be optimized for better user experience')}
                  </div>
                </div>
              </div>
            )}

            {/* توصیه‌های خاص برای هر معیار */}
            {webVitals.LCP && webVitals.LCP > THRESHOLDS.LCP.good && (
              <div className="text-sm text-gray-600 border-l-4 border-blue-200 pl-3">
                <strong>{t('performance.lcp_tip', 'LCP Optimization Tip')}:</strong> 
                {t('performance.lcp_suggestion', ' Consider optimizing images, fonts, and critical resource loading')}
              </div>
            )}

            {webVitals.CLS && webVitals.CLS > THRESHOLDS.CLS.good && (
              <div className="text-sm text-gray-600 border-l-4 border-blue-200 pl-3">
                <strong>{t('performance.cls_tip', 'CLS Optimization Tip')}:</strong> 
                {t('performance.cls_suggestion', ' Ensure images and ads have defined dimensions')}
              </div>
            )}

            {webVitals.FID && webVitals.FID > THRESHOLDS.FID.good && (
              <div className="text-sm text-gray-600 border-l-4 border-blue-200 pl-3">
                <strong>{t('performance.fid_tip', 'FID Optimization Tip')}:</strong> 
                {t('performance.fid_suggestion', ' Reduce JavaScript execution time and use code splitting')}
              </div>
            )}
          </div>
        </ModernCardContent>
      </ModernCard>
    </div>
  );
});

PerformanceDashboard.displayName = 'PerformanceDashboard';

export default PerformanceDashboard;