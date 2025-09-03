import React, { createContext } from 'react';
import { StatisticsData } from "./types";

export type StatisticsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DATA'; payload: StatisticsData }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' }
  | { type: 'SET_DATE_RANGE'; payload: { startDate: string | null; endDate: string | null } }
  | { type: 'SET_COMPARISON_DATA'; payload: { previousData: StatisticsData | null } };

// Initial state
export const initialState: {
  data: StatisticsData;
  loading: boolean;
  error: string | null;
  dateRange: { startDate: string | null; endDate: string | null };
  comparisonData: { previousData: StatisticsData | null };
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
  dateRange: { startDate: null, endDate: null },
  comparisonData: { previousData: null },
};

// Reducer
export function statisticsReducer(state: typeof initialState, action: StatisticsAction): typeof initialState {
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

// Context
export interface StatisticsContextType {
  state: typeof initialState;
  fetchData: () => Promise<void>;
  refreshData: () => Promise<void>;
  setDateRange: (startDate: string | null, endDate: string | null) => void;
  fetchComparisonData: (startDate: string, endDate: string) => Promise<void>;
}

export const StatisticsContext = createContext<StatisticsContextType | undefined>(undefined);