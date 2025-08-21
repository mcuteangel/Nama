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

interface StatisticsCache {
  timestamp: number;
  totalContacts: number | null;
  genderData: GenderData[];
  groupData: GroupData[];
  preferredMethodData: PreferredMethodData[];
  upcomingBirthdays: BirthdayContact[];
  creationTimeData: CreationTimeData[]; // Add to cache interface
  topCompaniesData: CompanyData[]; // Add to cache interface
  topPositionsData: PositionData[]; // Add to cache interface
}

const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

const ContactStatisticsDashboard: React.FC = () => {
  const { session, isLoading: isSessionLoading } = useSession();
  const { t } = useTranslation();

  const [totalContacts, setTotalContacts] = useState<number | null>(null);
  const [genderData, setGenderData] = useState<GenderData[]>([]);
  const [groupData, setGroupData] = useState<GroupData[]>([]);
  const [preferredMethodData, setPreferredMethodData] = useState<PreferredMethodData[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<BirthdayContact[]>([]);
  const [creationTimeData, setCreationTimeData] = useState<CreationTimeData[]>([]); // New state
  const [topCompaniesData, setTopCompaniesData] = useState<CompanyData[]>([]); // New state
  const [topPositionsData, setTopPositionsData] = useState<PositionData[]>([]); // New state

  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isFetchingRemote, setIsFetchingRemote] = useState(false);

  const onErrorStatistics = useCallback((error: Error) => { // Wrapped in useCallback
    ErrorManager.logError(error, { component: 'ContactStatisticsDashboard', action: 'fetchStatistics' });
  }, []);

  const {
    executeAsync,
  } = useErrorHandler(null, {
    showToast: false,
    customErrorMessage: t('statistics.error_loading_stats'),
    onError: onErrorStatistics, // Use the memoized callback
  });

  const fetchStatistics = useCallback(async (showLoadingToast: boolean = true) => {
    if (isSessionLoading) {
      setIsLoadingInitial(true);
      return;
    }

    if (!session?.user) {
      setTotalContacts(null);
      setGenderData([]);
      setGroupData([]);
      setPreferredMethodData([]);
      setUpcomingBirthdays([]);
      setCreationTimeData([]);
      setTopCompaniesData([]);
      setTopPositionsData([]);
      setIsLoadingInitial(false);
      return;
    }

    const cacheKey = `statistics_cache_${session.user.id}`;
    const cachedDataString = localStorage.getItem(cacheKey);
    let cachedData: StatisticsCache | null = null;

    if (cachedDataString) {
      try {
        cachedData = JSON.parse(cachedDataString);
        const now = Date.now();
        const isCacheFresh = (now - cachedData.timestamp) < CACHE_EXPIRATION_TIME;

        if (isCacheFresh) {
          setTotalContacts(cachedData.totalContacts);
          setGenderData(cachedData.genderData);
          setGroupData(cachedData.groupData);
          setPreferredMethodData(cachedData.preferredMethodData);
          setUpcomingBirthdays(cachedData.upcomingBirthdays);
          setCreationTimeData(cachedData.creationTimeData);
          setTopCompaniesData(cachedData.topCompaniesData);
          setTopPositionsData(cachedData.topPositionsData);
          setIsLoadingInitial(false);
          setIsFetchingRemote(false);
          return;
        } else {
          setTotalContacts(cachedData.totalContacts);
          setGenderData(cachedData.genderData);
          setGroupData(cachedData.groupData);
          setPreferredMethodData(cachedData.preferredMethodData);
          setUpcomingBirthdays(cachedData.upcomingBirthdays);
          setCreationTimeData(cachedData.creationTimeData);
          setTopCompaniesData(cachedData.topCompaniesData);
          setTopPositionsData(cachedData.topPositionsData);
          setIsLoadingInitial(false);
        }
      } catch (e) {
        console.error("Failed to parse cached statistics:", e);
        localStorage.removeItem(cacheKey);
      }
    }

    let toastId: string | number | undefined;
    if (showLoadingToast && (!cachedData || !cachedData.totalContacts)) {
      toastId = showLoading(t('statistics.loading_stats'));
    }
    
    setIsFetchingRemote(true);

    try {
      const userId = session.user.id;

      const [
        { data: totalData, error: totalError },
        { data: genderStats, error: genderError },
        { data: groupStats, error: groupError },
        { data: methodStats, error: methodError },
        { data: birthdaysData, error: birthdaysError },
        { data: creationTimeStats, error: creationTimeError }, // Fetch creation time stats
        { data: companiesStats, error: companiesError }, // Fetch top companies
        { data: positionsStats, error: positionsError }, // Fetch top positions
      ] = await Promise.all([
        ContactService.getTotalContacts(userId),
        ContactService.getContactsByGender(userId),
        ContactService.getContactsByGroup(userId),
        ContactService.getContactsByPreferredMethod(userId),
        ContactService.getUpcomingBirthdays(userId),
        ContactService.getContactsByCreationMonth(userId), // Call new service function
        ContactService.getTopCompanies(userId), // Call new service function
        ContactService.getTopPositions(userId), // Call new service function
      ]);

      if (totalError) throw new Error(totalError);
      if (genderError) throw new Error(genderError);
      if (groupError) throw new Error(groupError);
      if (methodError) throw new Error(methodError);
      if (birthdaysError) throw new Error(birthdaysError);
      if (creationTimeError) throw new Error(creationTimeError); // Handle error
      if (companiesError) throw new Error(companiesError); // Handle error
      if (positionsError) throw new Error(positionsError); // Handle error

      setTotalContacts(totalData);
      setGenderData(genderStats || []);
      setGroupData(groupStats || []);
      setPreferredMethodData(methodStats || []);
      setUpcomingBirthdays(birthdaysData || []);
      setCreationTimeData(creationTimeStats || []); // Set new state
      setTopCompaniesData(companiesStats || []); // Set new state
      setTopPositionsData(positionsStats || []); // Set new state

      const newCache: StatisticsCache = {
        timestamp: Date.now(),
        totalContacts: totalData,
        genderData: genderStats || [],
        groupData: groupStats || [],
        preferredMethodData: methodStats || [],
        upcomingBirthdays: birthdaysData || [],
        creationTimeData: creationTimeStats || [], // Add to new cache
        topCompaniesData: companiesStats || [], // Add to new cache
        topPositionsData: positionsStats || [], // Add to new cache
      };
      localStorage.setItem(cacheKey, JSON.stringify(newCache));

      if (toastId) dismissToast(toastId);
      if (showLoadingToast) ErrorManager.notifyUser(t('statistics.stats_loaded_success'), 'success');
    } catch (error: any) {
      console.error("Error fetching statistics from Supabase:", error);
      if (toastId) dismissToast(toastId);
      ErrorManager.notifyUser(`${t('statistics.error_loading_stats')}: ${error.message || t('common.unknown_error')}`, 'error');
      if (!cachedData) {
        setTotalContacts(null);
        setGenderData([]);
        setGroupData([]);
        setPreferredMethodData([]);
        setUpcomingBirthdays([]);
        setCreationTimeData([]);
        setTopCompaniesData([]);
        setTopPositionsData([]);
      }
    } finally {
      setIsLoadingInitial(false);
      setIsFetchingRemote(false);
    }
  }, [session, isSessionLoading, executeAsync, t, onErrorStatistics]); // Added onErrorStatistics to dependencies

  useEffect(() => {
    fetchStatistics(true);
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
      <TotalContactsCard count={totalContacts} />
      <ContactsByGenderChart data={genderData} />
      <ContactsByGroupChart data={groupData} />
      <ContactsByPreferredMethodChart data={preferredMethodData} />
      <UpcomingBirthdaysList data={upcomingBirthdays} />
      <ContactsByCreationTimeChart data={creationTimeData} />
      <TopCompaniesList data={topCompaniesData} />
      <TopPositionsList data={topPositionsData} />
    </div>
  );
};

export default ContactStatisticsDashboard;