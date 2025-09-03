import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { TestTube, Palette, Settings as SettingsIcon } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';
import SettingsSection from './SettingsSection';
import SettingsCard from './SettingsCard';
import { RTLTestSetting } from './index';
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingsCard
          title={t('settings.rtl_components_test')}
          description="Test RTL (Right-to-Left) component rendering and layout"
          icon={<TestTube size={16} />}
          gradient="pink"
        >
          <RTLTestSetting />
        </SettingsCard>

        <SettingsCard
          title={t('settings.ui_showcase')}
          description="View all UI components and design system elements"
          icon={<Palette size={16} />}
          gradient="purple"
        >
          <GlassButton 
            asChild 
            variant="gradient-primary" 
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold"
          >
            <Link to="/modern-ui-showcase">
              <SettingsIcon size={20} />
              {t('settings.ui_showcase')}
            </Link>
          </GlassButton>
        </SettingsCard>
      </div>

      {/* Debug Settings - Only in Development */}
      <div className="mt-4">
        <DebugSettings />
      </div>
    </SettingsSection>
  );
};

export default DeveloperSettings;