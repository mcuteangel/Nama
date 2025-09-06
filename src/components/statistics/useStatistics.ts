import { useContext } from 'react';
import { StatisticsContext, type StatisticsContextType } from './StatisticsContextOnly';

// Enhanced hook with better error handling
export const useStatistics = (): StatisticsContextType => {
  const context = useContext(StatisticsContext);
  if (context === undefined) {
    throw new Error('useStatistics must be used within a StatisticsProvider');
  }
  return context;
};