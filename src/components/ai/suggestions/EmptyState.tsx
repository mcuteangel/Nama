import React from 'react';
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

export const EmptyState: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-50/50 dark:bg-gray-800/20 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
      <div className="mb-6">
        <Sparkles size={48} className="mx-auto text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">
        {t('ai_suggestions.ready_to_start', 'آماده شروع هستیم!')}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {t('ai_suggestions.enter_text_to_start', 'متن خود را وارد کنید تا هوش مصنوعی شروع به کار کند')}
      </p>
      <div className="text-xs text-gray-400 dark:text-gray-500">
        💡 {t('common.hint', 'راهنمایی')}: {t('ai_suggestions.enter_text_hint', 'متن خود را در کادر بالا وارد کنید')}
      </div>
    </div>
  );
};
