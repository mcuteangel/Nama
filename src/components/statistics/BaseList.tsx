import React, { useRef } from 'react';
import { useTranslation } from "react-i18next";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";
import { LucideIcon } from 'lucide-react';
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
  const { t } = useTranslation();
  const listRef = useRef<HTMLDivElement>(null);

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
    XLSX.utils.book_append_sheet(workbook, worksheet, title.substring(0, 31)); // Excel sheet name limit is 31 chars
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

  return (
    <ModernCard
      variant="glass"
      className={`rounded-2xl p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-xl border border-border/50 ${className}`}
      role="region"
      aria-labelledby={`list-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <ModernCardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <ModernCardTitle
            id={`list-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
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
      <ModernCardContent ref={listRef} className="h-72 overflow-y-auto custom-scrollbar space-y-3 relative">
        {data.length > 0 ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-xl pointer-events-none" />
            <div className="relative space-y-3">
              {data.map((item, index) => (
                <div
                  key={item.id || String(item[nameKey]) || index}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-background/80 to-background/60 hover:from-background hover:to-background/80 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 hover:scale-[1.02] border border-border/30"
                  role="listitem"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold shadow-sm">
                      {index + 1}
                    </div>
                    <span className="font-semibold text-foreground">{String(item[nameKey])}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary text-lg">{String(item[countKey])}</span>
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
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

export default React.memo(BaseList);