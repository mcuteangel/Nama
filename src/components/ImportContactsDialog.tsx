"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GlassButton } from "@/components/ui/glass-button";
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
      t('contact_form.first_name'),
      t('contact_form.last_name'),
      t('contact_form.gender'),
      t('contact_form.position'),
      t('contact_form.company'),
      t('contact_form.street'),
      t('contact_form.city'),
      t('contact_form.state'),
      t('contact_form.zip_code'),
      t('contact_form.country'),
      t('contact_form.notes'),
      t('contact_form.birth_date'),
      t('contact_form.phone_numbers'),
      t('contact_form.email_addresses'),
      t('contact_form.social_links'),
      t('contact_form.group'),
      t('contact_form.avatar_url'),
      t('contact_form.preferred_contact_method')
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
        <GlassButton
          variant="outline"
          className="w-full group relative overflow-hidden rounded-2xl font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl hover:shadow-3xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-emerald-800 hover:text-emerald-900 border-2 border-emerald-400/50 hover:border-emerald-300 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-md"
          aria-label={t('settings.import_contacts')}
        >
          <div className="relative z-10 flex items-center justify-center gap-2">
            <UploadCloud size={16} />
            {t('settings.import_contacts')}
          </div>
        </GlassButton>
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
          <GlassButton
            variant="outline"
            onClick={handleDownloadTemplate}
            className="w-full group relative overflow-hidden rounded-2xl font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl hover:shadow-3xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-purple-800 dark:text-purple-200 hover:text-purple-900 dark:hover:text-purple-100 border-2 border-purple-400/50 hover:border-purple-300 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
          >
            <div className="relative z-10 flex items-center justify-center gap-2">
              <FileText size={16} />
              {t('import.download_template')}
            </div>
          </GlassButton>

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
                <GlassButton
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  disabled={isImporting}
                  className="group relative overflow-hidden rounded-full font-medium text-xs transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200/50 dark:border-red-700/50 hover:border-red-300 dark:hover:border-red-600 text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
                >
                  <div className="relative z-10">
                    <XCircle size={16} />
                  </div>
                </GlassButton>
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
            <GlassButton
              onClick={handleImportClick}
              disabled={!selectedFile || isImporting}
              className="group relative overflow-hidden rounded-2xl font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl hover:shadow-3xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-emerald-800 hover:text-emerald-900 border-2 border-emerald-400/50 hover:border-emerald-300 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-lg"
            >
              <div className="relative z-10 flex items-center gap-2 font-semibold">
                {isImporting && <LoadingSpinner size={14} />}
                {t('import.import_button')}
              </div>
            </GlassButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportContactsDialog;