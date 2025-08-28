"use client";

import React from 'react';
import { useJalaliCalendar } from '@/hooks/use-jalali-calendar';
import { Label } from '@/components/ui/label';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { useTranslation } from 'react-i18next';

const CalendarTypeSetting: React.FC = () => {
  const { calendarType, setCalendarType } = useJalaliCalendar();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="calendar-type" className="text-gray-700 dark:text-gray-200">
        {t('settings.calendar_type')}
      </Label>
      <ModernSelect
        value={calendarType}
        onValueChange={(value: 'jalali' | 'gregorian') => setCalendarType(value)}
      >
        <ModernSelectTrigger id="calendar-type" variant="glass" className="w-full">
          <ModernSelectValue placeholder={t('settings.calendar_type')} />
        </ModernSelectTrigger>
        <ModernSelectContent variant="glass">
          <ModernSelectItem value="jalali">{t('settings.jalali')}</ModernSelectItem>
          <ModernSelectItem value="gregorian">{t('settings.gregorian')}</ModernSelectItem>
        </ModernSelectContent>
      </ModernSelect>
    </div>
  );
};

export default CalendarTypeSetting;