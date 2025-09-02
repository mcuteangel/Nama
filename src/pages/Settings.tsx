import { useState } from "react";
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from "@/components/settings";
import CalendarTypeSetting from "@/components/settings/CalendarTypeSetting";
import LanguageSetting from "@/components/settings/LanguageSetting";
import { AccessibilitySetting, RTLTestSetting } from "@/components/settings";
import ContactDisplaySetting from "@/components/settings/ContactDisplaySetting";
import GeminiSettings from "@/components/ai/GeminiSettings";
import DebugSettings from "@/components/settings/DebugSettings";
import { Download, User, Settings as SettingsIcon, Sparkles, Database, Palette, Accessibility, TestTube } from "lucide-react";
import { exportContactsToCsv } from "@/utils/export-contacts";
import { useSession } from "@/integrations/supabase/auth";
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

  // Settings sections configuration
  const settingsSections = [
    {
      id: 'display',
      title: t('settings.display_settings'),
      icon: <Palette size={20} />,
      description: t('settings.display_settings_description'),
      component: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ModernCard variant="glass" className="p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-200">{t('settings.theme')}</span>
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
          <ModernCard variant="glass" className="p-4 rounded-lg shadow-sm md:col-span-2">
            <ContactDisplaySetting />
          </ModernCard>
        </div>
      )
    },
    {
      id: 'ai',
      title: t('settings.ai_settings'),
      icon: <Sparkles size={20} />,
      description: t('settings.ai_settings_description'),
      component: (
        <ModernCard variant="glass" className="p-4 rounded-lg shadow-sm">
          <GeminiSettings />
        </ModernCard>
      )
    },
    {
      id: 'testing',
      title: t('settings.component_testing'),
      icon: <TestTube size={20} />,
      description: t('settings.component_testing_description'),
      component: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ModernCard variant="glass" className="p-4 rounded-lg shadow-sm">
            <RTLTestSetting />
          </ModernCard>
          <ModernCard variant="glass" className="p-4 rounded-lg shadow-sm">
            <GlassButton 
              asChild 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold"
            >
              <Link to="/modern-ui-showcase">
                <SettingsIcon size={20} />
                {t('settings.ui_showcase')}
              </Link>
            </GlassButton>
          </ModernCard>
        </div>
      )
    },
    {
      id: 'data',
      title: t('settings.data_management'),
      icon: <Database size={20} />,
      description: t('settings.data_management_description'),
      component: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ModernCard variant="glass" className="p-4 rounded-lg shadow-sm">
            <div className="flex flex-col gap-2">
              <h4 className="font-medium text-gray-800 dark:text-gray-200">
                {t('settings.export_contacts')}
              </h4>
              <GlassButton
                onClick={handleExport}
                disabled={isExporting}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold"
              >
                {isExporting && <LoadingSpinner size={16} className="me-2" />}
                <Download size={20} />
                {t('settings.export_contacts')}
              </GlassButton>
            </div>
          </ModernCard>
          <ModernCard variant="glass" className="p-4 rounded-lg shadow-sm">
            <div className="flex flex-col gap-2">
              <h4 className="font-medium text-gray-800 dark:text-gray-200">
                {t('settings.import_contacts')}
              </h4>
              <ImportContactsDialog onImportSuccess={handleImportSuccess} />
            </div>
          </ModernCard>
        </div>
      )
    }
  ];

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
          {/* Settings Sections */}
          {settingsSections.map((section) => (
            <div key={section.id} className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 border-b pb-2 mb-4 flex items-center gap-2">
                {section.icon} {section.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {section.description}
              </p>
              {section.component}
            </div>
          ))}

          {/* Debug Settings - Only in Development */}
          <DebugSettings />

          {/* User Profile Link */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 border-b pb-2 mb-4 flex items-center gap-2">
              <User size={20} /> {t('common.profile')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('settings.user_profile_description')}
            </p>
            <ModernCard variant="glass" className="p-4 rounded-lg shadow-sm">
              <GlassButton
                asChild
                variant="outline"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold"
              >
                <Link to="/profile">
                  <User size={20} />
                  {t('settings.user_profile')}
                </Link>
              </GlassButton>
            </ModernCard>
          </div>
        </ModernCardContent>
      </ModernCard>
    </div>
  );
};

export default Settings;