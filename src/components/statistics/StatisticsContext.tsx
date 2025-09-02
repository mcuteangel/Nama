import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useSession } from "@/integrations/supabase/auth";
import { ContactStatisticsService } from "@/services/contact-statistics-service";
import { fetchWithCache } from "@/utils/cache-helpers";
import { ErrorManager } from "@/lib/error-manager";
import { useTranslation } from "react-i18next";

// Types
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

export interface StatisticsData {
  totalContacts: number | null;
  genderData: GenderData[];
  groupData: GroupData[];
  preferredMethodData: PreferredMethodData[];
  upcomingBirthdays: BirthdayContact[];
  creationTimeData: CreationTimeData[];
  topCompaniesData: CompanyData[];
  topPositionsData: PositionData[];
}

// Action types
type StatisticsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DATA'; payload: StatisticsData }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

// Initial state
const initialState: {
  data: StatisticsData;
  loading: boolean;
  error: string | null;
} = {
  data: {
    totalContacts: null,
    genderData: [],
    groupData: [],
    preferredMethodData: [],
    upcomingBirthdays: [],
    creationTimeData: [],
    topCompaniesData: [],
    topPositionsData: [],
  },
  loading: false,
  error: null,
};

// Reducer
function statisticsReducer(state: typeof initialState, action: StatisticsAction): typeof initialState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_DATA':
      return { ...state, data: action.payload, loading: false, error: null };
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// Context
interface StatisticsContextType {
  state: typeof initialState;
  fetchData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const StatisticsContext = createContext<StatisticsContextType | undefined>(undefined);

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
        dispatch({ type: 'SET_DATA', payload: data });
        if (!fromCache) {
          ErrorManager.notifyUser(t('statistics.stats_loaded_success'), 'success');
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || t('statistics.error_loading_stats');
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      ErrorManager.logError(error, { component: 'StatisticsContext', action: 'fetchData' });
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

// Hook to use the context
export const useStatistics = () => {
  const context = useContext(StatisticsContext);
  if (context === undefined) {
    throw new Error('useStatistics must be used within a StatisticsProvider');
  }
  return context;
};