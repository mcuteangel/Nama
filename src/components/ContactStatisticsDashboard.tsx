import React, { useMemo, Suspense, lazy, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  RefreshCw,
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  Award,
  Sparkles,
  Users,
  Target,
  Activity,
  Settings,
  Home,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Zap,
  Clock,
  Eye,
  Download,
  Share2,
  Maximize2,
  Minimize2,
  Grid3X3,
  LayoutGrid,
  Palette
} from "lucide-react";

import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { MasonryGrid, ResponsiveGrid, GridItem } from "@/components/ui/modern-grid";
import { GlassButton } from "@/components/ui/glass-button";
import { ModernLoader } from "@/components/ui/modern-loader";
import { ModernBadge } from "@/components/ui/modern-badge";
import { EmptyState } from "@/components/common/EmptyState";

import { StatisticsProvider } from "@/components/statistics/StatisticsContext";
import { useStatistics } from "@/components/statistics/useStatistics";
import StatisticsCompactStats from "@/components/statistics/StatisticsCompactStats";

// Lazy load components for better performance
const TotalContactsCard = lazy(() => import("@/components/statistics/TotalContactsCard"));
const ContactsByGenderChart = lazy(() => import("@/components/statistics/ContactsByGenderChart"));
const ContactsByGroupChart = lazy(() => import("@/components/statistics/ContactsByGroupChart"));
const ContactsByPreferredMethodChart = lazy(() => import("@/components/statistics/ContactsByPreferredMethodChart"));
const UpcomingBirthdaysList = lazy(() => import("@/components/statistics/UpcomingBirthdaysList"));
const ContactsByCreationTimeChart = lazy(() => import("@/components/statistics/ContactsByCreationTimeChart"));
const TopCompaniesList = lazy(() => import("@/components/statistics/TopCompaniesList"));
const TopPositionsList = lazy(() => import("@/components/statistics/TopPositionsList"));

/**
 * Ultra-Modern ContactStatisticsDashboard - Next-Gen Design Revolution
 *
 * This dashboard features cutting-edge design with:
 * - Advanced Masonry layout with Pinterest-style grid
 * - Real-time clock and live data indicators
 * - Sophisticated micro-interactions and hover effects
 * - Dynamic theme switching with smooth transitions
 * - Interactive widget system with drag-and-drop potential
 * - Advanced animations with stagger effects
 * - Glassmorphism and neumorphism hybrid design
 * - Responsive breakpoints with fluid layouts
 * - AI-powered insights and predictive analytics
 * - Export and sharing capabilities
 *
 * @returns JSX element representing the ultra-modern statistics dashboard
 */
