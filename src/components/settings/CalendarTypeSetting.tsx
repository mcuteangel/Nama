"use client";

import React, { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { useTranslation } from 'react-i18next';
import { Calendar, Loader2 } from 'lucide-react';
import { useAppSettings } from '@/hooks/use-app-settings';

type CalendarType = 'jalali' | 'gregorian';

interface CalendarOption {
  value: CalendarType;
  label: string;
  icon: string;
}

const CalendarTypeSetting: React.FC = () => {
  const { settings, updateSettings, isLoaded } = useAppSettings();
  const { t, ready } = useTranslation();
  const isLoading = !isLoaded || !ready;

  const calendarTypes = useMemo<CalendarOption[]>(
    () => [
      { value: 'jalali' as const, label: t('settings.jalali', 'شمسی (جلالی)'), icon: '🇮🇷' },
      { value: 'gregorian' as const, label: t('settings.gregorian', 'میلادی'), icon: '🇬🇧' }
    ],
    [t]
  );

  const currentCalendar = useMemo(
    () => calendarTypes.find(cal => cal.value === settings.calendarType) || calendarTypes[0],
    [calendarTypes, settings.calendarType]
  );

  const handleCalendarChange = (value: string) => {
    updateSettings({ calendarType: value as CalendarType });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
          <div className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700/50">
            <Loader2 className="h-4 w-4 text-gray-400 dark:text-gray-500 animate-spin" />
          </div>
          <span className="font-medium">{t('settings.loading', 'در حال بارگذاری...')}</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group flex flex-col gap-3 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-800/50 transition-all duration-300 hover:shadow-md"
      role="region"
      aria-label={t('settings.calendar_type', 'نوع تقویم')}
    >
      <Label 
        htmlFor="calendar-type" 
        className="text-gray-800 dark:text-gray-200 flex items-center gap-2 font-medium"
      >
        <div 
          className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/50 group-hover:bg-green-200/50 dark:group-hover:bg-green-900/70 transition-colors duration-200"
          aria-hidden="true"
        >
          <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden="true" />
        </div>
        {t('settings.calendar_type', 'نوع تقویم')}
      </Label>
      
      <ModernSelect
        value={settings.calendarType}
        onValueChange={handleCalendarChange}
        disabled={isLoading}
      >
        <ModernSelectTrigger 
          id="calendar-type" 
          variant="glass" 
          className="w-full hover:bg-white/20 dark:hover:bg-white/5 transition-colors duration-200 aria-disabled:opacity-50 aria-disabled:cursor-not-allowed"
          aria-disabled={isLoading}
          aria-busy={isLoading}
          aria-live="polite"
        >
          <ModernSelectValue placeholder={t('settings.calendar_type', 'نوع تقویم')}>
            <span className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">{currentCalendar.icon}</span>
              <span className="font-medium">{currentCalendar.label}</span>
            </span>
          </ModernSelectValue>
        </ModernSelectTrigger>
        
        <ModernSelectContent variant="glass">
          {calendarTypes.map((calendar) => (
            <ModernSelectItem 
              key={calendar.value} 
              value={calendar.value} 
              className="hover:bg-green-50 dark:hover:bg-green-950/30 focus:bg-green-100 dark:focus:bg-green-900/40 transition-colors"
              aria-label={`${calendar.label} (${calendar.value})`}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg" aria-hidden="true">{calendar.icon}</span>
                <span>{calendar.label}</span>
              </span>
            </ModernSelectItem>
          ))}
        </ModernSelectContent>
      </ModernSelect>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {t('settings.calendar_hint', 'تغییر نوع تقویم بر نمایش تاریخ‌ها در برنامه تأثیر می‌گذارد')}
      </p>
    </div>
  );
};

export default CalendarTypeSetting;