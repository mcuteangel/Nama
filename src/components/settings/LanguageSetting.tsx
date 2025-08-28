"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';

const LanguageSetting: React.FC = () => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    // Optionally, persist the language preference in localStorage
    localStorage.setItem('i18nextLng', lng);
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="language-select" className="text-gray-700 dark:text-gray-200">
        {t('settings.language')}
      </Label>
      <ModernSelect
        value={i18n.language}
        onValueChange={handleLanguageChange}
      >
        <ModernSelectTrigger id="language-select" variant="glass" className="w-full">
          <ModernSelectValue placeholder={t('settings.language')} />
        </ModernSelectTrigger>
        <ModernSelectContent variant="glass">
          <ModernSelectItem value="fa">{t('settings.persian')}</ModernSelectItem>
          <ModernSelectItem value="en">{t('settings.english')}</ModernSelectItem>
        </ModernSelectContent>
      </ModernSelect>
    </div>
  );
};

export default LanguageSetting;