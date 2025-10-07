import { useState } from "react";
import { useTranslation } from 'react-i18next';
import i18n from '@/integrations/i18n';
import { Settings as SettingsIcon, Palette, Sparkles, TestTube, UserCircle } from "lucide-react";
import * as Tabs from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';
import { PageHeader } from "@/components/ui/page-header";
import { ModernCard, ModernCardContent } from "@/components/ui/modern-card";
import { useMediaQuery } from '../hooks/use-media-query';

// Import new organized settings components
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import AISettings from '@/components/settings/AISettings';
import DataManagementSettings from '@/components/settings/DataManagementSettings';
import DeveloperSettings from '@/components/settings/DeveloperSettings';
import UserProfileSettings from '@/components/settings/UserProfileSettings';

const Settings = () => {
  const { t } = useTranslation();
  const isRTL = i18n.language === 'fa';
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  const handleImportSuccess = () => {
    console.log("Contacts imported successfully, refreshing data...");
  };

  const settingsTabs = [
    {
      id: 'appearance',
      title: t('settings.display_settings'),
      icon: <Palette size={18} />,
      component: <AppearanceSettings />
    },
    {
      id: 'ai',
      title: t('settings.ai_settings'),
      icon: <Sparkles size={18} />,
      component: <AISettings />
    },
    {
      id: 'data',
      title: t('settings.data_management'),
      icon: <TestTube size={18} />, // Using TestTube as a placeholder
      component: <DataManagementSettings onImportSuccess={handleImportSuccess} />
    },
    {
      id: 'profile',
      title: t('settings.profile'),
      icon: <UserCircle size={18} />,
      component: <UserProfileSettings />
    },
    {
      id: 'developer',
      title: t('settings.developer'),
      icon: <TestTube size={18} />,
      component: <DeveloperSettings />
    }
  ];

  const [activeTab, setActiveTab] = useState(settingsTabs[0].id);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    return false; // Prevent default behavior
  };

  return (
    <div className="flex flex-col p-4 h-full w-full min-h-screen bg-gradient-to-br from-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto max-w-6xl">
        <PageHeader 
          title={t('settings.title')}
          description={t('settings.description')}
          showBackButton={true}
          className="mb-6"
        />
        
        <ModernCard variant="glass" className="w-full rounded-2xl shadow-2xl backdrop-blur-xl border border-white/20 dark:border-gray-700/20 overflow-hidden">
          <ModernCardContent className="p-0">
            <Tabs.Root 
              value={activeTab} 
              onValueChange={(value) => {
                setActiveTab(value);
                return false;
              }}
              className="w-full"
              orientation="horizontal"
            >
              {/* Tabs Navigation */}
              <div className="px-6 pt-6">
                <Tabs.List 
                  dir={isRTL ? 'rtl' : 'ltr'}
                  className={`relative w-full flex flex-nowrap overflow-x-auto gap-1 scrollbar-hide ${isRTL ? 'rtl' : 'ltr'}`}
                  style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                >
                  {settingsTabs.map((tab) => (
                    <Tabs.Trigger
                      key={tab.id}
                      value={tab.id}
                      className={cn(
                        "group relative flex-shrink-0 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap",
                        "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                        "data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex-shrink-0 group-data-[state=active]:scale-110 transition-transform duration-200">
                          {tab.icon}
                        </span>
                        <span className={cn(
                          "text-sm transition-all duration-200 hidden sm:inline-block",
                          "group-data-[state=active]:font-semibold"
                        )}>
                          {tab.title}
                        </span>
                      </div>
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-transparent group-data-[state=active]:bg-blue-500 transition-all duration-300" />
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200/50 to-transparent dark:via-gray-700/30 mt-2" />
              </div>

              {/* Tabs Content */}
              <div className="p-6">
                {settingsTabs.map((tab) => (
                  <Tabs.Content
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      "focus:outline-none",
                      "data-[state=active]:animate-fadeIn",
                      "data-[state=inactive]:hidden"
                    )}
                  >
                    <div className="animate-fadeIn">
                      {tab.component}
                    </div>
                  </Tabs.Content>
                ))}
              </div>
          </Tabs.Root>
        </ModernCardContent>
        </ModernCard>
      </div>
    </div>
  );
};

export default Settings;