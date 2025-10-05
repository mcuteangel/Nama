export interface ContactWithoutGroup {
  id: string;
  first_name: string;
  last_name: string;
  company?: string;
  position?: string;
  suggested_group_id?: string;
  suggested_group_name?: string;
}

export interface ContactSuggestions {
  contact_id: string;
  contact_name: string;
  suggestions: Array<GroupSuggestion & { priority: number }>;
}

export interface GroupSuggestion {
  contact_id: string;
  contact_name: string;
  suggested_group_id: string;
  suggested_group_name: string;
  suggested_group_color?: string;
  confidence?: number;
  reasoning?: string;
  priority: number; // اولویت پیشنهاد (1 = بالاترین اولویت)
}

export interface GroupSuggestionStats {
  totalContacts: number;
  totalSuggestions: number;
  uniqueGroups: number;
  successRate: number;
  avgConfidence: number;
  topCompanies: string[];
  recentSuggestions: number;
}
