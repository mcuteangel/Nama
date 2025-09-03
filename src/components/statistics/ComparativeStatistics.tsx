import React from 'react';
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
  const { t } = useTranslation();

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

  return (
    <ModernCard variant="glass" className="rounded-2xl p-6">
      <ModernCardHeader className="pb-4">
        <ModernCardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          {t(title)}
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent className="space-y-4">
        {data.map((item, index) => {
          const change = calculateChange(item.current, item.previous);
          return (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-all duration-300">
              <span className="font-medium text-foreground">{item.label}</span>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-bold text-lg">{item.current.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground line-through">{item.previous.toLocaleString()}</div>
                </div>
                <div className={`flex items-center gap-1 ${getChangeColor(change)}`}>
                  {getChangeIcon(change)}
                  <span className="font-bold">{Math.abs(change)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </ModernCardContent>
    </ModernCard>
  );
};

export default ComparativeStatistics;