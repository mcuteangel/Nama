import { useMemo } from 'react';
import { GenderSuggestion } from '@/types/ai-suggestions.types';

interface ContactForGenderSuggestion {
  id: string;
  first_name: string;
  last_name: string;
  gender: 'male' | 'female' | 'not_specified';
}

interface GenderSuggestionStatsData {
  totalContacts: number;
  totalSuggestions: number;
  maleSuggestions: number;
  femaleSuggestions: number;
  successRate: number;
  pendingSuggestions: number;
  completedSuggestions: number;
}

export const useGenderSuggestionStats = (
  ungenderedContacts: ContactForGenderSuggestion[],
  genderSuggestions: GenderSuggestion[]
): GenderSuggestionStatsData => {
  return useMemo(() => {
    const totalContacts = ungenderedContacts.length;
    const totalSuggestions = genderSuggestions.length;
    const maleSuggestions = genderSuggestions.filter(s => s.suggestedGender === 'male').length;
    const femaleSuggestions = genderSuggestions.filter(s => s.suggestedGender === 'female').length;
    const successRate = totalContacts > 0 ? Math.round((totalSuggestions / totalContacts) * 100) : 0;

    return {
      totalContacts,
      totalSuggestions,
      maleSuggestions,
      femaleSuggestions,
      successRate,
      pendingSuggestions: genderSuggestions.filter(s => s.status === 'pending').length,
      completedSuggestions: genderSuggestions.filter(s => s.status === 'completed').length,
    };
  }, [ungenderedContacts.length, genderSuggestions]);
};
