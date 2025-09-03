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
      const cacheKey = `statistics_dashboard_${userId}${state.dateRange.startDate ? `_from_${state.dateRange.startDate}_to_${state.dateRange.endDate}` : ''}`;

      const { data, fromCache } = await fetchWithCache<StatisticsData>(
        cacheKey,
        async () => {
          // Add date range parameters to all service calls
          const startDate = state.dateRange.startDate;
          const endDate = state.dateRange.endDate;
          
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
            ContactStatisticsService.getTotalContacts(userId, startDate, endDate),
            ContactStatisticsService.getContactsByGender(userId, startDate, endDate),
            ContactStatisticsService.getContactsByGroup(userId, startDate, endDate),
            ContactStatisticsService.getContactsByPreferredMethod(userId, startDate, endDate),
            ContactStatisticsService.getUpcomingBirthdays(userId, startDate, endDate),
            ContactStatisticsService.getContactsByCreationMonth(userId, startDate, endDate),
            ContactStatisticsService.getTopCompanies(userId, 5, startDate, endDate),
            ContactStatisticsService.getTopPositions(userId, 5, startDate, endDate),
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
  }, [session, isSessionLoading, t, state.dateRange]);

  const refreshData = useCallback(async () => {
    if (session?.user) {
      const userId = session.user.id;
      const cacheKey = `statistics_dashboard_${userId}${state.dateRange.startDate ? `_from_${state.dateRange.startDate}_to_${state.dateRange.endDate}` : ''}`;
      localStorage.removeItem(cacheKey);
      await fetchData();
    }
  }, [fetchData, session, state.dateRange]);

  const setDateRange = useCallback((startDate: string | null, endDate: string | null) => {
    dispatch({ type: 'SET_DATE_RANGE', payload: { startDate, endDate } });
  }, []);

  const fetchComparisonData = useCallback(async (startDate: string, endDate: string) => {
    if (isSessionLoading || !session?.user) {
      return;
    }

    try {
      const userId = session.user.id;
      
      const { data: previousData } = await fetchWithCache<StatisticsData>(
        `statistics_comparison_${userId}_from_${startDate}_to_${endDate}`,
        async () => {
          const [
            { data: totalData },
            { data: genderStats },
            { data: groupStats },
            { data: methodStats },
            { data: birthdaysData },
            { data: creationTimeStats },
            { data: companiesStats },
            { data: positionsStats },
          ] = await Promise.all([
            ContactStatisticsService.getTotalContacts(userId, startDate, endDate),
            ContactStatisticsService.getContactsByGender(userId, startDate, endDate),
            ContactStatisticsService.getContactsByGroup(userId, startDate, endDate),
            ContactStatisticsService.getContactsByPreferredMethod(userId, startDate, endDate),
            ContactStatisticsService.getUpcomingBirthdays(userId, startDate, endDate),
            ContactStatisticsService.getContactsByCreationMonth(userId, startDate, endDate),
            ContactStatisticsService.getTopCompanies(userId, 5, startDate, endDate),
            ContactStatisticsService.getTopPositions(userId, 5, startDate, endDate),
          ]);

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

      if (previousData) {
        dispatch({ type: 'SET_COMPARISON_DATA', payload: { previousData } });
      }
    } catch (error) {
      console.error('Failed to fetch comparison data:', error);
      ErrorManager.logError(error instanceof Error ? error : new Error(String(error)), { component: 'StatisticsContext', action: 'fetchComparisonData' });
    }
  }, [session, isSessionLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <StatisticsContext.Provider value={{ state, fetchData, refreshData, setDateRange, fetchComparisonData }}>
      {children}
    </StatisticsContext.Provider>
  );
};