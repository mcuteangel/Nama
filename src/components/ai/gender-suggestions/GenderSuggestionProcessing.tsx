import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Loader2 } from 'lucide-react';
import AIBaseCard from '../AIBaseCard';

interface GenderSuggestionProcessingProps {
  isGenerating: boolean;
}

const GenderSuggestionProcessing: React.FC<GenderSuggestionProcessingProps> = ({
  isGenerating,
}) => {
  const { t } = useTranslation();

  if (!isGenerating) {
    return null;
  }

  return (
    <AIBaseCard
      title={t('ai_suggestions.ai_processing_gender', 'هوش مصنوعی در حال تحلیل')}
      description={t('ai_suggestions.analyzing_names', 'نام‌ها را برای تعیین جنسیت تحلیل می‌کند...')}
      icon={<Heart size={20} className="text-pink-500 animate-pulse" />}
      variant="warning"
      className="rounded-3xl shadow-2xl backdrop-blur-xl bg-gradient-to-br from-pink-50/80 via-white/60 to-purple-50/80 dark:from-pink-950/30 dark:via-gray-900/60 dark:to-purple-950/30 border border-white/20 dark:border-white/10 hover:shadow-pink-500/20 hover:shadow-2xl transition-all duration-500 animate-pulse"
    >
      <div className="relative">
        {/* Animated Progress Bar */}
        <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-3 mb-4 overflow-hidden backdrop-blur-sm">
          <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 h-3 rounded-full animate-pulse shadow-lg shadow-pink-500/30" style={{ width: '80%' }}></div>
        </div>

        {/* Processing Steps */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100/50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-sm font-medium backdrop-blur-sm border border-pink-200/30 dark:border-pink-800/30">
            <Loader2 size={14} className="animate-spin text-pink-500" />
            <span>{t('ai_suggestions.processing_names', 'مرحله: یادگیری از نام‌های قبلی')}</span>
          </div>
        </div>

        {/* Animated Dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                boxShadow: '0 0 10px rgba(236, 72, 153, 0.3)'
              }}
            />
          ))}
        </div>

        {/* Subtle Glow Effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pink-500/5 to-purple-500/5 opacity-50 animate-pulse pointer-events-none" />
      </div>
    </AIBaseCard>
  );
};

export default GenderSuggestionProcessing;
