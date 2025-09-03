import React from 'react';
import { PlusCircle, RefreshCw, TrendingUp, Target } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CompactStatsProps {
  newContacts: number;
  updates: number;
  total: number;
  filtered: number;
  className?: string;
}

const CompactStats: React.FC<CompactStatsProps> = ({
  newContacts,
  updates,
  total,
  filtered,
  className = ''
}) => {
  const { t } = useTranslation();

  const stats = [
    {
      label: t('ai_suggestions.new_contacts', 'مخاطب جدید'),
      value: newContacts,
      icon: PlusCircle,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30'
    },
    {
      label: t('ai_suggestions.updates', 'به‌روزرسانی'),
      value: updates,
      icon: RefreshCw,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30'
    },
    {
      label: t('ai_suggestions.total_suggestions', 'کل پیشنهادات'),
      value: total,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30'
    },
    {
      label: t('ai_suggestions.filtered', 'نمایش داده شده'),
      value: filtered,
      icon: Target,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30'
    }
  ];

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 ${className}`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`bg-gradient-to-r ${stat.bgColor} p-3 rounded-lg border border-white/30 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </p>
              </div>
              <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} shadow-sm`}>
                <Icon size={16} className="text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CompactStats;