import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
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
      className="animate-pulse"
    >
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full animate-pulse" style={{ width: '80%' }}></div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        {t('ai_suggestions.processing_names', 'مرحله: یادگیری از نام‌های قبلی')}
      </p>
    </AIBaseCard>
  );
};

export default GenderSuggestionProcessing;
