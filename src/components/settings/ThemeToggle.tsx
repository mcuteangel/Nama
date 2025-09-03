"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslation } from 'react-i18next';
import {
  ModernDropdownMenu,
  ModernDropdownMenuContent,
  ModernDropdownMenuItem,
  ModernDropdownMenuTrigger,
} from "@/components/ui/modern-dropdown-menu";
import { GlassButton } from "@/components/ui/glass-button";
import { useAppSettings } from '@/hooks/use-app-settings';

export function ThemeToggle() {
  const { settings, updateSettings } = useAppSettings();
  const { t } = useTranslation();

  const setTheme = (theme: string) => {
    updateSettings({ theme: theme as 'light' | 'dark' | 'system' });
    // Apply theme to document
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system - check prefers-color-scheme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const themes = [
    { value: "light", label: t('theme_options.light'), icon: <Sun className="h-4 w-4" /> },
    { value: "dark", label: t('theme_options.dark'), icon: <Moon className="h-4 w-4" /> },
    { value: "system", label: t('theme_options.system'), icon: <Sun className="h-4 w-4" /> }
  ];

  return (
    <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border border-yellow-200/50 dark:border-yellow-800/50 transition-all duration-300 hover:shadow-md">
      <ModernDropdownMenu>
        <ModernDropdownMenuTrigger asChild>
          <GlassButton
            variant="ghost"
            size="icon"
            className="h-10 w-10 hover:bg-yellow-100 dark:hover:bg-yellow-950/30 transition-colors duration-200"
            aria-label={t('settings.toggle_theme')}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">{t('settings.toggle_theme')}</span>
          </GlassButton>
        </ModernDropdownMenuTrigger>
        <ModernDropdownMenuContent
          align="end"
          glassEffect="advanced"
          className="rounded-md p-1 min-w-[140px] border border-yellow-200/50 dark:border-yellow-800/50"
        >
          {themes.map((item) => (
            <ModernDropdownMenuItem
              key={item.value}
              onClick={() => setTheme(item.value)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 ${
                  settings.theme === item.value
                    ? 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-800 dark:text-yellow-200'
                    : 'hover:bg-yellow-50 dark:hover:bg-yellow-950/30'
                }`}
            >
              <div className="p-1 rounded-full bg-yellow-100 dark:bg-yellow-900/50">
                {item.icon}
              </div>
              <span className="font-medium">{item.label}</span>
            </ModernDropdownMenuItem>
          ))}
        </ModernDropdownMenuContent>
      </ModernDropdownMenu>
    </div>
  );
}