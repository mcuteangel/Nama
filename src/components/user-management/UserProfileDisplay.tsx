import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useProfile } from '@/hooks/useProfile';
import { useSession } from '@/integrations/supabase/auth';
import LoadingMessage from '../common/LoadingMessage';
import { GlassButton } from "@/components/ui/glass-button";
import { Edit3, User, Phone, FileText, MapPin, Gift, Heart } from 'lucide-react';
import ProfileAvatar from './ProfileAvatar';
import UserProfileFormNew from './UserProfileFormNew';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '@/components/ui/modern-card';

const UserProfileDisplay: React.FC = () => {
  const { t } = useTranslation();
  const { session } = useSession();
  const { profile, loading, error, clearError, retryOperation } = useProfile();
  const [isEditing, setIsEditing] = useState(false);

  // Loading state
  if (loading && !profile) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <LoadingMessage message={t('loading_messages.loading_profile')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
          <span className="text-red-500">⚠️</span>
          {error}
        </p>
        <div className="flex gap-2 mt-2">
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={clearError}
            disabled={loading}
            className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40"
          >
            {t('actions.dismiss')}
          </GlassButton>
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={retryOperation}
            disabled={loading}
            className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40"
          >
            {t('actions.retry')}
          </GlassButton>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {t('actions.edit')} {t('profile.tabs.profile')}
          </h2>
        </div>
        <UserProfileFormNew
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 mt-8">
      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
          <ModernCard className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 p-6 rounded-2xl shadow-lg">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar Section */}
            <div className="flex-shrink-0">
              <ProfileAvatar
                avatarUrl={profile?.avatar_url}
                onAvatarUpdate={() => {
                  // Profile will be refreshed automatically by the hook
                }}
                size="lg"
                editable={true}
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-right">
              <div className="flex items-center justify-center md:justify-end gap-2 mb-3">
                <Heart className="w-4 h-4 text-pink-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('profile.hero.personal_profile')}
                </span>
              </div>
              <ModernCardTitle className="text-2xl md:text-3xl mb-2">
                {profile?.first_name && profile?.last_name
                  ? `${profile.first_name} ${profile.last_name}`
                  : t('common.not_specified')
                }
              </ModernCardTitle>
              <ModernCardDescription className="text-base mb-3">
                {session?.user?.email || t('common.not_specified')}
              </ModernCardDescription>
              <div className="flex flex-wrap justify-center md:justify-end gap-3 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{profile?.location || t('common.not_specified')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Gift className="w-3 h-3" />
                  <span>{profile?.birthday || t('common.not_specified')}</span>
                </div>
              </div>
            </div>
          </div>
        </ModernCard>
      </motion.div>

      {/* Information Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <ModernCard className="backdrop-blur-lg bg-blue-50/20 dark:bg-gray-900/90 p-4 rounded-2xl shadow-lg h-full">
            <ModernCardHeader>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-400 rounded-xl shadow-lg">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <ModernCardTitle className="text-lg">
                    {t('profile.sections.personal_info')}
                  </ModernCardTitle>
                  <ModernCardDescription className="text-xs">
                    {t('profile.sections.basic_account_info')}
                  </ModernCardDescription>
                </div>
              </div>
            </ModernCardHeader>
            <ModernCardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t('profile.sections.first_name')}:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  {profile?.first_name || t('common.not_specified')}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t('profile.sections.last_name')}:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white text-sm">{profile?.last_name || t('common.not_specified')}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t('profile.sections.email')}:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  {session?.user?.email || t('common.not_specified')}
                </span>
              </div>
            </ModernCardContent>
          </ModernCard>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <ModernCard className="backdrop-blur-lg bg-green-50/20 dark:bg-gray-900/90 p-4 rounded-2xl shadow-lg h-full">
            <ModernCardHeader>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-green-400 rounded-xl shadow-lg">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <div>
                  <ModernCardTitle className="text-lg">
                    {t('profile.sections.contact_info')}
                  </ModernCardTitle>
                  <ModernCardDescription className="text-xs">
                    {t('profile.sections.contact_methods')}
                  </ModernCardDescription>
                </div>
              </div>
            </ModernCardHeader>
            <ModernCardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t('profile.sections.phone')}:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  {profile?.phone || t('common.not_specified')}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t('profile.sections.location')}:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  {profile?.location || t('common.not_specified')}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t('profile.sections.birthday')}:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  {profile?.birthday || t('common.not_specified')}
                </span>
              </div>
            </ModernCardContent>
          </ModernCard>
        </motion.div>
      </div>

      {/* Bio Section */}
      {profile?.bio && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <ModernCard className="backdrop-blur-lg bg-purple-50/20 dark:bg-gray-900/90 p-4 rounded-2xl shadow-lg">
            <ModernCardHeader>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-purple-400 rounded-xl shadow-lg">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <ModernCardTitle className="text-lg">
                    {t('profile.sections.about_me')}
                  </ModernCardTitle>
                  <ModernCardDescription className="text-xs">
                    {t('profile.sections.brief_description')}
                  </ModernCardDescription>
                </div>
              </div>
            </ModernCardHeader>
            <ModernCardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">{profile.bio}</p>
            </ModernCardContent>
          </ModernCard>
        </motion.div>
      )}

      {/* Edit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="flex justify-center"
      >
        <GlassButton
          onClick={() => setIsEditing(true)}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-black font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 border-0"
        >
          <div className="flex items-center gap-2">
            <Edit3 size={18} />
            <span>{t('actions.edit')}</span>
          </div>
        </GlassButton>
      </motion.div>
    </div>
  );
};

export default UserProfileDisplay; 
