import React, { useMemo, Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";

import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";

import { useStatistics, StatisticsProvider } from "@/components/statistics/StatisticsContext";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{t('statistics.title')}</h1>
          <Button variant="outline" size="sm" disabled>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            {t('common.loading')}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderSkeleton}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
            {t('statistics.title')}
          </h1>
          <p className="text-muted-foreground text-lg">{t('statistics.description')}</p>
        </div>
        <Button
          variant="outline"
          size="lg"
          onClick={refreshData}
          disabled={state.loading}
          className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:scale-105 bg-gradient-to-r from-background to-background/80 border-border/50"
        >
          <RefreshCw className={`mr-2 h-5 w-5 ${state.loading ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </Button>
      </div>
      
      {state.error ? (
        <ModernCard
          variant="glass"
          className="rounded-2xl p-8 bg-gradient-to-br from-red-50/50 to-red-100/30 dark:from-red-950/20 dark:to-red-900/10 border border-red-200/50 dark:border-red-800/50"
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
              {t('common.retry')}
            </Button>
          </ModernCardContent>
        </ModernCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {dashboardComponents}
        </div>
      )}
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