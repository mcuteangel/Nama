import React, { useReducer, useEffect, useCallback } from 'react';
import { useSession } from "@/integrations/supabase/auth";
import { ContactStatisticsService } from "@/services/contact-statistics-service";
import { fetchWithCache } from "@/utils/cache-helpers";
import { ErrorManager } from "@/lib/error-manager";
import { useTranslation } from "react-i18next";
import {
  StatisticsData
} from "./types";
import { StatisticsContext, statisticsReducer, initialState } from './StatisticsContextOnly';

// Provider component
export const StatisticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(statisticsReducer, initialState);
  const { session, isLoading: isSessionLoading } = useSession();
  const { t } = useTranslation();

  const fetchData = useCallback(async () => {
    if (isSessionLoading || !session?.user) {
      dispatch({ type: 'RESET' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const userId = session.user.id;
      const cacheKey = `statistics_dashboard_${userId}`;

      const { data, fromCache } = await fetchWithCache<StatisticsData>(
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
            ContactStatisticsService.getTotalContacts(userId),
            ContactStatisticsService.getContactsByGender(userId),
            ContactStatisticsService.getContactsByGroup(userId),
            ContactStatisticsService.getContactsByPreferredMethod(userId),
            ContactStatisticsService.getUpcomingBirthdays(userId),
            ContactStatisticsService.getContactsByCreationMonth(userId),
            ContactStatisticsService.getTopCompanies(userId),
            ContactStatisticsService.getTopPositions(userId),
          ]);

          // Log individual errors but continue with available data
          const errors: string[] = [];
          if (totalError) errors.push(`Total Contacts: ${totalError}`);
          if (genderError) errors.push(`Gender Stats: ${genderError}`);
          if (groupError) errors.push(`Group Stats: ${groupError}`);
          if (methodError) errors.push(`Method Stats: ${methodError}`);
          if (birthdaysError) errors.push(`Birthdays: ${birthdaysError}`);
          if (creationTimeError) errors.push(`Creation Time: ${creationTimeError}`);
          if (companiesError) errors.push(`Companies: ${companiesError}`);
          if (errorPositions) errors.push(`Positions: ${errorPositions}`);

          // If critical data (total contacts) failed, throw error
          if (totalError) {
            throw new Error(`Failed to load total contacts: ${totalError}`);
          }

          // Log non-critical errors
          if (errors.length > 1) { // More than just total contacts error
            console.warn('Some statistics failed to load:', errors.slice(1));
            ErrorManager.logError(new Error('Partial statistics failure: ' + errors.slice(1).join('; ')), { component: 'StatisticsContext', action: 'fetchData' });
          }

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
        dispatch({ type: 'SET_DATA', payload: data });
        if (!fromCache) {
          ErrorManager.notifyUser(t('statistics.stats_loaded_success'), 'success');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('statistics.error_loading_stats');
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      ErrorManager.logError(error instanceof Error ? error : new Error(String(error)), { component: 'StatisticsContext', action: 'fetchData' });
      ErrorManager.notifyUser(errorMessage, 'error');
    }
  }, [session, isSessionLoading, t]);

  const refreshData = useCallback(async () => {
    if (session?.user) {
      const userId = session.user.id;
      const cacheKey = `statistics_dashboard_${userId}`;
      localStorage.removeItem(cacheKey);
      await fetchData();
    }
  }, [fetchData, session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <StatisticsContext.Provider value={{ state, fetchData, refreshData }}>
      {children}
    </StatisticsContext.Provider>
  );
};