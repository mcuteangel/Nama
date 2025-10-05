import React, { useState } from 'react';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { useTranslation } from "react-i18next";
import { GroupSuggestionCard } from './GroupSuggestionCard';
import { ContactSuggestions, GroupSuggestion } from '@/types/group-suggestions';

interface GroupSuggestionsListProps {
  contactSuggestions: ContactSuggestions[];
  onApplySuggestion: (suggestion: GroupSuggestion) => void;
  onDiscardSuggestion: (contactId: string, priority: number) => void;
}

export const GroupSuggestionsList: React.FC<GroupSuggestionsListProps> = ({
  contactSuggestions,
  onApplySuggestion,
  onDiscardSuggestion,
}) => {
  const { t } = useTranslation();
  const [hoveredSuggestion, setHoveredSuggestion] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  if (contactSuggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50/60 to-orange-50/60 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl border border-yellow-200/30 dark:border-yellow-800/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-2">
          <Lightbulb size={20} className="text-yellow-500" />
          <div className="min-w-0 flex-1">
            <h4 className="text-base font-bold text-gray-800 dark:text-gray-100">
              {t('ai_suggestions.pending_group_suggestions')}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              {t('ai_suggestions.suggestions_description', 'پیشنهادات هوشمند برای گروه‌بندی مخاطبین')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full text-xs font-semibold shadow-sm">
            {contactSuggestions.length}
          </div>
          <ArrowRight size={16} className="text-purple-500" />
        </div>
      </div>

      <div className="grid gap-4 max-h-96 overflow-y-auto">
        {contactSuggestions.map((contactSuggestion, index) => (
          <GroupSuggestionCard
            key={contactSuggestion.contact_id}
            contactName={contactSuggestion.contact_name}
            suggestions={contactSuggestion.suggestions}
            onApply={onApplySuggestion}
            onDiscard={onDiscardSuggestion}
            isHovered={hoveredSuggestion === contactSuggestion.contact_id}
            isSelected={selectedSuggestion === contactSuggestion.contact_id}
            onMouseEnter={() => setHoveredSuggestion(contactSuggestion.contact_id)}
            onMouseLeave={() => setHoveredSuggestion(null)}
            onClick={() => setSelectedSuggestion(
              selectedSuggestion === contactSuggestion.contact_id ? null : contactSuggestion.contact_id
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          />
        ))}
      </div>
    </div>
  );
};
