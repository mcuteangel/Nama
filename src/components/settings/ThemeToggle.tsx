"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect } from 'react';
import {
  ModernDropdownMenu,
  ModernDropdownMenuContent,
  ModernDropdownMenuItem,
  ModernDropdownMenuTrigger,
} from "@/components/ui/modern-dropdown-menu";
import { GlassButton } from "@/components/ui/glass-button";
import { useAppSettings } from '@/hooks/use-app-settings';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { settings, updateSettings } = useAppSettings();
  const { t } = useTranslation();

  const applyTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, []);

  // Apply theme when component mounts or theme changes
  useEffect(() => {
    applyTheme(settings.theme);
    
    // Listen for system theme changes
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
    <div className="group p-4 rounded-xl bg-gradient-to-r from-yellow-50/80 to-amber-50/80 dark:from-yellow-950/20 dark:to-amber-950/20 border border-yellow-200/60 dark:border-yellow-800/30 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-100/30 dark:hover:shadow-yellow-900/20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-medium text-gray-900 dark:text-yellow-50">{t('settings.theme')}</h3>
          <p className="text-sm text-gray-500 dark:text-yellow-200/70">
            {currentTheme.description || t('settings.theme_description')}
          </p>
        </div>
        
        <ModernDropdownMenu>
          <ModernDropdownMenuTrigger asChild>
            <GlassButton
              variant="ghost"
              size="icon"
              className="h-10 w-10 hover:bg-yellow-100/80 dark:hover:bg-yellow-900/30 transition-all duration-200 group-hover:scale-105"
              aria-label={t('settings.toggle_theme')}
              aria-pressed="true"
              aria-haspopup="true"
              aria-expanded="false"
            >
              {currentTheme.value === 'light' && (
                <Sun className="h-5 w-5 text-yellow-600 dark:text-yellow-400 transition-transform duration-300 hover:rotate-12" />
              )}
              {currentTheme.value === 'dark' && (
                <Moon className="h-5 w-5 text-indigo-300 transition-transform duration-300 hover:rotate-12" />
              )}
              {currentTheme.value === 'system' && (
                <Monitor className="h-5 w-5 text-blue-500 transition-transform duration-300 hover:scale-110" />
              )}
              <span className="sr-only">{t('settings.toggle_theme')}</span>
            </GlassButton>
          </ModernDropdownMenuTrigger>
          <ModernDropdownMenuContent
            align="end"
            glassEffect="advanced"
            className="rounded-xl p-2 min-w-[200px] border border-yellow-200/50 dark:border-yellow-800/50 shadow-lg shadow-black/5 backdrop-blur-xl"
            sideOffset={8}
          >
            <div className="px-2 py-1.5">
              <p className="text-xs font-medium text-gray-500 dark:text-yellow-200/60 mb-2 px-1">
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
                    "focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:ring-offset-2 focus:ring-offset-yellow-50/50 dark:focus:ring-offset-yellow-900/30",
                    settings.theme === item.value
                      ? 'bg-yellow-100/80 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-100 shadow-inner shadow-yellow-200/30 dark:shadow-yellow-800/20'
                      : 'hover:bg-yellow-50/80 dark:hover:bg-yellow-900/30 text-gray-700 dark:text-gray-200'
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-lg transition-all duration-200",
                    settings.theme === item.value 
                      ? 'bg-yellow-200/50 dark:bg-yellow-800/50 shadow-sm'
                      : 'bg-white/50 dark:bg-gray-800/50 group-hover:bg-yellow-100/50 dark:group-hover:bg-yellow-900/30'
                  )}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.label}</p>
                    {item.description && (
                      <p className="text-xs text-gray-500 dark:text-yellow-200/60 truncate">
                        {item.description}
                      </p>
                    )}
                  </div>
                  {settings.theme === item.value && (
                    <span className="h-2 w-2 rounded-full bg-yellow-500 dark:bg-yellow-400 ml-2" />
                  )}
                </ModernDropdownMenuItem>
              ))}
            </div>
          </ModernDropdownMenuContent>
        </ModernDropdownMenu>
      </div>
    </div>
  );
}