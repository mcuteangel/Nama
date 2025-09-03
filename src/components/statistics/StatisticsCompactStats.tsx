import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { BarChart3, Users, Calendar, Award } from "lucide-react";
import { StatisticsData } from "./types";

interface StatisticsCompactStatsProps {
  data: StatisticsData;
}

export const StatisticsCompactStats: React.FC<StatisticsCompactStatsProps> = ({ data }) => {
  const { t } = useTranslation();

  const stats = useMemo(() => [
    {
      label: t('statistics.total_contacts', 'کل مخاطبین'),
      value: data.totalContacts || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30'
    },
    {
      label: t('statistics.active_groups', 'گروه‌های فعال'),
      value: data.groupData?.length || 0,
      icon: BarChart3,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30'
    },
    {
      label: t('statistics.upcoming_birthdays', 'تولدهای نزدیک'),
      value: data.upcomingBirthdays?.length || 0,
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30'
    },
    {
      label: t('statistics.top_companies', 'شرکت‌های برتر'),
      value: data.topCompaniesData?.length || 0,
      icon: Award,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30'
    }
  ], [data, t]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`bg-gradient-to-r ${stat.bgColor} p-4 rounded-xl border border-white/30 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4`}
            style={{ animationDelay: `${index * 100}ms` }}
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
                <Icon size={20} className="text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatisticsCompactStats;