import React, { useMemo } from 'react';
import { TrendingUp, Activity, Zap, Award, Target, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import AIBaseCard from './AIBaseCard';
import { SuggestionSystemStats } from '@/types/ai-suggestions.types';

interface CompactStatsProps {
  // Props قدیمی برای backward compatibility
  newContacts?: number;
  updates?: number;
  total?: number;
  filtered?: number;
  className?: string;
  variant?: 'grid' | 'list' | 'cards';
  showTrend?: boolean;
  animated?: boolean;

  // Props جدید
  stats?: SuggestionSystemStats;
  compact?: boolean;
  showConfidence?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

const CompactStats: React.FC<CompactStatsProps> = ({
  // Props قدیمی
  newContacts,
  updates,
  total,
  filtered,
  className = '',
  variant = 'grid',
  showTrend = true,
  animated = true,

  // Props جدید
  stats,
  compact = false,
  showConfidence = false,
  theme = 'auto'
}) => {
  const { t } = useTranslation();

  // استفاده از props قدیمی اگر props جدید موجود نباشد
  const currentStats = stats || {
    totalSuggestions: total || 0,
    pendingSuggestions: 0,
    processingSuggestions: 0,
    completedSuggestions: newContacts || 0,
    failedSuggestions: 0,
    averageProcessingTime: 0,
    successRate: total ? (newContacts || 0) / total * 100 : 0,
    suggestionsByType: {
      contact_extraction: total || 0,
      gender_suggestion: 0,
      duplicate_detection: 0,
      smart_grouping: 0
    },
    suggestionsByPriority: {
      high: 0,
      medium: total || 0,
      low: 0
    },
    recentActivity: {
      last24Hours: 0,
      last7Days: 0,
      last30Days: 0
    }
  };

  // تعریف آمارها با اطلاعات پیشرفته
  const statItems = useMemo(() => [
    {
      key: 'total',
      label: t('ai_suggestions.total_suggestions', 'کل پیشنهادات'),
      value: currentStats.totalSuggestions,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50/60 via-purple-100/40 to-purple-50/20 dark:from-purple-900/30 dark:via-purple-800/20 dark:to-purple-700/10',
      borderColor: 'border-purple-200/40 dark:border-purple-800/40',
      glowColor: 'shadow-purple-500/20',
      trend: 'up' as const,
      description: t('ai_suggestions.total_suggestions_desc', 'تمام پیشنهادات تولید شده'),
      percentage: 100
    },
    {
      key: 'pending',
      label: t('ai_suggestions.pending', 'در انتظار'),
      value: currentStats.pendingSuggestions,
      icon: Activity,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'from-yellow-50/60 via-yellow-100/40 to-yellow-50/20 dark:from-yellow-900/30 dark:via-yellow-800/20 dark:to-yellow-700/10',
      borderColor: 'border-yellow-200/40 dark:border-yellow-800/40',
      glowColor: 'shadow-yellow-500/20',
      trend: currentStats.pendingSuggestions > 0 ? 'up' as const : 'neutral' as const,
      description: t('ai_suggestions.pending_desc', 'پیشنهادات در حال بررسی'),
      percentage: currentStats.totalSuggestions > 0 ? (currentStats.pendingSuggestions / currentStats.totalSuggestions) * 100 : 0
    },
    {
      key: 'processing',
      label: t('ai_suggestions.processing', 'در حال پردازش'),
      value: currentStats.processingSuggestions,
      icon: Zap,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50/60 via-blue-100/40 to-blue-50/20 dark:from-blue-900/30 dark:via-blue-800/20 dark:to-blue-700/10',
      borderColor: 'border-blue-200/40 dark:border-blue-800/40',
      glowColor: 'shadow-blue-500/20',
      trend: 'up' as const,
      description: t('ai_suggestions.processing_desc', 'پیشنهادات در حال اجرا'),
      percentage: currentStats.totalSuggestions > 0 ? (currentStats.processingSuggestions / currentStats.totalSuggestions) * 100 : 0
    },
    {
      key: 'completed',
      label: t('ai_suggestions.completed', 'تکمیل شده'),
      value: currentStats.completedSuggestions,
      icon: Award,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50/60 via-green-100/40 to-green-50/20 dark:from-green-900/30 dark:via-green-800/20 dark:to-green-700/10',
      borderColor: 'border-green-200/40 dark:border-green-800/40',
      glowColor: 'shadow-green-500/20',
      trend: 'up' as const,
      description: t('ai_suggestions.completed_desc', 'پیشنهادات موفق'),
      percentage: currentStats.totalSuggestions > 0 ? (currentStats.completedSuggestions / currentStats.totalSuggestions) * 100 : 0
    },
    {
      key: 'failed',
      label: t('ai_suggestions.failed', 'ناموفق'),
      value: currentStats.failedSuggestions,
      icon: Target,
      color: 'from-red-500 to-red-600',
      bgColor: 'from-red-50/60 via-red-100/40 to-red-50/20 dark:from-red-900/30 dark:via-red-800/20 dark:to-red-700/10',
      borderColor: 'border-red-200/40 dark:border-red-800/40',
      glowColor: 'shadow-red-500/20',
      trend: currentStats.failedSuggestions > 0 ? 'down' as const : 'neutral' as const,
      description: t('ai_suggestions.failed_desc', 'پیشنهادات ناموفق'),
      percentage: currentStats.totalSuggestions > 0 ? (currentStats.failedSuggestions / currentStats.totalSuggestions) * 100 : 0
    },
    {
      key: 'success_rate',
      label: t('ai_suggestions.success_rate', 'نرخ موفقیت'),
      value: Math.round(currentStats.successRate),
      icon: Users,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'from-emerald-50/60 via-emerald-100/40 to-emerald-50/20 dark:from-emerald-900/30 dark:via-emerald-800/20 dark:to-emerald-700/10',
      borderColor: 'border-emerald-200/40 dark:border-emerald-800/40',
      glowColor: 'shadow-emerald-500/20',
      trend: currentStats.successRate > 80 ? 'up' as const : currentStats.successRate > 60 ? 'neutral' as const : 'down' as const,
      description: t('ai_suggestions.success_rate_desc', 'درصد موفقیت پیشنهادات'),
      percentage: currentStats.successRate,
      suffix: '%'
    }
  ], [currentStats, t]);

  // رندر آمار به صورت کارت
  const renderStatCard = (stat: typeof statItems[0], index: number) => {
    const Icon = stat.icon;

    return (
      <AIBaseCard
        key={stat.key}
        title={`${stat.value}${stat.suffix || ''}`}
        description={stat.label}
        icon={<Icon size={20} className="text-white drop-shadow-sm" />}
        variant="gradient"
        compact
        animated={animated}
        className={`relative group overflow-hidden ${variant === 'grid' ? 'h-full' : ''}`}
      >
        {/* نوار پیشرفت برای نمایش درصد */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        {/* انیمیشن ذرات معلق */}
        <div className="absolute top-2 right-2 w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: `${index * 200}ms` }}></div>
        <div className="absolute bottom-3 left-3 w-1 h-1 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: `${index * 300}ms` }}></div>

        {/* محتوای اصلی کارت */}
        <div className="space-y-2">
          {/* مقدار اصلی با انیمیشن شمارنده */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-bold text-gray-800 dark:text-gray-100 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}{stat.suffix || ''}
                </span>
                {showTrend && stat.trend === 'up' && (
                  <div className="w-0 h-0 border-l-4 border-r-4 border-b-6 border-l-transparent border-r-transparent border-b-green-500 animate-bounce"></div>
                )}
                {showTrend && stat.trend === 'down' && (
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-red-500 animate-bounce"></div>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                {stat.description}
              </p>
            </div>
            <div className={`
              relative p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg
              transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6
            `}>
              <Icon size={20} className="text-white drop-shadow-sm" />
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-50 rounded-xl blur-sm`}></div>
            </div>
          </div>

          {/* نوار پیشرفت برای نمایش درصد نسبی */}
          {stat.percentage > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t('common.progress', 'پیشرفت')}
                </span>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {Math.round(stat.percentage)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${stat.percentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </AIBaseCard>
    );
  };

  // رندر بر اساس نوع نمایش
  if (variant === 'grid') {
    return (
      <div className={`grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 ${className}`}>
        {statItems.map((stat, index) => renderStatCard(stat, index))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {statItems.map((stat, index) => (
          <div key={stat.key} className={`flex items-center justify-between p-4 rounded-xl bg-gradient-to-r ${stat.bgColor} border ${stat.borderColor}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                <stat.icon size={16} className="text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{stat.label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stat.value}{stat.suffix || ''}</p>
              {stat.percentage > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{Math.round(stat.percentage)}%</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // variant === 'cards'
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {statItems.map((stat, index) => renderStatCard(stat, index))}
    </div>
  );
};

export default CompactStats;
