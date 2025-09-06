import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";

interface ComparativeData {
  current: number;
  previous: number;
  label: string;
}

interface ComparativeStatisticsProps {
  data: ComparativeData[];
  title: string;
}

const ComparativeStatistics: React.FC<ComparativeStatisticsProps> = ({ data, title }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100);
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="text-green-500" size={16} />;
    if (change < 0) return <TrendingDown className="text-red-500" size={16} />;
    return <Minus className="text-gray-500" size={16} />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  // Calculate max value for better visualization
  const maxValue = useMemo(() => {
    return Math.max(
      ...data.map(item => Math.max(item.current, item.previous)),
      1 // Ensure we never divide by zero
    );
  }, [data]);

  return (
    <ModernCard variant="glass" className="rounded-2xl p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <ModernCardHeader className="pb-4">
        <ModernCardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          {t(title)}
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent className="space-y-4">
        {data.map((item, index) => {
          const change = calculateChange(item.current, item.previous);
          const currentPercentage = maxValue > 0 ? (item.current / maxValue) * 100 : 0;
          const previousPercentage = maxValue > 0 ? (item.previous / maxValue) * 100 : 0;
          
          return (
            <div key={index} className="flex flex-col gap-2 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-all duration-300" dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{item.label}</span>
                <div className="flex items-center gap-3">
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <div className="font-bold text-lg">{item.current.toLocaleString(isRTL ? 'fa-IR' : undefined)}</div>
                    <div className="text-sm text-muted-foreground line-through">{item.previous.toLocaleString(isRTL ? 'fa-IR' : undefined)}</div>
                  </div>
                  <div className={`flex items-center gap-1 ${getChangeColor(change)}`}>
                    {getChangeIcon(change)}
                    <span className="font-bold">{Math.abs(change)}{t('statistics.percentage')}</span>
                  </div>
                </div>
              </div>
              
              {/* Visual comparison bar */}
              <div className="w-full h-6 bg-muted rounded-full overflow-hidden relative">
                {/* Previous value bar */}
                <div 
                  className="absolute top-0 left-0 h-full bg-muted-foreground/30 transition-all duration-1000"
                  style={{ width: `${previousPercentage}%` }}
                />
                {/* Current value bar */}
                <div 
                  className="absolute top-0 left-0 h-full bg-primary/80 transition-all duration-1000"
                  style={{ width: `${currentPercentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </ModernCardContent>
    </ModernCard>
  );
};

export default ComparativeStatistics;