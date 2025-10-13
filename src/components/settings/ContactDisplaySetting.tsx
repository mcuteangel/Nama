import { useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { Label } from "@/components/ui/label";
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from "@/components/ui/modern-select";
import { LayoutGrid, List } from 'lucide-react';
import { useAppSettings } from '@/hooks/use-app-settings';
import { cn } from '@/lib/utils';

type DisplayMode = 'grid' | 'list';

interface DisplayModeOption {
  value: DisplayMode;
  label: string;
  icon: React.ReactNode;
  description?: string;
}

const ContactDisplaySetting = () => {
  const { t } = useTranslation();
  const { settings, updateSettings } = useAppSettings();

  // Memoize display modes to prevent recreation on every render
  const displayModes = useMemo<DisplayModeOption[]>(() => [
    {
      value: 'grid',
      label: t('settings.display_mode_grid'),
      icon: <LayoutGrid className="h-4 w-4" aria-hidden="true" />,
      description: t('settings.display_mode_grid_description')
    },
    {
      value: 'list',
      label: t('settings.display_mode_list'),
      icon: <List className="h-4 w-4" aria-hidden="true" />,
      description: t('settings.display_mode_list_description')
    }
  ], [t]);

  // Get current mode with fallback
  const currentMode = useMemo(() => 
    displayModes.find(mode => mode.value === settings.contactDisplayMode) || displayModes[0],
    [settings.contactDisplayMode, displayModes]
  );

  // Handle display mode change with type safety
  const handleDisplayModeChange = (value: string) => {
    if (value === 'grid' || value === 'list') {
      updateSettings({ contactDisplayMode: value as DisplayMode });
    }
  };

  return (
    <div 
      className={cn(
        "p-4 rounded-xl transition-all duration-300",
        "bg-gradient-to-r from-cyan-50/80 to-blue-50/80",
        "dark:from-cyan-950/20 dark:to-blue-950/20",
        "border border-cyan-200/60 dark:border-cyan-800/30",
        "hover:shadow-lg hover:shadow-cyan-100/30 dark:hover:shadow-cyan-900/20"
      )}
      role="region"
      aria-label={t('settings.display_settings')}
    >
      <div className="space-y-3">
        <Label 
          htmlFor="display-mode-select" 
          className="text-gray-800 dark:text-gray-200 flex items-center gap-2 font-medium"
        >
          <div 
            className="p-1.5 rounded-full bg-cyan-100 dark:bg-cyan-900/50"
            aria-hidden="true"
          >
            <LayoutGrid className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          {t('settings.default_contact_display_mode')}
        </Label>
        
        <ModernSelect 
          onValueChange={handleDisplayModeChange} 
          value={settings.contactDisplayMode}
          name="display-mode"
        >
          <ModernSelectTrigger 
            id="display-mode-select"
            variant="glass" 
            className={cn(
              "w-full transition-all duration-200",
              "bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10",
              "border border-transparent hover:border-white/10",
              "focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-white/10"
            )}
            aria-label={t('settings.select_display_mode')}
          >
            <ModernSelectValue>
              <span className="flex items-center gap-2">
                <div 
                  className="p-1.5 rounded-lg bg-cyan-100/80 dark:bg-cyan-900/40"
                  aria-hidden="true"
                >
                  {currentMode.icon}
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {currentMode.label}
                </span>
              </span>
            </ModernSelectValue>
          </ModernSelectTrigger>
          
          <ModernSelectContent 
            variant="glass" 
            className={cn(
              "p-1.5 mt-1 min-w-[var(--radix-select-trigger-width)]",
              "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg",
              "border border-gray-200/80 dark:border-gray-700/80",
              "shadow-lg shadow-black/5 dark:shadow-black/20"
            )}
            sideOffset={8}
            align="start"
          >
            {displayModes.map((mode) => (
              <ModernSelectItem 
                key={mode.value} 
                value={mode.value} 
                className={cn(
                  "group relative px-3 py-2 rounded-lg transition-colors",
                  "text-gray-900 dark:text-gray-100",
                  "hover:bg-gray-100 dark:hover:bg-gray-800/80",
                  "focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-800/80",
                  "data-[state=checked]:bg-cyan-50/80 data-[state=checked]:text-cyan-700",
                  "dark:data-[state=checked]:bg-cyan-900/40 dark:data-[state=checked]:text-cyan-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      "bg-cyan-100/60 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
                      "group-hover:bg-cyan-200/60 dark:group-hover:bg-cyan-800/40"
                    )}
                    aria-hidden="true"
                  >
                    {mode.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {mode.label}
                    </p>
                    {mode.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {mode.description}
                      </p>
                    )}
                  </div>
                  {settings.contactDisplayMode === mode.value && (
                    <span 
                      className="h-2 w-2 rounded-full bg-cyan-500 dark:bg-cyan-400 ml-2 flex-shrink-0"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </ModernSelectItem>
            ))}
          </ModernSelectContent>
        </ModernSelect>
        
        <p 
          className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
          id="display-mode-description"
        >
          {currentMode.description || t(
            'settings.default_contact_display_mode_description'
          )}
        </p>
      </div>
    </div>
  );
};

export default ContactDisplaySetting;