import React from "react";
import { useTranslation } from 'react-i18next';
import { Label } from "@/components/ui/label";
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from "@/components/ui/modern-select";
import { LayoutGrid, List } from 'lucide-react';
import { useAppSettings } from '@/hooks/use-app-settings';

const ContactDisplaySetting = () => {
  const { t } = useTranslation();
  const { settings, updateSettings } = useAppSettings();

  // Handle display mode change
  const handleDisplayModeChange = (value: string) => {
    const mode = value as 'grid' | 'list';
    updateSettings({ contactDisplayMode: mode });
  };

  const displayModes = [
    {
      value: 'grid',
      label: t('settings.display_mode_grid'),
      icon: <LayoutGrid className="h-4 w-4" />
    },
    {
      value: 'list',
      label: t('settings.display_mode_list'),
      icon: <List className="h-4 w-4" />
    }
  ];

  const currentMode = displayModes.find(mode => mode.value === settings.contactDisplayMode) || displayModes[0];

  return (
    <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border border-cyan-200/50 dark:border-cyan-800/50 transition-all duration-300 hover:shadow-md">
      <div className="space-y-3">
        <Label className="text-gray-800 dark:text-gray-200 flex items-center gap-2 font-medium">
          <div className="p-1.5 rounded-full bg-cyan-100 dark:bg-cyan-900/50">
            <LayoutGrid className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          {t('settings.default_contact_display_mode')}
        </Label>
        <ModernSelect onValueChange={handleDisplayModeChange} value={settings.contactDisplayMode}>
          <ModernSelectTrigger variant="glass" className="w-full backdrop-blur-md border border-white/20 hover:bg-white/20 dark:hover:bg-white/5 transition-colors duration-200">
            <ModernSelectValue placeholder={t('settings.select_display_mode')}>
              <span className="flex items-center gap-2">
                <div className="p-1 rounded bg-cyan-100 dark:bg-cyan-900/50">
                  {currentMode.icon}
                </div>
                <span className="font-medium">{currentMode.label}</span>
              </span>
            </ModernSelectValue>
          </ModernSelectTrigger>
          <ModernSelectContent variant="glass" className="backdrop-blur-md border border-white/20">
            {displayModes.map((mode) => (
              <ModernSelectItem key={mode.value} value={mode.value} className="hover:bg-cyan-50 dark:hover:bg-cyan-950/30">
                <span className="flex items-center gap-2">
                  <div className="p-1 rounded bg-cyan-100 dark:bg-cyan-900/50">
                    {mode.icon}
                  </div>
                  <span>{mode.label}</span>
                </span>
              </ModernSelectItem>
            ))}
          </ModernSelectContent>
        </ModernSelect>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {t('settings.default_contact_display_mode_description')}
        </p>
      </div>
    </div>
  );
};

export default ContactDisplaySetting;