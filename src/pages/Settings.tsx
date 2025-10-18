import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, Palette, Sparkles, TestTube, UserCircle, Database, Code } from "lucide-react";
import { cn } from '@/lib/utils';
import PageHeader from "@/components/ui/PageHeader";
import { ModernCard, ModernCardContent } from "@/components/ui/modern-card";

// Import new organized settings components
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import AISettings from '@/components/settings/AISettings';
import DataManagementSettings from '@/components/settings/DataManagementSettings';
import DeveloperSettings from '@/components/settings/DeveloperSettings';
import UserProfileSettings from '@/components/settings/UserProfileSettings';

const Settings = () => {
  const { t } = useTranslation();

  const handleImportSuccess = () => {
    console.log("Contacts imported successfully, refreshing data...");
  };

  const settingsTabs = [
    {
      id: 'profile',
      title: t('settings.tabs.profile'),
      icon: <UserCircle size={14} />,
      component: <UserProfileSettings />,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-slate-100/60 dark:bg-slate-700/30',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
    },
    {
      id: 'appearance',
      title: t('settings.tabs.appearance'),
      icon: <Palette size={14} />,
      component: <AppearanceSettings />,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-slate-100/60 dark:bg-slate-700/30',
      hoverColor: 'hover:bg-purple-100 dark:hover:bg-purple-900/30'
    },
    {
      id: 'data',
      title: t('settings.tabs.data'),
      icon: <Database size={14} />,
      component: <DataManagementSettings onImportSuccess={handleImportSuccess} />,
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      bgColor: 'bg-slate-100/60 dark:bg-slate-700/30',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900/30'
    },
    {
      id: 'ai',
      title: t('settings.tabs.ai'),
      icon: <Sparkles size={14} />,
      component: <AISettings />,
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600',
      bgColor: 'bg-slate-100/60 dark:bg-slate-700/30',
      hoverColor: 'hover:bg-orange-100 dark:hover:bg-orange-900/30'
    },
    {
      id: 'developer',
      title: t('settings.tabs.developer'),
      icon: <Code size={14} />,
      component: <DeveloperSettings />,
      color: 'red',
      gradient: 'from-red-500 to-red-600',
      bgColor: 'bg-slate-100/60 dark:bg-slate-700/30',
      hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900/30'
    }
  ];

  const [activeTab, setActiveTab] = useState(settingsTabs[0].id);

  const currentTab = settingsTabs.find(tab => tab.id === activeTab);

  return (
    <div className="flex flex-col h-full w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div className="container mx-auto max-w-5xl p-6">
        <PageHeader
          title={t('settings.title')}
          description={t('settings.description')}
          showBackButton={true}
          className="mb-0"
        />

        {/* Spacer */}
        <div className="h-8" />

        <ModernCard className="w-full rounded-3xl shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 overflow-hidden">
          <ModernCardContent className="p-0">
            {/* Enhanced Tabs Navigation */}
            <div className="relative">
              <div className="px-6 pt-6 pb-3">
                <ModernCard className="rounded-2xl bg-slate-50/50 dark:bg-slate-700/30 border border-slate-200/50 dark:border-slate-600/30">
                  <ModernCardContent className="p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <SettingsIcon size={20} className="text-blue-600 dark:text-blue-400" />
                      <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                        {t('settings.section_chooser')}
                      </h2>
                    </div>

                    <div className={cn(
                      "grid gap-1.5",
                      "grid-cols-[repeat(5,minmax(0,1fr))]"
                    )}>
                      {settingsTabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={cn(
                            "group relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300",
                            "border backdrop-blur-sm overflow-hidden",
                            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50",
                            activeTab === tab.id
                              ? `${tab.bgColor} border-transparent shadow-md scale-[1.02]`
                              : `bg-white/60 dark:bg-slate-700/40 border-slate-200/50 dark:border-slate-600/50 ${tab.hoverColor}`,
                            "hover:shadow-md hover:scale-[1.02] hover:border-slate-300 dark:hover:border-slate-500"
                          )}
                        >
                          {/* Background Gradient */}
                          <div className={cn(
                            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                            `bg-gradient-to-br ${tab.gradient} opacity-10`
                          )} />

                          {/* Icon Container */}
                          <div className={cn(
                            "relative z-10 p-1.5 rounded-xl transition-all duration-300",
                            activeTab === tab.id
                              ? `bg-gradient-to-br ${tab.gradient} shadow-md scale-105`
                              : "bg-transparent"
                          )}>
                            <span className={cn(
                              "transition-colors duration-200",
                              activeTab === tab.id ? "text-white" : `text-${tab.color}-600 dark:text-${tab.color}-400`
                            )}>
                              {tab.icon}
                            </span>
                          </div>

                          {/* Title */}
                          <div className="relative z-10 text-center">
                            <h3 className={cn(
                              "font-medium text-xs transition-colors duration-200 leading-tight text-center break-words",
                              activeTab === tab.id
                                ? `text-${tab.color}-700 dark:text-${tab.color}-300`
                                : "text-slate-700 dark:text-slate-300"
                            )}>
                              {tab.title}
                            </h3>
                          </div>

                          {/* Active Indicator */}
                          {activeTab === tab.id && (
                            <div className={cn(
                              "absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 rounded-full",
                              `bg-gradient-to-r ${tab.gradient} shadow-sm`
                            )} />
                          )}

                          {/* Hover Effect Overlay */}
                          <div className={cn(
                            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                            `bg-gradient-to-br ${tab.gradient} opacity-5 rounded-2xl`
                          )} />
                        </button>
                      ))}
                    </div>
                  </ModernCardContent>
                </ModernCard>
              </div>

              {/* Decorative Line */}
              <div className="h-px bg-gradient-to-r from-transparent via-slate-200/50 to-transparent dark:via-slate-600/30" />
            </div>

            {/* Content Area */}
            <div className="p-6">
              <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                {/* Content Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    "p-2 rounded-xl",
                    `bg-gradient-to-br ${currentTab?.gradient} shadow-lg`
                  )}>
                    <span className="text-white">
                      {currentTab?.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                      {currentTab?.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {t('settings.section_description')}
                    </p>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    `bg-${currentTab?.color}-100 dark:bg-${currentTab?.color}-900/30 text-${currentTab?.color}-700 dark:text-${currentTab?.color}-300`
                  )}>
                    {t('settings.active_status')}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="bg-slate-50/50 dark:bg-slate-700/30 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-600/30">
                  {currentTab?.component}
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
      </div>
    </div>
  );
};

export default Settings;