import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, 
  Download, 
  Zap, 
  Clock, 
  MousePointer, 
  Image, 
  Server,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Layout,
  Lightbulb
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlassButton } from '@/components/ui/glass-button';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent, ModernCardDescription } from '@/components/ui/modern-card';
import { useAppSettings } from '@/hooks/use-app-settings';

// Types for performance metrics
interface WebVitalsMetrics {
  cls: number | null;  // Cumulative Layout Shift
  fcp: number | null;  // First Contentful Paint
  fid: number | null;  // First Input Delay
  lcp: number | null;  // Largest Contentful Paint
  ttfb: number | null; // Time to First Byte
}

interface PerformanceDashboardProps {
  className?: string;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ className }) => {
  const { t } = useTranslation();
  const { settings: appSettings } = useAppSettings();
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({
    cls: null,
    fcp: null,
    fid: null,
    lcp: null,
    ttfb: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Simulate fetching performance metrics
  const fetchMetrics = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setMetrics({
        cls: Math.random() * 0.25,   // Good threshold: < 0.1
        fcp: Math.random() * 3000,    // Good threshold: < 1800ms
        fid: Math.random() * 100,     // Good threshold: < 100ms
        lcp: Math.random() * 4000,    // Good threshold: < 2500ms
        ttfb: Math.random() * 500     // Good threshold: < 200ms
      });
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const refreshMetrics = () => {
    fetchMetrics();
  };

  const exportData = () => {
    // In a real app, this would export the performance data
    alert(t('performance.export_alert', 'Performance data export functionality would be implemented here'));
  };

  // Calculate overall performance score (simplified)
  const overallScore = Math.round(
    ([
      metrics.cls !== null ? (metrics.cls < 0.1 ? 100 : metrics.cls < 0.25 ? 50 : 0) : 0,
      metrics.fcp !== null ? (metrics.fcp < 1800 ? 100 : metrics.fcp < 3000 ? 50 : 0) : 0,
      metrics.fid !== null ? (metrics.fid < 100 ? 100 : metrics.fid < 300 ? 50 : 0) : 0,
      metrics.lcp !== null ? (metrics.lcp < 2500 ? 100 : metrics.lcp < 4000 ? 50 : 0) : 0,
      metrics.ttfb !== null ? (metrics.ttfb < 200 ? 100 : metrics.ttfb < 500 ? 50 : 0) : 0,
    ].reduce((sum, score) => sum + score, 0) / 5)
  );

  // Get performance status based on score
  const getPerformanceStatus = () => {
    if (overallScore >= 90) return 'excellent';
    if (overallScore >= 70) return 'good';
    if (overallScore >= 50) return 'needs_improvement';
    return 'poor';
  };

  const status = getPerformanceStatus();

  // Format time based on calendar settings
  const formatTime = (date: Date) => {
    return appSettings.calendarType === 'jalali' 
      ? date.toLocaleTimeString('fa-IR') 
      : date.toLocaleTimeString('en-US');
  };

  return (
    <ModernCard className={className}>
      <ModernCardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              status === 'excellent' ? 'bg-green-500/20 text-green-500' :
              status === 'good' ? 'bg-blue-500/20 text-blue-500' :
              status === 'needs_improvement' ? 'bg-yellow-500/20 text-yellow-500' :
              'bg-red-500/20 text-red-500'
            }`}>
              {status === 'excellent' ? <CheckCircle className="h-5 w-5" /> :
               status === 'good' ? <TrendingUp className="h-5 w-5" /> :
               <AlertTriangle className="h-5 w-5" />}
            </div>
            <div>
              <ModernCardTitle>{t('performance.title', 'Performance Dashboard')}</ModernCardTitle>
              <Badge 
                variant={
                  status === 'excellent' ? 'default' :
                  status === 'good' ? 'secondary' :
                  'destructive'
                }
                className="mt-1"
              >
                {t(`performance.${status}`, status === 'excellent' ? 'Excellent' : 
                  status === 'good' ? 'Good' : 
                  status === 'needs_improvement' ? 'Needs Improvement' : 'Poor')}
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
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
              {t('performance.last_updated', 'Last updated')}: {formatTime(lastUpdated)}
            </span>
          </div>
          <Progress value={overallScore} className="h-3" />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>{t('performance.poor', 'Poor')}</span>
            <span>{t('performance.excellent', 'Excellent')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* CLS Metric */}
          <ModernCard>
            <ModernCardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Layout className="h-4 w-4 text-purple-500" />
                <span className="font-medium text-sm">CLS</span>
              </ModernCardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : metrics.cls !== null ? metrics.cls.toFixed(3) : 'N/A'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {t('performance.cls_description', 'Visual stability')}
              </div>
              <Progress 
                value={metrics.cls !== null ? Math.min(metrics.cls * 400, 100) : 0} 
                className="h-1 mt-2"
                indicatorClassName={metrics.cls !== null && metrics.cls < 0.1 ? 'bg-green-500' : metrics.cls !== null && metrics.cls < 0.25 ? 'bg-yellow-500' : 'bg-red-500'}
              />
            </ModernCardContent>
          </ModernCard>

          {/* FCP Metric */}
          <ModernCard>
            <ModernCardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-sm">FCP</span>
              </ModernCardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : metrics.fcp !== null ? `${Math.round(metrics.fcp)}ms` : 'N/A'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {t('performance.fcp_description', 'First content paint')}
              </div>
              <Progress 
                value={metrics.fcp !== null ? Math.min((metrics.fcp / 50), 100) : 0} 
                className="h-1 mt-2"
                indicatorClassName={metrics.fcp !== null && metrics.fcp < 1800 ? 'bg-green-500' : metrics.fcp !== null && metrics.fcp < 3000 ? 'bg-yellow-500' : 'bg-red-500'}
              />
            </ModernCardContent>
          </ModernCard>

          {/* FID Metric */}
          <ModernCard>
            <ModernCardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MousePointer className="h-4 w-4 text-green-500" />
                <span className="font-medium text-sm">FID</span>
              </ModernCardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : metrics.fid !== null ? `${Math.round(metrics.fid)}ms` : 'N/A'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {t('performance.fid_description', 'First input delay')}
              </div>
              <Progress 
                value={metrics.fid !== null ? Math.min(metrics.fid, 100) : 0} 
                className="h-1 mt-2"
                indicatorClassName={metrics.fid !== null && metrics.fid < 100 ? 'bg-green-500' : metrics.fid !== null && metrics.fid < 300 ? 'bg-yellow-500' : 'bg-red-500'}
              />
            </ModernCardContent>
          </ModernCard>

          {/* LCP Metric */}
          <ModernCard>
            <ModernCardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Image className="h-4 w-4 text-orange-500" />
                <span className="font-medium text-sm">LCP</span>
              </ModernCardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : metrics.lcp !== null ? `${Math.round(metrics.lcp)}ms` : 'N/A'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {t('performance.lcp_description', 'Largest content paint')}
              </div>
              <Progress 
                value={metrics.lcp !== null ? Math.min((metrics.lcp / 50), 100) : 0} 
                className="h-1 mt-2"
                indicatorClassName={metrics.lcp !== null && metrics.lcp < 2500 ? 'bg-green-500' : metrics.lcp !== null && metrics.lcp < 4000 ? 'bg-yellow-500' : 'bg-red-500'}
              />
            </ModernCardContent>
          </ModernCard>

          {/* TTFB Metric */}
          <ModernCard>
            <ModernCardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Server className="h-4 w-4 text-red-500" />
                <span className="font-medium text-sm">TTFB</span>
              </ModernCardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : metrics.ttfb !== null ? `${Math.round(metrics.ttfb)}ms` : 'N/A'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {t('performance.ttfb_description', 'Time to first byte')}
              </div>
              <Progress 
                value={metrics.ttfb !== null ? Math.min(metrics.ttfb / 5, 100) : 0} 
                className="h-1 mt-2"
                indicatorClassName={metrics.ttfb !== null && metrics.ttfb < 200 ? 'bg-green-500' : metrics.ttfb !== null && metrics.ttfb < 500 ? 'bg-yellow-500' : 'bg-red-500'}
              />
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Performance Insights */}
        <ModernCard className="mt-6">
          <ModernCardContent className="p-4">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              {t('performance.insights', 'Performance Insights')}
            </h3>
            
            {status === 'excellent' && (
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <h4 className="font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {t('performance.excellent_performance', 'Excellent Performance!')}
                </h4>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {t('performance.excellent_message', 'Your application meets all performance standards')}
                </p>
              </div>
            )}
            
            {status === 'poor' && (
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <h4 className="font-medium text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {t('performance.critical_issues', 'Critical Performance Issues Detected')}
                </h4>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {t('performance.critical_message', 'Some metrics are in the poor range and need immediate attention')}
                </p>
              </div>
            )}
            
            {status === 'needs_improvement' && (
              <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <h4 className="font-medium text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {t('performance.room_for_improvement', 'Room for Improvement')}
                </h4>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                  {t('performance.improvement_message', 'Some metrics can be optimized for better user experience')}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <h4 className="font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  {t('performance.lcp_tip', 'LCP Optimization Tip')}
                </h4>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  {t('performance.lcp_suggestion', 'Consider optimizing images, fonts, and critical resource loading')}
                </p>
              </div>
              
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <h4 className="font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  {t('performance.cls_tip', 'CLS Optimization Tip')}
                </h4>
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                  {t('performance.cls_suggestion', 'Ensure images and ads have defined dimensions')}
                </p>
              </div>
              
              <div className="p-3 bg-green-500/10 rounded-lg">
                <h4 className="font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                  <MousePointer className="h-4 w-4" />
                  {t('performance.fid_tip', 'FID Optimization Tip')}
                </h4>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {t('performance.fid_suggestion', 'Reduce JavaScript execution time and use code splitting')}
                </p>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
      </ModernCardContent>
    </ModernCard>
  );
};

export default PerformanceDashboard;