import React from 'react';
import { Merge, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { GlassButton } from "@/components/ui/glass-button";
import LoadingSpinner from '../common/LoadingSpinner';

interface DuplicateContactScannerProps {
  isScanning: boolean;
  onScan: () => void;
}

export const DuplicateContactScanner: React.FC<DuplicateContactScannerProps> = ({
  isScanning,
  onScan
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Scan Button Container */}
      <div className="flex justify-center">
        <GlassButton
          onClick={onScan}
          disabled={isScanning}
          variant="gradient-primary"
          className="flex items-center gap-2 px-4 py-3 rounded-3xl font-semibold text-base shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20 backdrop-blur-xl bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-600/90 hover:to-purple-700/90"
          aria-label={t('ai_suggestions.scan_for_duplicates')}
        >
          {isScanning ? (
            <LoadingSpinner size={14} />
          ) : (
            <Merge size={14} />
          )}
          {t('ai_suggestions.scan_for_duplicates')}
        </GlassButton>
      </div>

      {/* Scanning Animation */}
      {isScanning && (
        <div className="bg-gradient-to-r from-orange-50/60 to-red-50/60 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6 border border-orange-200/30 dark:border-orange-800/30 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <Copy size={32} className="text-orange-500 animate-pulse" />
              <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping"></div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {t('ai_suggestions.scanning_contacts', 'در حال اسکن مخاطبین')}
              </h3>
              <p className="text-sm text-orange-500 dark:text-orange-300">
                {t('ai_suggestions.analyzing_duplicates', 'در حال تحلیل تکراری‌ها...')}
              </p>
            </div>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {t('ai_suggestions.processing_step', 'مرحله: مقایسه اطلاعات مخاطبین')}
          </p>
        </div>
      )}
    </>
  );
};
