import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Moon, Sun, Monitor } from "lucide-react";
import { GlassButton, GradientButton } from "./glass-button";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardDescription } from "@/components/ui/modern-card";
import { ModernTooltip, ModernTooltipContent, ModernTooltipTrigger } from "./modern-tooltip";
import { useAppSettings } from "@/hooks/use-app-settings";
import { useCallback, useEffect } from 'react';
import {
  ModernDropdownMenu,
  ModernDropdownMenuContent,
  ModernDropdownMenuItem,
  ModernDropdownMenuTrigger,
} from "@/components/ui/modern-dropdown-menu";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description: string;
  onAddClick?: () => void;
  addButtonLabel?: string;
  addButtonIcon?: React.ReactNode;
  showBackButton?: boolean;
  className?: string;
  children?: React.ReactNode;
  showThemeToggle?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  onAddClick,
  addButtonLabel,
  addButtonIcon = <Plus size={20} />,
  showBackButton = true,
  className = "",
  children,
  showThemeToggle = true
}) => {
  const { settings, updateSettings } = useAppSettings();
  const isRTL = settings.language === 'fa';
  const { t } = useTranslation();
  const navigate = useNavigate();

  const applyTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, []);

  useEffect(() => {
    applyTheme(settings.theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (settings.theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [settings.theme, applyTheme]);

  const setTheme = (theme: string) => {
    updateSettings({ theme: theme as 'light' | 'dark' | 'system' });
  };

  const themes = [
    {
      value: "light",
      label: t('theme_options.light'),
      icon: <Sun className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />,
      description: t('theme_options.light_description')
    },
    {
      value: "dark",
      label: t('theme_options.dark'),
      icon: <Moon className="h-4 w-4 text-indigo-400" />,
      description: t('theme_options.dark_description')
    },
    {
      value: "system",
      label: t('theme_options.system'),
      icon: <Monitor className="h-4 w-4 text-blue-500" />,
      description: t('theme_options.system_description')
    }
  ];

  const currentTheme = themes.find(t => t.value === settings.theme) || themes[0];

  return (
    <ModernCard className="backdrop-blur-lg bg-opacity-80 p-5 rounded-2xl shadow-lg">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={className}
      >
        <ModernCardHeader className="p-0">
          <div className="flex items-center justify-between gap-2 min-h-[3.5rem]">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {showBackButton && (
                <GlassButton
                  onClick={() => navigate(-1)}
                  size="icon"
                  variant="ghost"
                  className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/40 dark:border-gray-700/40 flex-shrink-0"
                  aria-label={t('common.back')}
                >
                  <ArrowLeft
                    className={`w-5 h-5 transition-transform duration-300 ${isRTL ? 'rotate-180' : ''}`}
                  />
                </GlassButton>
              )}
              <div className="flex-1 min-w-0">
                <ModernCardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent truncate">
                  {title}
                </ModernCardTitle>
                <ModernCardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-300 truncate">
                  {description}
                </ModernCardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {showThemeToggle && (
                <ModernDropdownMenu>
                  <ModernDropdownMenuTrigger asChild>
                    <GlassButton
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-200"
                      aria-label={t('settings.toggle_theme')}
                    >
                      {currentTheme.value === 'light' && (
                        <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400 transition-transform duration-300 hover:rotate-12" />
                      )}
                      {currentTheme.value === 'dark' && (
                        <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-300 transition-transform duration-300 hover:rotate-12" />
                      )}
                      {currentTheme.value === 'system' && (
                        <Monitor className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 transition-transform duration-300 hover:scale-110" />
                      )}
                      <span className="sr-only">{t('settings.toggle_theme')}</span>
                    </GlassButton>
                  </ModernDropdownMenuTrigger>
                  <ModernDropdownMenuContent
                    align="end"
                    glassEffect="advanced"
                    className="rounded-xl p-2 min-w-[200px] border border-gray-200/50 dark:border-gray-800/50 shadow-lg shadow-black/5 backdrop-blur-xl"
                    sideOffset={8}
                  >
                    <div className="px-2 py-1.5">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-200/60 mb-2 px-1">
                        {t('settings.choose_theme')}
                      </p>
                      {themes.map((item) => (
                        <ModernDropdownMenuItem
                          key={item.value}
                          onSelect={(e) => {
                            e.preventDefault();
                            setTheme(item.value);
                          }}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer",
                            "focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2",
                            settings.theme === item.value
                              ? 'bg-blue-100/80 dark:bg-blue-900/40 text-blue-800 dark:text-blue-100 shadow-inner'
                              : 'hover:bg-gray-50/80 dark:hover:bg-gray-900/30 text-gray-700 dark:text-gray-200'
                          )}
                        >
                          <div className={cn(
                            "p-1.5 rounded-lg transition-all duration-200",
                            settings.theme === item.value
                              ? 'bg-blue-200/50 dark:bg-blue-800/50 shadow-sm'
                              : 'bg-white/50 dark:bg-gray-800/50'
                          )}>
                            {item.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.label}</p>
                            {item.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-200/60 truncate">
                                {item.description}
                              </p>
                            )}
                          </div>
                          {settings.theme === item.value && (
                            <span className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400 ml-2" />
                          )}
                        </ModernDropdownMenuItem>
                      ))}
                    </div>
                  </ModernDropdownMenuContent>
                </ModernDropdownMenu>
              )}

              {onAddClick && (
                <ModernTooltip>
                  <ModernTooltipTrigger asChild>
                    <GradientButton
                      gradientType="primary"
                      onClick={onAddClick}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 font-medium rounded-xl text-white hover:text-white/90 text-sm sm:text-base h-8 sm:h-auto"
                      style={{
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {addButtonIcon}
                      {addButtonLabel && <span className="hidden sm:inline">{addButtonLabel}</span>}
                    </GradientButton>
                  </ModernTooltipTrigger>
                  {addButtonLabel && (
                    <ModernTooltipContent>
                      <p>{addButtonLabel}</p>
                    </ModernTooltipContent>
                  )}
                </ModernTooltip>
              )}

              {children}
            </div>
          </div>
        </ModernCardHeader>
      </motion.div>
    </ModernCard>
  );
};

export default PageHeader;
