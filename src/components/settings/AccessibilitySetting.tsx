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
    <div className="flex items-center justify-between">
      <div className="flex items-start gap-3">
        <AccessibilityIcon className="h-5 w-5 text-blue-500 mt-0.5" />
        <div className="flex flex-col gap-1">
          <Label htmlFor="accessibility-toggle" className="text-gray-700 dark:text-gray-200">
            {t('settings.accessibility')}
          </Label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('settings.accessibility_description')}
          </p>
        </div>
      </div>
      <Switch
        id="accessibility-toggle"
        checked={settings.screenReaderOptimized}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-green-500"
      />
    </div>
  );
};

export default AccessibilitySetting;