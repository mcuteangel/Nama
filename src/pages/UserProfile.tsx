import React, { useMemo } from 'react';
import UserProfileDisplay from "@/components/user-management/UserProfileDisplay";
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { GlassButton } from "@/components/ui/glass-button";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import useAppSettings from '@/hooks/use-app-settings';
import PageHeader from '@/components/ui/PageHeader';

const UserProfile: React.FC = () => {
  const { t } = useTranslation();
  const { settings } = useAppSettings();

  // Determine if we're in RTL mode based on the current language setting
  const isRTL = useMemo(() => settings.language === 'fa', [settings.language]);


  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <PageHeader
          title={t('pages.user_profile.title')}
          description={t('profile.subtitle')}
          showBackButton={true}
        />

        {/* Floating Action Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="fixed bottom-6 right-6 z-20"
        >
          <GlassButton
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            variant="ghost"
            size="sm"
            className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          >
            <ArrowLeft size={20} className="rotate-90" />
          </GlassButton>
        </motion.div>

        {/* Profile Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <ModernCard
            variant="glass"
            hover="lift"
            className="glass-advanced glass-3d-hover backdrop-blur-2xl border border-white/30 shadow-2xl"
          >
            <ModernCardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                  <span className="text-blue-500 text-xl">👤</span>
                </div>
                <div>
                  <ModernCardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    {t('profile.tabs.profile')}
                  </ModernCardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t('profile.tabs.profile_desc')}
                  </p>
                </div>
              </div>
            </ModernCardHeader>
            <ModernCardContent>
              <UserProfileDisplay />
            </ModernCardContent>
          </ModernCard>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;