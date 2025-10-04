import React from 'react';
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

export const EmptyState: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-12 border border-white/20 text-center">
      <div className="relative mb-8">
        <Sparkles size={80} className="mx-auto text-blue-400 animate-pulse" />
        <div className="absolute -top-4 -right-4">
          <div className="w-8 h-8 bg-yellow-400 rounded-full animate-ping"></div>
          <div className="w-8 h-8 bg-yellow-400 rounded-full absolute top-0 left-0 animate-pulse"></div>
        </div>
      </div>
      <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        {t('ai_suggestions.ready_to_start', 'آماده شروع هستیم!')} 🚀
      </h3>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
        {t('ai_suggestions.enter_text_to_start', 'متن خود را وارد کنید تا هوش مصنوعی شروع به کار کند')}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
          <p className="font-semibold text-blue-800 dark:text-blue-200 mb-2">💡 {t('common.hint', 'راهنمایی')}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">{t('ai_suggestions.enter_text_hint', 'متن خود را در کادر بالا وارد کنید')}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-700">
          <p className="font-semibold text-purple-800 dark:text-purple-200 mb-2">🎤 {t('common.voice', 'صدا')}</p>
          <p className="text-sm text-purple-600 dark:text-purple-400">{t('ai_suggestions.use_microphone_hint', 'از میکروفون برای ورود متن استفاده کنید')}</p>
        </div>
      </div>
    </div>
  );
};
