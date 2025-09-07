import React, { useState, useMemo } from 'react';
import UserProfileFormNew from "@/components/user-management/UserProfileFormNew";
import ProfileSettings from "@/components/user-management/ProfileSettings";
import NotificationSettings from "@/components/user-management/NotificationSettings";
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { User, Settings, Bell, Sparkles, ArrowLeft } from 'lucide-react';
import { GlassButton } from "@/components/ui/glass-button";
import { useNavigate } from 'react-router-dom';
import { ModernTabs, ModernTabsList, ModernTabsTrigger, ModernTabsContent } from "@/components/ui/modern-tabs";
import { ModernCard, ModernCardContent } from "@/components/ui/modern-card";
import useAppSettings from '@/hooks/use-app-settings';

type TabType = 'profile' | 'settings' | 'notifications';

const UserProfile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const { settings, updateSettings } = useAppSettings();

  // Determine if we're in RTL mode based on the current language setting
  const isRTL = useMemo(() => settings.language === 'fa', [settings.language]);

  // Determine theme based on settings or system preference
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (settings.theme === 'dark') return true;
    if (settings.theme === 'light') return false;
    // Default to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Update theme when settings change
  React.useEffect(() => {
    if (settings.theme === 'dark') {
      setIsDarkMode(true);
    } else if (settings.theme === 'light') {
      setIsDarkMode(false);
    } else {
      // System preference
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, [settings.theme]);

  // Handle theme toggle
  const handleThemeToggle = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    updateSettings({ theme: newTheme });
  };

  const tabs = [
    {
      id: 'profile' as TabType,
      label: t('profile.tabs.profile'),
      icon: User,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      description: t('profile.tabs.profile_desc'),
      gradient: 'from-blue-500 to-purple-600',
    },
    {
      id: 'settings' as TabType,
      label: t('profile.tabs.settings'),
      icon: Settings,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      description: t('profile.tabs.settings_desc'),
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      id: 'notifications' as TabType,
      label: t('profile.tabs.notifications'),
      icon: Bell,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      description: t('profile.tabs.notifications_desc'),
      gradient: 'from-green-500 to-blue-600',
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <UserProfileFormNew />;
      case 'settings':
        return <ProfileSettings />;
      case 'notifications':
        return <NotificationSettings />;
      default:
        return <UserProfileFormNew />;
    }
  };

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'} transition-all duration-700 p-3 sm:p-4 md:p-6 lg:p-8`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <GlassButton
              onClick={() => navigate(-1)}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <ArrowLeft size={20} />
            </GlassButton>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('pages.user_profile.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('profile.subtitle')}
              </p>
            </div>
          </div>

          {/* Theme Toggle */}
          <GlassButton
            onClick={handleThemeToggle}
            variant="ghost"
            size="sm"
            className="p-2"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </GlassButton>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ModernTabs defaultValue="profile" className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            <ModernTabsList
              className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6 sm:mb-8 bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20"
              glassEffect="default"
              hoverEffect="lift"
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <ModernTabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={`flex items-center gap-1 sm:gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:${tab.gradient} data-[state=active]:text-white transition-all duration-300 hover:scale-105 text-xs sm:text-sm`}
                    hoverEffect="scale"
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={14} className={isRTL ? 'rotate-180' : ''} />
                    <span className="hidden xs:inline">{tab.label}</span>
                  </ModernTabsTrigger>
                );
              })}
            </ModernTabsList>

            {/* Active Tab Indicator */}
            {activeTabData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className={`w-8 h-8 ${activeTabData.bgColor} rounded-lg flex items-center justify-center`}>
                  <activeTabData.icon size={16} className={activeTabData.color} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    {activeTabData.label}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activeTabData.description}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <ModernTabsContent value={activeTab} className="space-y-6 sm:space-y-8">
                <ModernCard variant="glass" hover="lift" className="backdrop-blur-2xl border border-white/30 shadow-2xl">
                  <ModernCardContent className="p-4 sm:p-6 md:p-8">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="animate-in fade-in duration-700"
                    >
                      {renderTabContent()}
                    </motion.div>
                  </ModernCardContent>
                </ModernCard>
              </ModernTabsContent>
            </AnimatePresence>
          </ModernTabs>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;