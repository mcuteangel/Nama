import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, TrendingUp, CheckCircle, XCircle, User } from 'lucide-react';
import { FaMars, FaVenus, FaGenderless } from 'react-icons/fa';
import { GlassButton } from "@/components/ui/glass-button";
import AIBaseCard from '../AIBaseCard';
import EmptyState from '../../common/EmptyState';
import { GenderSuggestion } from '@/types/ai-suggestions.types';

interface ContactForGenderSuggestion {
  id: string;
  first_name: string;
  last_name: string;
  gender: 'male' | 'female' | 'not_specified';
}

interface GenderSuggestionListProps {
  ungenderedContacts: ContactForGenderSuggestion[];
  genderSuggestions: GenderSuggestion[];
  isGenerating: boolean;
  onAcceptSuggestion: (suggestion: GenderSuggestion) => void;
  onDiscardSuggestion: (suggestionId: string) => void;
}

const GenderSuggestionList: React.FC<GenderSuggestionListProps> = ({
  ungenderedContacts,
  genderSuggestions,
  isGenerating,
  onAcceptSuggestion,
  onDiscardSuggestion,
}) => {
  const { t } = useTranslation();
  const [hoveredSuggestion, setHoveredSuggestion] = useState<string | null>(null);

  // وضعیت خالی - همه مخاطبین جنسیت دارند
  if (ungenderedContacts.length === 0 && !isGenerating) {
    return (
      <EmptyState
        icon={User}
        title={t('ai_suggestions.all_contacts_gendered')}
        description={t('ai_suggestions.all_contacts_gendered_description')}
        className="rounded-3xl shadow-2xl backdrop-blur-xl bg-gradient-to-br from-green-50/80 via-white/60 to-blue-50/80 dark:from-green-950/30 dark:via-gray-900/60 dark:to-blue-950/30 border border-white/20 dark:border-white/10"
      />
    );
  }

  // اگر پیشنهادی وجود نداشته باشه، چیزی نمایش نده
  if (genderSuggestions.length === 0) {
    return null;
  }

  return (
    <AIBaseCard
      title={t('ai_suggestions.pending_gender_suggestions')}
      description={t('ai_suggestions.gender_suggestions_ready' )}
      icon={<Sparkles size={20} className="text-yellow-500 animate-pulse" />}
      variant="warning"
      className="rounded-3xl shadow-2xl backdrop-blur-xl bg-gradient-to-br from-yellow-50/80 via-white/60 to-orange-50/80 dark:from-yellow-950/30 dark:via-gray-900/60 dark:to-orange-950/30 border border-white/20 dark:border-white/10 hover:shadow-yellow-500/20 hover:shadow-2xl transition-all duration-500"
      actions={
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg shadow-purple-500/30 transform hover:scale-105 transition-all duration-300">
            {genderSuggestions.length}
          </div>
          <TrendingUp size={20} className="text-purple-500 animate-pulse" />
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
              suggestion.suggestedGender === 'male' ? (
                <FaMars size={20} className="text-blue-500" />
              ) : suggestion.suggestedGender === 'female' ? (
                <FaVenus size={20} className="text-pink-500" />
              ) : (
                <FaGenderless size={20} className="text-gray-500" />
              )
            }
            variant={suggestion.suggestedGender === 'male' ? 'primary' : 'danger'}
            compact
            animated={false}
            hoverable={true}
            priority={suggestion.priority}
            status={suggestion.status}
            confidence={suggestion.confidence.score}
            showConfidence={true}
            className={`rounded-2xl shadow-xl backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:-translate-y-1 ${
              hoveredSuggestion === suggestion.id
                ? 'ring-2 ring-pink-300/70 shadow-pink-500/30 bg-gradient-to-br from-pink-50/90 to-purple-50/90 dark:from-pink-950/40 dark:to-purple-950/40'
                : 'bg-gradient-to-br from-white/60 to-gray-50/60 dark:from-gray-900/60 dark:to-gray-800/60'
            }`}
            actions={
              <div className="flex gap-3">
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() => onAcceptSuggestion(suggestion)}
                  className="w-12 h-12 rounded-2xl bg-green-500/10 hover:bg-green-500/20 dark:bg-green-900/30 dark:hover:bg-green-800/50 text-green-600 hover:text-green-700 transition-all duration-300 hover:scale-110 border-2 border-green-200/50 dark:border-green-800/50 shadow-lg hover:shadow-green-500/30 backdrop-blur-sm"
                  aria-label={t('ai_suggestions.accept_gender_suggestion')}
                >
                  <CheckCircle size={20} className="animate-pulse" />
                </GlassButton>
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() => onDiscardSuggestion(suggestion.id)}
                  className="w-12 h-12 rounded-2xl bg-red-500/10 hover:bg-red-500/20 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-600 hover:text-red-700 transition-all duration-300 hover:scale-110 border-2 border-red-200/50 dark:border-red-800/50 shadow-lg hover:shadow-red-500/30 backdrop-blur-sm"
                  aria-label={t('common.discard')}
                >
                  <XCircle size={20} className="animate-pulse" />
                </GlassButton>
              </div>
            }
            style={{ animationDelay: `${index * 100}ms` }}
            onMouseEnter={() => setHoveredSuggestion(suggestion.id)}
            onMouseLeave={() => setHoveredSuggestion(null)}
          />
        ))}
      </div>
    </AIBaseCard>
  );
};

export default GenderSuggestionList;
