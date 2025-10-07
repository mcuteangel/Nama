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
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="language-select" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          <Globe className="h-4 w-4 text-orange-500" />
          {t('settings.language')}
        </Label>
        
        <ModernSelect
          value={i18n.language}
          onValueChange={handleLanguageChange}
        >
          <ModernSelectTrigger 
            id="language-select"
            variant="glass"
            className="w-full border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 hover:bg-white/90 dark:hover:bg-gray-700/90 transition-colors"
          >
            <ModernSelectValue>
              <div className="flex items-center gap-2">
                <span className="text-base">{currentLanguage.flag}</span>
                <span className="text-gray-800 dark:text-gray-100">{currentLanguage.label}</span>
              </div>
            </ModernSelectValue>
          </ModernSelectTrigger>
          
          <ModernSelectContent 
            variant="glass"
            className="mt-1 w-[var(--radix-select-trigger-width)] min-w-[180px] p-1"
            position="popper"
            sideOffset={8}
          >
            {languages.map((language) => (
              <ModernSelectItem 
                key={language.value} 
                value={language.value}
                className="px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{language.flag}</span>
                  <span className="text-gray-800 dark:text-gray-200">{language.label}</span>
                </div>
              </ModernSelectItem>
            ))}
          </ModernSelectContent>
        </ModernSelect>
      </div>
    </div>
  );
};

export default LanguageSetting;