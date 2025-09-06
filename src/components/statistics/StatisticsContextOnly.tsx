import React, { createContext } from 'react';
import { StatisticsData } from "./types";

export type StatisticsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DATA'; payload: StatisticsData }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' }
  | { type: 'SET_DATE_RANGE'; payload: { startDate: string | null; endDate: string | null } }
  | { type: 'SET_COMPARISON_DATA'; payload: { previousData: StatisticsData | null } };

// Initial state with proper typing
export const initialState = {
  data: {
    totalContacts: null as number | null,
    genderData: [] as Array<{ gender: string; count: number }>,
    groupData: [] as Array<{ name: string; color?: string; count: number }>,
    preferredMethodData: [] as Array<{ method: string; count: number }>,
    upcomingBirthdays: [] as Array<{ id: string; first_name: string; last_name: string; birthday: string; days_until_birthday: number }>,
    creationTimeData: [] as Array<{ month_year: string; count: number }>,
    topCompaniesData: [] as Array<{ company: string; count: number }>,
    topPositionsData: [] as Array<{ position: string; count: number }>,
  },
  loading: false,
  error: null as string | null,
  dateRange: { startDate: null as string | null, endDate: null as string | null },
  comparisonData: { previousData: null as StatisticsData | null },
};

// Reducer with improved type safety
export function statisticsReducer(
  state: typeof initialState, 
  action: StatisticsAction
): typeof initialState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_DATA':
      return { ...state, data: action.payload, loading: false, error: null };
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'RESET':
      return initialState;
    case 'SET_DATE_RANGE':
      return { ...state, dateRange: action.payload };
    case 'SET_COMPARISON_DATA':
      return { ...state, comparisonData: action.payload };
    default:
      return state;
  }
}

// Context with proper typing
export interface StatisticsContextType {
  state: typeof initialState;
  fetchData: () => Promise<void>;
  refreshData: () => Promise<void>;
  setDateRange: (startDate: string | null, endDate: string | null) => void;
  fetchComparisonData: (startDate: string, endDate: string) => Promise<void>;
}

export const StatisticsContext = createContext<StatisticsContextType | undefined>(undefined);