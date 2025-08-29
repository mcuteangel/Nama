import { useState } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { ModernButton } from "@/components/ui/modern-button";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from "@/components/settings";
import CalendarTypeSetting from "@/components/settings/CalendarTypeSetting";
import LanguageSetting from "@/components/settings/LanguageSetting";
import { AccessibilitySetting, RTLTestSetting } from "@/components/settings";
import GeminiSettings from "@/components/ai/GeminiSettings";
import DebugSettings from "@/components/settings/DebugSettings";
import { Download, User, Settings as SettingsIcon, Sparkles } from "lucide-react";
import { exportContactsToCsv } from "@/utils/export-contacts";
import { useSession } from "@/integrations/supabase/auth";
import { Label } from "@/components/ui/label";
import ImportContactsDialog from "@/components/ImportContactsDialog";
import LoadingSpinner from '@/components/common/LoadingSpinner';

const Settings = () => {
  const { t } = useTranslation();
  const { session } = useSession();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    await exportContactsToCsv(session, {
      searchTerm: "",
      selectedGroup: "",
      companyFilter: "",
      sortOption: "first_name_asc",
    });
    setIsExporting(false);
  };

  const handleImportSuccess = () => {
    // Optionally refresh contact list or show a global success message
    console.log("Contacts imported successfully, refreshing data...");
    // Invalidate relevant caches if needed, e.g., contacts_list
    // For now, the DataImportService already invalidates caches.
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full">
      <ModernCard variant="glass" className="w-full max-w-3xl rounded-xl p-6">
        <ModernCardHeader className="text-center">
          <ModernCardTitle className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {t('settings.title')}
          </ModernCardTitle>
          <ModernCardDescription className="text-lg text-gray-600 dark:text-gray-300">
            {t('settings.description')}
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent className="space-y-8">
          {/* Display Settings */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 border-b pb-2 mb-4 flex items-center gap-2">
              <SettingsIcon size={20} /> {t('settings.display_settings')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ModernCard variant="glass" className="p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-700 dark:text-gray-200">{t('settings.theme')}</Label>
                  <ThemeToggle />
                </div>
              </ModernCard>
              <ModernCard variant="glass" className="p-4 rounded-lg shadow-sm">
                <CalendarTypeSetting />
              </ModernCard>
              <ModernCard variant="glass" className="p-4 rounded-lg shadow-sm">
                <LanguageSetting />
              </ModernCard>
              <ModernCard variant="glass" className="p-4 rounded-lg shadow-sm">
                <AccessibilitySetting />
              </ModernCard>
            </div>
          </div>

          {/* AI Settings */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 border-b pb-2 mb-4 flex items-center gap-2">
              <Sparkles size={20} /> {t('settings.ai_settings')}
            </h3>
            <ModernCard variant="glass" className="p-4 rounded-lg shadow-sm">
              <GeminiSettings />
            </ModernCard>
          </div>

          {/* Component Testing */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 border-b pb-2 mb-4 flex items-center gap-2">
              <SettingsIcon size={20} /> {t('settings.component_testing')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ModernCard variant="glass" className="p-4 rounded-lg shadow-sm">
                <RTLTestSetting />
              </ModernCard>
            </div>
          </div>

          {/* Data Management */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 border-b pb-2 mb-4 flex items-center gap-2">
              <Download size={20} /> {t('settings.data_management')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModernButton
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
              >
                {isExporting && <LoadingSpinner size={16} className="me-2" />}
                <Download size={20} />
                {t('settings.export_contacts')}
              </ModernButton>
              <ImportContactsDialog onImportSuccess={handleImportSuccess} />
            </div>
          </div>

          {/* Debug Settings - Only in Development */}
          <DebugSettings />

          {/* User Profile Link */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 border-b pb-2 mb-4 flex items-center gap-2">
              <User size={20} /> {t('common.profile')}
            </h3>
            <ModernButton
              asChild
              className="w-full px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
            >
              <Link to="/profile">
                {t('settings.user_profile')}
              </Link>
            </ModernButton>
          </div>
        </ModernCardContent>
      </ModernCard>
      <MadeWithDyad />
    </div>
  );
};

export default Settings;