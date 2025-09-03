"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAccessibility } from '@/components/accessibilityHooks';
import { Accessibility as AccessibilityIcon } from 'lucide-react';

const AccessibilitySetting: React.FC = () => {
  const { t } = useTranslation();
  const { settings, updateSettings } = useAccessibility();

  const handleToggle = (checked: boolean) => {
    updateSettings({ 
      screenReaderOptimized: checked,
      keyboardNavigation: checked,
      announceChanges: checked
    });
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/50 transition-all duration-300 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50">
          <AccessibilityIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="accessibility-toggle" className="text-gray-800 dark:text-gray-200 font-medium">
            {t('settings.accessibility')}
          </Label>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {t('settings.accessibility_description')}
          </p>
        </div>
      </div>
      <Switch
        id="accessibility-toggle"
        checked={settings.screenReaderOptimized}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-green-500 transition-colors duration-200"
      />
    </div>
  );
};

export default AccessibilitySetting;