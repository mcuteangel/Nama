"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import { useAppSettings } from '@/hooks/use-app-settings';

const CalendarTypeSetting: React.FC = () => {
  const { settings, updateSettings } = useAppSettings();
  const { t } = useTranslation();

  const calendarTypes = [
    { value: 'jalali', label: t('settings.jalali'), icon: '🇮🇷' },
    { value: 'gregorian', label: t('settings.gregorian'), icon: '🇬🇧' }
  ];

  const currentCalendar = calendarTypes.find(cal => cal.value === settings.calendarType) || calendarTypes[0];

  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-800/50 transition-all duration-300 hover:shadow-md">
      <Label htmlFor="calendar-type" className="text-gray-800 dark:text-gray-200 flex items-center gap-2 font-medium">
        <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/50">
          <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
        {t('settings.calendar_type')}
      </Label>
      <ModernSelect
        value={settings.calendarType}
        onValueChange={(value: 'jalali' | 'gregorian') => updateSettings({ calendarType: value })}
      >
        <ModernSelectTrigger id="calendar-type" variant="glass" className="w-full hover:bg-white/20 dark:hover:bg-white/5 transition-colors duration-200">
          <ModernSelectValue placeholder={t('settings.calendar_type')}>
            <span className="flex items-center gap-2">
              <span className="text-lg">{currentCalendar.icon}</span>
              <span className="font-medium">{currentCalendar.label}</span>
            </span>
          </ModernSelectValue>
        </ModernSelectTrigger>
        <ModernSelectContent variant="glass">
          {calendarTypes.map((calendar) => (
            <ModernSelectItem key={calendar.value} value={calendar.value} className="hover:bg-green-50 dark:hover:bg-green-950/30">
              <span className="flex items-center gap-2">
                <span className="text-lg">{calendar.icon}</span>
                <span>{calendar.label}</span>
              </span>
            </ModernSelectItem>
          ))}
        </ModernSelectContent>
      </ModernSelect>
    </div>
  );
};

export default CalendarTypeSetting;