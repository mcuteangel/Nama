"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from 'react-i18next';
import {
  ModernDropdownMenu,
  ModernDropdownMenuContent,
  ModernDropdownMenuItem,
  ModernDropdownMenuTrigger,
} from "@/components/ui/modern-dropdown-menu";
import { GlassButton } from "@/components/ui/glass-button";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const { t } = useTranslation();

  const themes = [
    { value: "light", label: t('theme_options.light'), icon: <Sun className="h-4 w-4" /> },
    { value: "dark", label: t('theme_options.dark'), icon: <Moon className="h-4 w-4" /> },
    { value: "system", label: t('theme_options.system'), icon: <Sun className="h-4 w-4" /> }
  ];

  return (
    <ModernDropdownMenu>
      <ModernDropdownMenuTrigger asChild>
        <GlassButton 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
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
        className="rounded-md p-1 min-w-[120px]"
      >
        {themes.map((item) => (
          <ModernDropdownMenuItem 
            key={item.value}
            onClick={() => setTheme(item.value)}
            className={`flex items-center gap-2 ${theme === item.value ? 'bg-accent' : ''}`}
          >
            {item.icon}
            {item.label}
          </ModernDropdownMenuItem>
        ))}
      </ModernDropdownMenuContent>
    </ModernDropdownMenu>
  );
}