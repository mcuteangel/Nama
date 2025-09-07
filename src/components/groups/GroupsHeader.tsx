import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Palette,
  Moon,
  Sun
} from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import { ModernTabs, ModernTabsList, ModernTabsTrigger } from "@/components/ui/modern-tabs";

interface GroupsHeaderProps {
  activeTab: 'overview' | 'manage';
  setActiveTab: (tab: 'overview' | 'manage') => void;
  isDarkMode: boolean;
  handleThemeToggle: () => void;
  isRTL: boolean;
}

const GroupsHeader: React.FC<GroupsHeaderProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  handleThemeToggle,
  isRTL
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const tabs = [
    {
      id: 'overview' as const,
      label: t('groups.overview_tab', 'نمای کلی'),
      icon: Sparkles,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      description: t('groups.overview_description', 'مشاهده و مدیریت گروه‌ها'),
      gradient: 'from-blue-500 to-purple-600',
    },
    {
      id: 'manage' as const,
      label: t('groups.manage_tab', 'مدیریت پیشرفته'),
      icon: Palette,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      description: t('groups.manage_description', 'ابزارهای پیشرفته مدیریت'),
      gradient: 'from-purple-500 to-pink-600',
    },
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="space-y-6 sm:space-y-8">
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
            className="p-2 hover:scale-110 transition-all duration-300"
          >
            <ArrowLeft size={20} />
          </GlassButton>
          <div>
            <motion.h1
              className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {t('groups.title')}
            </motion.h1>
            <motion.p
              className="text-gray-600 dark:text-gray-400 mt-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {t('groups.description')}
            </motion.p>
          </div>
        </div>

        {/* Enhanced Theme Toggle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <GlassButton
            onClick={handleThemeToggle}
            variant="ghost"
            size="sm"
            className="p-3 rounded-2xl hover:scale-110 transition-all duration-300 group"
            title={isDarkMode ? t('theme.switch_to_light', 'تغییر به تم روشن') : t('theme.switch_to_dark', 'تغییر به تم تاریک')}
          >
            <div className="relative">
              {isDarkMode ? (
                <Sun size={24} className="text-yellow-500 group-hover:rotate-180 transition-transform duration-500" />
              ) : (
                <Moon size={24} className="text-blue-500 group-hover:rotate-180 transition-transform duration-500" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-blue-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
            </div>
          </GlassButton>
        </motion.div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <ModernTabs defaultValue="overview" className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
          <ModernTabsList
            className="grid w-full grid-cols-1 sm:grid-cols-2 mb-6 sm:mb-8 bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20 shadow-2xl"
            glassEffect="default"
            hoverEffect="lift"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <ModernTabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={`flex items-center gap-1 sm:gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:${tab.gradient} data-[state=active]:text-white transition-all duration-300 hover:scale-105 text-xs sm:text-sm group`}
                  hoverEffect="scale"
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={14} className={`${isRTL ? 'rotate-180' : ''} group-hover:scale-110 transition-transform duration-300`} />
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
              <div className={`w-8 h-8 ${activeTabData.bgColor} rounded-lg flex items-center justify-center shadow-lg`}>
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
        </ModernTabs>
      </motion.div>
    </div>
  );
};

export default GroupsHeader;