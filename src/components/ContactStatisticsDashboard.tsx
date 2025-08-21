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
import { ContactService } from "@/services/contact-service";
import { useTranslation } from "react-i18next";
import { showLoading, dismissToast, showError } from "@/utils/toast"; // Import toast utilities

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

interface StatisticsCache {
  timestamp: number;
  totalContacts: number | null;
  genderData: GenderData[];
  groupData: GroupData[];
  preferredMethodData: PreferredMethodData[];
}

const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

const ContactStatisticsDashboard: React.FC = () => {
  const { session, isLoading: isSessionLoading } = useSession();
  const { t } = useTranslation();

  const [totalContacts, setTotalContacts] = useState<number | null>(null);
  const [genderData, setGenderData] = useState<GenderData[]>([]);
  const [groupData, setGroupData] = useState<GroupData[]>([]);
  const [preferredMethodData, setPreferredMethodData] = useState<PreferredMethodData[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true); // For initial load, before any data (cached or fresh)
  const [isFetchingRemote, setIsFetchingRemote] = useState(false); // For background revalidation

  const {
    executeAsync,
  } = useErrorHandler(null, {
    showToast: false, // Toasts handled manually for caching logic
    customErrorMessage: t('statistics.error_loading_stats'),
    onError: (error) => {
      ErrorManager.logError(error, { component: 'ContactStatisticsDashboard', action: 'fetchStatistics' });
    }
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
          setIsLoadingInitial(false);
          setIsFetchingRemote(false); // No need to fetch remotely if cache is fresh
          return; // Exit early if cache is fresh
        } else {
          // Cache is stale, use it but revalidate in background
          setTotalContacts(cachedData.totalContacts);
          setGenderData(cachedData.genderData);
          setGroupData(cachedData.groupData);
          setPreferredMethodData(cachedData.preferredMethodData);
          setIsLoadingInitial(false);
          // Proceed to fetch remotely in background
        }
      } catch (e) {
        console.error("Failed to parse cached statistics:", e);
        localStorage.removeItem(cacheKey); // Clear corrupted cache
      }
    }

    // If no fresh cache, or cache is stale and we need to revalidate
    let toastId: string | number | undefined;
    if (showLoadingToast && (!cachedData || !cachedData.totalContacts)) { // Only show loading if no data at all
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
      ] = await Promise.all([
        ContactService.getTotalContacts(userId),
        ContactService.getContactsByGender(userId),
        ContactService.getContactsByGroup(userId),
        ContactService.getContactsByPreferredMethod(userId),
      ]);

      if (totalError) throw new Error(totalError);
      if (genderError) throw new Error(genderError);
      if (groupError) throw new Error(groupError);
      if (methodError) throw new Error(methodError);

      setTotalContacts(totalData);
      setGenderData(genderStats || []);
      setGroupData(groupStats || []);
      setPreferredMethodData(methodStats || []);

      const newCache: StatisticsCache = {
        timestamp: Date.now(),
        totalContacts: totalData,
        genderData: genderStats || [],
        groupData: groupStats || [],
        preferredMethodData: methodStats || [],
      };
      localStorage.setItem(cacheKey, JSON.stringify(newCache));

      if (toastId) dismissToast(toastId);
      if (showLoadingToast) ErrorManager.notifyUser(t('statistics.stats_loaded_success'), 'success');
    } catch (error: any) {
      console.error("Error fetching statistics from Supabase:", error);
      if (toastId) dismissToast(toastId);
      ErrorManager.notifyUser(`${t('statistics.error_loading_stats')}: ${error.message || t('common.unknown_error')}`, 'error');
      // If fetching fails and no cached data was available, clear states
      if (!cachedData) {
        setTotalContacts(null);
        setGenderData([]);
        setGroupData([]);
        setPreferredMethodData([]);
      }
    } finally {
      setIsLoadingInitial(false);
      setIsFetchingRemote(false);
    }
  }, [session, isSessionLoading, executeAsync, t]);

  useEffect(() => {
    fetchStatistics(true); // Show loading toast for initial fetch
  }, [fetchStatistics]);

  if (isLoadingInitial) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        {t('statistics.loading_stats')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <TotalContactsCard count={totalContacts} />
      <ContactsByGenderChart data={genderData} />
      <ContactsByGroupChart data={groupData} />
      <ContactsByPreferredMethodChart data={preferredMethodData} />
      {/* UpcomingBirthdaysList component removed */}
      {/* Add more statistics components here */}
    </div>
  );
};

export default ContactStatisticsDashboard;