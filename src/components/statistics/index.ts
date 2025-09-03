// Export all statistics components and types
export { useStatistics, StatisticsProvider } from './StatisticsContext';

// Types
export type {
  GenderData,
  GroupData,
  PreferredMethodData,
  BirthdayContact,
  CreationTimeData,
  CompanyData,
  PositionData
} from './types';

// Components
export { default as TotalContactsCard } from './TotalContactsCard';
export { default as ContactsByGenderChart } from './ContactsByGenderChart';
export { default as ContactsByGroupChart } from './ContactsByGroupChart';
export { default as ContactsByPreferredMethodChart } from './ContactsByPreferredMethodChart';
export { default as UpcomingBirthdaysList } from './UpcomingBirthdaysList';
export { default as ContactsByCreationTimeChart } from './ContactsByCreationTimeChart';
export { default as TopCompaniesList } from './TopCompaniesList';
export { default as TopPositionsList } from './TopPositionsList';

// Base components
export { default as BasePieChart } from './BasePieChart';
export { default as BaseBarChart } from './BaseBarChart';
export { default as BaseLineChart } from './BaseLineChart';
export { default as BaseList } from './BaseList';