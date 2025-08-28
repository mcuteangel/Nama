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
import { ModernButton } from "@/components/ui/modern-button";

export function ThemeToggle() {
  const { setTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <ModernDropdownMenu>
      <ModernDropdownMenuTrigger asChild>
        <ModernButton variant="ghost" size="icon" className="h-8 w-8">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </ModernButton>
      </ModernDropdownMenuTrigger>
      <ModernDropdownMenuContent align="end" glassEffect="glassAdvanced" className="rounded-md p-1">
        <ModernDropdownMenuItem onClick={() => setTheme("light")}>
          {t('theme_options.light')}
        </ModernDropdownMenuItem>
        <ModernDropdownMenuItem onClick={() => setTheme("dark")}>
          {t('theme_options.dark')}
        </ModernDropdownMenuItem>
        <ModernDropdownMenuItem onClick={() => setTheme("system")}>
          {t('theme_options.system')}
        </ModernDropdownMenuItem>
      </ModernDropdownMenuContent>
    </ModernDropdownMenu>
  );
}