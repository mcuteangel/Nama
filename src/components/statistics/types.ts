// Shared types for statistics components
export interface GenderData {
  gender: string;
  count: number;
  [key: string]: string | number;
}

export interface GroupData {
  [key: string]: string | number | undefined;
  name: string;
  color?: string;
  count: number;
}

export interface PreferredMethodData {
  method: string;
  count: number;
  [key: string]: string | number;
}

export interface BirthdayContact {
  id: string;
  first_name: string;
  last_name: string;
  birthday: string;
  days_until_birthday: number;
}

export interface CreationTimeData {
  month_year: string;
  count: number;
}

export interface CompanyData {
  company: string;
  count: number;
  [key: string]: string | number | undefined;
}

export interface PositionData {
  position: string;
  count: number;
  [key: string]: string | number | undefined;
}

export interface ChartDataItem {
  name: string;
  value?: number;
  count?: number;
  color?: string;
}

export interface ListDataItem {
  id?: string;
  name: string;
  count: number;
  color?: string;
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