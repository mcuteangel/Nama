"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { Globe } from 'lucide-react';
import { useAppSettings } from '@/hooks/use-app-settings';

const LanguageSetting: React.FC = () => {
  const { i18n, t } = useTranslation();
  const { settings, updateSettings } = useAppSettings();

  const languages = [
    { value: 'fa', label: t('settings.persian'), flag: '🇮🇷' },
    { value: 'en', label: t('settings.english'), flag: '🇬🇧' }
  ];

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    updateSettings({ language: lng as 'fa' | 'en' });
  };

  const currentLanguage = languages.find(lang => lang.value === i18n.language) || languages[0];

  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-200/50 dark:border-orange-800/50 transition-all duration-300 hover:shadow-md">
      <Label htmlFor="language-select" className="text-gray-800 dark:text-gray-200 flex items-center gap-2 font-medium">
        <div className="p-1.5 rounded-full bg-orange-100 dark:bg-orange-900/50">
          <Globe className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        </div>
        {t('settings.language')}
      </Label>
      <ModernSelect
        value={i18n.language}
        onValueChange={handleLanguageChange}
      >
        <ModernSelectTrigger id="language-select" variant="glass" className="w-full hover:bg-white/20 dark:hover:bg-white/5 transition-colors duration-200">
          <ModernSelectValue placeholder={t('settings.language')}>
            <span className="flex items-center gap-2">
              <span className="text-lg">{currentLanguage.flag}</span>
              <span className="font-medium">{currentLanguage.label}</span>
            </span>
          </ModernSelectValue>
        </ModernSelectTrigger>
        <ModernSelectContent variant="glass">
          {languages.map((language) => (
            <ModernSelectItem key={language.value} value={language.value} className="hover:bg-orange-50 dark:hover:bg-orange-950/30">
              <span className="flex items-center gap-2">
                <span className="text-lg">{language.flag}</span>
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