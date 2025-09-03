import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { UserCircle, User } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';
import SettingsSection from './SettingsSection';
import SettingsCard from './SettingsCard';

const UserProfileSettings: React.FC = () => {
  const { t } = useTranslation();

  return (
    <SettingsSection
      title={t('common.profile')}
      description={t('settings.user_profile_description')}
      icon={<UserCircle size={20} />}
      variant="glass"
    >
      <SettingsCard
        title={t('settings.user_profile')}
        description="Manage your personal information and account settings"
        icon={<User size={16} />}
        gradient="blue"
      >
        <GlassButton
          asChild
          variant="gradient-primary"
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold"
        >
          <Link to="/profile">
            <User size={20} />
            {t('settings.user_profile')}
          </Link>
        </GlassButton>
      </SettingsCard>
    </SettingsSection>
  );
};

export default UserProfileSettings;