import React, { useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, TooltipProps } from 'recharts';
import { useTranslation } from "react-i18next";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { LucideIcon } from 'lucide-react';
import EnhancedExportOptions from './EnhancedExportOptions';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  const chartRef = useRef<HTMLDivElement>(null);

  const exportToCSV = () => {
    const csvContent = [
      [t('common.category'), t('common.count')],
      ...data.map(item => [
        item[nameKey],
        item[valueKey]
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title.replace(/\s+/g, '_')}.csv`;
    link.click();
  };

  const exportToExcel = () => {
    const excelData = data.map(item => ({
      [t('common.category')]: item[nameKey],
      [t('common.count')]: item[valueKey]
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, title.substring(0, 31)); // Excel sheet name limit is 31 chars
    XLSX.writeFile(workbook, `${title.replace(/\s+/g, '_')}.xlsx`);
  };

  const exportToPDF = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
    }
  };

  const exportToPNG = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

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
        <div className="flex items-center justify-between">
          <ModernCardTitle
            id={`chart-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
            className="text-xl font-bold flex items-center gap-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
          >
            <div className={`p-2 rounded-xl bg-gradient-to-br ${iconColor.replace('text-', 'from-').replace('-500', '-400')} ${iconColor.replace('text-', 'to-').replace('-500', '-600')} shadow-lg`}>
              <Icon size={24} className="text-white" aria-hidden="true" />
            </div>
            {t(title)}
          </ModernCardTitle>
          <div className="flex items-center gap-2">
            {data.length > 0 && (
              <EnhancedExportOptions
                data={data}
                title={t(title)}
                onExportCSV={exportToCSV}
                onExportExcel={exportToExcel}
                onExportPDF={exportToPDF}
                onExportPNG={exportToPNG}
              />
            )}
          </div>
        </div>
      </ModernCardHeader>
      <ModernCardContent ref={chartRef} className="h-72 relative">
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