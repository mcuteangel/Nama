import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Palette, Moon, Sun, Plus } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import { ModernTabs, ModernTabsList, ModernTabsTrigger } from "@/components/ui/modern-tabs";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardDescription } from "@/components/ui/modern-card";

interface GroupsHeaderProps {
  title: string;
  description: string;
  onAddClick: () => void;
  isDarkMode: boolean;
  handleThemeToggle: () => void;
  activeTab?: 'overview' | 'manage';
  setActiveTab?: (tab: 'overview' | 'manage') => void;
}

const GroupsHeader: React.FC<GroupsHeaderProps> = ({
  title,
  description,
  onAddClick,
  isDarkMode,
  handleThemeToggle,
  activeTab = 'overview',
  setActiveTab,
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


  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <ModernCard variant="glass" className="backdrop-blur-lg bg-opacity-80 p-6 rounded-2xl shadow-lg">
        <ModernCardHeader className="p-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <GlassButton 
                  onClick={() => navigate(-1)}
                  size="icon"
                  variant="ghost"
                  className="rounded-full"
                  aria-label={t('common.back', 'بازگشت')}
                >
                  <ArrowLeft className="w-5 h-5" />
                </GlassButton>
                <ModernCardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  {title}
                </ModernCardTitle>
              </div>
              <ModernCardDescription className="text-lg text-gray-600 dark:text-gray-300">
                {description}
              </ModernCardDescription>
            </div>
            
            <div className="flex items-center gap-3">
              <GlassButton 
                onClick={handleThemeToggle}
                size="icon"
                variant="ghost"
                className="rounded-full"
                aria-label={t('common.toggle_theme', 'تغییر تم')}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </GlassButton>
              
              <button
                onClick={onAddClick}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 glass-advanced text-foreground border border-white/20 hover:bg-white/10 dark:hover:bg-white/5 backdrop-blur-md h-10 px-4 py-2 hover-lift gap-2"
                type="button"
              >
                <Plus className="h-4 w-4" />
                {t('groups.create_group', 'افزودن گروه جدید')}
              </button>
            </div>
          </div>
        </ModernCardHeader>

        {setActiveTab && (
        <div className="mt-8">
          <ModernTabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as 'overview' | 'manage')}
            className="w-full"
          >
            <ModernTabsList className="w-full justify-start p-1 rounded-2xl bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm">
              {tabs.map((tab) => (
                <ModernTabsTrigger 
                  key={tab.id}
                  value={tab.id}
                  className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'bg-white/80 dark:bg-gray-700/80 shadow-lg text-blue-600 dark:text-blue-400 backdrop-blur-sm' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-700/30'
                  }`}
                >
                  <div className="flex items-center">
                    <tab.icon className={`w-5 h-5 ml-2 transition-transform duration-300 ${
                      activeTab === tab.id ? 'scale-110 ' + tab.color : 'text-gray-400 group-hover:scale-110'
                    }`} />
                    <span className="font-medium">{tab.label}</span>
                  </div>
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </ModernTabsTrigger>
              ))}
            </ModernTabsList>
          </ModernTabs>
        </div>
      )}
      </ModernCard>
    </motion.div>
  );
};

export default GroupsHeader;