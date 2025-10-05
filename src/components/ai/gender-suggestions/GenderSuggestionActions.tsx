import React, { useState, useCallback } from 'react';
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
          onClick={onGenerateSuggestions}
          disabled={isGenerating || ungenderedContactsCount === 0}
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
    </div>
  );
};

export default GenderSuggestionActions;
