// Shared types for statistics components
export interface GenderData {
  gender: string;
  count: number;
}

export interface GroupData {
  name: string;
  color?: string;
  count: number;
}

export interface PreferredMethodData {
  method: string;
  count: number;
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
}

export interface PositionData {
  position: string;
  count: number;
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