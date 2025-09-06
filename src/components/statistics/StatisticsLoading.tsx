import React from "react";
import { useTranslation } from "react-i18next";
import { BarChart3, Sparkles, Zap } from "lucide-react";
import { ModernCard, ModernCardHeader, ModernCardContent } from "@/components/ui/modern-card";
import { ModernLoader } from "@/components/ui/modern-loader";
import { ModernProgress } from "@/components/ui/modern-progress";

interface StatisticsLoadingProps {
  isDarkMode: boolean;
  isRTL: boolean;
}

const StatisticsLoading: React.FC<StatisticsLoadingProps> = ({ isDarkMode, isRTL }) => {
  const { t } = useTranslation();
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'} transition-all duration-700 p-3 sm:p-4 md:p-6 lg:p-8`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center py-8 sm:py-12 md:py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex justify-center mb-4 sm:mb-6 md:mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 rounded-2xl shadow-2xl">
                  <BarChart3 size={48} className="text-white animate-pulse" />
                </div>
                <Sparkles size={20} className="absolute -top-2 -right-2 text-yellow-400 animate-bounce" />
                <Zap size={16} className="absolute -bottom-2 -left-2 text-yellow-500 animate-ping" />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 sm:mb-6 animate-in fade-in slide-in-from-bottom-4">
              {t('statistics.title', 'آمار پیشرفته')}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '200ms' }}>
              {t('statistics.description', 'نمای کلی هوشمند از داده‌های شما با تحلیل‌های پیشرفته و پیش‌بینی‌های دقیق')}
            </p>

            <div className="flex items-center justify-center gap-4 mb-6 sm:mb-8">
              <ModernProgress
                value={75}
                variant="gradient"
                animated={true}
                className="max-w-lg h-3"
              />
              <div className="text-sm text-muted-foreground">
                {t('statistics.loading_data', 'بارگذاری داده‌ها...')}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '400ms' }}>
              <ModernLoader variant="spinner" size="lg" color="primary" />
              <div className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300">
                {t('common.loading', 'در حال بارگذاری')}
              </div>
            </div>
          </div>
        </div>

        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ModernCard
              key={`skeleton-${i}`}
              variant="glass"
              className="h-64 animate-pulse bg-gradient-to-br from-muted/30 to-muted/10 hover:shadow-xl transition-all duration-500"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <ModernCardHeader className="pb-4">
                <div className="h-6 bg-muted/50 rounded-lg w-3/4 mb-2 animate-pulse" />
                <div className="h-4 bg-muted/30 rounded-lg w-1/2 animate-pulse" />
              </ModernCardHeader>
              <ModernCardContent className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <ModernLoader variant="ring" size="lg" color="primary" />
                  <div className="h-2 bg-muted/30 rounded-full w-20 animate-pulse" />
                </div>
              </ModernCardContent>
            </ModernCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatisticsLoading;