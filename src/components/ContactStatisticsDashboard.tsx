import React, { useEffect, useState, useCallback } from "react";
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
import ContactsByCreationTimeChart from "@/components/statistics/ContactsByCreationTimeChart"; // New import
import TopCompaniesList from "@/components/statistics/TopCompaniesList"; // New import
import TopPositionsList from "@/components/statistics/TopPositionsList"; // New import
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { ContactService } from "@/services/contact-service";
import { useTranslation } from "react-i18next";
import { showLoading, dismissToast, showError } from "@/utils/toast";
import { fetchWithCache, invalidateCache } from "@/utils/cache-helpers"; // Import caching helpers

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

const ContactStatisticsDashboard: React.FC = () => {
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
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isFetchingRemote, setIsFetchingRemote] = useState(false);

  const onErrorStatistics = useCallback((error: Error) => {
    ErrorManager.logError(error, { component: 'ContactStatisticsDashboard', action: 'fetchStatistics' });
  }, []);

  const fetchStatistics = useCallback(async () => {
    if (isSessionLoading) {
      setIsLoadingInitial(true);
      return;
    }

    if (!session?.user) {
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
      setIsLoadingInitial(false);
      return;
    }

    const cacheKey = `statistics_dashboard_${session.user.id}`;
    
    setIsLoadingInitial(true);
    setIsFetchingRemote(true);

    const { data, error } = await fetchWithCache<StatisticsData>(
      cacheKey,
      async () => {
        const userId = session.user.id;
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
          ContactService.getTotalContacts(userId),
          ContactService.getContactsByGender(userId),
          ContactService.getContactsByGroup(userId),
          ContactService.getContactsByPreferredMethod(userId),
          ContactService.getUpcomingBirthdays(userId),
          ContactService.getContactsByCreationMonth(userId),
          ContactService.getTopCompanies(userId),
          ContactService.getTopPositions(userId),
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
      },
      {
        loadingMessage: t('statistics.loading_stats'),
        successMessage: t('statistics.stats_loaded_success'),
        errorMessage: t('statistics.error_loading_stats'),
      }
    );

    if (error) {
      console.error("Error fetching statistics:", error);
      // If there's an error and no cached data was returned, set to empty/null
      if (!data) {
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
      } else {
        setStatistics(data); // Use stale data if available on error
      }
    } else {
      setStatistics(data || statistics); // Use fetched data or current state if data is null
    }
    setIsLoadingInitial(false);
    setIsFetchingRemote(false);
  }, [session, isSessionLoading, t, onErrorStatistics, statistics]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const renderSkeleton = () => (
    <>
      <Card className="rounded-xl p-4 flex flex-col items-center justify-center text-center bg-white dark:bg-gray-800">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-3/4 mb-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-24" />
        </CardContent>
      </Card>
      <Card className="rounded-xl p-4 bg-white dark:bg-gray-800">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-3/4 mb-2" />
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <Skeleton className="h-full w-full rounded-full" />
        </CardContent>
      </Card>
      <Card className="rounded-xl p-4 bg-white dark:bg-gray-800">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-3/4 mb-2" />
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <Skeleton className="h-full w-full rounded-full" />
        </CardContent>
      </Card>
      <Card className="rounded-xl p-4 bg-white dark:bg-gray-800">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-3/4 mb-2" />
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <Skeleton className="h-full w-full rounded-full" />
        </CardContent>
      </Card>
      <Card className="rounded-xl p-4 col-span-1 md:col-span-2 lg:col-span-1 bg-white dark:bg-gray-800">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-3/4 mb-2" />
        </CardHeader>
        <CardContent className="h-64 overflow-y-auto custom-scrollbar space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </CardContent>
      </Card>
      <Card className="rounded-xl p-4 col-span-1 md:col-span-2 bg-white dark:bg-gray-800">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-3/4 mb-2" />
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
      <Card className="rounded-xl p-4 col-span-1 bg-white dark:bg-gray-800">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-3/4 mb-2" />
        </CardHeader>
        <CardContent className="h-64 overflow-y-auto custom-scrollbar space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </CardContent>
      </Card>
      <Card className="rounded-xl p-4 col-span-1 bg-white dark:bg-gray-800">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-3/4 mb-2" />
        </CardHeader>
        <CardContent className="h-64 overflow-y-auto custom-scrollbar space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </CardContent>
      </Card>
    </>
  );

  if (isLoadingInitial) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {renderSkeleton()}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <TotalContactsCard count={statistics.totalContacts} />
      <ContactsByGenderChart data={statistics.genderData} />
      <ContactsByGroupChart data={statistics.groupData} />
      <ContactsByPreferredMethodChart data={statistics.preferredMethodData} />
      <UpcomingBirthdaysList data={statistics.upcomingBirthdays} />
      <ContactsByCreationTimeChart data={statistics.creationTimeData} />
      <TopCompaniesList data={statistics.topCompaniesData} />
      <TopPositionsList data={statistics.topPositionsData} />
    </div>
  );
};

export default ContactStatisticsDashboard;