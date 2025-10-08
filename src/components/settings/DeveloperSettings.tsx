import React from 'react';
import { useTranslation } from 'react-i18next';
import { TestTube } from 'lucide-react';
import SettingsSection from './SettingsSection';
import DebugSettings from './DebugSettings';

const DeveloperSettings: React.FC = () => {
  const { t } = useTranslation();

  return (
    <SettingsSection
      title={t('settings.component_testing')}
      description={t('settings.component_testing_description')}
      icon={<TestTube size={20} />}
      variant="glass"
    >
      {/* Debug Settings - Only in Development */}
      <DebugSettings />
    </SettingsSection>
  );
};

export default DeveloperSettings;