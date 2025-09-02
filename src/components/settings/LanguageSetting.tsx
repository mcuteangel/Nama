"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { Globe } from 'lucide-react';

const LanguageSetting: React.FC = () => {
  const { i18n, t } = useTranslation();

  const languages = [
    { value: 'fa', label: t('settings.persian'), flag: '🇮🇷' },
    { value: 'en', label: t('settings.english'), flag: '🇬🇧' }
  ];

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    // Optionally, persist the language preference in localStorage
    localStorage.setItem('i18nextLng', lng);
  };

  const currentLanguage = languages.find(lang => lang.value === i18n.language) || languages[0];

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="language-select" className="text-gray-700 dark:text-gray-200 flex items-center gap-2">
        <Globe className="h-4 w-4" />
        {t('settings.language')}
      </Label>
      <ModernSelect
        value={i18n.language}
        onValueChange={handleLanguageChange}
      >
        <ModernSelectTrigger id="language-select" variant="glass" className="w-full">
          <ModernSelectValue placeholder={t('settings.language')}>
            <span className="flex items-center gap-2">
              <span>{currentLanguage.flag}</span>
              <span>{currentLanguage.label}</span>
            </span>
          </ModernSelectValue>
        </ModernSelectTrigger>
        <ModernSelectContent variant="glass">
          {languages.map((language) => (
            <ModernSelectItem key={language.value} value={language.value}>
              <span className="flex items-center gap-2">
                <span>{language.flag}</span>
                <span>{language.label}</span>
              </span>
            </ModernSelectItem>
          ))}
        </ModernSelectContent>
      </ModernSelect>
    </div>
  );
};

export default LanguageSetting;