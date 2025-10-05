import React from 'react';
import { AlertTriangle, Zap, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import EmptyState from '../common/EmptyState';
import { DuplicateContactCard } from './DuplicateContactCard';
import { DuplicatePair, DuplicateContact } from '@/types/contact.types';

interface DuplicateContactListProps {
  duplicatePairs: DuplicatePair[];
  hoveredPair: string | null;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
  onMerge: (mainContact: DuplicateContact, duplicateContact: DuplicateContact) => void;
  onDiscard: (duplicateId: string) => void;
}

export const DuplicateContactList: React.FC<DuplicateContactListProps> = ({
  duplicatePairs,
  hoveredPair,
  onMouseEnter,
  onMouseLeave,
  onMerge,
  onDiscard,
}) => {
  const { t } = useTranslation();

  if (duplicatePairs.length === 0) {
    return (
      <EmptyState
        icon={Copy}
        title={t('ai_suggestions.no_duplicates_found')}
        description={t('ai_suggestions.no_duplicates_found_description')}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50/60 to-orange-50/60 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl border border-red-200/30 dark:border-red-800/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <AlertTriangle size={24} className="text-red-500 animate-pulse" />
          <div>
            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {t('ai_suggestions.pending_duplicate_suggestions')}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t('ai_suggestions.duplicates_detected', 'تکراری‌های شناسایی شده نیاز به بررسی دارند')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-3 py-1 rounded-full text-sm font-semibold">
            {duplicatePairs.length}
          </div>
          <Zap size={20} className="text-red-500" />
        </div>
      </div>

      <div className="grid gap-4 max-h-96 overflow-y-auto">
        {duplicatePairs.map((pair, index) => (
          <DuplicateContactCard
            key={index}
            pair={pair}
            index={index}
            isHovered={hoveredPair === pair.mainContact.id}
            onMouseEnter={() => onMouseEnter(pair.mainContact.id)}
            onMouseLeave={onMouseLeave}
            onMerge={() => onMerge(pair.mainContact, pair.duplicateContact)}
            onDiscard={() => onDiscard(pair.duplicateContact.id)}
          />
        ))}
      </div>
    </div>
  );
};
