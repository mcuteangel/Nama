import React from "react";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";

interface StatisticsFooterProps {
  isDarkMode: boolean;
}

const StatisticsFooter: React.FC<StatisticsFooterProps> = ({ isDarkMode }) => {
  const { t } = useTranslation();

  return (
    <div className="text-center py-8 sm:py-12">
      <div className={`inline-flex items-center gap-3 sm:gap-4 ${isDarkMode ? 'bg-gray-800/30' : 'bg-white/30'} backdrop-blur-2xl px-6 sm:px-8 py-4 sm:py-6 rounded-3xl shadow-2xl border ${isDarkMode ? 'border-gray-700/30' : 'border-gray-200/30'} hover:shadow-3xl transition-all duration-500 hover:scale-105`}>
        <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
          <Sparkles size={20} className="text-white" />
        </div>
        <div className="text-left">
          <span className="text-base sm:text-lg font-bold text-gray-700 dark:text-gray-300 block">
            {t('statistics.data_insights', 'تحلیل داده‌های شما')}
          </span>
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {t('statistics.data_insights_description', 'آمارهای دقیق و به‌روز • بروزرسانی لحظه‌ای')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-400 font-medium">آنلاین</span>
        </div>
      </div>
    </div>
  );
};

export default StatisticsFooter;