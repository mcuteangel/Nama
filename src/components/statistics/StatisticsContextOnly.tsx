import React, { createContext } from 'react';
import { StatisticsData } from "./types";

export type StatisticsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DATA'; payload: StatisticsData }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

// Initial state
export const initialState: {
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
    default:
      return state;
  }
}

// Context
export interface StatisticsContextType {
  state: typeof initialState;
  fetchData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export const StatisticsContext = createContext<StatisticsContextType | undefined>(undefined);