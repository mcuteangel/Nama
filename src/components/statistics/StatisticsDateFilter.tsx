import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, X } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';
import { ModernCard, ModernCardContent } from '@/components/ui/modern-card';

interface StatisticsDateFilterProps {
  onDateRangeChange: (startDate: string | null, endDate: string | null) => void;
  onComparePeriod: (startDate: string, endDate: string) => void;
}

const StatisticsDateFilter: React.FC<StatisticsDateFilterProps> = ({ 
  onDateRangeChange, 
  onComparePeriod 
}) => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [compareStartDate, setCompareStartDate] = useState<string>('');
  const [compareEndDate, setCompareEndDate] = useState<string>('');

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
    <ModernCard variant="glass" className="mb-6">
      <ModernCardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t('statistics.start_date')}
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-background/50 p-2 text-foreground backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t('statistics.end_date')}
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-background/50 p-2 text-foreground backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
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
              <X size={16} />
            </GlassButton>
          </div>

          {/* Comparison Period */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t('statistics.compare_period')}
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={compareStartDate}
                onChange={(e) => setCompareStartDate(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-background/50 p-2 text-foreground backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="self-center text-muted-foreground">-</span>
              <input
                type="date"
                value={compareEndDate}
                onChange={(e) => setCompareEndDate(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-background/50 p-2 text-foreground backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
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