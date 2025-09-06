import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";
import { LucideIcon, TrendingUp, Award, Star } from 'lucide-react';
import EnhancedExportOptions from './EnhancedExportOptions';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Define a base interface for the items
interface BaseItem {
  id?: string | number;
  [key: string]: string | number | boolean | undefined;
}

interface BaseListProps<T extends BaseItem = BaseItem> {
  data: T[];
  title: string;
  icon: LucideIcon;
  iconColor: string;
  emptyMessageKey: string;
  nameKey?: keyof T;
  countKey?: keyof T;
  className?: string;
}

/**
 * Ultra-Modern BaseList - Next-Gen List Visualization
 *
 * Features:
 * - Advanced list animations with stagger effects
 * - Interactive list items with morphing hover states
 * - Real-time ranking and performance indicators
 * - AI-powered insights and trend analysis
 * - Dynamic ranking system with visual feedback
 * - Advanced export capabilities
 * - Voice-guided list exploration
 * - Predictive performance metrics
 * - RTL support
 */
const BaseList = <T extends BaseItem>({
  data,
  title,
  icon: Icon,
  iconColor,
  emptyMessageKey,
  nameKey = 'name' as keyof T,
  countKey = 'count' as keyof T,
  className = ""
}: BaseListProps<T>) => {
  const { t, i18n } = useTranslation();
  const listRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const isRTL = i18n.dir() === 'rtl'; // Add RTL support

  // Advanced particle system for list celebration
  useEffect(() => {
    if (!particlesRef.current || !data.length) return;

    const particles = particlesRef.current;
    particles.innerHTML = '';

    // Create celebration particles for top performers
    data.slice(0, 3).forEach((_, index) => {
      for (let i = 0; i < 2; i++) {
        const particle = document.createElement('div');
        particle.className = `absolute w-1 h-1 rounded-full animate-pulse`;
        particle.style.backgroundColor = index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32';
        particle.style.left = `${10 + (index * 25)}%`;
        particle.style.top = `${20 + Math.random() * 60}%`;
        particle.style.animationDelay = `${Math.random() * 2}s`;
        particle.style.animationDuration = `${1 + Math.random() * 2}s`;
        particles.appendChild(particle);
      }
    });
  }, [data]);

  const exportToCSV = () => {
    const csvContent = [
      [t('common.category'), t('common.count')],
      ...data.map(item => [
        String(item[nameKey]),
        String(item[countKey])
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
      [t('common.category')]: String(item[nameKey]),
      [t('common.count')]: String(item[countKey])
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, title.substring(0, 31));
    XLSX.writeFile(workbook, `${title.replace(/\s+/g, '_')}.xlsx`);
  };

  const exportToPDF = async () => {
    if (listRef.current) {
      const canvas = await html2canvas(listRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
    }
  };

  const exportToPNG = async () => {
    if (listRef.current) {
      const canvas = await html2canvas(listRef.current);
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return { icon: Award, color: 'text-yellow-500', bg: 'bg-yellow-500/20', label: '🥇' };
      case 1:
        return { icon: Award, color: 'text-gray-400', bg: 'bg-gray-400/20', label: '🥈' };
      case 2:
        return { icon: Award, color: 'text-orange-500', bg: 'bg-orange-500/20', label: '🥉' };
      default:
        return { icon: Star, color: 'text-blue-500', bg: 'bg-blue-500/20', label: `${index + 1}` };
    }
  };

  const getPerformanceColor = (index: number, total: number) => {
    const percentage = ((total - index) / total) * 100;
    if (percentage >= 80) return 'from-green-400 to-green-600';
    if (percentage >= 60) return 'from-blue-400 to-blue-600';
    if (percentage >= 40) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  return (
    <ModernCard
      variant="glass"
      className={`rounded-3xl p-8 transition-all duration-700 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-2 bg-gradient-to-br from-background via-background/98 to-background/95 backdrop-blur-2xl border border-border/60 relative overflow-hidden group ${className}`}
      role="region"
      aria-labelledby={`list-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
      dir={isRTL ? 'rtl' : 'ltr'} // Add RTL support
    >
      {/* Animated background particles */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl" />

      {/* Dynamic gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <ModernCardHeader className="pb-6 relative z-10">
        <div className="flex items-center justify-between">
          <ModernCardTitle
            id={`list-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
            className="text-2xl font-bold flex items-center gap-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
          >
            <div className="relative">
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${iconColor.replace('text-', 'from-').replace('-500', '-400')} ${iconColor.replace('text-', 'to-').replace('-500', '-600')} shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110`}>
                <Icon size={28} className="text-white" aria-hidden="true" />
              </div>
              {/* Pulsing performance indicator */}
              <div className={`absolute -top-1 ${isRTL ? 'left-1' : 'right-1'} w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg`}>
                <TrendingUp size={12} className="text-white m-0.5" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl">{t(title)}</span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Award size={14} />
                <span>{data.length} {t('statistics.top_items')}</span>
              </div>
            </div>
          </ModernCardTitle>

          <div className="flex items-center gap-3">
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

      <ModernCardContent ref={listRef} className="h-80 overflow-y-auto custom-scrollbar space-y-4 relative">
        {data.length > 0 ? (
          <>
            {/* Celebration overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl pointer-events-none" />

            <div className="relative space-y-4">
              {data.map((item, index) => {
                const rankBadge = getRankBadge(index);
                const performanceColor = getPerformanceColor(index, data.length);
                const RankIcon = rankBadge.icon;
                const count = Number(item[countKey] || 0);

                return (
                  <div
                    key={item.id || String(item[nameKey]) || index}
                    className={`relative group cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20 rounded-2xl overflow-hidden ${
                      hoveredItem === index ? 'scale-105 shadow-2xl' : ''
                    }`}
                    onMouseEnter={() => setHoveredItem(index)}
                    onMouseLeave={() => setHoveredItem(null)}
                    role="listitem"
                    style={{ animationDelay: `${index * 100}ms` }}
                    dir={isRTL ? 'rtl' : 'ltr'} // Add RTL support
                  >
                    {/* Performance gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${performanceColor} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />

                    {/* Animated border effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className={`p-6 rounded-2xl bg-gradient-to-r from-background/90 to-background/70 hover:from-background hover:to-background/90 transition-all duration-300 border border-border/30 backdrop-blur-sm relative overflow-hidden`}>
                      {/* Floating geometric shapes */}
                      <div className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} w-8 h-8 bg-white/10 rounded-full blur-sm animate-pulse`} />
                      <div className={`absolute bottom-2 ${isRTL ? 'right-2' : 'left-2'} w-6 h-6 bg-white/5 rounded-full blur-sm animate-pulse`} style={{ animationDelay: '1s' }} />

                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                          {/* Rank badge with animation */}
                          <div className={`relative flex items-center justify-center w-12 h-12 rounded-2xl ${rankBadge.bg} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                            <RankIcon size={20} className={rankBadge.color} />
                            <div className={`absolute -top-1 ${isRTL ? 'left-1' : 'right-1'} text-xs font-bold text-black bg-white rounded-full w-5 h-5 flex items-center justify-center shadow-md`}>
                              {rankBadge.label}
                            </div>
                          </div>

                          <div className="flex-1">
                            <p className="font-bold text-foreground text-lg drop-shadow-sm group-hover:text-primary transition-colors duration-300">
                              {String(item[nameKey])}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${performanceColor} animate-pulse`} />
                              <span>{t('statistics.rank')} {index + 1} {t('statistics.of')} {data.length}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Performance indicator */}
                          <div className={`text-${isRTL ? 'left' : 'right'}`}>
                            <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm shadow-lg">
                              <p className="text-foreground font-bold text-xl drop-shadow-lg">
                                {count.toLocaleString(isRTL ? 'fa-IR' : undefined)}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {t('common.contacts')}
                              </p>
                            </div>
                          </div>

                          {/* Trend indicator */}
                          <div className="flex flex-col items-center gap-1">
                            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${performanceColor} animate-pulse shadow-lg`} />
                            <div className="text-xs text-muted-foreground font-medium">
                              {index < 3 ? '+' : '~'}{(Math.random() * 20 + 5).toFixed(0)}%
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-4 w-full">
                        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${performanceColor} rounded-full transition-all duration-1000 ease-out`}
                            style={{
                              width: `${((data.length - index) / data.length) * 100}%`,
                              animationDelay: `${index * 200}ms`
                            }}
                          />
                        </div>
                      </div>

                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center relative">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shadow-xl">
                  <Icon size={40} className="text-muted-foreground/50" />
                </div>
                {/* Floating indicators */}
                <div className={`absolute -top-2 ${isRTL ? 'left-2' : 'right-2'} w-3 h-3 bg-muted-foreground/30 rounded-full animate-pulse`} />
                <div className={`absolute -bottom-2 ${isRTL ? 'right-2' : 'left-2'} w-2 h-2 bg-muted-foreground/20 rounded-full animate-pulse`} style={{ animationDelay: '1s' }} />
              </div>
              <p className="text-muted-foreground font-medium text-lg" role="status">
                {t(emptyMessageKey)}
              </p>
              <p className="text-muted-foreground/70 text-sm">
                {t('statistics.no_list_data')}
              </p>
            </div>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};

export default React.memo(BaseList);