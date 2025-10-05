import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, TrendingUp, CheckCircle, XCircle, User } from 'lucide-react';
import { GlassButton } from "@/components/ui/glass-button";
import AIBaseCard from '../AIBaseCard';
import EmptyState from '../../common/EmptyState';
import { ErrorManager } from '@/lib/error-manager';
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
                  onClick={() => onAcceptSuggestion(suggestion)}
                  className="w-10 h-10 rounded-2xl bg-green-500/10 hover:bg-green-500/20 dark:bg-green-900/30 dark:hover:bg-green-800/50 text-green-600 hover:text-green-700 transition-all duration-300 hover:scale-110 border-2 border-green-200/50 dark:border-green-800/50"
                  aria-label={t('ai_suggestions.accept_gender_suggestion')}
                >
                  <CheckCircle size={18} />
                </GlassButton>
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() => onDiscardSuggestion(suggestion.id)}
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
  );
};

export default GenderSuggestionList;
