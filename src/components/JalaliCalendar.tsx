"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import {
  ModernPopover,
  ModernPopoverContent,
  ModernPopoverTrigger,
} from '@/components/ui/modern-popover';
import { GlassButton } from "@/components/ui/glass-button";
import { ModernButton } from '@/components/ui/modern-button';
import { cn, applyGlassEffect } from '@/lib/utils';
import moment from 'moment-jalaali';
import { useAppSettings } from '@/hooks/use-app-settings';

export interface JalaliCalendarProps {
  selected?: Date | undefined;
  onSelect?: (date: Date) => void;
  className?: string;
  variant?: 'default' | 'glass';
  locale?: 'fa' | 'en';
  showToggle?: boolean;
}

export function JalaliCalendar({ 
  selected, 
  onSelect, 
  className, 
  variant = 'glass',
  locale: initialLocale,
  showToggle = true
}: JalaliCalendarProps) {
  // Get the default calendar type from app settings
  const { settings } = useAppSettings();
  const defaultLocale = initialLocale || (settings.calendarType === 'jalali' ? 'fa' : 'en');
  
  // Store dates as timestamps to prevent infinite re-renders
  const [currentDate, setCurrentDate] = useState(() => {
    return selected ? moment(selected).valueOf() : moment().startOf('day').valueOf();
  });

  const [selectedDate, setSelectedDate] = useState(() => {
    return selected ? moment(selected).valueOf() : moment().startOf('day').valueOf();
  });
  
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [yearPage, setYearPage] = useState(0); // For decade pagination
  
  // Create moment objects from timestamps
  const currentMoment = moment(currentDate);
  const selectedMoment = moment(selectedDate);

  const [locale, setLocale] = useState<'fa' | 'en'>(defaultLocale);
  const isJalali = locale === 'fa';

  // Sync with external locale changes
  useEffect(() => {
    if (initialLocale) {
      setLocale(initialLocale);
    } else {
      // Use the app settings calendar type as default
      setLocale(settings.calendarType === 'jalali' ? 'fa' : 'en');
    }
  }, [initialLocale, settings.calendarType]);

  // همگام‌سازی با prop خارجی selected: تاریخ انتخابی و ماه جاری را به همان تاریخ ببر
  useEffect(() => {
    if (selected) {
      const m = moment(selected).startOf('day');
      setSelectedDate(m.valueOf());
      setCurrentDate(m.valueOf());
    }
  }, [selected]);

  const monthDays = React.useMemo(() => {
    const days: Array<{
      date: moment.Moment;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      isWeekend: boolean;
      dayIndex?: number;
    }> = [];

    // شروع و پایان ماه بر اساس نوع تقویم
    const startOfMonth = isJalali
      ? currentMoment.clone().startOf('jMonth')
      : currentMoment.clone().startOf('month');

    const endOfMonth = isJalali
      ? currentMoment.clone().endOf('jMonth')
      : currentMoment.clone().endOf('month');

    // ایندکس روز هفته بدون تغییر locale گلوبال
    // شمسی: شنبه=0 ... جمعه=6 | میلادی: یکشنبه=0 ... شنبه=6
    const getWeekIndex = (d: moment.Moment) => (isJalali ? (d.day() + 1) % 7 : d.day());

    const leading = getWeekIndex(startOfMonth);
    const trailing = 6 - getWeekIndex(endOfMonth);

    const gridStart = startOfMonth.clone().subtract(leading, 'day');
    const gridEnd = endOfMonth.clone().add(trailing, 'day');

    const day = gridStart.clone();
    let dayIndex = 0;
    while (day.isSameOrBefore(gridEnd, 'day')) {
      const isCurrentMonth = isJalali
        ? day.jMonth() === currentMoment.jMonth()
        : day.isSame(currentMoment, 'month');

      const today = moment().startOf('day');
      const isToday = day.isSame(today, 'day');
      const isSelected = day.isSame(selectedMoment, 'day');

      const dayOfWeek = getWeekIndex(day);
      const isWeekend = isJalali
        ? dayOfWeek === 6 // جمعه در تقویم شمسی
        : dayOfWeek === 0 || dayOfWeek === 6; // آخر هفته در تقویم میلادی

      days.push({
        date: day.clone(),
        isCurrentMonth,
        isToday,
        isSelected,
        isWeekend,
        dayIndex,
      });

      day.add(1, 'day');
      dayIndex++;
    }

    return days;
  }, [currentMoment, selectedMoment, isJalali]);

  const goToPreviousMonth = () => {
    setCurrentDate((prev: number) => {
      const date = moment(prev);
      return isJalali 
        ? date.subtract(1, 'jMonth').valueOf()
        : date.subtract(1, 'month').valueOf();
    });
  };

  const goToNextMonth = () => {
    setCurrentDate((prev: number) => {
      const date = moment(prev);
      return isJalali 
        ? date.add(1, 'jMonth').valueOf()
        : date.add(1, 'month').valueOf();
    });
  };

  const goToToday = () => {
    const today = moment().startOf('day');
    setCurrentDate(today.valueOf());
    setSelectedDate(today.valueOf());
    if (onSelect) {
      onSelect(today.toDate());
    }
  };

  const toggleCalendarType = () => {
    setLocale(prev => prev === 'fa' ? 'en' : 'fa');
  };

  const handleDateClick = (date: moment.Moment) => {
    const newDate = date.clone().startOf('day');
    setSelectedDate(newDate.valueOf());
    // هنگام انتخاب تاریخ، ماه نمایشی هم به ماه همان تاریخ برود
    setCurrentDate(newDate.valueOf());
    if (onSelect) {
      onSelect(newDate.toDate());
    }
  };

  // Weekday names based on locale
  // ترتیب روزهای هفته به صورت: شنبه تا جمعه
  const daysOfWeek = isJalali 
    ? ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] // شنبه (0) تا جمعه (6)
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Get localized month and year
  const getMonthYear = () => {
    if (isJalali) {
      return {
        month: currentMoment.jMonth(),
        year: currentMoment.jYear(),
        monthName: [
          'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
          'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
        ][currentMoment.jMonth()],
        yearNumber: currentMoment.jYear()
      };
    } else {
      return {
        month: currentMoment.month(),
        year: currentMoment.year(),
        monthName: [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ][currentMoment.month()],
        yearNumber: currentMoment.year()
      };
    }
  };

  const { month, monthName, yearNumber } = getMonthYear();

  const changeMonth = (monthIndex: number) => {
    setCurrentDate((prev: number) => {
      const newDate = moment(prev);
      if (isJalali) {
        newDate.jMonth(monthIndex);
      } else {
        newDate.month(monthIndex);
      }
      return newDate.valueOf();
    });
    setShowMonthPicker(false);
  };

  const changeYear = (year: number) => {
    setCurrentDate((prev: number) => {
      const newDate = moment(prev);
      if (isJalali) {
        newDate.jYear(year);
      } else {
        newDate.year(year);
      }
      return newDate.valueOf();
    });
    setShowYearPicker(false);
  };

  const getCurrentDecade = () => {
    const currentYear = isJalali ? currentMoment.jYear() : currentMoment.year();
    const startDecade = Math.floor((currentYear + yearPage * 15) / 15) * 15;
    return {
      start: startDecade - 1, // Show one year before the range
      end: startDecade + 16,  // Show 15 years in total (14 + 1 extra)
      current: currentYear
    };
  };

  const getYearsInDecade = () => {
    const { start, end, current } = getCurrentDecade();
    const years = [];
    
    for (let i = start; i <= end; i++) {
      years.push({
        year: i,
        isCurrent: i === current,
        isInDecade: i >= start + 1 && i <= end - 2
      });
    }
    
    return years;
  };

  const navigateYearPage = (direction: 'prev' | 'next') => {
    setYearPage(prev => direction === 'prev' ? prev - 1 : prev + 1);
  };

  // Get day number based on calendar type
  const getDayNumber = (date: moment.Moment) => {
    return isJalali ? date.format('jD') : date.format('D');
  };

  return (
    <div 
      className={cn(
        "p-4 rounded-lg w-full max-w-xs shadow-lg",
        variant === 'glass' && applyGlassEffect("advanced"),
        "transition-all duration-200 hover:shadow-xl",
        className,
        isJalali ? 'font-sans' : 'font-sans'
      )}
      dir={isJalali ? 'rtl' : 'ltr'}
    >
      {/* Calendar Type Toggle */}
      {showToggle && (
        <div className="flex justify-end mb-3">
          <ModernButton
            variant="glass"
            size="sm"
            rounded="full"
            shadow="xl"
            onClick={toggleCalendarType}
            className="text-xs px-3 h-7 bg-white/40 dark:bg-gray-800/60 hover:bg-white/50 dark:hover:bg-gray-700/70 backdrop-saturate-150"
          >
            {isJalali ? 'میلادی' : 'شمسی'}
          </ModernButton>
        </div>
      )}

      {/* Header */}
      <div className={cn("flex items-center justify-between mb-4")}>
        <GlassButton
          variant="ghost"
          size="icon"
          onClick={isJalali ? goToNextMonth : goToPreviousMonth}
          className="h-8 w-8 p-0"
        >
          {isJalali ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </GlassButton>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <ModernPopover open={showMonthPicker} onOpenChange={setShowMonthPicker}>
              <ModernPopoverTrigger asChild>
                <GlassButton 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-sm"
                  onClick={() => {
                    setShowMonthPicker(!showMonthPicker);
                    setShowYearPicker(false); // Close year picker if open
                  }}
                >
                  {monthName}
                  <ChevronDown className="mr-1 h-3 w-3 opacity-50" />
                </GlassButton>
              </ModernPopoverTrigger>
              <ModernPopoverContent className="w-48 p-2" align={isJalali ? 'end' : 'start'} glassEffect="advanced">
                <div className="grid grid-cols-3 gap-1">
                  {(isJalali 
                    ? ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
                    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                  ).map((m, i) => (
                    <GlassButton
                      key={i}
                      variant={i === month ? 'default' : 'ghost'}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => changeMonth(i)}
                    >
                      {m}
                    </GlassButton>
                  ))}
                </div>
              </ModernPopoverContent>
            </ModernPopover>
            
            <ModernPopover open={showYearPicker} onOpenChange={open => {
              setShowYearPicker(open);
              if (open) setYearPage(0); // Reset to current decade when opening
            }}>
              <ModernPopoverTrigger asChild>
                <GlassButton 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-sm"
                  onClick={() => {
                    setShowYearPicker(!showYearPicker);
                    setShowMonthPicker(false); // Close month picker if open
                  }}
                >
                  {yearNumber}
                  <ChevronDown className="mr-1 h-3 w-3 opacity-50" />
                </GlassButton>
              </ModernPopoverTrigger>
              <ModernPopoverContent className="w-64 p-3" align={isJalali ? 'end' : 'start'} glassEffect="advanced">
                <div className="flex justify-between items-center mb-2">
                  <GlassButton
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateYearPage('prev');
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </GlassButton>
                  <span className="text-sm font-medium">
                    {getCurrentDecade().start + 2} - {getCurrentDecade().end - 2} ({getCurrentDecade().end - getCurrentDecade().start - 3} سال)
                  </span>
                  <GlassButton
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateYearPage('next');
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </GlassButton>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {getYearsInDecade().map(({ year, isCurrent, isInDecade }) => (
                    <GlassButton
                      key={year}
                      variant={year === yearNumber ? 'default' : 'ghost'}
                      size="sm"
                      className={cn(
                        'h-8 text-xs',
                        !isInDecade && 'text-muted-foreground/50',
                        isCurrent && 'font-bold',
                        !isInDecade && 'opacity-60'
                      )}
                      onClick={() => {
                        changeYear(year);
                        setShowYearPicker(false);
                      }}
                    >
                      {year}
                    </GlassButton>
                  ))}
                </div>
              </ModernPopoverContent>
            </ModernPopover>
          </div>
          <ModernButton
            variant="glass"
            size="sm"
            rounded="full"
            shadow="xl"
            onClick={goToToday}
            className="text-xs px-3 h-7 bg-white/40 dark:bg-gray-800/60 hover:bg-white/50 dark:hover:bg-gray-700/70 backdrop-saturate-150"
          >
            {isJalali ? 'امروز' : 'Today'}
          </ModernButton>
        </div>
        
        <GlassButton
          variant="ghost"
          size="icon"
          onClick={isJalali ? goToPreviousMonth : goToNextMonth}
          className="h-8 w-8 p-0"
        >
          {isJalali ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </GlassButton>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day, index) => {
          const isWeekend = isJalali 
            ? index === 6 // Friday in Jalali
            : index === 0 || index === 6; // Weekend in Gregorian
          
          return (
            <div
              key={index}
              className={cn(
                "text-center text-xs font-medium py-1 text-muted-foreground",
                isWeekend && "text-red-600"
              )}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((day, index) => (
          <GlassButton
            key={index}
            variant="ghost"
            size="sm"
            onClick={() => handleDateClick(day.date)}
            disabled={!day.isCurrentMonth}
            className={cn(
              "relative h-9 w-9 p-0 text-sm font-medium transition-colors duration-200 rounded-full",
              !day.isCurrentMonth && "text-muted-foreground opacity-50",
              day.isWeekend && !day.isSelected && "text-red-600",
              day.isToday && !day.isSelected && "bg-accent/50 text-accent-foreground ring-2 ring-primary",
              day.isSelected && "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {getDayNumber(day.date)}
            {day.isToday && !day.isSelected && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"></span>
            )}
          </GlassButton>
        ))}
      </div>
    </div>
  );
}