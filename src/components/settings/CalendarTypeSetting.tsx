"use client";

import React from 'react';
import { useJalaliCalendar } from '@/hooks/use-jalali-calendar';
import { Label } from '@/components/ui/label';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';

const CalendarTypeSetting: React.FC = () => {
  const { calendarType, setCalendarType } = useJalaliCalendar();
  const { t } = useTranslation();

  const calendarTypes = [
    { value: 'jalali', label: t('settings.jalali'), icon: '🇮🇷' },
    { value: 'gregorian', label: t('settings.gregorian'), icon: '🇬🇧' }
  ];

  const currentCalendar = calendarTypes.find(cal => cal.value === calendarType) || calendarTypes[0];

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="calendar-type" className="text-gray-700 dark:text-gray-200 flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        {t('settings.calendar_type')}
      </Label>
      <ModernSelect
        value={calendarType}
        onValueChange={(value: 'jalali' | 'gregorian') => setCalendarType(value)}
      >
        <ModernSelectTrigger id="calendar-type" variant="glass" className="w-full">
          <ModernSelectValue placeholder={t('settings.calendar_type')}>
            <span className="flex items-center gap-2">
              <span>{currentCalendar.icon}</span>
              <span>{currentCalendar.label}</span>
            </span>
          </ModernSelectValue>
        </ModernSelectTrigger>
        <ModernSelectContent variant="glass">
          {calendarTypes.map((calendar) => (
            <ModernSelectItem key={calendar.value} value={calendar.value}>
              <span className="flex items-center gap-2">
                <span>{calendar.icon}</span>
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