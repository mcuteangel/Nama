import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";

import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";

import { useStatistics, StatisticsProvider } from "@/components/statistics/StatisticsContext";

import TotalContactsCard from "@/components/statistics/TotalContactsCard";
import ContactsByGenderChart from "@/components/statistics/ContactsByGenderChart";
import ContactsByGroupChart from "@/components/statistics/ContactsByGroupChart";
import ContactsByPreferredMethodChart from "@/components/statistics/ContactsByPreferredMethodChart";
import UpcomingBirthdaysList from "@/components/statistics/UpcomingBirthdaysList";
import ContactsByCreationTimeChart from "@/components/statistics/ContactsByCreationTimeChart";
import TopCompaniesList from "@/components/statistics/TopCompaniesList";
import TopPositionsList from "@/components/statistics/TopPositionsList";
import { Skeleton } from "@/components/ui/skeleton";

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
    <TotalContactsCard key="total" count={state.data.totalContacts} />,
    <ContactsByGenderChart key="gender" data={state.data.genderData} />,
    <ContactsByGroupChart key="group" data={state.data.groupData} />,
    <ContactsByPreferredMethodChart key="method" data={state.data.preferredMethodData} />,
    <UpcomingBirthdaysList key="birthdays" data={state.data.upcomingBirthdays} />,
    <ContactsByCreationTimeChart key="creation" data={state.data.creationTimeData} />,
    <TopCompaniesList key="companies" data={state.data.topCompaniesData} />,
    <TopPositionsList key="positions" data={state.data.topPositionsData} />
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('statistics.title')}</h1>
          <p className="text-muted-foreground">{t('statistics.description')}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshData}
          disabled={state.loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${state.loading ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </Button>
      </div>
      
      {state.error ? (
        <ModernCard variant="glass" className="rounded-xl p-6">
          <ModernCardHeader>
            <ModernCardTitle className="text-red-500">{t('error.something_went_wrong')}</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <p className="text-muted-foreground mb-4">{state.error}</p>
            <Button onClick={refreshData}>{t('common.retry')}</Button>
          </ModernCardContent>
        </ModernCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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