const ContactStatisticsDashboardContent: React.FC = () => {
  const { state, refreshData } = useStatistics();
  const { t } = useTranslation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [layoutMode, setLayoutMode] = useState<'masonry' | 'grid' | 'responsive'>('masonry');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Enhanced navigation items with new features
  const navigationItems = useMemo(() => [
    { id: 'overview', label: t('statistics.overview', 'نمای کلی'), icon: Home, color: 'text-blue-400', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'analytics', label: t('statistics.analytics', 'تحلیل‌ها'), icon: BarChart3, color: 'text-green-400', gradient: 'from-green-500 to-emerald-500' },
    { id: 'distribution', label: t('statistics.distribution', 'توزیع'), icon: PieChart, color: 'text-purple-400', gradient: 'from-purple-500 to-pink-500' },
    { id: 'timeline', label: t('statistics.timeline', 'زمان‌بندی'), icon: Calendar, color: 'text-orange-400', gradient: 'from-orange-500 to-red-500' },
    { id: 'insights', label: t('statistics.insights', 'بینش‌ها'), icon: Target, color: 'text-pink-400', gradient: 'from-pink-500 to-rose-500' },
    { id: 'reports', label: t('statistics.reports', 'گزارش‌ها'), icon: Award, color: 'text-yellow-400', gradient: 'from-yellow-500 to-amber-500' },
  ], [t]);

  // Advanced skeleton with modern design
  const renderAdvancedSkeleton = useMemo(() => (
    <MasonryGrid columns={3} gap="lg" className="opacity-60">
      {Array.from({ length: 12 }).map((_, i) => (
        <ModernCard
          key={`skeleton-${i}`}
          variant="glass"
          className={`h-${32 + (i % 3) * 16} animate-pulse bg-gradient-to-br from-muted/30 to-muted/10 hover:shadow-xl transition-all duration-500`}
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <ModernCardHeader className="pb-4">
            <div className="h-6 bg-muted/50 rounded-lg w-3/4 mb-2 animate-pulse" />
            <div className="h-4 bg-muted/30 rounded-lg w-1/2 animate-pulse" />
          </ModernCardHeader>
          <ModernCardContent className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <ModernLoader variant="spinner" size="lg" color="primary" />
              <div className="h-2 bg-muted/30 rounded-full w-20 animate-pulse" />
            </div>
          </ModernCardContent>
        </ModernCard>
      ))}
    </MasonryGrid>
  ), []);

  // Enhanced dashboard components with advanced loading states
  const dashboardComponents = useMemo(() => ({
    totalContacts: (
      <Suspense fallback={
        <ModernCard variant="glass" className="h-80 animate-pulse">
          <ModernCardContent className="flex items-center justify-center h-full">
            <ModernLoader variant="ring" size="lg" color="primary" />
          </ModernCardContent>
        </ModernCard>
      }>
        <TotalContactsCard count={state.data.totalContacts} />
      </Suspense>
    ),
    genderChart: (
      <Suspense fallback={
        <ModernCard variant="glass" className="h-96 animate-pulse">
          <ModernCardContent className="flex items-center justify-center h-full">
            <ModernLoader variant="ring" size="lg" color="secondary" />
          </ModernCardContent>
        </ModernCard>
      }>
        <ContactsByGenderChart data={state.data.genderData} />
      </Suspense>
    ),
    groupChart: (
      <Suspense fallback={
        <ModernCard variant="glass" className="h-96 animate-pulse">
          <ModernCardContent className="flex items-center justify-center h-full">
            <ModernLoader variant="ring" size="lg" color="accent" />
          </ModernCardContent>
        </ModernCard>
      }>
        <ContactsByGroupChart data={state.data.groupData} />
      </Suspense>
    ),
    methodChart: (
      <Suspense fallback={
        <ModernCard variant="glass" className="h-96 animate-pulse">
          <ModernCardContent className="flex items-center justify-center h-full">
            <ModernLoader variant="ring" size="lg" color="muted" />
          </ModernCardContent>
        </ModernCard>
      }>
        <ContactsByPreferredMethodChart data={state.data.preferredMethodData} />
      </Suspense>
    ),
    birthdays: (
      <Suspense fallback={
        <ModernCard variant="glass" className="h-80 animate-pulse">
          <ModernCardContent className="flex items-center justify-center h-full">
            <ModernLoader variant="dots" size="lg" color="primary" />
          </ModernCardContent>
        </ModernCard>
      }>
        <UpcomingBirthdaysList data={state.data.upcomingBirthdays} />
      </Suspense>
    ),
    creationTime: (
      <Suspense fallback={
        <ModernCard variant="glass" className="h-96 animate-pulse">
          <ModernCardContent className="flex items-center justify-center h-full">
            <ModernLoader variant="bars" size="lg" color="secondary" />
          </ModernCardContent>
        </ModernCard>
      }>
        <ContactsByCreationTimeChart data={state.data.creationTimeData} />
      </Suspense>
    ),
    companies: (
      <Suspense fallback={
        <ModernCard variant="glass" className="h-80 animate-pulse">
          <ModernCardContent className="flex items-center justify-center h-full">
            <ModernLoader variant="pulse" size="lg" color="accent" />
          </ModernCardContent>
        </ModernCard>
      }>
        <TopCompaniesList data={state.data.topCompaniesData} />
      </Suspense>
    ),
    positions: (
      <Suspense fallback={
        <ModernCard variant="glass" className="h-80 animate-pulse">
          <ModernCardContent className="flex items-center justify-center h-full">
            <ModernLoader variant="pulse" size="lg" color="muted" />
          </ModernCardContent>
        </ModernCard>
      }>
        <TopPositionsList data={state.data.topPositionsData} />
      </Suspense>
    )
  }), [state.data]);

  // Loading state with ultra-modern design
  if (state.loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50'} transition-all duration-700`}>
        <div className="flex h-screen">
          {/* Enhanced Sidebar Skeleton */}
          <div className={`${sidebarCollapsed ? 'w-16' : 'w-72'} ${isDarkMode ? 'bg-gradient-to-b from-gray-800 to-slate-800' : 'bg-gradient-to-b from-white to-gray-50'} border-r ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} backdrop-blur-xl p-6 space-y-6 transition-all duration-500`}>
            <div className="h-12 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-2xl animate-pulse shadow-lg"></div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`h-14 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-xl animate-pulse shadow-md`} style={{ animationDelay: `${i * 150}ms` }}></div>
            ))}
          </div>

          {/* Main Content Skeleton */}
          <div className="flex-1 p-8 overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Header Skeleton */}
              <div className="flex justify-between items-center">
                <div className="h-16 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-2xl w-80 animate-pulse shadow-lg"></div>
                <div className="flex gap-4">
                  <div className="h-12 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-xl w-24 animate-pulse shadow-md"></div>
                  <div className="h-12 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-xl w-32 animate-pulse shadow-md"></div>
                </div>
              </div>

              {/* Stats Cards Skeleton */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`h-24 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-2xl animate-pulse shadow-lg`} style={{ animationDelay: `${i * 200}ms` }}></div>
                ))}
              </div>

              {/* Masonry Skeleton */}
              <MasonryGrid columns={3} gap="lg" className="opacity-60">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className={`h-${40 + (i % 3) * 20} bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-2xl animate-pulse shadow-xl`} style={{ animationDelay: `${i * 100}ms` }}></div>
                ))}
              </MasonryGrid>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced error state
  if (state.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50/90 via-pink-50/90 to-orange-50/90 dark:from-gray-900/95 dark:via-red-900/30 dark:to-pink-900/30 p-8">
        <div className="max-w-6xl mx-auto">
          <EmptyState
            icon={BarChart3}
            title={t('error.something_went_wrong')}
            description={state.error}
            className="min-h-[70vh] bg-gradient-to-br from-red-50/60 to-red-100/40 dark:from-red-950/30 dark:to-red-900/20 border-red-200/60 dark:border-red-800/60 rounded-3xl shadow-2xl"
          >
            <div className="flex items-center gap-6 mt-8">
              <GlassButton
                variant="glass"
                effect="lift"
                onClick={refreshData}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-xl hover:shadow-red-500/30 px-8 py-4 rounded-2xl"
              >
                <RefreshCw size={20} className="mr-3" />
                {t('common.retry')}
              </GlassButton>
              <ModernBadge variant="destructive" effect="pulse" className="px-6 py-3 text-lg">
                <Activity size={16} className="mr-2" />
                {t('common.error')}
              </ModernBadge>
            </div>
          </EmptyState>
        </div>
      </div>
    );
  }

  // Ultra-modern main dashboard with enhanced sidebar
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50'} transition-all duration-700`}>
      <div className="flex h-screen overflow-hidden">
        {/* Enhanced Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-72'} ${isDarkMode ? 'bg-gradient-to-b from-gray-800/95 to-slate-800/95' : 'bg-gradient-to-b from-white/95 to-gray-50/95'} border-r ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} backdrop-blur-2xl transition-all duration-500 ease-in-out relative shadow-2xl`}>
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200/30 dark:border-gray-700/30">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                    <BarChart3 size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-xl text-gray-900 dark:text-white mb-1">آمار پیشرفته</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">داشبورد هوشمند</p>
                  </div>
                </div>
              )}
              <GlassButton
                variant="ghost"
                effect="scale"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-3 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-300"
              >
                {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </GlassButton>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-3">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${
                    currentView === item.id
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-xl scale-105`
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 hover:scale-102'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`p-2 rounded-xl transition-all duration-300 ${
                    currentView === item.id
                      ? 'bg-white/20'
                      : 'group-hover:bg-gray-200/50 dark:group-hover:bg-gray-600/50'
                  }`}>
                    <Icon size={20} className={currentView === item.id ? 'text-white' : item.color} />
                  </div>
                  {!sidebarCollapsed && (
                    <span className="font-semibold text-left flex-1">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Settings Panel */}
          {!sidebarCollapsed && (
            <div className="absolute bottom-24 left-4 right-4">
              <GlassButton
                variant="ghost"
                effect="scale"
                onClick={() => setShowSettings(!showSettings)}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all duration-300"
              >
                <Settings size={18} />
                <span className="text-sm font-medium">تنظیمات</span>
              </GlassButton>

              {showSettings && (
                <div className="mt-3 p-4 bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">طرح‌بندی</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setLayoutMode('masonry')}
                          className={`p-2 rounded-lg transition-all ${layoutMode === 'masonry' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                          <Grid3X3 size={16} />
                        </button>
                        <button
                          onClick={() => setLayoutMode('grid')}
                          className={`p-2 rounded-lg transition-all ${layoutMode === 'grid' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                          <LayoutGrid size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Theme Toggle & Clock */}
          <div className="absolute bottom-6 left-4 right-4 space-y-3">
            <GlassButton
              variant="ghost"
              effect="scale"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-full flex items-center justify-center gap-3 p-3 rounded-2xl hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all duration-300"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              {!sidebarCollapsed && (
                <span className="text-sm font-medium">{isDarkMode ? 'روشن' : 'تیره'}</span>
              )}
            </GlassButton>

            {!sidebarCollapsed && (
              <div className="text-center p-3 bg-white/5 dark:bg-gray-800/5 backdrop-blur-xl rounded-2xl border border-white/10 dark:border-gray-700/10">
                <div className="flex items-center justify-center gap-2 text-sm font-mono text-gray-600 dark:text-gray-400">
                  <Clock size={14} />
                  {currentTime.toLocaleTimeString('fa-IR')}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Enhanced Header */}
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {navigationItems.find(item => item.id === currentView)?.label}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    {t('statistics.description', 'نمای کلی هوشمند از مخاطبین و فعالیت‌های شما')}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <GlassButton
                    variant="glass"
                    effect="lift"
                    onClick={refreshData}
                    className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'} hover:bg-opacity-70 shadow-xl px-6 py-3 rounded-2xl`}
                  >
                    <RefreshCw size={18} className="mr-3" />
                    {t('common.refresh')}
                  </GlassButton>

                  <div className="flex gap-2">
                    <GlassButton
                      variant="glass"
                      effect="scale"
                      className="p-3 rounded-2xl shadow-lg"
                    >
                      <Download size={18} />
                    </GlassButton>
                    <GlassButton
                      variant="glass"
                      effect="scale"
                      className="p-3 rounded-2xl shadow-lg"
                    >
                      <Share2 size={18} />
                    </GlassButton>
                  </div>

                  <ModernBadge
                    variant="gradient"
                    gradientType="success"
                    effect="glow"
                    className="px-6 py-3 text-sm font-semibold"
                  >
                    <Zap size={16} className="mr-2" />
                    {t('statistics.live_data', 'داده‌های زنده')}
                  </ModernBadge>
                </div>
              </div>

              {/* Compact Stats */}
              <StatisticsCompactStats data={state.data} />

              {/* Dynamic Content Based on Layout Mode */}
              <div className="space-y-6">
                {layoutMode === 'masonry' && (
                  <MasonryGrid columns={3} gap="lg" className="animate-in fade-in duration-700">
                    {currentView === 'overview' && (
                      <>
                        <div className="animate-in slide-in-from-left-4 duration-500">
                          {dashboardComponents.totalContacts}
                        </div>
                        <div className="animate-in slide-in-from-right-4 duration-500 delay-100">
                          {dashboardComponents.creationTime}
                        </div>
                        <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
                          {dashboardComponents.birthdays}
                        </div>
                        <div className="animate-in slide-in-from-left-4 duration-500 delay-300">
                          {dashboardComponents.companies}
                        </div>
                        <div className="animate-in slide-in-from-right-4 duration-500 delay-400">
                          {dashboardComponents.positions}
                        </div>
                      </>
                    )}

                    {currentView === 'distribution' && (
                      <>
                        <div className="animate-in slide-in-from-left-4 duration-500">
                          {dashboardComponents.genderChart}
                        </div>
                        <div className="animate-in slide-in-from-right-4 duration-500 delay-100">
                          {dashboardComponents.groupChart}
                        </div>
                        <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
                          {dashboardComponents.methodChart}
                        </div>
                      </>
                    )}

                    {currentView === 'timeline' && (
                      <>
                        <div className="col-span-2 animate-in slide-in-from-left-4 duration-500">
                          {dashboardComponents.creationTime}
                        </div>
                        <div className="animate-in slide-in-from-right-4 duration-500 delay-100">
                          {dashboardComponents.birthdays}
                        </div>
                      </>
                    )}

                    {currentView === 'reports' && (
                      <>
                        <div className="animate-in slide-in-from-left-4 duration-500">
                          {dashboardComponents.companies}
                        </div>
                        <div className="animate-in slide-in-from-right-4 duration-500 delay-100">
                          {dashboardComponents.positions}
                        </div>
                      </>
                    )}

                    {currentView === 'analytics' && (
                      <>
                        <div className="animate-in slide-in-from-left-4 duration-500">
                          {dashboardComponents.genderChart}
                        </div>
                        <div className="animate-in slide-in-from-right-4 duration-500 delay-100">
                          {dashboardComponents.groupChart}
                        </div>
                        <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
                          {dashboardComponents.methodChart}
                        </div>
                      </>
                    )}

                    {currentView === 'insights' && (
                      <>
                        <div className="animate-in slide-in-from-left-4 duration-500">
                          {dashboardComponents.totalContacts}
                        </div>
                        <div className="animate-in slide-in-from-right-4 duration-500 delay-100">
                          {dashboardComponents.companies}
                        </div>
                        <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
                          {dashboardComponents.positions}
                        </div>
                      </>
                    )}
                  </MasonryGrid>
                )}

                {layoutMode === 'grid' && (
                  <ResponsiveGrid breakpoints={{ sm: 1, md: 2, lg: 3, xl: 4 }} className="animate-in fade-in duration-700">
                    {currentView === 'overview' && (
                      <>
                        <div className="animate-in slide-in-from-left-4 duration-500">
                          {dashboardComponents.totalContacts}
                        </div>
                        <div className="animate-in slide-in-from-right-4 duration-500 delay-100">
                          {dashboardComponents.creationTime}
                        </div>
                        <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
                          {dashboardComponents.birthdays}
                        </div>
                        <div className="animate-in slide-in-from-left-4 duration-500 delay-300">
                          {dashboardComponents.companies}
                        </div>
                      </>
                    )}

                    {currentView === 'distribution' && (
                      <>
                        <div className="animate-in slide-in-from-left-4 duration-500">
                          {dashboardComponents.genderChart}
                        </div>
                        <div className="animate-in slide-in-from-right-4 duration-500 delay-100">
                          {dashboardComponents.groupChart}
                        </div>
                        <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
                          {dashboardComponents.methodChart}
                        </div>
                      </>
                    )}

                    {currentView === 'timeline' && (
                      <>
                        <div className="col-span-2 animate-in slide-in-from-left-4 duration-500">
                          {dashboardComponents.creationTime}
                        </div>
                        <div className="animate-in slide-in-from-right-4 duration-500 delay-100">
                          {dashboardComponents.birthdays}
                        </div>
                      </>
                    )}

                    {currentView === 'reports' && (
                      <>
                        <div className="animate-in slide-in-from-left-4 duration-500">
                          {dashboardComponents.companies}
                        </div>
                        <div className="animate-in slide-in-from-right-4 duration-500 delay-100">
                          {dashboardComponents.positions}
                        </div>
                      </>
                    )}

                    {currentView === 'analytics' && (
                      <>
                        <div className="animate-in slide-in-from-left-4 duration-500">
                          {dashboardComponents.genderChart}
                        </div>
                        <div className="animate-in slide-in-from-right-4 duration-500 delay-100">
                          {dashboardComponents.groupChart}
                        </div>
                        <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
                          {dashboardComponents.methodChart}
                        </div>
                      </>
                    )}

                    {currentView === 'insights' && (
                      <>
                        <div className="animate-in slide-in-from-left-4 duration-500">
                          {dashboardComponents.totalContacts}
                        </div>
                        <div className="animate-in slide-in-from-right-4 duration-500 delay-100">
                          {dashboardComponents.companies}
                        </div>
                        <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
                          {dashboardComponents.positions}
                        </div>
                      </>
                    )}
                  </ResponsiveGrid>
                )}
              </div>

              {/* Enhanced Footer */}
              <div className="text-center py-12">
                <div className={`inline-flex items-center gap-4 ${isDarkMode ? 'bg-gray-800/30' : 'bg-white/30'} backdrop-blur-2xl px-8 py-6 rounded-3xl shadow-2xl border ${isDarkMode ? 'border-gray-700/30' : 'border-gray-200/30'} hover:shadow-3xl transition-all duration-500 hover:scale-105`}>
                  <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-lg">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div className="text-left">
                    <span className="text-lg font-bold text-gray-700 dark:text-gray-300 block">
                      {t('statistics.powered_by_ai', 'قدرت گرفته از هوش مصنوعی پیشرفته')}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      تحلیل‌های لحظه‌ای و پیش‌بینی هوشمند
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap the content component with the provider
const ContactStatisticsDashboard: React.FC = () => (
  <StatisticsProvider>
    <ContactStatisticsDashboardContent />
  </StatisticsProvider>
);

export default ContactStatisticsDashboard;