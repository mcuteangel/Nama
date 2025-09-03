import { useContext } from 'react';
import { StatisticsContext, type StatisticsContextType } from './StatisticsContextOnly';

// Hook to use the context
export const useStatistics = (): StatisticsContextType => {
  const context = useContext(StatisticsContext);
  if (context === undefined) {
    throw new Error('useStatistics must be used within a StatisticsProvider');
  }
  return context;
};