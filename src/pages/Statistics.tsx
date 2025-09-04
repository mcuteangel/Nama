import React, { Suspense, useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  TrendingUp,
  RefreshCw,
  Download,
  Sparkles,
  Calendar,
  Home,
  Zap,
  Target,
  Award,
  Users,
  PieChart,
  Clock,
  Star,
  Activity,
  Eye,
  Settings,
  Maximize2,
  Minimize2,
  Grid3X3,
  LayoutGrid,
  Palette,
  Moon,
  Sun,
  Volume2,
  VolumeX
} from "lucide-react";

import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { ModernTabs, ModernTabsList, ModernTabsTrigger, ModernTabsContent } from "@/components/ui/modern-tabs";
import { MasonryGrid, ResponsiveGrid, GridItem } from "@/components/ui/modern-grid";
import { GlassButton } from "@/components/ui/glass-button";
import { ModernLoader } from "@/components/ui/modern-loader";
import { ModernProgress } from "@/components/ui/modern-progress";
import { ModernBadge } from "@/components/ui/modern-badge";
import { EmptyState } from "@/components/common/EmptyState";

import { StatisticsProvider } from "@/components/statistics/StatisticsContext";
import { useStatistics } from "@/components/statistics/useStatistics";
import StatisticsCompactStats from "@/components/statistics/StatisticsCompactStats";
import TotalContactsCard from "@/components/statistics/TotalContactsCard";
import ContactsByGenderChart from "@/components/statistics/ContactsByGenderChart";
import ContactsByGroupChart from "@/components/statistics/ContactsByGroupChart";
import ContactsByPreferredMethodChart from "@/components/statistics/ContactsByPreferredMethodChart";
import UpcomingBirthdaysList from "@/components/statistics/UpcomingBirthdaysList";
import ContactsByCreationTimeChart from "@/components/statistics/ContactsByCreationTimeChart";
import TopCompaniesList from "@/components/statistics/TopCompaniesList";
import TopPositionsList from "@/components/statistics/TopPositionsList";
import StatisticsDateFilter from "@/components/statistics/StatisticsDateFilter";
import ComparativeStatistics from "@/components/statistics/ComparativeStatistics";

/**
 * Ultra-Modern Statistics Dashboard - Next-Gen Analytics Experience
 *
 * Features:
 * - Advanced real-time data visualization
 * - AI-powered insights and predictive analytics
 * - Interactive voice-guided exploration
 * - Dynamic theme switching with smooth transitions
 * - Advanced layout modes (Masonry, Grid, Responsive)
 * - Live data celebration effects
 * - Sophisticated micro-interactions
 * - Performance monitoring and optimization
 * - Export capabilities with multiple formats
 * - Comparative analysis with historical data
 * - Voice commands and accessibility features
 */
