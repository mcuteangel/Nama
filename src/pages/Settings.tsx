import React, { useState } from "react";
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, Palette, Sparkles, Database, TestTube, UserCircle } from "lucide-react";
import * as Tabs from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

// Import new organized settings components
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import AISettings from '@/components/settings/AISettings';
import DataManagementSettings from '@/components/settings/DataManagementSettings';
import DeveloperSettings from '@/components/settings/DeveloperSettings';
import UserProfileSettings from '@/components/settings/UserProfileSettings';

const Settings = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('appearance');

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
      icon: <Database size={18} />,
      component: <DataManagementSettings onImportSuccess={handleImportSuccess} />
    },
    {
      id: 'profile',
      title: t('common.profile'),
      icon: <UserCircle size={18} />,
      component: <UserProfileSettings />
    },
    {
      id: 'developer',
      title: t('settings.component_testing'),
      icon: <TestTube size={18} />,
      component: <DeveloperSettings />
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full min-h-screen bg-gradient-to-br from-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:to-gray-800">
      <ModernCard variant="glass" className="w-full max-w-6xl rounded-xl shadow-2xl backdrop-blur-xl border border-white/20 dark:border-gray-700/20">
        <ModernCardHeader className="text-center pb-6 border-b border-white/10 dark:border-gray-700/20">
          <ModernCardTitle className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center justify-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
              <SettingsIcon size={32} />
            </div>
            {t('settings.title')}
          </ModernCardTitle>
          <ModernCardDescription className="text-lg text-gray-600 dark:text-gray-300">
            {t('settings.description')}
          </ModernCardDescription>
        </ModernCardHeader>
        
        <ModernCardContent className="p-6">
          <Tabs.Root 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
            orientation="horizontal"
          >
            {/* Tabs Navigation */}
            <Tabs.List className="flex flex-wrap gap-2 mb-8 p-2 bg-white/30 dark:bg-gray-800/30 rounded-xl backdrop-blur-sm border border-white/20 dark:border-gray-700/20">
              {settingsTabs.map((tab) => (
                <Tabs.Trigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200",
                    "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200",
                    "hover:bg-white/50 dark:hover:bg-gray-700/50",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                    "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600",
                    "data-[state=active]:text-white data-[state=active]:shadow-lg",
                    "data-[state=active]:scale-105"
                  )}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.title}</span>
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {/* Tabs Content */}
            <div className="min-h-[400px]">
              {settingsTabs.map((tab) => (
                <Tabs.Content
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    "focus:outline-none",
                    "data-[state=active]:animate-fadeInUp",
                    "data-[state=inactive]:hidden"
                  )}
                >
                  <div className="fade-in-up">
                    {tab.component}
                  </div>
                </Tabs.Content>
              ))}
            </div>
          </Tabs.Root>
        </ModernCardContent>
      </ModernCard>
    </div>
  );
};

export default Settings;