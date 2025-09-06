import React, { useReducer, useEffect, useCallback, useMemo } from 'react';
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

  // Optimized data fetching with better error handling and caching
  const fetchData = useCallback(async () => {
    if (isSessionLoading || !session?.user) {
      dispatch({ type: 'RESET' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const userId = session.user.id;
      const cacheKey = `statistics_dashboard_${userId}${state.dateRange.startDate ? `_from_${state.dateRange.startDate}_to_${state.dateRange.endDate}` : ''}`;

      const result = await fetchWithCache<StatisticsData>(
        cacheKey,
        async () => {
          try {
            // Add date range parameters to all service calls
            const startDate = state.dateRange.startDate;
            const endDate = state.dateRange.endDate;
            
            // Fetch all statistics in parallel for better performance
            const [
              totalResult,
              genderResult,
              groupResult,
              methodResult,
              birthdaysResult,
              creationTimeResult,
              companiesResult,
              positionsResult,
            ] = await Promise.allSettled([
              ContactStatisticsService.getTotalContacts(userId, startDate, endDate),
              ContactStatisticsService.getContactsByGender(userId, startDate, endDate),
              ContactStatisticsService.getContactsByGroup(userId, startDate, endDate),
              ContactStatisticsService.getContactsByPreferredMethod(userId, startDate, endDate),
              ContactStatisticsService.getUpcomingBirthdays(userId, startDate, endDate),
              ContactStatisticsService.getContactsByCreationMonth(userId, startDate, endDate),
              ContactStatisticsService.getTopCompanies(userId, 5, startDate, endDate),
              ContactStatisticsService.getTopPositions(userId, 5, startDate, endDate),
            ]);

            // Process results with proper error handling
            const totalData = totalResult.status === 'fulfilled' ? totalResult.value.data : null;
            const totalError = totalResult.status === 'rejected' ? totalResult.reason : null;
            
            const genderData = genderResult.status === 'fulfilled' ? genderResult.value.data || [] : [];
            const genderError = genderResult.status === 'rejected' ? genderResult.reason : null;
            
            const groupData = groupResult.status === 'fulfilled' ? groupResult.value.data || [] : [];
            const groupError = groupResult.status === 'rejected' ? groupResult.reason : null;
            
            const methodData = methodResult.status === 'fulfilled' ? methodResult.value.data || [] : [];
            const methodError = methodResult.status === 'rejected' ? methodResult.reason : null;
            
            const birthdaysData = birthdaysResult.status === 'fulfilled' ? birthdaysResult.value.data || [] : [];
            const birthdaysError = birthdaysResult.status === 'rejected' ? birthdaysResult.reason : null;
            
            const creationTimeData = creationTimeResult.status === 'fulfilled' ? creationTimeResult.value.data || [] : [];
            const creationTimeError = creationTimeResult.status === 'rejected' ? creationTimeResult.reason : null;
            
            const companiesData = companiesResult.status === 'fulfilled' ? companiesResult.value.data || [] : [];
            const companiesError = companiesResult.status === 'rejected' ? companiesResult.reason : null;
            
            const positionsData = positionsResult.status === 'fulfilled' ? positionsResult.value.data || [] : [];
            const positionsError = positionsResult.status === 'rejected' ? positionsResult.reason : null;

            // Log individual errors but continue with available data
            const errors: string[] = [];
            if (totalError) errors.push(`Total Contacts: ${totalError}`);
            if (genderError) errors.push(`Gender Stats: ${genderError}`);
            if (groupError) errors.push(`Group Stats: ${groupError}`);
            if (methodError) errors.push(`Method Stats: ${methodError}`);
            if (birthdaysError) errors.push(`Birthdays: ${birthdaysError}`);
            if (creationTimeError) errors.push(`Creation Time: ${creationTimeError}`);
            if (companiesError) errors.push(`Companies: ${companiesError}`);
            if (positionsError) errors.push(`Positions: ${positionsError}`);

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
                genderData,
                groupData,
                preferredMethodData: methodData,
                upcomingBirthdays: birthdaysData,
                creationTimeData,
                topCompaniesData: companiesData,
                topPositionsData: positionsData,
              },
              error: null,
            };
          } catch (error) {
            return {
              data: initialState.data, // Return initial data on error
              error: error instanceof Error ? error.message : String(error),
            };
          }
        }
      );

      if (result.data) {
        dispatch({ type: 'SET_DATA', payload: result.data });
        if (!result.fromCache) {
          ErrorManager.notifyUser(t('statistics.stats_loaded_success'), 'success');
        }
      } else if (result.error) {
        throw new Error(result.error);
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
      
      const result = await fetchWithCache<StatisticsData>(
        `statistics_comparison_${userId}_from_${startDate}_to_${endDate}`,
        async () => {
          try {
            // Fetch all comparison data in parallel
            const [
              totalResult,
              genderResult,
              groupResult,
              methodResult,
              birthdaysResult,
              creationTimeResult,
              companiesResult,
              positionsResult,
            ] = await Promise.allSettled([
              ContactStatisticsService.getTotalContacts(userId, startDate, endDate),
              ContactStatisticsService.getContactsByGender(userId, startDate, endDate),
              ContactStatisticsService.getContactsByGroup(userId, startDate, endDate),
              ContactStatisticsService.getContactsByPreferredMethod(userId, startDate, endDate),
              ContactStatisticsService.getUpcomingBirthdays(userId, startDate, endDate),
              ContactStatisticsService.getContactsByCreationMonth(userId, startDate, endDate),
              ContactStatisticsService.getTopCompanies(userId, 5, startDate, endDate),
              ContactStatisticsService.getTopPositions(userId, 5, startDate, endDate),
            ]);

            // Process results with proper error handling
            const totalData = totalResult.status === 'fulfilled' ? totalResult.value.data : null;
            const genderData = genderResult.status === 'fulfilled' ? genderResult.value.data || [] : [];
            const groupData = groupResult.status === 'fulfilled' ? groupResult.value.data || [] : [];
            const methodData = methodResult.status === 'fulfilled' ? methodResult.value.data || [] : [];
            const birthdaysData = birthdaysResult.status === 'fulfilled' ? birthdaysResult.value.data || [] : [];
            const creationTimeData = creationTimeResult.status === 'fulfilled' ? creationTimeResult.value.data || [] : [];
            const companiesData = companiesResult.status === 'fulfilled' ? companiesResult.value.data || [] : [];
            const positionsData = positionsResult.status === 'fulfilled' ? positionsResult.value.data || [] : [];

            return {
              data: {
                totalContacts: totalData,
                genderData,
                groupData,
                preferredMethodData: methodData,
                upcomingBirthdays: birthdaysData,
                creationTimeData,
                topCompaniesData: companiesData,
                topPositionsData: positionsData,
              },
              error: null,
            };
          } catch (error) {
            return {
              data: initialState.data, // Return initial data on error
              error: error instanceof Error ? error.message : String(error),
            };
          }
        }
      );

      if (result.data) {
        dispatch({ type: 'SET_COMPARISON_DATA', payload: { previousData: result.data } });
      } else if (result.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to fetch comparison data:', error);
      ErrorManager.logError(error instanceof Error ? error : new Error(String(error)), { component: 'StatisticsContext', action: 'fetchComparisonData' });
    }
  }, [session, isSessionLoading]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    state,
    fetchData,
    refreshData,
    setDateRange,
    fetchComparisonData
  }), [state, fetchData, refreshData, setDateRange, fetchComparisonData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <StatisticsContext.Provider value={contextValue}>
      {children}
    </StatisticsContext.Provider>
  );
};