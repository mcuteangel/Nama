import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Bot } from 'lucide-react';
import SettingsSection from './SettingsSection';
import SettingsCard from './SettingsCard';
import GeminiSettings from '../ai/GeminiSettings';

const AISettings: React.FC = () => {
  const { t } = useTranslation();

  return (
    <SettingsSection
      title={t('settings.ai_settings')}
      description={t('settings.ai_settings_description')}
      icon={<Sparkles size={20} />}
      variant="glass"
    >
      <SettingsCard
        title={t('settings.gemini_settings')}
        description={t('settings.gemini_description')}
        icon={<Bot size={16} />}
        gradient="purple"
      >
        <GeminiSettings />
      </SettingsCard>
    </SettingsSection>
  );
};

export default AISettings;