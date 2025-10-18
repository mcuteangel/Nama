"use client";

import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment-jalaali';
import { enUS } from 'date-fns/locale';
import { format as formatFns } from 'date-fns'; // Renamed to avoid conflict with local format function

export type CalendarType = 'gregorian' | 'jalali';

export interface CalendarOptions {
  type?: CalendarType;
  defaultDate?: Date;
  format?: string;
}

export interface CalendarHookReturn {
  calendarType: CalendarType;
  currentLocale: 'fa' | 'en';
  setCalendarType: (type: CalendarType) => void;
  formatDate: (date: Date | undefined, formatString?: string) => string;
  formatDateWithDay: (date: Date | undefined) => string;
  getCalendarLabel: () => string;
  convertToJalali: (date: Date) => moment.Moment;
  convertToGregorian: (date: moment.Moment) => Date;
}

const CALENDAR_TYPE_STORAGE_KEY = 'calendarType';

export function useJalaliCalendar(options: CalendarOptions = {}): CalendarHookReturn {
  const { 
    type = 'jalali', 
    format: formatString = 'jYYYY/jMM/jDD' 
  } = options;

  const { t } = useTranslation();

  const [calendarType, setCalendarTypeState] = useState<CalendarType>(() => {
    if (typeof window !== 'undefined') {
      const storedType = localStorage.getItem(CALENDAR_TYPE_STORAGE_KEY);
      return (storedType === 'jalali' || storedType === 'gregorian') ? storedType : type;
    }
    return type;
  });

  // Update localStorage when calendarType changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CALENDAR_TYPE_STORAGE_KEY, calendarType);
    }
  }, [calendarType]);

  const setCalendarType = useCallback((newType: CalendarType) => {
    setCalendarTypeState(newType);
  }, []);

  const formatDate = useCallback((date: Date | undefined, customFormat?: string) => {
    if (!date) return '';
    
    if (calendarType === 'jalali') {
      const momentDate = moment(date);
      return momentDate.format(customFormat || formatString);
    } else {
      return formatFns(date, customFormat || 'yyyy/MM/dd', { locale: enUS });
    }
  }, [calendarType, formatString]);

  const formatDateWithDay = useCallback((date: Date | undefined) => {
    if (!date) return '';
    
    if (calendarType === 'jalali') {
      const momentDate = moment(date);
      return `${momentDate.format('jYYYY/jMM/jDD')} (${momentDate.format('dddd')})`;
    } else {
      const dateObj = new Date(date);
      const dayName = dateObj.toLocaleDateString('fa-IR', { weekday: 'long' });
      return `${formatFns(date, 'yyyy/MM/dd', { locale: enUS })} (${dayName})`;
    }
  }, [calendarType]);

  const getCalendarLabel = useCallback(() => {
    return calendarType === 'jalali' ? t('settings.calendar.solar') : t('settings.calendar.gregorian');
  }, [calendarType, t]);

  const convertToJalali = useCallback((date: Date) => {
    return moment(date);
  }, []);

  const convertToGregorian = useCallback((date: moment.Moment) => {
    return date.toDate();
  }, []);

  return {
    calendarType,
    currentLocale: calendarType === 'jalali' ? 'fa' : 'en',
    setCalendarType,
    formatDate,
    formatDateWithDay,
    getCalendarLabel,
    convertToJalali,
    convertToGregorian,
  };
}