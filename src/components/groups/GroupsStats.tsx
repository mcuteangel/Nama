import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  TrendingUp,
  Activity,
  Zap,
  Users,
  Target,
  Crown,
  Gem
} from "lucide-react";

interface StatsData {
  totalGroups: number;
  filteredGroups: number;
  totalSuggestions: number;
  ungroupedContacts: number;
  completionRate: number;
}

interface GroupsStatsProps {
  stats: StatsData;
}

const GroupsStats: React.FC<GroupsStatsProps> = ({ stats }) => {
  const { t } = useTranslation();

  const statCards = [
    {
      icon: BarChart3,
      value: stats.totalGroups,
      label: t('groups.total_groups'),
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-500/10 to-blue-600/10',
      borderColor: 'border-blue-200/30 dark:border-blue-800/30',
      textColor: 'text-blue-600 dark:text-blue-400',
      iconColor: 'text-blue-500',
      description: t('groups.total_groups_desc', 'کل گروه‌های موجود'),
      trend: stats.totalGroups > 0 ? 'up' : 'neutral'
    },
    {
      icon: TrendingUp,
      value: `${stats.completionRate}%`,
      label: t('groups.completion_rate'),
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-500/10 to-green-600/10',
      borderColor: 'border-green-200/30 dark:border-green-800/30',
      textColor: 'text-green-600 dark:text-green-400',
      iconColor: 'text-green-500',
      description: t('groups.completion_rate_desc', 'درصد تکمیل سازماندهی'),
      trend: stats.completionRate > 50 ? 'up' : 'down'
    },
    {
      icon: Activity,
      value: stats.ungroupedContacts,
      label: t('groups.ungrouped'),
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-500/10 to-purple-600/10',
      borderColor: 'border-purple-200/30 dark:border-purple-800/30',
      textColor: 'text-purple-600 dark:text-purple-400',
      iconColor: 'text-purple-500',
      description: t('groups.ungrouped_desc', 'مخاطبین بدون گروه'),
      trend: stats.ungroupedContacts > 0 ? 'down' : 'up'
    },
    {
      icon: Zap,
      value: stats.totalSuggestions,
      label: t('groups.suggestions'),
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-500/10 to-orange-600/10',
      borderColor: 'border-orange-200/30 dark:border-orange-800/30',
      textColor: 'text-orange-600 dark:text-orange-400',
      iconColor: 'text-orange-500',
      description: t('groups.suggestions_desc', 'پیشنهادات هوشمند'),
      trend: stats.totalSuggestions > 0 ? 'up' : 'neutral'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} className="text-green-500" />;
      case 'down':
        return <TrendingUp size={16} className="text-red-500 rotate-180" />;
      default:
        return <Target size={16} className="text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="space-y-6"
    >
      {/* Stats Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('groups.stats_title', 'آمار گروه‌ها')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('groups.stats_description', 'نمای کلی از وضعیت گروه‌ها و سازماندهی')}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className={`
                relative overflow-hidden
                bg-gradient-to-br ${stat.bgColor} dark:${stat.bgColor}
                rounded-2xl p-6
                border ${stat.borderColor}
                backdrop-blur-sm
                hover:shadow-xl hover:shadow-${stat.iconColor}/20
                transition-all duration-500 ease-out
                transform hover:-translate-y-1 hover:scale-[1.02]
                cursor-pointer
              `}>
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

                {/* Floating particles effect */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
                  <div className="absolute top-1 right-1 w-1 h-1 bg-white/50 rounded-full animate-pulse"></div>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`
                      w-12 h-12 rounded-xl
                      bg-gradient-to-br ${stat.color}
                      flex items-center justify-center
                      shadow-lg group-hover:scale-110
                      transition-transform duration-300
                    `}>
                      <Icon size={24} className="text-white" />
                    </div>

                    <div className="flex items-center gap-1">
                      {getTrendIcon(stat.trend)}
                      <span className={`text-xs font-medium ${getTrendColor(stat.trend)}`}>
                        {stat.trend === 'up' ? '+' : stat.trend === 'down' ? '-' : '~'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className={`text-3xl font-bold ${stat.textColor} group-hover:scale-105 transition-transform duration-300`}>
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {stat.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">
                      {stat.description}
                    </div>
                  </div>

                  {/* Progress bar for completion rate */}
                  {stat.label === t('groups.completion_rate') && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${stats.completionRate}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-indigo-200/30 dark:border-indigo-800/30 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Crown size={24} className="text-white" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('groups.summary_title', 'خلاصه وضعیت')}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stats.totalGroups > 0
                  ? t('groups.summary_good', 'وضعیت گروه‌ها خوب است!')
                  : t('groups.summary_start', 'زمان شروع سازماندهی گروه‌ها فرا رسیده!')
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Gem size={20} className="text-purple-500" />
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
              {stats.completionRate >= 80 ? t('groups.excellent', 'عالی') :
               stats.completionRate >= 60 ? t('groups.good', 'خوب') :
               stats.completionRate >= 40 ? t('groups.fair', 'متوسط') :
               t('groups.needs_work', 'نیاز به بهبود')}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GroupsStats;