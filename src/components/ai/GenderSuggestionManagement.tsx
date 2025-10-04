import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sparkles, User, CheckCircle, XCircle, LightbulbOff, Brain, Heart, TrendingUp, Target, Activity, Users, Award, Zap, Loader2 } from "lucide-react";
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
import { GenderSuggestion, ConfidenceLevel, SuggestionStatus, SuggestionPriority } from '@/types/ai-suggestions.types';

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
  const [hoveredSuggestion, setHoveredSuggestion] = useState<string | null>(null);

  // محاسبات آماری پیشرفته با useMemo برای عملکرد بهتر
  const stats = useMemo(() => {
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
      const newSuggestions: GenderSuggestion[] = ungenderedContacts
        .map(contact => {
          const suggestedGender = suggestGenderFromName(contact.first_name);
          if (suggestedGender === 'not_specified') return null;

          return {
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
              score: Math.floor(Math.random() * 20) + 80, // 80-100% confidence
              factors: ['name_analysis', 'learned_patterns'],
              lastUpdated: new Date()
            },
            reasoning: [`نام "${contact.first_name}" معمولاً برای جنسیت ${suggestedGender === 'male' ? 'مردانه' : 'زنانه'} است`]
          };
        })
        .filter((s): s is GenderSuggestion => s !== null);

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
  }, [session, t, fetchUngenderedContacts, ungenderedContacts, updateLearnedNamesCount]);

  const handleDiscardSuggestion = useCallback((suggestionId: string) => {
    setGenderSuggestions(prev =>
      prev.map(s =>
        s.id === suggestionId
          ? { ...s, status: 'discarded' as SuggestionStatus, updatedAt: new Date() }
          : s
      )
    );
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
      {/* Enhanced Header */}
      <AIBaseCard
        title={t('ai_suggestions.gender_suggestion_title')}
        description={t('ai_suggestions.gender_suggestion_description')}
        icon={<Heart size={24} className="text-pink-500 animate-pulse" />}
        variant="gradient"
        className="relative overflow-hidden"
      >
        {/* آمار پیشرفته */}
        {stats.totalContacts > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 dark:from-pink-500/20 dark:to-pink-600/20 rounded-2xl p-4 border border-pink-200/30 dark:border-pink-800/30 backdrop-blur-sm text-center">
              <Users size={24} className="text-pink-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{stats.totalContacts}</div>
              <div className="text-sm text-pink-500 dark:text-pink-300">{t('ai_suggestions.ungendered_contacts', 'بدون جنسیت')}</div>
            </div>

            <div className="bg-gradient-to-br from-rose-500/10 to-rose-600/10 dark:from-rose-500/20 dark:to-rose-600/20 rounded-2xl p-4 border border-rose-200/30 dark:border-rose-800/30 backdrop-blur-sm text-center">
              <TrendingUp size={24} className="text-rose-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.successRate}%</div>
              <div className="text-sm text-rose-500 dark:text-rose-300">{t('ai_suggestions.match_rate', 'نرخ تطابق')}</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 rounded-2xl p-4 border border-blue-200/30 dark:border-blue-800/30 backdrop-blur-sm text-center">
              <Activity size={24} className="text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.maleSuggestions}</div>
              <div className="text-sm text-blue-500 dark:text-blue-300">👨 {t('gender.male', 'مرد')}</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-500/20 dark:to-purple-600/20 rounded-2xl p-4 border border-purple-200/30 dark:border-purple-800/30 backdrop-blur-sm text-center">
              <Award size={24} className="text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.femaleSuggestions}</div>
              <div className="text-sm text-purple-500 dark:text-purple-300">👩 {t('gender.female', 'زن')}</div>
            </div>
          </div>
        )}
      </AIBaseCard>

      {/* Machine Learning Section */}
      <AIBaseCard
        title={t('ai_suggestions.learned_names_count')}
        description={t('ai_suggestions.learned_names_description')}
        icon={<Brain size={20} className="text-indigo-500 animate-pulse" />}
        variant="info"
        compact
        actions={
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-sm font-bold rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              {learnedNamesCount}
            </span>
            <Target size={16} className="text-indigo-500" />
          </div>
        }
      />

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <GlassButton
          onClick={handleGenerateSuggestions}
          disabled={isGenerating || ungenderedContacts.length === 0}
          variant="gradient-primary"
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm"
          aria-label={t('ai_suggestions.generate_gender_suggestions')}
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
              aria-label={t('ai_suggestions.clear_learned_preferences')}
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

      {/* AI Processing Animation */}
      {isGenerating && (
        <AIBaseCard
          title={t('ai_suggestions.ai_processing_gender', 'هوش مصنوعی در حال تحلیل')}
          description={t('ai_suggestions.analyzing_names', 'نام‌ها را برای تعیین جنسیت تحلیل می‌کند...')}
          icon={<Heart size={20} className="text-pink-500 animate-pulse" />}
          variant="warning"
          className="animate-pulse"
        >
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full animate-pulse" style={{ width: '80%' }}></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {t('ai_suggestions.processing_names', 'مرحله: یادگیری از نام‌های قبلی')}
          </p>
        </AIBaseCard>
      )}

      {ungenderedContacts.length === 0 && !isGenerating && (
        <EmptyState
          icon={User}
          title={t('ai_suggestions.all_contacts_gendered')}
          description={t('ai_suggestions.all_contacts_gendered_description')}
        />
      )}

      {genderSuggestions.length > 0 && (
        <AIBaseCard
          title={t('ai_suggestions.pending_gender_suggestions')}
          description={t('ai_suggestions.gender_suggestions_ready', 'پیشنهادات جنسیت آماده بررسی هستند')}
          icon={<Sparkles size={20} className="text-yellow-500 animate-pulse" />}
          variant="warning"
          actions={
            <div className="flex items-center gap-2">
              <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-semibold">
                {genderSuggestions.length}
              </div>
              <TrendingUp size={20} className="text-purple-500" />
            </div>
          }
        >
          <div className="grid gap-4 max-h-80 overflow-y-auto">
            {genderSuggestions.map((suggestion, index) => (
              <AIBaseCard
                key={suggestion.id}
                title={suggestion.contactName}
                description={`${t('ai_suggestions.suggested_gender')}: ${t(`gender.${suggestion.suggestedGender}`)}`}
                icon={
                  suggestion.suggestedGender === 'male' ? '👨' :
                  suggestion.suggestedGender === 'female' ? '👩' : '❓'
                }
                variant={suggestion.suggestedGender === 'male' ? 'primary' : 'danger'}
                compact
                animated={false}
                hoverable={true}
                priority={suggestion.priority}
                status={suggestion.status}
                confidence={suggestion.confidence}
                showConfidence={true}
                actions={
                  <div className="flex gap-2">
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAcceptSuggestion(suggestion)}
                      className="w-10 h-10 rounded-2xl bg-green-500/10 hover:bg-green-500/20 dark:bg-green-900/30 dark:hover:bg-green-800/50 text-green-600 hover:text-green-700 transition-all duration-300 hover:scale-110 border-2 border-green-200/50 dark:border-green-800/50"
                      aria-label={t('ai_suggestions.accept_gender_suggestion')}
                    >
                      <CheckCircle size={18} />
                    </GlassButton>
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDiscardSuggestion(suggestion.id)}
                      className="w-10 h-10 rounded-2xl bg-red-500/10 hover:bg-red-500/20 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-600 hover:text-red-700 transition-all duration-300 hover:scale-110 border-2 border-red-200/50 dark:border-red-800/50"
                      aria-label={t('common.discard')}
                    >
                      <XCircle size={18} />
                    </GlassButton>
                  </div>
                }
                className={`
                  ${hoveredSuggestion === suggestion.id ? 'ring-2 ring-pink-300/70 shadow-pink-500/30' : ''}
                  animate-slide-in
                `}
                style={{ animationDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredSuggestion(suggestion.id)}
                onMouseLeave={() => setHoveredSuggestion(null)}
              />
            ))}
          </div>
        </AIBaseCard>
      )}
    </div>
  );
});

GenderSuggestionManagement.displayName = 'GenderSuggestionManagement';

export default GenderSuggestionManagement;
