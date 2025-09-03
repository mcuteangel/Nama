// Settings Components Export
export { ThemeToggle } from './ThemeToggle';
export { default as CalendarTypeSetting } from './CalendarTypeSetting';
export { default as LanguageSetting } from './LanguageSetting';
export { default as AccessibilitySetting } from './AccessibilitySetting';
export { default as ContactDisplaySetting } from './ContactDisplaySetting';
export { default as SettingsSection } from './SettingsSection';
export { default as SettingsCard } from './SettingsCard';
export { default as AppearanceSettings } from './AppearanceSettings';
export { default as AISettings } from './AISettings';
export { default as DataManagementSettings } from './DataManagementSettings';
export { default as DeveloperSettings } from './DeveloperSettings';
export { default as UserProfileSettings } from './UserProfileSettings';

// RTL Test Setting - placeholder for now
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { TestTube } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';

export const RTLTestSetting: React.FC = () => {
  const { t } = useTranslation();

  return (
    <GlassButton 
      asChild 
      variant="gradient-primary" 
      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold"
    >
      <Link to="/rtl-test">
        <TestTube size={20} />
        {t('settings.rtl_components_test')}
      </Link>
    </GlassButton>
  );
};