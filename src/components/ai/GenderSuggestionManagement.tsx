import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from "react-i18next";
import { useSession } from "@/integrations/supabase/auth";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import LoadingMessage from "../common/LoadingMessage";
import { supabase } from '@/integrations/supabase/client';
import { clearLearnedGenderPreferences, getLearnedGenderPreferences } from '@/utils/gender-learning';
import { GenderSuggestion, SuggestionStatus } from '@/types/ai-suggestions.types';
import {
  GenderSuggestionStats,
  GenderSuggestionActions,
  GenderSuggestionProcessing,
  GenderSuggestionList
} from './gender-suggestions';
import { useGenderSuggestionActions } from '@/hooks/use-gender-suggestion-actions';

interface ContactForGenderSuggestion {
  id: string;
  first_name: string;
  last_name: string;
  gender: 'male' | 'female' | 'not_specified';
}

const GenderSuggestionManagement: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const { session, isLoading: isSessionLoading } = useSession();

  const [ungenderedContacts, setUngenderedContacts] = useState<ContactForGenderSuggestion[]>([]);
  const [genderSuggestions, setGenderSuggestions] = useState<GenderSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [learnedNamesCount, setLearnedNamesCount] = useState(0);

  const updateLearnedNamesCount = useCallback(() => {
    const preferences = getLearnedGenderPreferences();
    setLearnedNamesCount(Object.keys(preferences).length);
  }, []);

  const onSuccessFetchContacts = useCallback((result: { data: ContactForGenderSuggestion[] | null; error: string | null; fromCache: boolean }) => {
    if (result.data) {
      setUngenderedContacts(result.data);
    }
  }, []);

  const onErrorFetchContacts = useCallback((err: Error) => {
    ErrorManager.logError(err, { component: 'GenderSuggestionManagement', action: 'fetchUngenderedContacts' });
    ErrorManager.notifyUser(t('ai_suggestions.error_fetching_ungendered_contacts'), 'error');
  }, [t]);

  const {
    isLoading: isLoadingContacts,
    executeAsync: executeFetchContacts,
  } = useErrorHandler(null, {
    showToast: false,
    onSuccess: onSuccessFetchContacts,
    onError: onErrorFetchContacts,
  });

  const fetchUngenderedContacts = useCallback(async () => {
    if (isSessionLoading || !session?.user) {
      setUngenderedContacts([]);
      return;
    }

    await executeFetchContacts(async () => {
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, gender')
        .eq('user_id', session.user.id)
        .eq('gender', 'not_specified');

      if (contactsError) throw new Error(contactsError.message);

      return { data: contacts as ContactForGenderSuggestion[], error: null, fromCache: false };
    });
  }, [session, isSessionLoading, executeFetchContacts]);

  // استفاده از hook جدید برای مدیریت عملیات
  const { handleGenerateSuggestions, handleAcceptSuggestion, handleDiscardSuggestion } = useGenderSuggestionActions({
    ungenderedContacts,
    setGenderSuggestions,
    setIsGenerating,
    fetchUngenderedContacts,
    updateLearnedNamesCount,
  });

  const handleClearLearnedPreferences = useCallback(() => {
    clearLearnedGenderPreferences();
    ErrorManager.notifyUser(t('ai_suggestions.learned_preferences_cleared'), 'success');
    updateLearnedNamesCount();
    handleGenerateSuggestions();
  }, [t, handleGenerateSuggestions, updateLearnedNamesCount]);

  useEffect(() => {
    fetchUngenderedContacts();
    updateLearnedNamesCount();
  }, [fetchUngenderedContacts, updateLearnedNamesCount]);

  if (isSessionLoading || isLoadingContacts) {
    return <LoadingMessage message={t('ai_suggestions.loading_gender_management_data')} />;
  }

  return (
    <div className="space-y-8 p-6">
      <GenderSuggestionStats
        ungenderedContacts={ungenderedContacts}
        genderSuggestions={genderSuggestions}
      />

      <GenderSuggestionActions
        isGenerating={isGenerating}
        ungenderedContactsCount={ungenderedContacts.length}
        learnedNamesCount={learnedNamesCount}
        onGenerateSuggestions={handleGenerateSuggestions}
        onClearLearnedPreferences={handleClearLearnedPreferences}
      />

      <GenderSuggestionProcessing
        isGenerating={isGenerating}
      />

      <GenderSuggestionList
        ungenderedContacts={ungenderedContacts}
        genderSuggestions={genderSuggestions}
        isGenerating={isGenerating}
        onAcceptSuggestion={handleAcceptSuggestion}
        onDiscardSuggestion={handleDiscardSuggestion}
      />
    </div>
  );
});

GenderSuggestionManagement.displayName = 'GenderSuggestionManagement';

export default GenderSuggestionManagement;
