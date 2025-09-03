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
import { Download, User, Settings as SettingsIcon, Sparkles, Database, Palette, Accessibility, TestTube, PaletteIcon, Bot, Palette as Palette2, Languages, Calendar, Eye, Wrench, UserCircle, FileDown, FileUp, Cpu } from "lucide-react";
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

  // Settings categories configuration
  const settingsCategories = [
    {
      id: 'appearance',
      title: t('settings.display_settings'),
      icon: <Palette2 size={20} />,
      description: t('settings.display_settings_description'),
      sections: [
        {
          id: 'theme',
          title: t('settings.theme'),
          icon: <PaletteIcon size={16} />,
          component: <ThemeToggle />
        },
        {
          id: 'calendar',
          title: t('settings.calendar_type'),
          icon: <Calendar size={16} />,
          component: <CalendarTypeSetting />
        },
        {
          id: 'language',
          title: t('settings.language'),
          icon: <Languages size={16} />,
          component: <LanguageSetting />
        },
        {
          id: 'accessibility',
          title: t('settings.accessibility'),
          icon: <Accessibility size={16} />,
          component: <AccessibilitySetting />
        },
        {
          id: 'display-mode',
          title: t('settings.default_contact_display_mode'),
          icon: <Eye size={16} />,
          component: <ContactDisplaySetting />
        }
      ]
    },
    {
      id: 'ai',
      title: t('settings.ai_settings'),
      icon: <Sparkles size={20} />,
      description: t('settings.ai_settings_description'),
      sections: [
        {
          id: 'gemini',
          title: t('settings.gemini_settings'),
          icon: <Bot size={16} />,
          component: <GeminiSettings />
        }
      ]
    },
    {
      id: 'tools',
      title: t('settings.component_testing'),
      icon: <TestTube size={20} />,
      description: t('settings.component_testing_description'),
      sections: [
        {
          id: 'rtl-test',
          title: t('settings.rtl_components_test'),
          icon: <TestTube size={16} />,
          component: <RTLTestSetting />
        },
        {
          id: 'ui-showcase',
          title: t('settings.ui_showcase'),
          icon: <PaletteIcon size={16} />,
          component: (
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
          )
        }
      ]
    },
    {
      id: 'data',
      title: t('settings.data_management'),
      icon: <Database size={20} />,
      description: t('settings.data_management_description'),
      sections: [
        {
          id: 'export',
          title: t('settings.export_contacts'),
          icon: <FileDown size={16} />,
          component: (
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
          )
        },
        {
          id: 'import',
          title: t('settings.import_contacts'),
          icon: <FileUp size={16} />,
          component: <ImportContactsDialog onImportSuccess={handleImportSuccess} />
        }
      ]
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full">
      <ModernCard variant="glass" className="w-full max-w-4xl rounded-xl p-6">
        <ModernCardHeader className="text-center">
          <ModernCardTitle className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center justify-center gap-3">
            <SettingsIcon size={32} />
            {t('settings.title')}
          </ModernCardTitle>
          <ModernCardDescription className="text-lg text-gray-600 dark:text-gray-300">
            {t('settings.description')}
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent className="space-y-8">
          {/* Settings Categories */}
          {settingsCategories.map((category) => (
            <ModernCard key={category.id} variant="glass" className="rounded-xl p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-2">
                  {category.icon} {category.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {category.description}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {category.sections.map((section) => (
                  <ModernCard key={section.id} variant="glass" className="p-4 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      {section.icon}
                      <h3 className="font-medium text-gray-800 dark:text-gray-200">
                        {section.title}
                      </h3>
                    </div>
                    {section.component}
                  </ModernCard>
                ))}
              </div>
            </ModernCard>
          ))}

          {/* Debug Settings - Only in Development */}
          <DebugSettings />

          {/* User Profile Section */}
          <ModernCard variant="glass" className="rounded-xl p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-2">
                <UserCircle size={20} /> {t('common.profile')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('settings.user_profile_description')}
              </p>
            </div>
            
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
          </ModernCard>
        </ModernCardContent>
      </ModernCard>
    </div>
  );
};

export default Settings;