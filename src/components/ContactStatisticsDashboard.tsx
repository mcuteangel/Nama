import React, { useMemo, Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, BarChart3, PieChart, TrendingUp, Calendar, Award, Sparkles } from "lucide-react";

import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { ModernTabs, ModernTabsList, ModernTabsTrigger, ModernTabsContent } from "@/components/ui/modern-tabs";
import { ModernGrid, GridItem } from "@/components/ui/modern-grid";
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
 * Enhanced ContactStatisticsDashboard component for displaying contact analytics
 *
 * This component provides comprehensive statistics about contacts including:
 * - Total contacts count with modern visual design
 * - Gender, group, and preferred method distribution charts
 * - Upcoming birthdays and contact creation timeline
 * - Top companies and positions analytics
 * - Modern tabbed interface with glass morphism effects
 *
 * Features:
 * - Performance optimized with React.memo and useMemo
 * - Modern UI with enhanced glass effects and animations
 * - Responsive grid layout with staggered animations
 * - Comprehensive error handling and loading states
 * - Internationalization support with RTL compatibility
 * - Advanced visual hierarchy and micro-interactions
 *
 * @returns JSX element representing the enhanced statistics dashboard
 */
const ContactStatisticsDashboardContent: React.FC = () => {
  const { state, refreshData } = useStatistics();
  const { t } = useTranslation();

  // Memoized loading skeleton with modern design
  const renderModernSkeleton = useMemo(() => (
    <ModernGrid variant="dynamic" gap="lg" minWidth="320px" className="opacity-60">
      {Array.from({ length: 8 }).map((_, i) => (
        <GridItem key={`skeleton-${i}`}>
          <ModernCard 
            variant="glass" 
            className="h-64 animate-pulse bg-gradient-to-br from-muted/30 to-muted/10"
          >
            <ModernCardHeader className="pb-4">
              <div className="h-6 bg-muted/50 rounded-lg w-3/4 mb-2" />
            </ModernCardHeader>
            <ModernCardContent className="h-48 flex items-center justify-center">
              <ModernLoader variant="spinner" size="lg" color="primary" />
            </ModernCardContent>
          </ModernCard>
        </GridItem>
      ))}
    </ModernGrid>
  ), []);

  // Memoized dashboard components with enhanced error boundaries
  const dashboardComponents = useMemo(() => ({
    totalContacts: (
      <Suspense fallback={<ModernLoader variant="ring" size="lg" color="primary" />}>
        <TotalContactsCard count={state.data.totalContacts} />
      </Suspense>
    ),
    genderChart: (
      <Suspense fallback={<ModernLoader variant="ring" size="lg" color="secondary" />}>
        <ContactsByGenderChart data={state.data.genderData} />
      </Suspense>
    ),
    groupChart: (
      <Suspense fallback={<ModernLoader variant="ring" size="lg" color="accent" />}>
        <ContactsByGroupChart data={state.data.groupData} />
      </Suspense>
    ),
    methodChart: (
      <Suspense fallback={<ModernLoader variant="ring" size="lg" color="muted" />}>
        <ContactsByPreferredMethodChart data={state.data.preferredMethodData} />
      </Suspense>
    ),
    birthdays: (
      <Suspense fallback={<ModernLoader variant="dots" size="lg" color="primary" />}>
        <UpcomingBirthdaysList data={state.data.upcomingBirthdays} />
      </Suspense>
    ),
    creationTime: (
      <Suspense fallback={<ModernLoader variant="bars" size="lg" color="secondary" />}>
        <ContactsByCreationTimeChart data={state.data.creationTimeData} />
      </Suspense>
    ),
    companies: (
      <Suspense fallback={<ModernLoader variant="pulse" size="lg" color="accent" />}>
        <TopCompaniesList data={state.data.topCompaniesData} />
      </Suspense>
    ),
    positions: (
      <Suspense fallback={<ModernLoader variant="pulse" size="lg" color="muted" />}>
        <TopPositionsList data={state.data.topPositionsData} />
      </Suspense>
    )
  }), [state.data]);

  // Loading state with enhanced design
  if (state.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-pink-50/80 dark:from-gray-900/90 dark:via-purple-900/30 dark:to-pink-900/30 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Enhanced loading header */}
          <div className="text-center py-12 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl"></div>
            <div className="relative">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <BarChart3 size={72} className="text-blue-600 animate-pulse" />
                  <Sparkles size={28} className="absolute -top-3 -right-3 text-yellow-500 animate-bounce" />
                </div>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                {t('statistics.title', 'آمار و تحلیل‌ها')}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
                {t('statistics.description', 'نمای کلی از مخاطبین و فعالیت‌های شما')}
              </p>
              <div className="flex items-center justify-center gap-4 mb-6">
                <ModernLoader variant="dots" size="md" color="primary" />
                <span className="text-muted-foreground">{t('common.loading')}</span>
              </div>
            </div>
          </div>

          {/* Compact stats loading */}
          <div className="px-4">
            <StatisticsCompactStats data={{
              totalContacts: 0,
              genderData: [],
              groupData: [],
              preferredMethodData: [],
              upcomingBirthdays: [],
              creationTimeData: [],
              topCompaniesData: [],
              topPositionsData: []
            }} />
          </div>

          {/* Loading skeleton */}
          {renderModernSkeleton}
        </div>
      </div>
    );
  }

  // Error state with enhanced design
  if (state.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50/80 via-pink-50/80 to-orange-50/80 dark:from-gray-900/90 dark:via-red-900/30 dark:to-pink-900/30 p-6">
        <div className="max-w-4xl mx-auto">
          <EmptyState
            icon={BarChart3}
            title={t('error.something_went_wrong')}
            description={state.error}
            className="min-h-[60vh] bg-gradient-to-br from-red-50/50 to-red-100/30 dark:from-red-950/20 dark:to-red-900/10 border-red-200/50 dark:border-red-800/50"
          >
            <div className="flex items-center gap-4 mt-6">
              <GlassButton
                variant="glass"
                effect="lift"
                onClick={refreshData}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
              >
                <RefreshCw size={16} className="mr-2" />
                {t('common.retry')}
              </GlassButton>
              <ModernBadge variant="destructive" effect="pulse">
                {t('common.error')}
              </ModernBadge>
            </div>
          </EmptyState>
        </div>
      </div>
    );
  }

  // Main dashboard content with enhanced design
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-pink-50/80 dark:from-gray-900/90 dark:via-purple-900/30 dark:to-pink-900/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Enhanced header with modern design */}
        <div className="text-center py-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <BarChart3 size={72} className="text-blue-600" />
                <Sparkles size={28} className="absolute -top-3 -right-3 text-yellow-500 animate-pulse" />
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              {t('statistics.title', 'آمار و تحلیل‌ها')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              {t('statistics.description', 'نمای کلی از مخاطبین و فعالیت‌های شما')}
            </p>
            
            {/* Action buttons with modern design */}
            <div className="flex items-center justify-center gap-4">
              <GlassButton
                variant="glass"
                effect="lift"
                onClick={refreshData}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30"
              >
                <RefreshCw size={16} className="mr-2" />
                {t('common.refresh')}
              </GlassButton>
              
              <ModernBadge 
                variant="gradient" 
                gradientType="success" 
                effect="glow"
                className="px-4 py-2"
              >
                <TrendingUp size={14} className="mr-1" />
                {t('statistics.live_data', 'داده‌های زنده')}
              </ModernBadge>
            </div>
          </div>
        </div>

        {/* Enhanced compact stats */}
        <div className="px-4">
          <StatisticsCompactStats data={state.data} />
        </div>

        {/* Main content with enhanced tabbed interface */}
        <ModernCard variant="glass" hover="lift" className="backdrop-blur-xl border border-white/30">
          <ModernCardContent className="p-8">
            <ModernTabs defaultValue="overview" className="w-full">
              <ModernTabsList 
                className="grid w-full grid-cols-4 mb-8 bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20"
                glassEffect="medium"
                hoverEffect="lift"
              >
                <ModernTabsTrigger
                  value="overview"
                  className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
                  hoverEffect="scale"
                >
                  <TrendingUp size={16} />
                  <span className="hidden sm:inline">{t('statistics.overview', 'نمای کلی')}</span>
                </ModernTabsTrigger>
                <ModernTabsTrigger
                  value="distribution"
                  className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all duration-300"
                  hoverEffect="scale"
                >
                  <PieChart size={16} />
                  <span className="hidden sm:inline">{t('statistics.distribution', 'توزیع')}</span>
                </ModernTabsTrigger>
                <ModernTabsTrigger
                  value="timeline"
                  className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300"
                  hoverEffect="scale"
                >
                  <Calendar size={16} />
                  <span className="hidden sm:inline">{t('statistics.timeline', 'زمان‌بندی')}</span>
                </ModernTabsTrigger>
                <ModernTabsTrigger
                  value="top"
                  className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white transition-all duration-300"
                  hoverEffect="scale"
                >
                  <Award size={16} />
                  <span className="hidden sm:inline">{t('statistics.top', 'برترین‌ها')}</span>
                </ModernTabsTrigger>
              </ModernTabsList>

              {/* Overview Tab with enhanced grid */}
              <ModernTabsContent value="overview" className="space-y-8">
                <ModernGrid variant="dynamic" gap="lg" minWidth="320px">
                  <GridItem>
                    <div className="animate-in fade-in slide-in-from-left-4" style={{ animationDelay: '100ms' }}>
                      {dashboardComponents.totalContacts}
                    </div>
                  </GridItem>
                  <GridItem>
                    <div className="animate-in fade-in slide-in-from-right-4" style={{ animationDelay: '200ms' }}>
                      {dashboardComponents.creationTime}
                    </div>
                  </GridItem>
                  <GridItem>
                    <div className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '300ms' }}>
                      {dashboardComponents.birthdays}
                    </div>
                  </GridItem>
                </ModernGrid>
              </ModernTabsContent>

              {/* Distribution Tab with enhanced grid */}
              <ModernTabsContent value="distribution" className="space-y-8">
                <ModernGrid variant="dynamic" gap="lg" minWidth="320px">
                  <GridItem>
                    <div className="animate-in fade-in slide-in-from-left-4" style={{ animationDelay: '100ms' }}>
                      {dashboardComponents.genderChart}
                    </div>
                  </GridItem>
                  <GridItem>
                    <div className="animate-in fade-in slide-in-from-right-4" style={{ animationDelay: '200ms' }}>
                      {dashboardComponents.groupChart}
                    </div>
                  </GridItem>
                  <GridItem>
                    <div className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '300ms' }}>
                      {dashboardComponents.methodChart}
                    </div>
                  </GridItem>
                </ModernGrid>
              </ModernTabsContent>

              {/* Timeline Tab with enhanced layout */}
              <ModernTabsContent value="timeline" className="space-y-8">
                <ModernGrid variant="dynamic" gap="lg" minWidth="400px">
                  <GridItem colSpan={2}>
                    <div className="animate-in fade-in slide-in-from-left-4" style={{ animationDelay: '100ms' }}>
                      {dashboardComponents.creationTime}
                    </div>
                  </GridItem>
                  <GridItem>
                    <div className="animate-in fade-in slide-in-from-right-4" style={{ animationDelay: '200ms' }}>
                      {dashboardComponents.birthdays}
                    </div>
                  </GridItem>
                </ModernGrid>
              </ModernTabsContent>

              {/* Top Tab with enhanced layout */}
              <ModernTabsContent value="top" className="space-y-8">
                <ModernGrid variant="dynamic" gap="lg" minWidth="320px">
                  <GridItem>
                    <div className="animate-in fade-in slide-in-from-left-4" style={{ animationDelay: '100ms' }}>
                      {dashboardComponents.companies}
                    </div>
                  </GridItem>
                  <GridItem>
                    <div className="animate-in fade-in slide-in-from-right-4" style={{ animationDelay: '200ms' }}>
                      {dashboardComponents.positions}
                    </div>
                  </GridItem>
                </ModernGrid>
              </ModernTabsContent>
            </ModernTabs>
          </ModernCardContent>
        </ModernCard>

        {/* Enhanced footer with AI branding */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl px-6 py-3 rounded-full shadow-lg border border-white/20">
            <Sparkles size={16} className="text-yellow-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('statistics.powered_by_ai', 'قدرت گرفته از هوش مصنوعی پیشرفته')}
            </span>
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