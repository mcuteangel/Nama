import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, User, CheckCircle, XCircle, LightbulbOff, Brain, Heart } from "lucide-react";
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
import { GlassButton } from "@/components/ui/glass-button";
import AIBaseCard from './AIBaseCard';

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
    <AIBaseCard
      title={t('ai_suggestions.gender_suggestion_title')}
      description={t('ai_suggestions.gender_suggestion_description')}
      icon={<Heart size={20} />}
      variant="success"
      compact
    >
      <div className="bg-gradient-to-r from-indigo-50/30 to-purple-50/30 dark:from-indigo-900/20 dark:to-purple-900/20 p-3 rounded-lg border border-white/30 backdrop-blur-sm shadow-sm mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-indigo-500" />
            <div>
              <p className="font-medium text-indigo-800 dark:text-indigo-200 text-sm">{t('ai_suggestions.learned_names_count')}</p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400">{t('ai_suggestions.learned_names_description')}</p>
            </div>
          </div>
          <span className="px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            {learnedNamesCount}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <GlassButton
          onClick={handleGenerateSuggestions}
          disabled={isGenerating || ungenderedContacts.length === 0}
          variant="gradient-primary"
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm"
        >
          {isGenerating ? (
            <LoadingSpinner size={14} />
          ) : (
            <Sparkles size={14} />
          )}
          {t('ai_suggestions.generate_gender_suggestions')}
        </GlassButton>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <GlassButton
              variant="outline"
              disabled={isGenerating || learnedNamesCount === 0}
              size="sm"
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm"
            >
              <LightbulbOff size={12} />
              {t('ai_suggestions.clear_learned_preferences')}
            </GlassButton>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass rounded-lg p-4">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-800 dark:text-gray-100">{t('ai_suggestions.confirm_clear_learning_title')}</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-300 text-sm">
                {t('ai_suggestions.confirm_clear_learning_description')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <CancelButton text={t('common.cancel')} />
              <AlertDialogAction onClick={handleClearLearnedPreferences} className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm">
                {t('ai_suggestions.clear_learning_button')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {ungenderedContacts.length === 0 && !isGenerating && (
        <EmptyState
          icon={User}
          title={t('ai_suggestions.all_contacts_gendered')}
          description={t('ai_suggestions.all_contacts_gendered_description')}
        />
      )}

      {genderSuggestions.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Sparkles size={16} className="text-yellow-500" />
            <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              {t('ai_suggestions.pending_gender_suggestions')}
            </span>
            <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full text-xs font-semibold">
              {genderSuggestions.length}
            </span>
          </h4>
          <div className="grid gap-2">
            {genderSuggestions.map((suggestion, index) => (
              <div
                key={suggestion.contactId}
                className="bg-gradient-to-r from-white/20 via-gray-50/30 to-slate-50/30 dark:from-gray-800/20 dark:via-gray-700/30 dark:to-gray-600/30 p-2 rounded-lg border border-white/30 backdrop-blur-sm shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-800 dark:text-gray-100 mb-1">{suggestion.contactName}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        {t('ai_suggestions.suggested_gender')}:
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        suggestion.suggestedGender === 'male'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                          : suggestion.suggestedGender === 'female'
                          ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white'
                          : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                      }`}>
                        {suggestion.suggestedGender === 'male' && '👨'}
                        {suggestion.suggestedGender === 'female' && '👩'}
                        {suggestion.suggestedGender === 'not_specified' && '❓'}
                        {t(`gender.${suggestion.suggestedGender}`)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAcceptSuggestion(suggestion)}
                      className="w-7 h-7 rounded-full bg-green-100/50 hover:bg-green-200/70 dark:bg-green-900/30 dark:hover:bg-green-800/50 text-green-600 hover:text-green-700"
                    >
                      <CheckCircle size={14} />
                    </GlassButton>
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDiscardSuggestion(suggestion.contactId)}
                      className="w-7 h-7 rounded-full bg-red-100/50 hover:bg-red-200/70 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-600 hover:text-red-700"
                    >
                      <XCircle size={14} />
                    </GlassButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AIBaseCard>
  );
};

export default GenderSuggestionManagement;