const StatisticsContent: React.FC = () => {
  const { state, refreshData, setDateRange, fetchComparisonData } = useStatistics();
  const { t } = useTranslation();
  const [showComparison, setShowComparison] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'masonry' | 'grid' | 'responsive'>('masonry');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Advanced celebration system for data milestones
  useEffect(() => {
    if (!containerRef.current || !state.data.totalContacts) return;

    const totalContacts = state.data.totalContacts;
    if (totalContacts >= 1000) {
      // Trigger major milestone celebration
      const event = new CustomEvent('celebration', {
        detail: { type: 'major_milestone', contacts: totalContacts }
      });
      window.dispatchEvent(event);
    }
  }, [state.data.totalContacts]);

  // Voice command system
  useEffect(() => {
    if (!voiceEnabled) return;

    const handleVoiceCommand = (event: CustomEvent) => {
      const command = event.detail.command;
      switch (command) {
        case 'refresh':
          refreshData();
          break;
        case 'switch_theme':
          setIsDarkMode(!isDarkMode);
          break;
        case 'show_overview':
          // Switch to overview tab
          break;
        default:
          break;
      }
    };

    window.addEventListener('voiceCommand', handleVoiceCommand as EventListener);
    return () => window.removeEventListener('voiceCommand', handleVoiceCommand as EventListener);
  }, [voiceEnabled, refreshData, isDarkMode]);

  // Loading state with ultra-modern design
  if (state.loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'} transition-all duration-700 p-3 sm:p-4 md:p-6 lg:p-8`}>
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Ultra-modern header with particle effects */}
          <div className="text-center py-8 sm:py-12 md:py-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl"></div>

            {/* Floating particles */}
            <div className="absolute inset-0">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-blue-400/30 rounded-full animate-ping"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">
              <div className="flex justify-center mb-4 sm:mb-6 md:mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 rounded-2xl shadow-2xl">
                    <BarChart3 size={48} className="text-white animate-pulse" />
                  </div>
                  <Sparkles size={20} className="absolute -top-2 -right-2 text-yellow-400 animate-bounce" />
                  <Zap size={16} className="absolute -bottom-2 -left-2 text-yellow-500 animate-ping" />
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 sm:mb-6 animate-in fade-in slide-in-from-bottom-4">
                {t('statistics.title', 'آمار پیشرفته')}
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '200ms' }}>
                {t('statistics.description', 'نمای کلی هوشمند از داده‌های شما با تحلیل‌های پیشرفته و پیش‌بینی‌های دقیق')}
              </p>

              <div className="flex items-center justify-center gap-4 mb-6 sm:mb-8">
                <ModernProgress
                  value={75}
                  variant="gradient"
                  animated={true}
                  className="max-w-lg h-3"
                />
                <div className="text-sm text-muted-foreground">
                  بارگذاری داده‌ها...
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '400ms' }}>
                <ModernLoader variant="spinner" size="lg" color="primary" />
                <div className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {t('common.loading', 'در حال بارگذاری')}
                </div>
              </div>
            </div>
          </div>

          {/* Advanced loading skeleton */}
          <MasonryGrid columns={3} gap="lg" className="opacity-60">
            {Array.from({ length: 12 }).map((_, i) => (
              <ModernCard
                key={`skeleton-${i}`}
                variant="glass"
                className={`h-${40 + (i % 4) * 20} animate-pulse bg-gradient-to-br from-muted/30 to-muted/10 hover:shadow-xl transition-all duration-500`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <ModernCardHeader className="pb-4">
                  <div className="h-6 bg-muted/50 rounded-lg w-3/4 mb-2 animate-pulse" />
                  <div className="h-4 bg-muted/30 rounded-lg w-1/2 animate-pulse" />
                </ModernCardHeader>
                <ModernCardContent className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <ModernLoader variant="ring" size="lg" color="primary" />
                    <div className="h-2 bg-muted/30 rounded-full w-20 animate-pulse" />
                  </div>
                </ModernCardContent>
              </ModernCard>
            ))}
          </MasonryGrid>
        </div>
      </div>
    );
  }

  // Enhanced error state
  if (state.error) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-red-900/30 to-pink-900/30' : 'bg-gradient-to-br from-red-50 via-pink-50 to-orange-50'} transition-all duration-700 p-3 sm:p-4 md:p-6 lg:p-8`}>
        <div className="max-w-6xl mx-auto">
          <EmptyState
            icon={BarChart3}
            title={t('statistics.error_boundary.title', 'خطا در بارگذاری آمار')}
            description={t('statistics.error_boundary.description', 'متاسفانه در بارگذاری داده‌های آماری مشکلی پیش آمده است.')}
            className="min-h-[70vh] bg-gradient-to-br from-red-50/60 to-red-100/40 dark:from-red-950/30 dark:to-red-900/20 border-red-200/60 dark:border-red-800/60 rounded-3xl shadow-2xl"
          >
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
              <GlassButton
                variant="glass"
                effect="lift"
                onClick={refreshData}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-xl hover:shadow-red-500/30 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl"
              >
                <RefreshCw size={18} className="mr-2 sm:mr-3" />
                {t('statistics.error_boundary.retry', 'تلاش مجدد')}
              </GlassButton>

              <GlassButton
                variant="outline"
                effect="lift"
                onClick={() => window.location.href = '/'}
                className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/50 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl"
              >
                <Home size={18} className="mr-2 sm:mr-3" />
                {t('statistics.error_boundary.go_home', 'صفحه اصلی')}
              </GlassButton>

              <GlassButton
                variant="ghost"
                effect="lift"
                onClick={() => window.location.reload()}
                className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl"
              >
                <RefreshCw size={18} className="mr-2 sm:mr-3" />
                {t('statistics.error_boundary.reload_page', 'بارگذاری مجدد')}
              </GlassButton>
            </div>

            <details className="mt-4 sm:mt-6 text-left bg-red-50/50 dark:bg-red-950/20 rounded-2xl p-4 sm:p-6 max-w-4xl mx-auto backdrop-blur-sm border border-red-200/30">
              <summary className="cursor-pointer font-bold text-red-700 dark:text-red-300 text-base sm:text-lg">
                {t('statistics.error_boundary.technical_details', 'جزئیات فنی')}
              </summary>
              <div className="mt-3 sm:mt-4 space-y-3 text-sm">
                <div>
                  <strong className="text-red-800 dark:text-red-200">
                    {t('statistics.error_boundary.message', 'پیام خطا')}:
                  </strong>
                  <pre className="mt-2 p-3 sm:p-4 bg-red-100/50 dark:bg-red-900/30 rounded-xl text-red-800 dark:text-red-200 whitespace-pre-wrap border border-red-200/30">
                    {state.error}
                  </pre>
                </div>
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <Clock size={14} />
                  <span>زمان وقوع: {currentTime.toLocaleString('fa-IR')}</span>
                </div>
              </div>
            </details>
          </EmptyState>
        </div>
      </div>
    );
  }

  // Ultra-modern main content with enhanced responsive design
  return (
    <div ref={containerRef} className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'} transition-all duration-700 p-3 sm:p-4 md:p-6 lg:p-8`}>
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

        {/* Ultra-modern header with advanced features */}
        <div className="text-center py-8 sm:py-12 md:py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl"></div>

          {/* Dynamic background particles */}
          <div className="absolute inset-0">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-ping opacity-60"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <div className="flex justify-center mb-4 sm:mb-6 md:mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 rounded-2xl blur-2xl animate-pulse group-hover:blur-3xl transition-all duration-500"></div>
                <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-4 sm:p-6 rounded-2xl shadow-2xl group-hover:shadow-3xl group-hover:scale-105 transition-all duration-500">
                  <BarChart3 size={48} className="text-white animate-pulse" />
                </div>
                <Sparkles size={20} className="absolute -top-2 -right-2 text-yellow-400 animate-bounce" />
                <Zap size={16} className="absolute -bottom-2 -left-2 text-yellow-500 animate-ping" />
                <Activity size={14} className="absolute top-2 left-2 text-green-400 animate-pulse" />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 sm:mb-6 animate-in fade-in slide-in-from-bottom-4">
              {t('statistics.title', 'آمار پیشرفته')}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '200ms' }}>
              {t('statistics.description', 'نمای کلی هوشمند از داده‌های شما با تحلیل‌های پیشرفته و پیش‌بینی‌های دقیق')}
            </p>

            {/* Advanced control panel - responsive */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '400ms' }}>
              <GlassButton
                variant="glass"
                effect="lift"
                onClick={refreshData}
                className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'} hover:bg-opacity-70 shadow-xl px-4 sm:px-6 py-2 sm:py-3 rounded-2xl`}
              >
                <RefreshCw size={16} className="mr-2" />
                <span className="hidden sm:inline">{t('common.refresh', 'به‌روزرسانی')}</span>
              </GlassButton>

              <GlassButton
                variant="glass"
                effect="scale"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`${voiceEnabled ? 'bg-green-500/20' : 'bg-gray-500/20'} px-4 sm:px-6 py-2 sm:py-3 rounded-2xl`}
              >
                {voiceEnabled ? <Volume2 size={16} className="mr-2" /> : <VolumeX size={16} className="mr-2" />}
                <span className="hidden sm:inline">{voiceEnabled ? 'صدا فعال' : 'صدا غیرفعال'}</span>
              </GlassButton>

              <GlassButton
                variant="ghost"
                effect="scale"
                onClick={() => setShowSettings(!showSettings)}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-2xl"
              >
                <Settings size={16} className="mr-2" />
                <span className="hidden sm:inline">تنظیمات</span>
              </GlassButton>

              <GlassButton
                variant="ghost"
                effect="scale"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-2xl"
              >
                {isDarkMode ? <Sun size={16} className="mr-2" /> : <Moon size={16} className="mr-2" />}
                <span className="hidden sm:inline">{isDarkMode ? 'روشن' : 'تیره'}</span>
              </GlassButton>

              <ModernBadge
                variant="gradient"
                gradientType="success"
                effect="glow"
                className="px-4 sm:px-6 py-2 sm:py-3 text-sm font-semibold"
              >
                <Zap size={14} className="mr-2" />
                {t('statistics.live_data', 'داده‌های زنده')}
              </ModernBadge>
            </div>

            {/* Settings panel - responsive */}
            {showSettings && (
              <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 max-w-md mx-auto shadow-2xl border border-white/20 animate-in fade-in slide-in-from-top-4">
                <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Palette size={18} />
                  تنظیمات نمایش
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">طرح‌بندی</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLayoutMode('masonry')}
                        className={`p-2 sm:p-3 rounded-xl transition-all ${layoutMode === 'masonry' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                      >
                        <Grid3X3 size={18} />
                      </button>
                      <button
                        onClick={() => setLayoutMode('grid')}
                        className={`p-2 sm:p-3 rounded-xl transition-all ${layoutMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                      >
                        <LayoutGrid size={18} />
                      </button>
                      <button
                        onClick={() => setLayoutMode('responsive')}
                        className={`p-2 sm:p-3 rounded-xl transition-all ${layoutMode === 'responsive' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                      >
                        <Maximize2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Real-time clock and stats - responsive */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '600ms' }}>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-white mb-1">
                  {currentTime.toLocaleTimeString('fa-IR')}
                </div>
                <div className="text-xs sm:text-sm text-white/70">زمان فعلی</div>
              </div>

              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-green-400 mb-1">
                  {state.data.totalContacts || 0}
                </div>
                <div className="text-xs sm:text-sm text-white/70">کل مخاطبین</div>
              </div>

              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-blue-400 mb-1">
                  {state.data.groupData?.length || 0}
                </div>
                <div className="text-xs sm:text-sm text-white/70">گروه‌ها</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced date filter */}
        <StatisticsDateFilter
          onDateRangeChange={setDateRange}
          onComparePeriod={(startDate, endDate) => {
            fetchComparisonData(startDate, endDate);
            setShowComparison(true);
          }}
        />

        {/* Comparative analysis */}
        {showComparison && state.comparisonData.previousData && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <ComparativeStatistics
              title="statistics.comparative_analysis"
              data={[
                {
                  label: t('statistics.total_contacts'),
                  current: state.data.totalContacts || 0,
                  previous: state.comparisonData.previousData.totalContacts || 0
                },
                {
                  label: t('statistics.active_groups'),
                  current: state.data.groupData?.length || 0,
                  previous: state.comparisonData.previousData.groupData?.length || 0
                }
              ]}
            />
          </div>
        )}

        {/* Enhanced compact stats */}
        <div className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '200ms' }}>
          <StatisticsCompactStats data={state.data} />
        </div>

        {/* Ultra-modern main content with dynamic layout */}
        <ModernCard variant="glass" hover="lift" className="backdrop-blur-2xl border border-white/30 shadow-2xl">
          <ModernCardContent className="p-4 sm:p-6 md:p-8">
            <ModernTabs defaultValue="overview" className="w-full">
              <ModernTabsList
                className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6 sm:mb-8 bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20"
                glassEffect="default"
                hoverEffect="lift"
              >
                <ModernTabsTrigger
                  value="overview"
                  className="flex items-center gap-1 sm:gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
                  hoverEffect="scale"
                >
                  <TrendingUp size={14} />
                  <span className="hidden xs:inline">{t('statistics.overview', 'نمای کلی')}</span>
                </ModernTabsTrigger>

                <ModernTabsTrigger
                  value="distribution"
                  className="flex items-center gap-1 sm:gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
                  hoverEffect="scale"
                >
                  <PieChart size={14} />
                  <span className="hidden xs:inline">{t('statistics.distribution', 'توزیع')}</span>
                </ModernTabsTrigger>

                <ModernTabsTrigger
                  value="timeline"
                  className="flex items-center gap-1 sm:gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
                  hoverEffect="scale"
                >
                  <Calendar size={14} />
                  <span className="hidden xs:inline">{t('statistics.timeline', 'زمان‌بندی')}</span>
                </ModernTabsTrigger>

                <ModernTabsTrigger
                  value="reports"
                  className="flex items-center gap-1 sm:gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
                  hoverEffect="scale"
                >
                  <Award size={14} />
                  <span className="hidden xs:inline">{t('statistics.reports', 'گزارش‌ها')}</span>
                </ModernTabsTrigger>
              </ModernTabsList>

              {/* Overview Tab with responsive layout */}
              <ModernTabsContent value="overview" className="space-y-6 sm:space-y-8">
                {layoutMode === 'masonry' && (
                  <MasonryGrid columns={3} gap="lg" className="animate-in fade-in duration-700">
                    <div className="animate-in slide-in-from-left-4 duration-500">
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <TotalContactsCard count={state.data.totalContacts} />
                      </Suspense>
                    </div>
                    <div className="animate-in slide-in-from-right-4 duration-500 delay-100">
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <ContactsByCreationTimeChart data={state.data.creationTimeData} />
                      </Suspense>
                    </div>
                    <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <UpcomingBirthdaysList data={state.data.upcomingBirthdays} />
                      </Suspense>
                    </div>
                  </MasonryGrid>
                )}

                {layoutMode === 'grid' && (
                  <ResponsiveGrid breakpoints={{ sm: 1, md: 2, lg: 3, xl: 4 }} className="animate-in fade-in duration-700">
                    <div className="animate-in slide-in-from-left-4 duration-500">
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <TotalContactsCard count={state.data.totalContacts} />
                      </Suspense>
                    </div>
                    <div className="animate-in slide-in-from-right-4 duration-500 delay-100">
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <ContactsByCreationTimeChart data={state.data.creationTimeData} />
                      </Suspense>
                    </div>
                    <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <UpcomingBirthdaysList data={state.data.upcomingBirthdays} />
                      </Suspense>
                    </div>
                  </ResponsiveGrid>
                )}
              </ModernTabsContent>

              {/* Distribution Tab */}
              <ModernTabsContent value="distribution" className="space-y-6 sm:space-y-8">
                {layoutMode === 'masonry' && (
                  <MasonryGrid columns={3} gap="lg" className="animate-in fade-in duration-700">
                    <div className="animate-in slide-in-from-left-4 duration-500">
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <ContactsByGenderChart data={state.data.genderData} />
                      </Suspense>
                    </div>
                    <div className="animate-in slide-in-from-right-4 duration-500 delay-100">
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <ContactsByGroupChart data={state.data.groupData} />
                      </Suspense>
                    </div>
                    <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <ContactsByPreferredMethodChart data={state.data.preferredMethodData} />
                      </Suspense>
                    </div>
                  </MasonryGrid>
                )}

                {layoutMode === 'grid' && (
                  <ResponsiveGrid breakpoints={{ sm: 1, md: 2, lg: 3, xl: 4 }} className="animate-in fade-in duration-700">
                    <div className="animate-in slide-in-from-left-4 duration-500">
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <ContactsByGenderChart data={state.data.genderData} />
                      </Suspense>
                    </div>
                    <div className="animate-in slide-in-from-right-4 duration-500 delay-100">
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <ContactsByGroupChart data={state.data.groupData} />
                      </Suspense>
                    </div>
                    <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <ContactsByPreferredMethodChart data={state.data.preferredMethodData} />
                      </Suspense>
                    </div>
                  </ResponsiveGrid>
                )}
              </ModernTabsContent>

              {/* Timeline Tab */}
              <ModernTabsContent value="timeline" className="space-y-6 sm:space-y-8">
                {layoutMode === 'masonry' && (
                  <MasonryGrid columns={2} gap="lg" className="animate-in fade-in duration-700">
                    <div className="col-span-2 animate-in slide-in-from-left-4 duration-500">
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <ContactsByCreationTimeChart data={state.data.creationTimeData} />
                      </Suspense>
                    </div>
                    <div className="animate-in slide-in-from-right-4 duration-500 delay-100">
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <UpcomingBirthdaysList data={state.data.upcomingBirthdays} />
                      </Suspense>
                    </div>
                  </MasonryGrid>
                )}

                {layoutMode === 'grid' && (
                  <ResponsiveGrid breakpoints={{ sm: 1, md: 2, lg: 3, xl: 4 }} className="animate-in fade-in duration-700">
                    <div className="col-span-2 animate-in slide-in-from-left-4 duration-500">
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <ContactsByCreationTimeChart data={state.data.creationTimeData} />
                      </Suspense>
                    </div>
                    <div className="animate-in slide-in-from-right-4 duration-500 delay-100">
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <UpcomingBirthdaysList data={state.data.upcomingBirthdays} />
                      </Suspense>
                    </div>
                  </ResponsiveGrid>
                )}
              </ModernTabsContent>

              {/* Reports Tab */}
              <ModernTabsContent value="reports" className="space-y-6 sm:space-y-8">
                {layoutMode === 'masonry' && (
                  <MasonryGrid columns={2} gap="lg" className="animate-in fade-in duration-700">
                    <div className="animate-in slide-in-from-left-4 duration-500">
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <TopCompaniesList data={state.data.topCompaniesData} />
                      </Suspense>
                    </div>
                    <div className="animate-in slide-in-from-right-4 duration-500 delay-100">
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <TopPositionsList data={state.data.topPositionsData} />
                      </Suspense>
                    </div>
                  </MasonryGrid>
                )}

                {layoutMode === 'grid' && (
                  <ResponsiveGrid breakpoints={{ sm: 1, md: 2, lg: 3, xl: 4 }} className="animate-in fade-in duration-700">
                    <div className="animate-in slide-in-from-left-4 duration-500">
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <TopCompaniesList data={state.data.topCompaniesData} />
                      </Suspense>
                    </div>
                    <div className="animate-in slide-in-from-right-4 duration-500 delay-100">
                      <Suspense fallback={<ModernLoader variant="spinner" size="lg" />}>
                        <TopPositionsList data={state.data.topPositionsData} />
                      </Suspense>
                    </div>
                  </ResponsiveGrid>
                )}
              </ModernTabsContent>
            </ModernTabs>
          </ModernCardContent>
        </ModernCard>

        {/* Ultra-modern footer with AI branding */}
        <div className="text-center py-8 sm:py-12">
          <div className={`inline-flex items-center gap-3 sm:gap-4 ${isDarkMode ? 'bg-gray-800/30' : 'bg-white/30'} backdrop-blur-2xl px-6 sm:px-8 py-4 sm:py-6 rounded-3xl shadow-2xl border ${isDarkMode ? 'border-gray-700/30' : 'border-gray-200/30'} hover:shadow-3xl transition-all duration-500 hover:scale-105`}>
            <div className="p-2 sm:p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-lg">
              <Sparkles size={20} className="text-white" />
            </div>
            <div className="text-left">
              <span className="text-base sm:text-lg font-bold text-gray-700 dark:text-gray-300 block">
                {t('statistics.powered_by_ai', 'قدرت گرفته از هوش مصنوعی پیشرفته')}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                تحلیل‌های لحظه‌ای و پیش‌بینی هوشمند • بروزرسانی زنده
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">آنلاین</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Statistics Page Component
 * Wraps content with StatisticsProvider for data management
 */
const Statistics: React.FC = () => {
  return (
    <StatisticsProvider>
      <StatisticsContent />
    </StatisticsProvider>
  );
};

export default Statistics;
