import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { ModernCard } from "@/components/ui/modern-card";
import { Label } from "@/components/ui/label";
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from "@/components/ui/modern-select";

const ContactDisplaySetting = () => {
  const { t } = useTranslation();
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');

  // Load saved display mode from localStorage on component mount
  useEffect(() => {
    const savedMode = localStorage.getItem('defaultContactDisplayMode');
    if (savedMode === 'list' || savedMode === 'grid') {
      setDisplayMode(savedMode);
    }
  }, []);

  // Save display mode to localStorage when it changes
  const handleDisplayModeChange = (value: string) => {
    const mode = value as 'grid' | 'list';
    setDisplayMode(mode);
    localStorage.setItem('defaultContactDisplayMode', mode);
  };

  return (
    <ModernCard variant="glass" className="p-4 rounded-lg shadow-sm">
      <div className="space-y-2">
        <Label className="text-gray-700 dark:text-gray-200">
          {t('settings.default_contact_display_mode')}
        </Label>
        <ModernSelect onValueChange={handleDisplayModeChange} value={displayMode}>
          <ModernSelectTrigger variant="glass" className="w-full backdrop-blur-md border border-white/20 hover:bg-white/10 dark:hover:bg-white/5">
            <ModernSelectValue placeholder={t('settings.select_display_mode')} />
          </ModernSelectTrigger>
          <ModernSelectContent variant="glass" className="backdrop-blur-md border border-white/20">
            <ModernSelectItem value="grid">
              {t('settings.display_mode_grid')}
            </ModernSelectItem>
            <ModernSelectItem value="list">
              {t('settings.display_mode_list')}
            </ModernSelectItem>
          </ModernSelectContent>
        </ModernSelect>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t('settings.default_contact_display_mode_description')}
        </p>
      </div>
    </ModernCard>
  );
};

export default ContactDisplaySetting;