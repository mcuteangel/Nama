import React from 'react';
import { useTranslation } from 'react-i18next';
import { Palette, Calendar, Languages, Accessibility, Eye } from 'lucide-react';
import SettingsSection from './SettingsSection';
import SettingsCard from './SettingsCard';
import { ThemeToggle } from './ThemeToggle';
import CalendarTypeSetting from './CalendarTypeSetting';
import LanguageSetting from './LanguageSetting';
import AccessibilitySetting from './AccessibilitySetting';
import ContactDisplaySetting from './ContactDisplaySetting';

const AppearanceSettings: React.FC = () => {
  const { t } = useTranslation();

  return (
    <SettingsSection
      title={t('settings.display_settings')}
      description={t('settings.display_settings_description')}
      icon={<Palette size={20} />}
      variant="glass"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingsCard
          title={t('settings.theme')}
          icon={<Palette size={16} />}
          gradient="purple"
        >
          <ThemeToggle />
        </SettingsCard>

        <SettingsCard
          title={t('settings.language')}
          icon={<Languages size={16} />}
          gradient="orange"
        >
          <LanguageSetting />
        </SettingsCard>

        <SettingsCard
          title={t('settings.calendar_type')}
          icon={<Calendar size={16} />}
          gradient="green"
        >
          <CalendarTypeSetting />
        </SettingsCard>

        <SettingsCard
          title={t('settings.default_contact_display_mode')}
          icon={<Eye size={16} />}
          gradient="cyan"
        >
          <ContactDisplaySetting />
        </SettingsCard>
      </div>

      <div className="mt-4">
        <SettingsCard
          title={t('settings.accessibility')}
          description={t('settings.accessibility_description')}
          icon={<Accessibility size={16} />}
          gradient="blue"
        >
          <AccessibilitySetting />
        </SettingsCard>
      </div>
    </SettingsSection>
  );
};

export default AppearanceSettings;