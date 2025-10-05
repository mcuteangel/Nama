import React from 'react';
import { Merge, XCircle, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { GlassButton } from "@/components/ui/glass-button";
import { DuplicatePair } from '@/types/contact.types';

interface DuplicateContactCardProps {
  pair: DuplicatePair;
  index: number;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onMerge: () => void;
  onDiscard: () => void;
}

export const DuplicateContactCard: React.FC<DuplicateContactCardProps> = ({
  pair,
  index,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onMerge,
  onDiscard,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={`
        group bg-white/10 dark:bg-gray-900/20 backdrop-blur-2xl
        border border-white/20 dark:border-gray-700/30
        p-8 rounded-3xl shadow-2xl hover:shadow-3xl
        transition-all duration-700 ease-out transform
        hover:scale-[1.03] hover:bg-white/15 dark:hover:bg-gray-900/30
        ${isHovered ? 'border-red-300/50 shadow-red-500/20 bg-red-50/5 dark:bg-red-900/10' : ''}
        animate-slide-in
      `}
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="region"
      aria-labelledby={`duplicate-${index}`}
    >
      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 mb-4">
        <Info size={14} className="text-blue-500" />
        <span id={`duplicate-${index}`} className="font-semibold">
          {t('ai_suggestions.duplicate_reason')}: {pair.reason}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 border border-blue-200/20 dark:border-blue-800/20 rounded-2xl bg-gradient-to-br from-blue-50/20 to-blue-100/10 dark:from-blue-900/10 dark:to-blue-800/5 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300">
          <p className="font-bold text-lg text-blue-800 dark:text-blue-200 mb-2">
            {t('ai_suggestions.main_contact')}: {pair.mainContact.first_name} {pair.mainContact.last_name}
          </p>
          {pair.mainContact.email_addresses.slice(0, 1).map((e, i) => (
            <p key={i} className="text-sm text-gray-600 dark:text-gray-300 truncate">{e.email_address}</p>
          ))}
          {pair.mainContact.phone_numbers.slice(0, 1).map((p, i) => (
            <p key={i} className="text-sm text-gray-600 dark:text-gray-300">{p.phone_number}</p>
          ))}
        </div>
        <div className="p-6 border border-red-200/20 dark:border-red-800/20 rounded-2xl bg-gradient-to-br from-red-50/20 to-red-100/10 dark:from-red-900/10 dark:to-red-800/5 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300">
          <p className="font-bold text-lg text-red-800 dark:text-red-200 mb-2">
            {t('ai_suggestions.duplicate_contact')}: {pair.duplicateContact.first_name} {pair.duplicateContact.last_name}
          </p>
          {pair.duplicateContact.email_addresses.slice(0, 1).map((e, i) => (
            <p key={i} className="text-sm text-gray-600 dark:text-gray-300 truncate">{e.email_address}</p>
          ))}
          {pair.duplicateContact.phone_numbers.slice(0, 1).map((p, i) => (
            <p key={i} className="text-sm text-gray-600 dark:text-gray-300">{p.phone_number}</p>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <GlassButton
          variant="ghost"
          size="sm"
          onClick={onMerge}
          className="w-10 h-10 rounded-2xl bg-green-500/10 hover:bg-green-500/20 dark:bg-green-900/30 dark:hover:bg-green-800/50 text-green-600 hover:text-green-700 transition-all duration-300 hover:scale-110 border-2 border-green-200/50 dark:border-green-800/50"
          aria-label={t('ai_suggestions.merge_contacts')}
        >
          <Merge size={18} />
        </GlassButton>
        <GlassButton
          variant="ghost"
          size="sm"
          onClick={onDiscard}
          className="w-10 h-10 rounded-2xl bg-red-500/10 hover:bg-red-500/20 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-600 hover:text-red-700 transition-all duration-300 hover:scale-110 border-2 border-red-200/50 dark:border-red-800/50"
          aria-label={t('common.discard')}
        >
          <XCircle size={18} />
        </GlassButton>
      </div>
    </div>
  );
};
