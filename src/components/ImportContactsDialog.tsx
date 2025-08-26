"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud, FileText, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { ErrorManager } from '@/lib/error-manager';
import { DataImportService } from '@/services/data-import-service';
import { useSession } from '@/integrations/supabase/auth';
import LoadingSpinner from './common/LoadingSpinner';
import CancelButton from './common/CancelButton';

interface ImportContactsDialogProps {
  onImportSuccess: () => void;
}

const ImportContactsDialog: React.FC<ImportContactsDialogProps> = ({ onImportSuccess }) => {
  const { t } = useTranslation();
  const { session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSuccessImport = useCallback((result: { success: boolean; importedCount: number; error: string | null }) => {
    if (result.success) {
      ErrorManager.notifyUser(t('import.import_success', { count: result.importedCount }), 'success');
      onImportSuccess();
      setIsOpen(false);
      setSelectedFile(null);
    } else {
      ErrorManager.notifyUser(result.error || t('import.import_failed_unknown'), 'error');
    }
  }, [onImportSuccess, t]);

  const onErrorImport = useCallback((err: Error) => {
    ErrorManager.logError(err, { component: 'ImportContactsDialog', action: 'importCsv' });
  }, []);

  const {
    isLoading: isImporting,
    executeAsync: executeImport,
  } = useErrorHandler(null, {
    maxRetries: 0, // No retries for file import
    showToast: false, // Handled by onSuccessImport/onErrorImport
    customErrorMessage: t('import.import_failed_generic'),
    onSuccess: onSuccessImport,
    onError: onErrorImport,
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv') {
        ErrorManager.notifyUser(t('import.invalid_file_type'), 'error');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleImportClick = async () => {
    if (!session?.user) {
      ErrorManager.notifyUser(t('common.auth_required'), 'error');
      return;
    }
    if (!selectedFile) {
      ErrorManager.notifyUser(t('import.no_file_selected'), 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvContent = e.target?.result as string;
      await executeImport(async () => {
        const result = await DataImportService.importContactsFromCsv(csvContent, session.user.id);
        return result;
      });
    };
    reader.onerror = () => {
      ErrorManager.notifyUser(t('import.file_read_error'), 'error');
    };
    reader.readAsText(selectedFile);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "نام", "نام خانوادگی", "جنسیت", "سمت", "شرکت", "خیابان", "شهر", "استان", "کد پستی", "کشور", "یادداشت‌ها", "تاریخ تولد",
      "شماره تلفن‌ها", "ایمیل‌ها", "لینک‌های اجتماعی", "گروه", "URL آواتار", "روش ارتباط ترجیحی"
    ];
    const csvContent = `\uFEFF${headers.map(h => `"${h}"`).join(',')}\n`; // Add BOM for UTF-8
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'contacts_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    ErrorManager.notifyUser(t('import.template_download_success'), 'success');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold shadow-md transition-all duration-300 transform hover:scale-105 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 dark:border-gray-600"
        >
          <UploadCloud size={20} />
          {t('settings.import_contacts')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] glass rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {t('import.title')}
          </DialogTitle>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {t('import.description')}
          </p>
        </DialogHeader>
        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            className="w-full flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold shadow-sm transition-all duration-300 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-100"
          >
            <FileText size={20} />
            {t('import.download_template')}
          </Button>

          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              disabled={isImporting}
            />
            {selectedFile ? (
              <div className="flex items-center gap-3">
                <FileText size={24} className="text-green-500" />
                <span className="text-gray-800 dark:text-gray-100 font-medium">{selectedFile.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  disabled={isImporting}
                  className="text-red-500 hover:bg-red-100 dark:hover:bg-gray-600/50"
                >
                  <XCircle size={20} />
                </Button>
              </div>
            ) : (
              <>
                <UploadCloud size={48} className="text-gray-400 dark:text-gray-500 mb-3" />
                <Label htmlFor="csv-upload" className="cursor-pointer text-blue-600 hover:underline dark:text-blue-400">
                  {t('import.select_csv_file')}
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('import.or_drag_and_drop')}</p>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <CancelButton onClick={() => setIsOpen(false)} disabled={isImporting} />
            <Button
              onClick={handleImportClick}
              disabled={!selectedFile || isImporting}
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
            >
              {isImporting && <LoadingSpinner size={16} className="me-2" />}
              {t('import.import_button')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportContactsDialog;