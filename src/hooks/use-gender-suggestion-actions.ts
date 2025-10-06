import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/integrations/supabase/auth';
import { ErrorManager } from '@/lib/error-manager';
import { supabase } from '@/integrations/supabase/client';
import { invalidateCache } from '@/utils/cache-helpers';
import { suggestGenderFromName, updateLearnedGenderPreference, saveLearnedPersianName } from '@/utils/gender-learning';
import { GenderSuggestion, SuggestionStatus, SuggestionPriority } from '@/types/ai-suggestions.types';

interface ContactForGenderSuggestion {
  id: string;
  first_name: string;
  last_name: string;
  gender: 'male' | 'female' | 'not_specified';
}

interface UseGenderSuggestionActionsProps {
  ungenderedContacts: ContactForGenderSuggestion[];
  setGenderSuggestions: React.Dispatch<React.SetStateAction<GenderSuggestion[]>>;
  setIsGenerating: (isGenerating: boolean) => void;
  fetchUngenderedContacts: () => Promise<void>;
  updateLearnedNamesCount: () => void;
}

export const useGenderSuggestionActions = ({
  ungenderedContacts,
  setGenderSuggestions,
  setIsGenerating,
  fetchUngenderedContacts,
  updateLearnedNamesCount,
}: UseGenderSuggestionActionsProps) => {
  const { t } = useTranslation();
  const { session } = useSession();

  const handleGenerateSuggestions = useCallback(async () => {
    if (!session?.user) {
      ErrorManager.notifyUser(t('common.auth_required'), 'error');
      return;
    }
    if (ungenderedContacts.length === 0) {
      ErrorManager.notifyUser(t('ai_suggestions.no_ungendered_contacts'), 'info');
      return;
    }

    setIsGenerating(true);

    try {
      const newSuggestions: GenderSuggestion[] = [];

      for (const contact of ungenderedContacts) {
        const suggestedGender = await suggestGenderFromName(contact.first_name);
        if (suggestedGender === 'not_specified') continue;

        const suggestion: GenderSuggestion = {
          id: `gender_${contact.id}_${Date.now()}`,
          type: 'gender_suggestion' as const,
          status: 'pending' as SuggestionStatus,
          priority: 'medium' as SuggestionPriority,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['gender', 'ai-suggestion'],
          contactId: contact.id,
          contactName: `${contact.first_name} ${contact.last_name}`,
          currentGender: contact.gender,
          suggestedGender,
          confidence: {
            score: Math.floor(Math.random() * 20) + 80,
            factors: ['name_analysis', 'learned_patterns'],
            lastUpdated: new Date()
          },
          reasoning: [t('ai_suggestions.gender_reasoning_name_analysis', { 
            name: contact.first_name, 
            gender: t(`common.${suggestedGender}`) 
          })]
        };

        newSuggestions.push(suggestion);
      }

      setGenderSuggestions(newSuggestions);
      if (newSuggestions.length === 0) {
        ErrorManager.notifyUser(t('ai_suggestions.no_gender_suggestions_found_local'), 'info');
      } else {
        ErrorManager.notifyUser(t('ai_suggestions.gender_suggestions_generated_local'), 'success');
      }
    } catch (err: unknown) {
      ErrorManager.logError(err, { component: 'GenderSuggestionManagement', action: 'generateGenderSuggestionsLocal' });
      ErrorManager.notifyUser(`${t('ai_suggestions.error_generating_gender_suggestions_local')}: ${ErrorManager.getErrorMessage(err)}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [session, ungenderedContacts, t, setGenderSuggestions, setIsGenerating]);

  const handleAcceptSuggestion = useCallback(async (suggestion: GenderSuggestion) => {
    if (!session?.user) {
      ErrorManager.notifyUser(t('common.auth_required'), 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('contacts')
        .update({ gender: suggestion.suggestedGender })
        .eq('id', suggestion.contactId)
        .eq('user_id', session.user.id);

      if (error) throw new Error(error.message);

      updateLearnedGenderPreference(
        ungenderedContacts.find(c => c.id === suggestion.contactId)?.first_name || '',
        suggestion.suggestedGender
      );

      // اضافه کردن نام جدید به لیست نام‌های فارسی
      const contactFirstName = ungenderedContacts.find(c => c.id === suggestion.contactId)?.first_name;
      if (contactFirstName) {
        saveLearnedPersianName(contactFirstName, suggestion.suggestedGender);
      }

      updateLearnedNamesCount();

      // به‌روزرسانی وضعیت پیشنهاد
      setGenderSuggestions(prev =>
        prev.map(s =>
          s.id === suggestion.id
            ? { ...s, status: 'completed' as SuggestionStatus, updatedAt: new Date() }
            : s
        )
      );

      ErrorManager.notifyUser(t('ai_suggestions.gender_suggestion_applied_success'), 'success');
      invalidateCache(`contacts_list_${session.user.id}_`);
      fetchUngenderedContacts();
    } catch (err: unknown) {
      ErrorManager.logError(err, { component: 'GenderSuggestionManagement', action: 'acceptGenderSuggestion', suggestion });
      ErrorManager.notifyUser(`${t('ai_suggestions.error_applying_gender_suggestion')}: ${ErrorManager.getErrorMessage(err)}`, 'error');
    }
  }, [session, t, fetchUngenderedContacts, ungenderedContacts, updateLearnedNamesCount, setGenderSuggestions]);

  const handleDiscardSuggestion = useCallback((suggestionId: string) => {
    setGenderSuggestions(prev =>
      prev.map(s =>
        s.id === suggestionId
          ? { ...s, status: 'discarded' as SuggestionStatus, updatedAt: new Date() }
          : s
      )
    );
    ErrorManager.notifyUser(t('ai_suggestions.gender_suggestion_discarded'), 'info');
  }, [t, setGenderSuggestions]);

  return {
    handleGenerateSuggestions,
    handleAcceptSuggestion,
    handleDiscardSuggestion,
  };
};
