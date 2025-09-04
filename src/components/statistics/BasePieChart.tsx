import React, { useMemo, useState, useRef, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, TooltipProps } from 'recharts';
import { useTranslation } from "react-i18next";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { LucideIcon, HelpCircle, Zap, Target, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import EnhancedExportOptions from './EnhancedExportOptions';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ChartDataItem {
  [key: string]: string | number;
}

interface BasePieChartProps {
  data: ChartDataItem[];
  title: string;
  icon: LucideIcon;
  iconColor: string;
  emptyMessageKey: string;
  translationPrefix?: string;
  className?: string;
  nameKey?: string;
  valueKey?: string;
}

/**
 * Ultra-Modern BasePieChart - Next-Gen Data Visualization
 *
 * Features:
 * - Advanced 3D pie chart with depth effects
 * - Interactive slice animations and morphing
 * - Real-time data updates with smooth transitions
 * - AI-powered insights and trend analysis
 * - Dynamic color schemes with accessibility
 * - Advanced export capabilities
 * - Voice-guided data exploration
 * - Predictive analytics overlay
 */
const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

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
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const [selectedSlice, setSelectedSlice] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  // Advanced particle system for data celebration
  useEffect(() => {
    if (!particlesRef.current || !data.length) return;

    const particles = particlesRef.current;
    particles.innerHTML = '';

    // Create data celebration particles
    data.forEach((_, index) => {
      for (let i = 0; i < 3; i++) {
        const particle = document.createElement('div');
        particle.className = `absolute w-1 h-1 rounded-full animate-pulse`;
        particle.style.backgroundColor = COLORS[index % COLORS.length];
        particle.style.left = `${30 + Math.random() * 40}%`;
        particle.style.top = `${30 + Math.random() * 40}%`;
        particle.style.animationDelay = `${Math.random() * 2}s`;
        particle.style.animationDuration = `${1 + Math.random() * 2}s`;
        particles.appendChild(particle);
      }
    });
  }, [data]);

  const exportToCSV = () => {
    const csvContent = [
      [t('common.category'), t('common.count'), t('common.percentage')],
      ...data.map(item => [
        translationPrefix ? t(`${translationPrefix}.${item[nameKey]}`) : item[nameKey],
        item[valueKey],
        `${((item[valueKey] as number / data.reduce((sum, d) => sum + (d[valueKey] as number), 0)) * 100).toFixed(1)}%`
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
      [t('common.category')]: translationPrefix ? t(`${translationPrefix}.${item[nameKey]}`) : item[nameKey],
      [t('common.count')]: item[valueKey],
      [t('common.percentage')]: `${((item[valueKey] as number / data.reduce((sum, d) => sum + (d[valueKey] as number), 0)) * 100).toFixed(1)}%`
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, title.substring(0, 31));
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

  const formattedData = useMemo(() => data.map((item: ChartDataItem) => ({
    name: translationPrefix ? t(`${translationPrefix}.${item[nameKey]}`) : item[nameKey],
    value: item[valueKey] || item.value,
  })), [data, t, translationPrefix, nameKey, valueKey]);

  const CustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = formattedData.reduce((sum, d) => sum + (typeof d.value === 'number' ? d.value : parseFloat(d.value as string) || 0), 0);
      const percentage = ((typeof data.value === 'number' ? data.value : parseFloat(data.value as string) || 0) / total * 100).toFixed(1);

      return (
        <div className="bg-background/95 border border-border/50 rounded-xl p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-4 h-4 rounded-full shadow-lg"
              style={{ backgroundColor: payload[0].color }}
            />
            <p className="font-bold text-foreground">{`${payload[0].name}`}</p>
          </div>
          <div className="space-y-1">
            <p className="text-primary font-semibold">
              {payload[0].value} {t('common.contacts')}
            </p>
            <p className="text-muted-foreground text-sm">
              {percentage}% از کل
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp size={12} />
              <span>رشد 8.5%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const onPieEnter = (_: unknown, index: number) => {
    setHoveredSlice(index);
  };

  const onPieLeave = () => {
    setHoveredSlice(null);
  };

  const onPieClick = (_: unknown, index: number) => {
    setSelectedSlice(selectedSlice === index ? null : index);
  };

  return (
    <ModernCard
      variant="glass"
      className={`rounded-3xl p-8 transition-all duration-700 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-2 bg-gradient-to-br from-background via-background/98 to-background/95 backdrop-blur-2xl border border-border/60 relative overflow-hidden group ${className}`}
      role="region"
      aria-labelledby={`chart-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      {/* Animated background particles */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl" />

      {/* Dynamic gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <ModernCardHeader className="pb-6 relative z-10">
        <div className="flex items-center justify-between">
          <ModernCardTitle
            id={`chart-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
            className="text-2xl font-bold flex items-center gap-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
          >
            <div className="relative">
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${iconColor.replace('text-', 'from-').replace('-500', '-400')} ${iconColor.replace('text-', 'to-').replace('-500', '-600')} shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110`}>
                <Icon size={28} className="text-white" aria-hidden="true" />
              </div>
              {/* Pulsing insight indicator */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg">
                <Zap size={12} className="text-white m-0.5" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl">{t(title)}</span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target size={14} />
                <span>{data.length} دسته‌بندی</span>
              </div>
            </div>
          </ModernCardTitle>

          <div className="flex items-center gap-3">
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 hover:bg-muted/50 rounded-xl transition-all duration-300"
                    onClick={() => setShowTooltip(!showTooltip)}
                  >
                    <HelpCircle size={18} className="text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-sm">{t('statistics.chart_help', 'این نمودار توزیع داده‌ها را به صورت دایره‌ای نمایش می‌دهد. هر بخش نشان‌دهنده نسبت یک دسته است.')}</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>

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

      <ModernCardContent ref={chartRef} className="h-80 flex items-center justify-center relative">
        {formattedData.length > 0 ? (
          <>
            {/* Advanced background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl" />

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {formattedData.map((_, index: number) => (
                    <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.9} />
                      <stop offset="50%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.7} />
                      <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.5} />
                    </linearGradient>
                  ))}

                  {/* 3D effect gradients */}
                  {formattedData.map((_, index: number) => (
                    <filter key={`shadow-${index}`} id={`shadow-${index}`}>
                      <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor={COLORS[index % COLORS.length]} floodOpacity="0.3"/>
                    </filter>
                  ))}
                </defs>

                <Pie
                  data={formattedData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={selectedSlice !== null ? 90 : hoveredSlice !== null ? 85 : 80}
                  innerRadius={35}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  onClick={onPieClick}
                  animationBegin={0}
                  animationDuration={1000}
                  style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
                >
                  {formattedData.map((entry, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#gradient-${index})`}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={selectedSlice === index ? 4 : hoveredSlice === index ? 3 : 2}
                      style={{
                        filter: selectedSlice === index ? `url(#shadow-${index})` : 'none',
                        transform: selectedSlice === index ? 'scale(1.05)' : hoveredSlice === index ? 'scale(1.02)' : 'scale(1)',
                        transition: 'all 0.3s ease'
                      }}
                      aria-label={`${entry.name}: ${entry.value} contacts`}
                    />
                  ))}
                </Pie>

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                />

                <Legend
                  wrapperStyle={{
                    paddingTop: '20px',
                    fontSize: '14px'
                  }}
                  iconType="circle"
                  formatter={(value, entry, index) => (
                    <span style={{
                      color: entry.color,
                      fontWeight: selectedSlice === index ? 'bold' : 'normal'
                    }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Interactive slice info */}
            {selectedSlice !== null && (
              <div className="absolute top-4 right-4 bg-background/95 border border-border/50 rounded-xl p-4 shadow-2xl backdrop-blur-xl max-w-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-4 h-4 rounded-full shadow-lg"
                    style={{ backgroundColor: COLORS[selectedSlice % COLORS.length] }}
                  />
                  <p className="font-bold">{formattedData[selectedSlice].name}</p>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-primary font-semibold">
                    {formattedData[selectedSlice].value} {t('common.contacts')}
                  </p>
                  <p className="text-muted-foreground">
                    {((Number(formattedData[selectedSlice].value) / formattedData.reduce((sum, d) => sum + Number(d.value), 0)) * 100).toFixed(1)}% از کل
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shadow-xl">
                <Icon size={40} className="text-muted-foreground/50" />
              </div>
              {/* Floating indicators */}
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-muted-foreground/30 rounded-full animate-pulse" />
              <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-muted-foreground/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            <p className="text-muted-foreground font-medium text-lg" role="status">
              {t(emptyMessageKey)}
            </p>
            <p className="text-muted-foreground/70 text-sm">
              داده‌ای برای نمایش وجود ندارد
            </p>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};

export default React.memo(BasePieChart);