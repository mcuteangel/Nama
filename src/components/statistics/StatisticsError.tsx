import React from "react";
import { useTranslation } from "react-i18next";
import { BarChart3, RefreshCw, Home, Clock } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import { EmptyState } from "@/components/common/EmptyState";

interface StatisticsErrorProps {
  error: string;
  onRetry: () => void;
  isDarkMode: boolean;
}

const StatisticsError: React.FC<StatisticsErrorProps> = ({ 
  error, 
  onRetry, 
  isDarkMode 
}) => {
  const { t } = useTranslation();
  const currentTime = new Date();
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-red-900/30 to-pink-900/30' : 'bg-gradient-to-br from-red-50 via-pink-50 to-orange-50'} transition-all duration-700 p-3 sm:p-4 md:p-6 lg:p-8`}>
      <div className="max-w-6xl mx-auto">
        <EmptyState
          icon={BarChart3}
          title={t('statistics.error_boundary.title', 'خطا در بارگذاری آمار')}
          description={t('statistics.error_boundary.description', 'متاسفانه در بارگذاری داده‌های آماری مشکلی پیش آمده است.')}
          className="min-h-[70vh] bg-gradient-to-br from-red-50/60 to-red-100/40 dark:from-red-950/30 dark:to-red-900/20 border-red-200/60 dark:border-red-800/60 rounded-3xl shadow-2xl"
        >
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
            <GlassButton
              variant="glass"
              effect="lift"
              onClick={onRetry}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-xl hover:shadow-red-500/30 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl"
            >
              <RefreshCw size={18} className="mr-2 sm:mr-3" />
              {t('statistics.error_boundary.retry', 'تلاش مجدد')}
            </GlassButton>

            <GlassButton
              variant="outline"
              effect="lift"
              onClick={() => window.location.href = '/'}
              className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/50 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl"
            >
              <Home size={18} className="mr-2 sm:mr-3" />
              {t('statistics.error_boundary.go_home', 'صفحه اصلی')}
            </GlassButton>

            <GlassButton
              variant="ghost"
              effect="lift"
              onClick={() => window.location.reload()}
              className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl"
            >
              <RefreshCw size={18} className="mr-2 sm:mr-3" />
              {t('statistics.error_boundary.reload_page', 'بارگذاری مجدد')}
            </GlassButton>
          </div>

          <details className="mt-4 sm:mt-6 text-left bg-red-50/50 dark:bg-red-950/20 rounded-2xl p-4 sm:p-6 max-w-4xl mx-auto backdrop-blur-sm border border-red-200/30">
            <summary className="cursor-pointer font-bold text-red-700 dark:text-red-300 text-base sm:text-lg">
              {t('statistics.error_boundary.technical_details', 'جزئیات فنی')}
            </summary>
            <div className="mt-3 sm:mt-4 space-y-3 text-sm">
              <div>
                <strong className="text-red-800 dark:text-red-200">
                  {t('statistics.error_boundary.message', 'پیام خطا')}:
                </strong>
                <pre className="mt-2 p-3 sm:p-4 bg-red-100/50 dark:bg-red-900/30 rounded-xl text-red-800 dark:text-red-200 whitespace-pre-wrap border border-red-200/30">
                  {error}
                </pre>
              </div>
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <Clock size={14} />
                <span>زمان وقوع: {currentTime.toLocaleString('fa-IR')}</span>
              </div>
            </div>
          </details>
        </EmptyState>
      </div>
    </div>
  );
};

export default StatisticsError;