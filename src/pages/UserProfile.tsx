import React, { useMemo } from 'react';
import UserProfileDisplay from "@/components/user-management/UserProfileDisplay";
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import useAppSettings from '@/hooks/use-app-settings';
import PageHeader from '@/components/ui/PageHeader';

const UserProfile: React.FC = () => {
  const { t } = useTranslation();
  const { settings } = useAppSettings();

  // Determine if we're in RTL mode based on the current language setting
  const isRTL = useMemo(() => settings.language === 'fa', [settings.language]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PageHeader
            title={t('pages.user_profile.title')}
            description={t('profile.hero.subtitle')}
            showBackButton={true}
          />
        </motion.div>

        {/* Profile Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <UserProfileDisplay />
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;