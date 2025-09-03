import React, { useMemo, Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, BarChart3, PieChart, TrendingUp, Calendar, Award } from "lucide-react";

import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { ModernTabs, ModernTabsList, ModernTabsTrigger, ModernTabsContent } from "@/components/ui/modern-tabs";

import { StatisticsProvider } from "@/components/statistics/StatisticsContext";
import { useStatistics } from "@/components/statistics/useStatistics";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from '@/components/ai/DashboardLayout';
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
 * ContactStatisticsDashboard component for displaying contact analytics
 *
 * This component provides comprehensive statistics about contacts including:
 * - Total contacts count
 * - Gender distribution
 * - Group distribution
 * - Preferred contact method distribution
 * - Upcoming birthdays
 * - Contact creation timeline
 * - Top companies and positions
 *
 * Features:
 * - Performance optimized with React.memo and useMemo
 * - Cached data fetching to reduce API calls
 * - Error handling and retry functionality
 * - Responsive skeleton loading states
 * - Internationalization support
 * - Modern UI with glass effects and animations
 *
 * @returns JSX element representing the statistics dashboard
 */
const ContactStatisticsDashboardContent: React.FC = () => {
  const { state, refreshData } = useStatistics();
  const { t } = useTranslation();

  // Memoized skeleton component to prevent unnecessary re-renders
  const renderSkeleton = useMemo(() => [
    <ModernCard key="skeleton-1" variant="glass" className="rounded-xl p-4 flex flex-col items-center justify-center text-center min-h-[256px]">
      <ModernCardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4 mb-2" />
      </ModernCardHeader>
      <ModernCardContent>
        <Skeleton className="h-12 w-24" />
      </ModernCardContent>
    </ModernCard>,
    <ModernCard key="skeleton-2" variant="glass" className="rounded-xl p-4 min-h-[256px]">
      <ModernCardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4 mb-2" />
      </ModernCardHeader>
      <ModernCardContent className="h-64 flex items-center justify-center">
        <Skeleton className="h-full w-full rounded-full" />
      </ModernCardContent>
    </ModernCard>,
    <ModernCard key="skeleton-3" variant="glass" className="rounded-xl p-4 min-h-[256px]">
      <ModernCardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4 mb-2" />
      </ModernCardHeader>
      <ModernCardContent className="h-64 flex items-center justify-center">
        <Skeleton className="h-full w-full rounded-full" />
      </ModernCardContent>
    </ModernCard>,
    <ModernCard key="skeleton-4" variant="glass" className="rounded-xl p-4 min-h-[256px]">
      <ModernCardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4 mb-2" />
      </ModernCardHeader>
      <ModernCardContent className="h-64 flex items-center justify-center">
        <Skeleton className="h-full w-full rounded-full" />
      </ModernCardContent>
    </ModernCard>,
    <ModernCard key="skeleton-5" variant="glass" className="rounded-xl p-4 col-span-1 md:col-span-2 lg:col-span-1 min-h-[256px]">
      <ModernCardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4 mb-2" />
      </ModernCardHeader>
      <ModernCardContent className="h-64 overflow-y-auto custom-scrollbar space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </ModernCardContent>
    </ModernCard>,
    <ModernCard key="skeleton-6" variant="glass" className="rounded-xl p-4 col-span-1 md:col-span-2 min-h-[256px]">
      <ModernCardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4 mb-2" />
      </ModernCardHeader>
      <ModernCardContent className="h-64 flex items-center justify-center">
        <Skeleton className="h-full w-full" />
      </ModernCardContent>
    </ModernCard>,
    <ModernCard key="skeleton-7" variant="glass" className="rounded-xl p-4 col-span-1 min-h-[256px]">
      <ModernCardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4 mb-2" />
      </ModernCardHeader>
      <ModernCardContent className="h-64 overflow-y-auto custom-scrollbar space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </ModernCardContent>
    </ModernCard>,
    <ModernCard key="skeleton-8" variant="glass" className="rounded-xl p-4 col-span-1 min-h-[256px]">
      <ModernCardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4 mb-2" />
      </ModernCardHeader>
      <ModernCardContent className="h-64 overflow-y-auto custom-scrollbar space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </ModernCardContent>
    </ModernCard>
  ], []);

  // Memoized dashboard components to prevent unnecessary re-renders
  const dashboardComponents = useMemo(() => [
    <Suspense key="total" fallback={<Skeleton className="rounded-xl p-4 flex flex-col items-center justify-center text-center min-h-[256px]" />}>
      <TotalContactsCard count={state.data.totalContacts} />
    </Suspense>,
    <Suspense key="gender" fallback={<Skeleton className="rounded-xl p-4 min-h-[256px]" />}>
      <ContactsByGenderChart data={state.data.genderData} />
    </Suspense>,
    <Suspense key="group" fallback={<Skeleton className="rounded-xl p-4 min-h-[256px]" />}>
      <ContactsByGroupChart data={state.data.groupData} />
    </Suspense>,
    <Suspense key="method" fallback={<Skeleton className="rounded-xl p-4 min-h-[256px]" />}>
      <ContactsByPreferredMethodChart data={state.data.preferredMethodData} />
    </Suspense>,
    <Suspense key="birthdays" fallback={<Skeleton className="rounded-xl p-4 min-h-[256px]" />}>
      <UpcomingBirthdaysList data={state.data.upcomingBirthdays} />
    </Suspense>,
    <Suspense key="creation" fallback={<Skeleton className="rounded-xl p-4 col-span-1 md:col-span-2 min-h-[256px]" />}>
      <ContactsByCreationTimeChart data={state.data.creationTimeData} />
    </Suspense>,
    <Suspense key="companies" fallback={<Skeleton className="rounded-xl p-4 min-h-[256px]" />}>
      <TopCompaniesList data={state.data.topCompaniesData} />
    </Suspense>,
    <Suspense key="positions" fallback={<Skeleton className="rounded-xl p-4 min-h-[256px]" />}>
      <TopPositionsList data={state.data.topPositionsData} />
    </Suspense>
  ], [state.data]);

  if (state.loading) {
    return (
      <DashboardLayout
        title={t('statistics.title', 'آمار و تحلیل‌ها')}
        description={t('statistics.description', 'نمای کلی از مخاطبین و فعالیت‌های شما')}
        icon={<BarChart3 size={64} className="text-blue-600" />}
        showFooter={false}
      >
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderSkeleton}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={t('statistics.title', 'آمار و تحلیل‌ها')}
      description={t('statistics.description', 'نمای کلی از مخاطبین و فعالیت‌های شما')}
      icon={<BarChart3 size={64} className="text-blue-600" />}
      headerStats={<StatisticsCompactStats data={state.data} />}
      showFooter={false}
    >
      <ModernTabs defaultValue="overview" className="w-full">
        <ModernTabsList className="grid w-full grid-cols-4 mb-8 bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20">
          <ModernTabsTrigger
            value="overview"
            className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
          >
            <TrendingUp size={16} />
            <span className="hidden sm:inline">{t('statistics.overview', 'نمای کلی')}</span>
          </ModernTabsTrigger>
          <ModernTabsTrigger
            value="distribution"
            className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all duration-300"
          >
            <PieChart size={16} />
            <span className="hidden sm:inline">{t('statistics.distribution', 'توزیع')}</span>
          </ModernTabsTrigger>
          <ModernTabsTrigger
            value="timeline"
            className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300"
          >
            <Calendar size={16} />
            <span className="hidden sm:inline">{t('statistics.timeline', 'زمان‌بندی')}</span>
          </ModernTabsTrigger>
          <ModernTabsTrigger
            value="top"
            className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white transition-all duration-300"
          >
            <Award size={16} />
            <span className="hidden sm:inline">{t('statistics.top', 'برترین‌ها')}</span>
          </ModernTabsTrigger>
        </ModernTabsList>

        {/* Overview Tab */}
        <ModernTabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="animate-in fade-in slide-in-from-left-4" style={{ animationDelay: '100ms' }}>
              {dashboardComponents[0]}
            </div>
            <div className="animate-in fade-in slide-in-from-right-4" style={{ animationDelay: '200ms' }}>
              {dashboardComponents[5]}
            </div>
            <div className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '300ms' }}>
              {dashboardComponents[4]}
            </div>
          </div>
        </ModernTabsContent>

        {/* Distribution Tab */}
        <ModernTabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="animate-in fade-in slide-in-from-left-4" style={{ animationDelay: '100ms' }}>
              {dashboardComponents[1]}
            </div>
            <div className="animate-in fade-in slide-in-from-right-4" style={{ animationDelay: '200ms' }}>
              {dashboardComponents[2]}
            </div>
            <div className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '300ms' }}>
              {dashboardComponents[3]}
            </div>
          </div>
        </ModernTabsContent>

        {/* Timeline Tab */}
        <ModernTabsContent value="timeline" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="animate-in fade-in slide-in-from-left-4" style={{ animationDelay: '100ms' }}>
              {dashboardComponents[5]}
            </div>
            <div className="animate-in fade-in slide-in-from-right-4" style={{ animationDelay: '200ms' }}>
              {dashboardComponents[4]}
            </div>
          </div>
        </ModernTabsContent>

        {/* Top Tab */}
        <ModernTabsContent value="top" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="animate-in fade-in slide-in-from-left-4" style={{ animationDelay: '100ms' }}>
              {dashboardComponents[6]}
            </div>
            <div className="animate-in fade-in slide-in-from-right-4" style={{ animationDelay: '200ms' }}>
              {dashboardComponents[7]}
            </div>
          </div>
        </ModernTabsContent>
      </ModernTabs>

      {/* Error State */}
      {state.error && (
        <ModernCard
          variant="glass"
          className="rounded-2xl p-8 bg-gradient-to-br from-red-50/50 to-red-100/30 dark:from-red-950/20 dark:to-red-900/10 border border-red-200/50 dark:border-red-800/50 animate-in fade-in slide-in-from-bottom-4"
        >
          <ModernCardHeader>
            <ModernCardTitle className="text-red-600 dark:text-red-400 text-xl">
              {t('error.something_went_wrong')}
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <p className="text-muted-foreground mb-6 text-lg">{state.error}</p>
            <Button
              onClick={refreshData}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <RefreshCw className={`mr-2 h-5 w-5`} />
              {t('common.retry')}
            </Button>
          </ModernCardContent>
        </ModernCard>
      )}
    </DashboardLayout>
  );
};

// Wrap the content component with the provider
const ContactStatisticsDashboard: React.FC = () => (
  <StatisticsProvider>
    <ContactStatisticsDashboardContent />
  </StatisticsProvider>
);

export default ContactStatisticsDashboard;