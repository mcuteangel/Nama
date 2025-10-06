import React from 'react';
import { Copy, Activity, TrendingUp, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DuplicateManagementStats } from '@/types/contact.types';

interface DuplicateContactHeaderProps {
  stats: DuplicateManagementStats;
}

export const DuplicateContactHeader: React.FC<DuplicateContactHeaderProps> = ({ stats }) => {
  const { t } = useTranslation();

  return (
    <div className="relative bg-gradient-to-br from-orange-50/60 via-red-50/40 to-pink-50/20 dark:from-orange-900/20 dark:via-red-900/10 dark:to-pink-900/5 rounded-3xl p-6 border-2 border-orange-200/30 dark:border-orange-800/30 backdrop-blur-xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-pink-500/5"></div>
      <div className="relative flex items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-xl transform transition-all duration-300 hover:scale-110">
            <Copy size={32} className="text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
            {t('ai_suggestions.duplicate_contact_management_title')}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {t('ai_suggestions.duplicate_contact_management_description')}
          </p>
        </div>
      </div>

      {/* Enhanced Statistics */}
      {stats.total > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 dark:from-orange-500/20 dark:to-orange-600/20 rounded-2xl p-4 border border-orange-200/30 dark:border-orange-800/30 backdrop-blur-sm text-center">
            <Activity size={24} className="text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.total}</div>
            <div className="text-sm text-orange-500 dark:text-orange-300">{t('common.total')}</div>
          </div>

          <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 dark:from-red-500/20 dark:to-red-600/20 rounded-2xl p-4 border border-red-200/30 dark:border-red-800/30 backdrop-blur-sm text-center">
            <TrendingUp size={24} className="text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.highConfidence}</div>
            <div className="text-sm text-red-500 dark:text-red-300">{t('ai_suggestions.high_confidence')}</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 dark:from-yellow-500/20 dark:to-yellow-600/20 rounded-2xl p-4 border border-yellow-200/30 dark:border-yellow-800/30 backdrop-blur-sm text-center">
            <Target size={24} className="text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.mediumConfidence}</div>
            <div className="text-sm text-yellow-500 dark:text-yellow-300">{t('ai_suggestions.medium_confidence')}</div>
          </div>
        </div>
      )}
    </div>
  );
};
