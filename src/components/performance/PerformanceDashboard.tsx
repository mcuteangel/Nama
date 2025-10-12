import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Download,
  Activity,
  Layout,
  Zap,
  MousePointer,
  Image,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Lightbulb,
  BarChart3,
  Wifi
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlassButton } from '@/components/ui/glass-button';
import SettingsSection from '@/components/settings/SettingsSection';
import SettingsCard from '@/components/settings/SettingsCard';
import { useAppSettings } from '@/hooks/use-app-settings';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

// Types for performance metrics
interface WebVitalsMetrics {
  cls: number | null;  // Cumulative Layout Shift
  fcp: number | null;  // First Contentful Paint
  inp: number | null;  // Interaction to Next Paint (replaces FID)
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
    inp: null,
    lcp: null,
    ttfb: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  // Function to get Web Vitals metrics
  const getWebVitals = () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get all Web Vitals metrics
      onCLS((metric) => {
        setMetrics(prev => ({ ...prev, cls: metric.value }));
      });
      onFCP((metric) => {
        setMetrics(prev => ({ ...prev, fcp: metric.value }));
      });
      onINP((metric) => {
        setMetrics(prev => ({ ...prev, inp: metric.value }));
      });
      onLCP((metric) => {
        setMetrics(prev => ({ ...prev, lcp: metric.value }));
      });
      onTTFB((metric) => {
        setMetrics(prev => ({ ...prev, ttfb: metric.value }));
      });

