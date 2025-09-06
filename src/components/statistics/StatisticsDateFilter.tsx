import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';
import { ModernCard, ModernCardContent } from '@/components/ui/modern-card';
import {
  ModernPopover,
  ModernPopoverContent,
  ModernPopoverTrigger,
} from '@/components/ui/modern-popover';
import { JalaliCalendar } from '@/components/JalaliCalendar';
import { useJalaliCalendar } from '@/hooks/use-jalali-calendar';
import moment from 'moment-jalaali';

interface StatisticsDateFilterProps {
  onDateRangeChange: (startDate: string | null, endDate: string | null) => void;
  onComparePeriod: (startDate: string, endDate: string) => void;
}

const StatisticsDateFilter: React.FC<StatisticsDateFilterProps> = ({ 
  onDateRangeChange, 
  onComparePeriod 
}) => {
  const { t, i18n } = useTranslation();
  const { calendarType, formatDate } = useJalaliCalendar();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [compareStartDate, setCompareStartDate] = useState<string>('');
  const [compareEndDate, setCompareEndDate] = useState<string>('');
  const isRTL = i18n.dir() === 'rtl'; // Add RTL support

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return formatDate(date);
  };

  const handleApplyFilter = () => {
    onDateRangeChange(startDate || null, endDate || null);
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    onDateRangeChange(null, null);
  };

  const handleCompare = () => {
    if (compareStartDate && compareEndDate) {
      onComparePeriod(compareStartDate, compareEndDate);
    }
  };

  return (
    <ModernCard variant="glass" className="mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <ModernCardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t('statistics.start_date')}
            </label>
            <ModernPopover>
              <ModernPopoverTrigger asChild>
                <GlassButton
                  variant="glass"
                  className="w-full justify-start text-left font-normal py-2 bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 hover:bg-white/40 dark:hover:bg-gray-700/40"
                >
                  {startDate ? formatDisplayDate(startDate) : t('statistics.start_date')}
                </GlassButton>
              </ModernPopoverTrigger>
              <ModernPopoverContent className="w-auto p-0" glassEffect="card">
                <JalaliCalendar
                  selected={startDate ? new Date(startDate) : undefined}
                  onSelect={(date) => setStartDate(date ? date.toISOString() : '')}
                  showToggle={true}
                />
              </ModernPopoverContent>
            </ModernPopover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t('statistics.end_date')}
            </label>
            <ModernPopover>
              <ModernPopoverTrigger asChild>
                <GlassButton
                  variant="glass"
                  className="w-full justify-start text-left font-normal py-2 bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 hover:bg-white/40 dark:hover:bg-gray-700/40"
                >
                  {endDate ? formatDisplayDate(endDate) : t('statistics.end_date')}
                </GlassButton>
              </ModernPopoverTrigger>
              <ModernPopoverContent className="w-auto p-0" glassEffect="card">
                <JalaliCalendar
                  selected={endDate ? new Date(endDate) : undefined}
                  onSelect={(date) => setEndDate(date ? date.toISOString() : '')}
                  showToggle={true}
                />
              </ModernPopoverContent>
            </ModernPopover>
          </div>

          <div className="flex gap-2">
            <GlassButton
              variant="glass"
              effect="lift"
              onClick={handleApplyFilter}
              className="flex-1"
            >
              {t('common.apply')}
            </GlassButton>
            <GlassButton
              variant="glass"
              effect="lift"
              onClick={handleClearFilter}
              className="px-3"
            >
              <X size={16} className={isRTL ? 'rotate-180' : ''} />
            </GlassButton>
          </div>

          {/* Comparison Period */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t('statistics.compare_period')}
            </label>
            <div className="flex gap-2">
              <ModernPopover>
                <ModernPopoverTrigger asChild>
                  <GlassButton
                    variant="glass"
                    className="flex-1 justify-start text-left font-normal py-2 bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 hover:bg-white/40 dark:hover:bg-gray-700/40"
                  >
                    {compareStartDate ? formatDisplayDate(compareStartDate) : t('statistics.start_date')}
                  </GlassButton>
                </ModernPopoverTrigger>
                <ModernPopoverContent className="w-auto p-0" glassEffect="card">
                  <JalaliCalendar
                    selected={compareStartDate ? new Date(compareStartDate) : undefined}
                    onSelect={(date) => setCompareStartDate(date ? date.toISOString() : '')}
                    showToggle={true}
                  />
                </ModernPopoverContent>
              </ModernPopover>
              <span className="self-center text-muted-foreground">-</span>
              <ModernPopover>
                <ModernPopoverTrigger asChild>
                  <GlassButton
                    variant="glass"
                    className="flex-1 justify-start text-left font-normal py-2 bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 hover:bg-white/40 dark:hover:bg-gray-700/40"
                  >
                    {compareEndDate ? formatDisplayDate(compareEndDate) : t('statistics.end_date')}
                  </GlassButton>
                </ModernPopoverTrigger>
                <ModernPopoverContent className="w-auto p-0" glassEffect="card">
                  <JalaliCalendar
                    selected={compareEndDate ? new Date(compareEndDate) : undefined}
                    onSelect={(date) => setCompareEndDate(date ? date.toISOString() : '')}
                    showToggle={true}
                  />
                </ModernPopoverContent>
              </ModernPopover>
            </div>
          </div>

          <GlassButton
            variant="glass"
            effect="lift"
            onClick={handleCompare}
            disabled={!compareStartDate || !compareEndDate}
            className="disabled:opacity-50"
          >
            {t('statistics.compare')}
          </GlassButton>
        </div>
      </ModernCardContent>
    </ModernCard>
  );
};

export default StatisticsDateFilter;