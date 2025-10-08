import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Database, Download, FileDown, FileUp, Settings, History, AlertCircle, CheckCircle2, Clock, Trash2, TrendingUp } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { useSession } from '@/integrations/supabase/auth';
import { exportContactsToCsv } from '@/utils/export-contacts';
import ImportContactsDialog from '@/components/ImportContactsDialog';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SettingsSection from './SettingsSection';
import SettingsCard from './SettingsCard';

interface DataManagementSettingsProps {
  onImportSuccess?: () => void;
}

interface ExportHistoryItem {
  id: string;
  timestamp: Date;
  fileName: string;
  recordCount: number;
  status: 'success' | 'error';
}

const DataManagementSettings: React.FC<DataManagementSettingsProps> = ({ onImportSuccess }) => {
  const { t } = useTranslation();
  const { session } = useSession();
  const [isExporting, setIsExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [exportSettings, setExportSettings] = useState({
    format: 'csv',
    includeGroups: true,
    includeCustomFields: true,
    dateRange: 'all'
  });

  // Load export history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('exportHistory');
    if (saved) {
      try {
        const history = JSON.parse(saved);
        setExportHistory(history.map((item: ExportHistoryItem & { timestamp: string }) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (error) {
        console.warn('Failed to load export history:', error);
      }
    }
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportContactsToCsv(session, {
        searchTerm: "",
        selectedGroup: "",
        companyFilter: "",
        sortOption: "first_name_asc",
      });

      // Add to export history
      const newExport: ExportHistoryItem = {
        id: Date.now().toString(),
        timestamp: new Date(),
        fileName: `contacts_export_${new Date().toISOString().split('T')[0]}.csv`,
        recordCount: 0, // We don't have the actual count from the export function
        status: 'success'
      };

      const updatedHistory = [newExport, ...exportHistory.slice(0, 9)]; // Keep last 10
      setExportHistory(updatedHistory);
      localStorage.setItem('exportHistory', JSON.stringify(updatedHistory));

    } catch (error) {
      // Add failed export to history
      const failedExport: ExportHistoryItem = {
        id: Date.now().toString(),
        timestamp: new Date(),
        fileName: 'export_failed',
        recordCount: 0,
        status: 'error'
      };

      const updatedHistory = [failedExport, ...exportHistory.slice(0, 9)];
      setExportHistory(updatedHistory);
      localStorage.setItem('exportHistory', JSON.stringify(updatedHistory));
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportSuccess = () => {
    console.log("Contacts imported successfully, refreshing data...");
    onImportSuccess?.();
  };

  const removeExportHistoryItem = (id: string) => {
    const updatedHistory = exportHistory.filter(item => item.id !== id);
    setExportHistory(updatedHistory);
    localStorage.setItem('exportHistory', JSON.stringify(updatedHistory));
  };

  const clearExportHistory = () => {
    setExportHistory([]);
    localStorage.removeItem('exportHistory');
  };

  return (
    <SettingsSection
      title={t('settings.data_management')}
      description={t('settings.data_management_description')}
      icon={<Database size={20} />}
      variant="glass"
    >
      <div className="space-y-6">
        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SettingsCard
            title={t('settings.export_contacts')}
            description={t('settings.export_contacts_description')}
            icon={<FileDown size={16} />}
            gradient="green"
          >
            <div className="space-y-3">
              <GlassButton
                onClick={handleExport}
                disabled={isExporting}
                className="w-full group relative overflow-hidden rounded-2xl font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl hover:shadow-3xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-emerald-800 hover:text-emerald-900 border-2 border-emerald-400/50 hover:border-emerald-300 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
                aria-label={t('settings.export_contacts')}
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {isExporting ? (
                    <>
                      <LoadingSpinner size={16} />
                      {t('common.exporting')}
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      {t('settings.export_contacts')}
                    </>
                  )}
                </div>
              </GlassButton>

              <GlassButton
                variant="outline"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full group relative overflow-hidden rounded-2xl font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl hover:shadow-3xl bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 text-blue-900 dark:text-blue-100 hover:text-blue-950 dark:hover:text-blue-50 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <Settings size={14} />
                  {showAdvanced ? t('common.hide_advanced') : t('common.advanced_settings')}
                </div>
              </GlassButton>

              {showAdvanced && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-3 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={exportSettings.includeGroups}
                        onChange={(e) => setExportSettings(prev => ({ ...prev, includeGroups: e.target.checked }))}
                        className="rounded"
                      />
                      شامل گروه‌ها
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={exportSettings.includeCustomFields}
                        onChange={(e) => setExportSettings(prev => ({ ...prev, includeCustomFields: e.target.checked }))}
                        className="rounded"
                      />
                      شامل فیلدهای سفارشی
                    </label>
                  </div>
                  <ModernSelect
                    value={exportSettings.format}
                    onValueChange={(value) => setExportSettings(prev => ({ ...prev, format: value }))}
                  >
                    <ModernSelectTrigger className="w-full text-sm">
                      <ModernSelectValue placeholder="فرمت فایل" />
                    </ModernSelectTrigger>
                    <ModernSelectContent>
                      <ModernSelectItem value="csv">CSV</ModernSelectItem>
                      <ModernSelectItem value="xlsx">Excel</ModernSelectItem>
                      <ModernSelectItem value="json">JSON</ModernSelectItem>
                    </ModernSelectContent>
                  </ModernSelect>
                </div>
              )}
            </div>
          </SettingsCard>

          <SettingsCard
            title={t('settings.import_contacts')}
            description={t('settings.import_contacts_description')}
            icon={<FileUp size={16} />}
            gradient="blue"
          >
            <ImportContactsDialog onImportSuccess={handleImportSuccess} />
          </SettingsCard>
        </div>

        {/* Export History */}
        {exportHistory.length > 0 && (
          <SettingsCard
            title={t('settings.export_history', 'تاریخچه صادرات')}
            description={t('settings.recent_exports', 'فایل‌های اخیر صادر شده')}
            icon={<History size={16} />}
            gradient="purple"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {t('settings.total_exports', 'کل فایل‌های صادر شده: {{count}}', { count: exportHistory.length })}
                </span>
                <GlassButton
                  variant="outline"
                  size="sm"
                  onClick={clearExportHistory}
                  className="group relative overflow-hidden rounded-2xl font-medium text-xs transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl hover:shadow-3xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200/50 dark:border-red-700/50 hover:border-red-300 dark:hover:border-red-600 text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
                  aria-label={t('settings.clear_history', 'پاک کردن تاریخچه صادرات')}
                >
                  <div className="relative z-10 flex items-center gap-1">
                    <Trash2 size={12} />
                    پاک کردن تاریخچه صادرات
                  </div>
                </GlassButton>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {exportHistory.map((item) => (
                  <div
                    className={`flex items-center justify-between p-2 rounded-lg border ${
                      item.status === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {item.status === 'success' ? (
                        <CheckCircle2 size={14} className="text-green-600" />
                      ) : (
                        <AlertCircle size={14} className="text-red-600" />
                      )}
                      <div>
                        <div className="text-xs font-medium">{item.fileName}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={10} />
                          {item.timestamp.toLocaleString('fa-IR')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${item.status === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {item.status === 'success'
                          ? (item.recordCount > 0 ? `${item.recordCount} مخاطب` : t('settings.successful_export', 'موفق'))
                          : t('settings.failed_export', 'ناموفق')}
                      </span>
                      <GlassButton
                        variant="outline"
                        size="sm"
                        onClick={() => removeExportHistoryItem(item.id)}
                        className="group relative overflow-hidden rounded-2xl font-medium text-xs transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl hover:shadow-3xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200/50 dark:border-red-700/50 hover:border-red-300 dark:hover:border-red-600 text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
                      >
                        <div className="relative z-10">
                          <Trash2 size={10} />
                        </div>
                      </GlassButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SettingsCard>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Successful Exports */}
          <div className="group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/20 dark:via-green-900/20 dark:to-teal-900/20 border-2 border-emerald-200/40 dark:border-emerald-700/40 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300">
            <div className="relative z-10 text-center">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1 group-hover:scale-110 transition-transform duration-300">
                {exportHistory.filter(h => h.status === 'success').length}
              </div>
              <div className="text-sm font-medium text-emerald-600 dark:text-emerald-300 flex items-center justify-center gap-1">
                <CheckCircle2 size={14} className="text-emerald-500" />
                صادرات موفق
              </div>
            </div>
          </div>

          {/* Failed Exports */}
          <div className="group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 dark:from-red-900/20 dark:via-pink-900/20 dark:to-rose-900/20 border-2 border-red-200/40 dark:border-red-700/40 hover:border-red-300 dark:hover:border-red-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300">
            <div className="relative z-10 text-center">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1 group-hover:scale-110 transition-transform duration-300">
                {exportHistory.filter(h => h.status === 'error').length}
              </div>
              <div className="text-sm font-medium text-red-600 dark:text-red-300 flex items-center justify-center gap-1">
                <AlertCircle size={14} className="text-red-500" />
                صادرات ناموفق
              </div>
            </div>
          </div>

          {/* Total Operations */}
          <div className="group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-2 border-blue-200/40 dark:border-blue-700/40 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300">
            <div className="relative z-10 text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1 group-hover:scale-110 transition-transform duration-300">
                {exportHistory.length}
              </div>
              <div className="text-sm font-medium text-blue-600 dark:text-blue-300 flex items-center justify-center gap-1">
                <Database size={14} className="text-blue-500" />
                کل عملیات
              </div>
            </div>
          </div>

          {/* Average Contacts */}
          <div className="group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 dark:from-purple-900/20 dark:via-violet-900/20 dark:to-fuchsia-900/20 border-2 border-purple-200/40 dark:border-purple-700/40 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300">
            <div className="relative z-10 text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1 group-hover:scale-110 transition-transform duration-300">
                {exportHistory.length > 0 ? Math.round(exportHistory.reduce((acc, item) => acc + (item.recordCount || 0), 0) / exportHistory.length) : 0}
              </div>
              <div className="text-sm font-medium text-purple-600 dark:text-purple-300 flex items-center justify-center gap-1">
                <TrendingUp size={14} className="text-purple-500" />
                میانگین مخاطبین
              </div>
            </div>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
};

export default DataManagementSettings;