      // Set loading to false after a short delay to allow metrics to be collected
      setTimeout(() => {
        setIsLoading(false);
        setLastUpdated(new Date());
      }, 2000);
    } catch (err) {
      setError('Failed to collect performance metrics');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getWebVitals();
  }, []);

  const refreshMetrics = () => {
    getWebVitals();
  };

  const exportData = () => {
    const dataStr = JSON.stringify({
      metrics,
      overallScore,
      status,
      exportedAt: new Date().toISOString(),
      url: window.location.href
    }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `performance-metrics-${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Calculate overall performance score based on real Web Vitals
  const overallScore = React.useMemo(() => {
    const scores = [
      metrics.cls !== null ? (metrics.cls < 0.1 ? 100 : metrics.cls < 0.25 ? 50 : 0) : null,
      metrics.fcp !== null ? (metrics.fcp < 1800 ? 100 : metrics.fcp < 3000 ? 50 : 0) : null,
      metrics.inp !== null ? (metrics.inp < 200 ? 100 : metrics.inp < 500 ? 50 : 0) : null,
      metrics.lcp !== null ? (metrics.lcp < 2500 ? 100 : metrics.lcp < 4000 ? 50 : 0) : null,
      metrics.ttfb !== null ? (metrics.ttfb < 200 ? 100 : metrics.ttfb < 500 ? 50 : 0) : null,
    ].filter(score => score !== null);

    if (scores.length === 0) return 0;

    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }, [metrics]);

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

  // Get status color for badges and indicators
  const getStatusColor = () => {
    switch (status) {
      case 'excellent': return 'green';
      case 'good': return 'blue';
      case 'needs_improvement': return 'orange';
      case 'poor': return 'orange';
      default: return 'blue';
    }
  };

  const statusColor = getStatusColor();

  return (
    <SettingsSection
      title={t('performance.title', 'Performance Dashboard')}
      description={t('performance.description', 'Real-time Web Vitals and performance metrics monitoring')}
      icon={<Activity size={20} />}
      variant="glass"
      className={className}
    >
      {/* Header Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <GlassButton
          onClick={refreshMetrics}
          disabled={isLoading}
          variant="3d-gradient-primary"
          size="sm"
          effect="lift"
          className="flex items-center gap-2 font-medium"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {t('performance.refresh', 'Refresh')}
        </GlassButton>
        <GlassButton
          onClick={exportData}
          variant="3d-gradient-ocean"
          size="sm"
          effect="lift"
          className="flex items-center gap-2 font-medium"
        >
          <Download className="h-4 w-4" />
          {t('performance.export', 'Export')}
        </GlassButton>
      </div>

      {/* Error Display */}
      {error && (
        <SettingsCard
          title={t('performance.error', 'Error')}
          description={error}
          icon={<AlertTriangle size={16} />}
          gradient="orange"
          className="mb-4"
        >
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        </SettingsCard>
      )}

      {/* Overall Score */}
      <SettingsCard
        title={t('performance.overall_health', 'Overall Performance Health')}
        description={`${t('performance.last_updated', 'Last updated')}: ${formatTime(lastUpdated)}`}
        icon={<BarChart3 size={16} />}
        gradient={statusColor as 'blue' | 'green' | 'orange' | 'purple' | 'pink' | 'cyan'}
        className="mb-4"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {t('performance.score', 'Score')}: {overallScore}/100
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              status === 'excellent' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
              status === 'good' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
              status === 'needs_improvement' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            }`}>
              {t(`performance.${status}`, status === 'excellent' ? 'Excellent' :
                status === 'good' ? 'Good' :
                status === 'needs_improvement' ? 'Needs Improvement' : 'Poor')}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                status === 'excellent' ? 'bg-green-500' :
                status === 'good' ? 'bg-blue-500' :
                status === 'needs_improvement' ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${overallScore}%` }}
            />
          </div>
        </div>
      </SettingsCard>

      {/* Web Vitals Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* CLS Metric */}
        <SettingsCard
          title="CLS"
          description={t('performance.cls_description', 'Visual stability')}
          icon={<Layout size={16} />}
          gradient="purple"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Loading...</span>
                </div>
              ) : metrics.cls !== null ? metrics.cls.toFixed(3) : 'N/A'}
            </div>
            <div className="w-full bg-purple-100 dark:bg-purple-900/30 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  metrics.cls !== null && metrics.cls < 0.1 ? 'bg-green-500' :
                  metrics.cls !== null && metrics.cls < 0.25 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${metrics.cls !== null ? Math.min(metrics.cls * 400, 100) : 0}%` }}
              />
            </div>
          </div>
        </SettingsCard>

        {/* FCP Metric */}
        <SettingsCard
          title="FCP"
          description={t('performance.fcp_description', 'First content paint')}
          icon={<Zap size={16} />}
          gradient="blue"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Loading...</span>
                </div>
              ) : metrics.fcp !== null ? `${Math.round(metrics.fcp)}ms` : 'N/A'}
            </div>
            <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  metrics.fcp !== null && metrics.fcp < 1800 ? 'bg-green-500' :
                  metrics.fcp !== null && metrics.fcp < 3000 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${metrics.fcp !== null ? Math.min((metrics.fcp / 30), 100) : 0}%` }}
              />
            </div>
          </div>
        </SettingsCard>

        {/* INP Metric */}
        <SettingsCard
          title="INP"
          description={t('performance.inp_description', 'Interaction to Next Paint')}
          icon={<MousePointer size={16} />}
          gradient="green"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-300">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Loading...</span>
                </div>
              ) : metrics.inp !== null ? `${Math.round(metrics.inp)}ms` : 'N/A'}
            </div>
            <div className="w-full bg-green-100 dark:bg-green-900/30 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  metrics.inp !== null && metrics.inp < 200 ? 'bg-green-500' :
                  metrics.inp !== null && metrics.inp < 500 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${metrics.inp !== null ? Math.min((metrics.inp / 5), 100) : 0}%` }}
              />
            </div>
          </div>
        </SettingsCard>

        {/* LCP Metric */}
        <SettingsCard
          title="LCP"
          description={t('performance.lcp_description', 'Largest content paint')}
          icon={<Image size={16} />}
          gradient="orange"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-300">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Loading...</span>
                </div>
              ) : metrics.lcp !== null ? `${Math.round(metrics.lcp)}ms` : 'N/A'}
            </div>
            <div className="w-full bg-orange-100 dark:bg-orange-900/30 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  metrics.lcp !== null && metrics.lcp < 2500 ? 'bg-green-500' :
                  metrics.lcp !== null && metrics.lcp < 4000 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${metrics.lcp !== null ? Math.min((metrics.lcp / 40), 100) : 0}%` }}
              />
            </div>
          </div>
        </SettingsCard>

        {/* TTFB Metric */}
        <SettingsCard
          title="TTFB"
          description={t('performance.ttfb_description', 'Time to first byte')}
          icon={<Wifi size={16} />}
          gradient="cyan"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-300">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Loading...</span>
                </div>
              ) : metrics.ttfb !== null ? `${Math.round(metrics.ttfb)}ms` : 'N/A'}
            </div>
            <div className="w-full bg-cyan-100 dark:bg-cyan-900/30 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  metrics.ttfb !== null && metrics.ttfb < 200 ? 'bg-green-500' :
                  metrics.ttfb !== null && metrics.ttfb < 500 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${metrics.ttfb !== null ? Math.min(metrics.ttfb / 5, 100) : 0}%` }}
              />
            </div>
          </div>
        </SettingsCard>
      </div>

      {/* Performance Insights */}
      <SettingsCard
        title={t('performance.insights', 'Performance Insights')}
        description={t('performance.insights_description', 'Optimization tips and recommendations')}
        icon={<Lightbulb size={16} />}
        gradient="purple"
      >
        <div className="space-y-3">
          {status === 'excellent' && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-700 dark:text-green-300">
                  {t('performance.excellent_performance', 'Excellent Performance!')}
                </span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">
                {t('performance.excellent_message', 'Your application meets all performance standards')}
              </p>
            </div>
          )}

          {status === 'poor' && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-700 dark:text-red-300">
                  {t('performance.critical_issues', 'Critical Performance Issues Detected')}
                </span>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400">
                {t('performance.critical_message', 'Some metrics are in the poor range and need immediate attention')}
              </p>
            </div>
          )}

          {status === 'needs_improvement' && (
            <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-700 dark:text-orange-300">
                  {t('performance.room_for_improvement', 'Room for Improvement')}
                </span>
              </div>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                {t('performance.improvement_message', 'Some metrics can be optimized for better user experience')}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  {t('performance.lcp_tip', 'LCP Optimization')}
                </span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {t('performance.lcp_suggestion', 'Consider optimizing images, fonts, and critical resource loading')}
              </p>
            </div>

            <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Layout className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-700 dark:text-purple-300">
                  {t('performance.cls_tip', 'CLS Optimization')}
                </span>
              </div>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                {t('performance.cls_suggestion', 'Ensure images and ads have defined dimensions')}
              </p>
            </div>

            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center gap-2 mb-1">
                <MousePointer className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-700 dark:text-green-300">
                  {t('performance.inp_tip', 'INP Optimization')}
                </span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">
                {t('performance.inp_suggestion', 'Reduce JavaScript execution time and use code splitting')}
              </p>
            </div>
          </div>
        </div>
      </SettingsCard>
    </SettingsSection>
  );
};

export default PerformanceDashboard;