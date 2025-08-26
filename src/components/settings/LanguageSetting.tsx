"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
      <Select
        value={i18n.language}
        onValueChange={handleLanguageChange}
      >
        <SelectTrigger id="language-select" className="w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100">
          <SelectValue placeholder={t('settings.language')} />
        </SelectTrigger>
        <SelectContent className="backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
          <SelectItem value="fa">{t('settings.persian')}</SelectItem>
          <SelectItem value="en">{t('settings.english')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSetting;