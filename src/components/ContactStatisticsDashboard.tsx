import React, { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/integrations/supabase/auth";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PieChart, CalendarClock, Building, Mail, Phone } from "lucide-react";
import TotalContactsCard from "@/components/statistics/TotalContactsCard";
import ContactsByGenderChart from "@/components/statistics/ContactsByGenderChart";
import ContactsByGroupChart from "@/components/statistics/ContactsByGroupChart";
import ContactsByPreferredMethodChart from "@/components/statistics/ContactsByPreferredMethodChart";
import UpcomingBirthdaysList from "@/components/statistics/UpcomingBirthdaysList";
import ContactsByCreationTimeChart from "@/components/statistics/ContactsByCreationTimeChart";
import TopCompaniesList from "@/components/statistics/TopCompaniesList";
import TopPositionsList from "@/components/statistics/TopPositionsList";
import { Skeleton } from "@/components/ui/skeleton";
import { ContactStatisticsService } from "@/services/contact-statistics-service"; // Updated import
import { ContactListService } from "@/services/contact-list-service"; // Added import for getFilteredContacts
import { useTranslation } from "react-i18next";
import { fetchWithCache } from "@/utils/cache-helpers";

interface GenderData {
  gender: string;
  count: number;
}

interface GroupData {
  name: string;
  color?: string;
  count: number;
}

interface PreferredMethodData {
  method: string;
  count: number;
}

interface BirthdayContact {
  id: string;
  first_name: string;
  last_name: string;
  birthday: string;
  days_until_birthday: number;
}

interface CreationTimeData {
  month_year: string;
  count: number;
}

interface CompanyData {
  company: string;
  count: number;
}

interface PositionData {
  position: string;
  count: number;
}

interface StatisticsData {
  totalContacts: number | null;
  genderData: GenderData[];
  groupData: GroupData[];
  preferredMethodData: PreferredMethodData[];
  upcomingBirthdays: BirthdayContact[];
  creationTimeData: CreationTimeData[];
  topCompaniesData: CompanyData[];
  topPositionsData: PositionData[];
}

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
const ContactStatisticsDashboard: React.FC = React.memo(() => {
  const { session, isLoading: isSessionLoading } = useSession();
  const { t } = useTranslation();

  const [statistics, setStatistics] = useState<StatisticsData>({
    totalContacts: null,
    genderData: [],
    groupData: [],
    preferredMethodData: [],
    upcomingBirthdays: [],
    creationTimeData: [],
    topCompaniesData: [],
    topPositionsData: [],
  });

  const onSuccessStats = useCallback((result: { data: StatisticsData | null; error: string | null; fromCache: boolean }) => {
    if (result && !result.fromCache) {
      ErrorManager.notifyUser(t('statistics.stats_loaded_success'), 'success');
    }
  }, [t]);

  const onErrorStats = useCallback((err) => {
    ErrorManager.logError(err, { component: 'ContactStatisticsDashboard', action: 'fetchStatistics' });
  }, []);

  const {
    isLoading, // This isLoading is from useErrorHandler
    executeAsync,
  } = useErrorHandler<{ data: StatisticsData | null; error: string | null; fromCache: boolean }>(null, { // Explicitly define TResult here
    maxRetries: 3,
    retryDelay: 1000,
    showToast: false, // Changed to false to manually control success toast
    customErrorMessage: t('statistics.error_loading_stats'),
    onSuccess: onSuccessStats,
    onError: onErrorStats,
  });

  const fetchStatistics = useCallback(async () => {
    if (isSessionLoading || !session?.user) {
      setStatistics({
        totalContacts: null,
        genderData: [],
        groupData: [],
        preferredMethodData: [],
        upcomingBirthdays: [],
        creationTimeData: [],
        topCompaniesData: [],
        topPositionsData: [],
      });
      return;
    }

    // Prevent re-fetching if a fetch is already in progress
    if (isLoading) {
      return;
    }

    const userId = session.user.id;
    const cacheKey = `statistics_dashboard_${userId}`;

    await executeAsync(async () => {
      const { data, error, fromCache } = await fetchWithCache<StatisticsData>(
        cacheKey,
        async () => {
          const [
            { data: totalData, error: totalError },
            { data: genderStats, error: genderError },
            { data: groupStats, error: groupError },
            { data: methodStats, error: methodError },
            { data: birthdaysData, error: birthdaysError },
            { data: creationTimeStats, error: creationTimeError },
            { data: companiesStats, error: companiesError },
            { data: positionsStats, error: errorPositions },
          ] = await Promise.all([
            ContactStatisticsService.getTotalContacts(userId), // Updated service call
            ContactStatisticsService.getContactsByGender(userId), // Updated service call
            ContactStatisticsService.getContactsByGroup(userId), // Updated service call
            ContactStatisticsService.getContactsByPreferredMethod(userId), // Updated service call
            ContactStatisticsService.getUpcomingBirthdays(userId), // Updated service call
            ContactStatisticsService.getContactsByCreationMonth(userId), // Updated service call
            ContactStatisticsService.getTopCompanies(userId), // Updated service call
            ContactStatisticsService.getTopPositions(userId), // Updated service call
          ]);

          if (totalError) throw new Error(totalError);
          if (genderError) throw new Error(genderError);
          if (groupError) throw new Error(groupError);
          if (methodError) throw new Error(methodError);
          if (birthdaysError) throw new Error(birthdaysError);
          if (creationTimeError) throw new Error(creationTimeError);
          if (companiesError) throw new Error(companiesError);
          if (errorPositions) throw new Error(errorPositions);

          return {
            data: {
              totalContacts: totalData,
              genderData: genderStats || [],
              groupData: groupStats || [],
              preferredMethodData: methodStats || [],
              upcomingBirthdays: birthdaysData || [],
              creationTimeData: creationTimeStats || [],
              topCompaniesData: companiesStats || [],
              topPositionsData: positionsStats || [],
            },
            error: null,
          };
        }
      );

      if (data) {
        setStatistics(data);
      }
      return { data, error: null, fromCache }; // Added error: null
    });
  }, [session, isSessionLoading, executeAsync, isLoading, t]); // Add isLoading to dependencies

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // Memoized skeleton component to prevent unnecessary re-renders
  const renderSkeleton = useMemo(() => [
    <Card key="skeleton-1" className="rounded-xl p-4 flex flex-col items-center justify-center text-center bg-white dark:bg-gray-800 min-h-[256px]">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4 mb-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-12 w-24" />
      </CardContent>
    </Card>,
    <Card key="skeleton-2" className="rounded-xl p-4 bg-white dark:bg-gray-800 min-h-[256px]">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4 mb-2" />
      </CardHeader>
      <CardContent className="h-64 flex items-center justify-center">
        <Skeleton className="h-full w-full rounded-full" />
      </CardContent>
    </Card>,
    <Card key="skeleton-3" className="rounded-xl p-4 bg-white dark:bg-gray-800 min-h-[256px]">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4 mb-2" />
      </CardHeader>
      <CardContent className="h-64 flex items-center justify-center">
        <Skeleton className="h-full w-full rounded-full" />
      </CardContent>
    </Card>,
    <Card key="skeleton-4" className="rounded-xl p-4 bg-white dark:bg-gray-800 min-h-[256px]">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4 mb-2" />
      </CardHeader>
      <CardContent className="h-64 flex items-center justify-center">
        <Skeleton className="h-full w-full rounded-full" />
      </CardContent>
    </Card>,
    <Card key="skeleton-5" className="rounded-xl p-4 col-span-1 md:col-span-2 lg:col-span-1 bg-white dark:bg-gray-800 min-h-[256px]">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4 mb-2" />
      </CardHeader>
      <CardContent className="h-64 overflow-y-auto custom-scrollbar space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </CardContent>
    </Card>,
    <Card key="skeleton-6" className="rounded-xl p-4 col-span-1 md:col-span-2 bg-white dark:bg-gray-800 min-h-[256px]">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4 mb-2" />
      </CardHeader>
      <CardContent className="h-64 flex items-center justify-center">
        <Skeleton className="h-full w-full" />
      </CardContent>
    </Card>,
    <Card key="skeleton-7" className="rounded-xl p-4 col-span-1 bg-white dark:bg-gray-800 min-h-[256px]">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4 mb-2" />
      </CardHeader>
      <CardContent className="h-64 overflow-y-auto custom-scrollbar space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </CardContent>
    </Card>,
    <Card key="skeleton-8" className="rounded-xl p-4 col-span-1 bg-white dark:bg-gray-800 min-h-[256px]">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4 mb-2" />
      </CardHeader>
      <CardContent className="h-64 overflow-y-auto custom-scrollbar space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </CardContent>
    </Card>
  ], []);

  // Memoized dashboard components to prevent unnecessary re-renders
  const dashboardComponents = useMemo(() => [
    <TotalContactsCard key="total" count={statistics.totalContacts} />,
    <ContactsByGenderChart key="gender" data={statistics.genderData} />,
    <ContactsByGroupChart key="group" data={statistics.groupData} />,
    <ContactsByPreferredMethodChart key="method" data={statistics.preferredMethodData} />,
    <UpcomingBirthdaysList key="birthdays" data={statistics.upcomingBirthdays} />,
    <ContactsByCreationTimeChart key="creation" data={statistics.creationTimeData} />,
    <TopCompaniesList key="companies" data={statistics.topCompaniesData} />,
    <TopPositionsList key="positions" data={statistics.topPositionsData} />
  ], [statistics]);

  if (isLoading || isSessionLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {renderSkeleton}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {dashboardComponents}
    </div>
  );
});

export default ContactStatisticsDashboard;