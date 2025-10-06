import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, LightbulbOff, Target, Brain } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { GlassButton } from "@/components/ui/glass-button";
import AIBaseCard from '../AIBaseCard';
import CancelButton from '../../common/CancelButton';
import LoadingSpinner from '../../common/LoadingSpinner';
import { clearLearnedGenderPreferences } from '@/utils/gender-learning';
import { ErrorManager } from '@/lib/error-manager';

interface GenderSuggestionActionsProps {
  isGenerating: boolean;
  ungenderedContactsCount: number;
  learnedNamesCount: number;
  onGenerateSuggestions: () => void;
  onClearLearnedPreferences: () => void;
}

const GenderSuggestionActions: React.FC<GenderSuggestionActionsProps> = ({
  isGenerating,
  ungenderedContactsCount,
  learnedNamesCount,
  onGenerateSuggestions,
  onClearLearnedPreferences,
}) => {
  const { t } = useTranslation();

  const handleClearLearnedPreferences = useCallback(() => {
    clearLearnedGenderPreferences();
    ErrorManager.notifyUser(t('ai_suggestions.learned_preferences_cleared'), 'success');
    onClearLearnedPreferences();
    onGenerateSuggestions();
  }, [t, onClearLearnedPreferences, onGenerateSuggestions]);

  return (
    <div className="space-y-6">
      {/* Machine Learning Section */}
      <AIBaseCard
        title={t('ai_suggestions.learned_names_count')}
        description={t('ai_suggestions.learned_names_description')}
        icon={<Brain size={20} className="text-indigo-500 animate-pulse" />}
        variant="info"
        compact
        className="rounded-3xl shadow-2xl backdrop-blur-xl bg-gradient-to-br from-indigo-50/80 via-white/60 to-purple-50/80 dark:from-indigo-950/30 dark:via-gray-900/60 dark:to-purple-950/30 border border-white/20 dark:border-white/10 hover:shadow-indigo-500/20 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
        actions={
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-sm font-bold rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 transform hover:scale-105 transition-all duration-300">
              {learnedNamesCount}
            </span>
            <Target size={16} className="text-indigo-500 animate-pulse" />
          </div>
        }
      />

      {/* Action Buttons */}
      <div className="flex flex-col gap-4">
        <GlassButton
          onClick={onGenerateSuggestions}
          disabled={isGenerating || ungenderedContactsCount === 0}
          variant="gradient-primary"
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-medium text-sm shadow-2xl shadow-pink-500/30 hover:shadow-pink-500/50 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl bg-gradient-to-r from-pink-500/80 to-purple-500/80 border border-white/20 hover:border-pink-300/50"
          aria-label={t('ai_suggestions.generate_gender_suggestions')}
        >
          {isGenerating ? (
            <LoadingSpinner size={14} />
          ) : (
            <Sparkles size={14} className="animate-pulse" />
          )}
          <span className="font-semibold">
            {t('ai_suggestions.generate_gender_suggestions')}
          </span>
        </GlassButton>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <GlassButton
              variant="outline"
              disabled={isGenerating || learnedNamesCount === 0}
              size="sm"
              className="flex items-center gap-2 px-4 py-2 rounded-2xl font-medium text-sm shadow-xl shadow-red-500/20 hover:shadow-red-500/40 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-200/30 hover:border-red-300/50"
              aria-label={t('ai_suggestions.clear_learned_preferences')}
            >
              <LightbulbOff size={12} className="animate-pulse" />
              <span className="font-medium">
                {t('ai_suggestions.clear_learned_preferences')}
              </span>
            </GlassButton>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass rounded-3xl p-6 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-red-50/80 via-white/60 to-orange-50/80 dark:from-red-950/30 dark:via-gray-900/60 dark:to-orange-950/30 border border-white/20 dark:border-white/10">
            <AlertDialogHeader className="space-y-4">
              <AlertDialogTitle className="text-gray-800 dark:text-gray-100 text-xl font-bold">
                {t('ai_suggestions.confirm_clear_learning_title')}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                {t('ai_suggestions.confirm_clear_learning_description')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3 mt-6">
              <CancelButton text={t('common.cancel')} className="rounded-2xl px-6 py-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" />
              <AlertDialogAction
                onClick={handleClearLearnedPreferences}
                className="px-6 py-2 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium text-sm shadow-xl shadow-red-500/40 hover:shadow-red-500/60 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300"
              >
                {t('ai_suggestions.clear_learning_button')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default GenderSuggestionActions;
