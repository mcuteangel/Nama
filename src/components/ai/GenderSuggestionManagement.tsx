import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, User, CheckCircle, XCircle, LightbulbOff, Brain } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSession } from "@/integrations/supabase/auth";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import LoadingMessage from "../common/LoadingMessage";
import { supabase } from '@/integrations/supabase/client';
import { invalidateCache } from '@/utils/cache-helpers';
import { suggestGenderFromName, updateLearnedGenderPreference, clearLearnedGenderPreferences, getLearnedGenderPreferences } from '@/utils/gender-learning';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import CancelButton from '../common/CancelButton';
import EmptyState from '../common/EmptyState';
import LoadingSpinner from '../common/LoadingSpinner';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardDescription, ModernCardContent } from "@/components/ui/modern-card";
import { ModernButton } from "@/components/ui/modern-button";

interface ContactForGenderSuggestion {
  id: string;
  first_name: string;
  last_name: string;
  gender: 'male' | 'female' | 'not_specified';
}

interface GenderSuggestionDisplay {
  contactId: string;
  contactName: string;
  currentGender: 'male' | 'female' | 'not_specified';
  suggestedGender: 'male' | 'female' | 'not_specified';
}

const GenderSuggestionManagement: React.FC = () => {
  const { t } = useTranslation();
  const { session, isLoading: isSessionLoading } = useSession();

  const [ungenderedContacts, setUngenderedContacts] = useState<ContactForGenderSuggestion[]>([]);
  const [genderSuggestions, setGenderSuggestions] = useState<GenderSuggestionDisplay[]>([]);
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

  useEffect(() => {
    fetchUngenderedContacts();
    updateLearnedNamesCount();
  }, [fetchUngenderedContacts, updateLearnedNamesCount]);

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
      const newSuggestions: GenderSuggestionDisplay[] = ungenderedContacts
        .map(contact => {
          const suggestedGender = suggestGenderFromName(contact.first_name);
          return {
            contactId: contact.id,
            contactName: `${contact.first_name} ${contact.last_name}`,
            currentGender: contact.gender,
            suggestedGender: suggestedGender,
          };
        })
        .filter(s => s.suggestedGender !== 'not_specified');

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
      // dismissToast(toastId);
    }
  }, [session, ungenderedContacts, t]);

  const handleAcceptSuggestion = useCallback(async (suggestion: GenderSuggestionDisplay) => {
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
      updateLearnedNamesCount();

      ErrorManager.notifyUser(t('ai_suggestions.gender_suggestion_applied_success'), 'success');
      setGenderSuggestions(prev => prev.filter(s => s.contactId !== suggestion.contactId));
      invalidateCache(`contacts_list_${session.user.id}_`);
      fetchUngenderedContacts();
    } catch (err: unknown) {
      ErrorManager.logError(err, { component: 'GenderSuggestionManagement', action: 'acceptGenderSuggestion', suggestion });
      ErrorManager.notifyUser(`${t('ai_suggestions.error_applying_gender_suggestion')}: ${ErrorManager.getErrorMessage(err)}`, 'error');
    } finally {
      // dismissToast(toastId);
    }
  }, [session, t, fetchUngenderedContacts, ungenderedContacts, updateLearnedNamesCount]);

  const handleDiscardSuggestion = useCallback((contactId: string) => {
    setGenderSuggestions(prev => prev.filter(s => s.contactId !== contactId));
    ErrorManager.notifyUser(t('ai_suggestions.gender_suggestion_discarded'), 'info');
  }, [t]);

  const handleClearLearnedPreferences = useCallback(() => {
    clearLearnedGenderPreferences();
    ErrorManager.notifyUser(t('ai_suggestions.learned_preferences_cleared'), 'success');
    updateLearnedNamesCount();
    handleGenerateSuggestions();
  }, [t, handleGenerateSuggestions, updateLearnedNamesCount]);

  if (isSessionLoading || isLoadingContacts) {
    return <LoadingMessage message={t('ai_suggestions.loading_gender_management_data')} />;
  }

  return (
    <div className="space-y-6">
      <ModernCard variant="glass" className="rounded-xl p-4">
        <ModernCardHeader className="pb-2">
          <ModernCardTitle className="text-xl font-bold flex items-center gap-2">
            <User size={20} className="text-pink-500" /> {t('ai_suggestions.gender_suggestion_title')}
          </ModernCardTitle>
          <ModernCardDescription>
            {t('ai_suggestions.gender_suggestion_description_local')}
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 glass rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <Brain size={20} className="text-indigo-500" />
              <p className="font-medium text-gray-800 dark:text-gray-100">{t('ai_suggestions.learned_names_count')}</p>
            </div>
            <span className="px-3 py-1 text-sm font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
              {learnedNamesCount} {t('common.names')}
            </span>
          </div>

          <ModernButton
            onClick={handleGenerateSuggestions}
            disabled={isGenerating || ungenderedContacts.length === 0}
            variant="gradient-primary"
            className="w-full flex items-center gap-2 px-6 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
          >
            {isGenerating && <LoadingSpinner size={16} className="me-2" />}
            <Sparkles size={16} className="me-2" />
            {t('ai_suggestions.generate_gender_suggestions')}
          </ModernButton>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <ModernButton
                variant="outline"
                disabled={isGenerating || learnedNamesCount === 0}
                className="w-full flex items-center gap-2 px-6 py-2 rounded-lg font-semibold shadow-sm transition-all duration-300"
              >
                <LightbulbOff size={16} />
                {t('ai_suggestions.clear_learned_preferences')}
              </ModernButton>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass rounded-xl p-6">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-gray-800 dark:text-gray-100">{t('ai_suggestions.confirm_clear_learning_title')}</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                  {t('ai_suggestions.confirm_clear_learning_description')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <CancelButton text={t('common.cancel')} />
                <AlertDialogAction onClick={handleClearLearnedPreferences} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold">
                  {t('ai_suggestions.clear_learning_button')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {ungenderedContacts.length === 0 && !isGenerating && (
            <EmptyState
              icon={User}
              title={t('ai_suggestions.all_contacts_gendered')}
              description={t('ai_suggestions.all_contacts_gendered_description')}
            />
          )}

          {genderSuggestions.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{t('ai_suggestions.pending_gender_suggestions')}</h4>
              {genderSuggestions.map((suggestion) => (
                <div key={suggestion.contactId} className="flex items-center justify-between p-3 glass rounded-lg shadow-sm">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{suggestion.contactName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {t('ai_suggestions.suggested_gender')}:
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ms-1 ${
                        suggestion.suggestedGender === 'male' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        suggestion.suggestedGender === 'female' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {t(`gender.${suggestion.suggestedGender}`)}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <ModernButton
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAcceptSuggestion(suggestion)}
                      className="text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-gray-600/50"
                    >
                      <CheckCircle size={20} />
                    </ModernButton>
                    <ModernButton
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDiscardSuggestion(suggestion.contactId)}
                      className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-600/50"
                    >
                      <XCircle size={20} />
                    </ModernButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModernCardContent>
      </ModernCard>
    </div>
  );
};

export default GenderSuggestionManagement;