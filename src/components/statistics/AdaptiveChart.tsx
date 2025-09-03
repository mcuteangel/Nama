import React, { useMemo } from 'react';
import BasePieChart from './BasePieChart';
import BaseBarChart from './BaseBarChart';
import BaseLineChart from './BaseLineChart';
import { LucideIcon } from 'lucide-react';

interface AdaptiveChartProps {
  data: any[];
  title: string;
  icon: LucideIcon;
  iconColor: string;
  emptyMessageKey: string;
  nameKey?: string;
  valueKey?: string;
  colorKey?: string;
  className?: string;
}

const AdaptiveChart: React.FC<AdaptiveChartProps> = ({
  data,
  title,
  icon,
  iconColor,
  emptyMessageKey,
  nameKey = 'name',
  valueKey = 'count',
  colorKey = 'color',
  className = ""
}) => {
  // Determine the best chart type based on data characteristics
  const chartType = useMemo(() => {
    if (!data || data.length === 0) return 'empty';
    
    // If we have time-series data (data with time-based names)
    const timeSeriesPattern = /^(\d{4}[-/]\d{1,2}|\d{4}[-/]\d{1,2}[-/]\d{1,2}|[A-Za-z]{3} \d{4})/;
    const isTimeSeries = data.some(item => 
      typeof item[nameKey] === 'string' && timeSeriesPattern.test(item[nameKey] as string)
    );
    
    if (isTimeSeries) return 'line';
    
    // If we have a small number of categories (<= 5), use pie chart
    if (data.length <= 5) return 'pie';
    
    // For larger datasets, use bar chart
    return 'bar';
  }, [data, nameKey]);

  // Render the appropriate chart based on the determined type
  switch (chartType) {
    case 'pie':
      return (
        <BasePieChart
          data={data}
          title={title}
          icon={icon}
          iconColor={iconColor}
          emptyMessageKey={emptyMessageKey}
          nameKey={nameKey}
          valueKey={valueKey}
          className={className}
        />
      );
    case 'bar':
      return (
        <BaseBarChart
          data={data}
          title={title}
          icon={icon}
          iconColor={iconColor}
          emptyMessageKey={emptyMessageKey}
          nameKey={nameKey}
          valueKey={valueKey}
          colorKey={colorKey}
          className={className}
        />
      );
    case 'line':
      return (
        <BaseLineChart
          data={data}
          title={title}
          icon={icon}
          iconColor={iconColor}
          emptyMessageKey={emptyMessageKey}
          nameKey={nameKey}
          valueKey={valueKey}
          className={className}
        />
      );
    default:
      // For empty data, we'll use a bar chart as default (it handles empty state well)
      return (
        <BaseBarChart
          data={data}
          title={title}
          icon={icon}
          iconColor={iconColor}
          emptyMessageKey={emptyMessageKey}
          nameKey={nameKey}
          valueKey={valueKey}
          colorKey={colorKey}
          className={className}
        />
      );
  }
};

export default AdaptiveChart;