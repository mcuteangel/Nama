import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, TooltipProps } from 'recharts';
import { useTranslation } from "react-i18next";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { LucideIcon } from 'lucide-react';

interface BasePieChartProps {
  data: any[];
  title: string;
  icon: LucideIcon;
  iconColor: string;
  emptyMessageKey: string;
  translationPrefix?: string;
  className?: string;
  nameKey?: string;
  valueKey?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const BasePieChart: React.FC<BasePieChartProps> = ({
  data,
  title,
  icon: Icon,
  iconColor,
  emptyMessageKey,
  translationPrefix,
  className = "",
  nameKey = 'name',
  valueKey = 'count'
}) => {
  const { t } = useTranslation();

  const formattedData = useMemo(() => data.map((item: any) => ({
    name: translationPrefix ? t(`${translationPrefix}.${item[nameKey]}`) : item[nameKey],
    value: item[valueKey] || item.value,
  })), [data, t, translationPrefix, nameKey, valueKey]);

  const CustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-2 shadow-lg" role="tooltip">
          <p className="font-semibold">{`${payload[0].name}`}</p>
          <p className="text-primary">{`${payload[0].value} ${t('common.contacts')}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ModernCard
      variant="glass"
      className={`rounded-2xl p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-xl border border-border/50 ${className}`}
      role="region"
      aria-labelledby={`chart-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <ModernCardHeader className="pb-4">
        <ModernCardTitle
          id={`chart-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className="text-xl font-bold flex items-center gap-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
        >
          <div className={`p-2 rounded-xl bg-gradient-to-br ${iconColor.replace('text-', 'from-').replace('-500', '-400')} ${iconColor.replace('text-', 'to-').replace('-500', '-600')} shadow-lg`}>
            <Icon size={24} className="text-white" aria-hidden="true" />
          </div>
          {t(title)}
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent className="h-72 flex items-center justify-center relative">
        {formattedData.length > 0 ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-xl" />
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {formattedData.map((entry: any, index: number) => (
                    <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8} />
                      <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.4} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={formattedData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={85}
                  innerRadius={35}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  aria-label={`${t(title)} chart`}
                  animationBegin={0}
                  animationDuration={800}
                >
                  {formattedData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#gradient-${index})`}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={2}
                      aria-label={`${entry.name}: ${entry.value} contacts`}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </>
        ) : (
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <Icon size={32} className="text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-medium" role="status">
              {t(emptyMessageKey)}
            </p>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};

export default React.memo(BasePieChart);