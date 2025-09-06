import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileText, FileSpreadsheet, Image } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GlassButton } from '@/components/ui/glass-button';

interface EnhancedExportOptionsProps {
  data: unknown[];
  title: string;
  onExportCSV: () => void;
  onExportExcel?: () => void;
  onExportPDF?: () => void;
  onExportPNG?: () => void;
}

const EnhancedExportOptions: React.FC<EnhancedExportOptionsProps> = ({
  data,
  onExportCSV,
  onExportExcel,
  onExportPDF,
  onExportPNG
}) => {
  const { t } = useTranslation();

  if (!data || data.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <GlassButton
          variant="glass"
          effect="lift"
          className="h-8 w-8 p-0 hover:bg-muted/50"
          title={t('common.export_data')}
        >
          <Download size={16} className="text-muted-foreground" />
        </GlassButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onExportCSV}>
          <FileText className="mr-2 h-4 w-4" />
          <span>{t('common.export_csv')}</span>
        </DropdownMenuItem>
        {onExportExcel && (
          <DropdownMenuItem onClick={onExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span>{t('common.export_excel')}</span>
          </DropdownMenuItem>
        )}
        {onExportPDF && (
          <DropdownMenuItem onClick={onExportPDF}>
            <FileText className="mr-2 h-4 w-4" />
            <span>{t('common.export_pdf')}</span>
          </DropdownMenuItem>
        )}
        {onExportPNG && (
          <DropdownMenuItem onClick={onExportPNG}>
            <Image className="mr-2 h-4 w-4" />
            <span>{t('common.export_png')}</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EnhancedExportOptions;