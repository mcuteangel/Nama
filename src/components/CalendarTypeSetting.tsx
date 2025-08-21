"use client";

import React from 'react';
import { useJalaliCalendar } from '@/hooks/use-jalali-calendar';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

const CalendarTypeSetting: React.FC = () => {
  const { calendarType, setCalendarType } = useJalaliCalendar();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="calendar-type" className="text-gray-700 dark:text-gray-200">
        {t('settings.calendar_type')}
      </Label>
      <Select
        value={calendarType}
        onValueChange={(value: 'jalali' | 'gregorian') => setCalendarType(value)}
      >
        <SelectTrigger id="calendar-type" className="w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100">
          <SelectValue placeholder={t('settings.calendar_type')} />
        </SelectTrigger>
        <SelectContent className="backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
          <SelectItem value="jalali">{t('settings.jalali')}</SelectItem>
          <SelectItem value="gregorian">{t('settings.gregorian')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CalendarTypeSetting;