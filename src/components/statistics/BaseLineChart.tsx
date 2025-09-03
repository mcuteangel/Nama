import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, TooltipProps } from 'recharts';
import { useTranslation } from "react-i18next";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { LucideIcon } from 'lucide-react';

interface ChartDataPoint {
  name: string | number;
  count: number;
  [key: string]: string | number | boolean | null | undefined;
}

interface BaseLineChartProps {
  data: ChartDataPoint[];
  title: string;
  icon: LucideIcon;
  iconColor: string;
  emptyMessageKey: string;
  className?: string;
  nameKey?: string;
  valueKey?: string;
}

const BaseLineChart: React.FC<BaseLineChartProps> = ({
  data,
  title,
  icon: Icon,
  iconColor,
  emptyMessageKey,
  className = "",
  nameKey = 'name',
  valueKey = 'count'
}) => {
  const { t } = useTranslation();

  const CustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-2 shadow-lg" role="tooltip">
          <p className="font-semibold">{`${payload[0].payload.name}`}</p>
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
      <ModernCardContent className="h-72 relative">
        {data.length > 0 ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-xl" />
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="50%" stopColor="#8884d8" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#8884d8" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  opacity={0.1}
                  horizontal={true}
                  vertical={false}
                />
                <XAxis
                  dataKey={nameKey}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.7 }}
                  axisLine={{ stroke: 'currentColor', opacity: 0.2 }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.7 }}
                  axisLine={{ stroke: 'currentColor', opacity: 0.2 }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: 'currentColor', strokeWidth: 2, opacity: 0.3 }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                <Line
                  type="monotone"
                  dataKey={valueKey}
                  name={t('common.contacts')}
                  stroke="url(#lineGradient)"
                  strokeWidth={3}
                  activeDot={{
                    r: 8,
                    fill: '#8884d8',
                    stroke: '#fff',
                    strokeWidth: 2,
                    style: { filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }
                  }}
                  dot={{
                    r: 4,
                    fill: '#8884d8',
                    stroke: '#fff',
                    strokeWidth: 2,
                    style: { filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }
                  }}
                  animationBegin={0}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <Icon size={32} className="text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground font-medium" role="status">
                {t(emptyMessageKey)}
              </p>
            </div>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};

export default React.memo(BaseLineChart);