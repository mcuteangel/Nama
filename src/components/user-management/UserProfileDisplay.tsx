import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useProfile } from '@/hooks/useProfile';
import { useSession } from '@/integrations/supabase/auth';
import LoadingMessage from '../common/LoadingMessage';
import { GlassButton } from "@/components/ui/glass-button";
import { Edit3, User, Mail, Phone, FileText, MapPin, Gift } from 'lucide-react';
import ProfileAvatar from './ProfileAvatar';
import UserProfileFormNew from './UserProfileFormNew';
import { designTokens } from '@/lib/design-tokens';

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
    <div className="flex flex-col items-center justify-start w-full">
      {/* Profile Avatar */}
      <div className="mb-8">
        <ProfileAvatar
          avatarUrl={profile?.avatar_url}
          onAvatarUpdate={() => {
            // Profile will be refreshed automatically by the hook
          }}
          size="xl"
          editable={true}
        />
      </div>

      {/* Profile Information Cards */}
      <div className="w-full max-w-4xl">
        <div className="grid gap-4 md:gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          {/* Basic Information */}
          <div className="relative group">
            {/* Background Glow */}
            <div
              className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `linear-gradient(135deg, ${designTokens.colors.primary[500]}20, ${designTokens.colors.secondary[500]}20)`,
                filter: 'blur(20px)',
              }}
            />

            {/* Main Card */}
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg,
                  rgba(255, 255, 255, 0.1) 0%,
                  rgba(255, 255, 255, 0.05) 50%,
                  rgba(255, 255, 255, 0.02) 100%)`,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: `0 20px 40px -12px rgba(0, 0, 0, 0.2),
                           0 8px 16px -8px rgba(0, 0, 0, 0.1),
                           inset 0 1px 0 0 rgba(255, 255, 255, 0.1)`,
              }}
            >
              <div
                className="px-4 py-3 border-b border-white/10"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                }}
              >
                <h2 className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-gray-100">
                  <div
                    className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg"
                  >
                    <User size={20} className="text-white" />
                  </div>
                  <span>{t('contact_detail.basic_info')}</span>
                </h2>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* First Name */}
                <div className="group/field">
                  <label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <User size={16} className="text-primary" />
                    <span>{t('form_labels.first_name')}</span>
                  </label>
                  <div
                    className="px-4 py-3 rounded-xl bg-white/70 dark:bg-gray-800/70 border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
                  >
                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                      {profile?.first_name || t('common.not_specified')}
                    </span>
                  </div>
                </div>

                {/* Last Name */}
                <div className="group/field">
                  <label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <User size={16} className="text-primary" />
                    <span>{t('form_labels.last_name')}</span>
                  </label>
                  <div
                    className="px-4 py-3 rounded-xl bg-white/70 dark:bg-gray-800/70 border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
                  >
                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                      {profile?.last_name || t('common.not_specified')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="relative group">
            {/* Background Glow */}
            <div
              className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `linear-gradient(135deg, ${designTokens.colors.semantic.success[500]}20, ${designTokens.colors.info[500]}20)`,
                filter: 'blur(20px)',
              }}
            />

            {/* Main Card */}
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg,
                  rgba(255, 255, 255, 0.1) 0%,
                  rgba(255, 255, 255, 0.05) 50%,
                  rgba(255, 255, 255, 0.02) 100%)`,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: `0 20px 40px -12px rgba(0, 0, 0, 0.2),
                           0 8px 16px -8px rgba(0, 0, 0, 0.1),
                           inset 0 1px 0 0 rgba(255, 255, 255, 0.1)`,
              }}
            >
              {/* Header */}
              <div
                className="px-4 py-3 border-b border-white/10"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                }}
              >
                <h2 className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-gray-100">
                  <div
                    className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 shadow-lg"
                  >
                    <Phone size={20} className="text-white" />
                  </div>
                  <span>{t('contact_detail.contact_methods')}</span>
                </h2>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Email */}
                <div className="group/field">
                  <label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Mail size={16} className="text-primary" />
                    <span>{t('form_labels.user_email')}</span>
                  </label>
                  <div
                    className="px-4 py-3 rounded-xl bg-white/70 dark:bg-gray-800/70 border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
                  >
                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                      {session?.user?.email || t('common.not_specified')}
                    </span>
                  </div>
                </div>

                {/* Phone */}
                <div className="group/field">
                  <label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Phone size={16} className="text-primary" />
                    <span>{t('form_labels.phone')}</span>
                  </label>
                  <div
                    className="px-4 py-3 rounded-xl bg-white/70 dark:bg-gray-800/70 border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
                  >
                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                      {profile?.phone || t('common.not_specified')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="relative group">
            {/* Background Glow */}
            <div
              className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `linear-gradient(135deg, ${designTokens.colors.secondary[500]}20, ${designTokens.colors.accent[500]}20)`,
                filter: 'blur(20px)',
              }}
            />

            {/* Main Card */}
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg,
                  rgba(255, 255, 255, 0.1) 0%,
                  rgba(255, 255, 255, 0.05) 50%,
                  rgba(255, 255, 255, 0.02) 100%)`,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: `0 20px 40px -12px rgba(0, 0, 0, 0.2),
                           0 8px 16px -8px rgba(0, 0, 0, 0.1),
                           inset 0 1px 0 0 rgba(255, 255, 255, 0.1)`,
              }}
            >
              {/* Header */}
              <div
                className="px-4 py-3 border-b border-white/10"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                }}
              >
                <h2 className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-gray-100">
                  <div
                    className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg"
                  >
                    <MapPin size={20} className="text-white" />
                  </div>
                  <span>اطلاعات تکمیلی</span>
                </h2>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Location */}
                <div className="group/field">
                  <label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <MapPin size={16} className="text-primary" />
                    <span>{t('form_labels.location')}</span>
                  </label>
                  <div
                    className="px-4 py-3 rounded-xl bg-white/70 dark:bg-gray-800/70 border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
                  >
                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                      {profile?.location || t('common.not_specified')}
                    </span>
                  </div>
                </div>

                {/* Birthday */}
                <div className="group/field">
                  <label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Gift size={16} className="text-primary" />
                    <span>{t('form_labels.birthday')}</span>
                  </label>
                  <div
                    className="px-4 py-3 rounded-xl bg-white/70 dark:bg-gray-800/70 border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
                  >
                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                      {profile?.birthday || t('common.not_specified')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="relative group">
            {/* Background Glow */}
            <div
              className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `linear-gradient(135deg, ${designTokens.colors.semantic.warning[500]}20, ${designTokens.colors.semantic.error[500]}20)`,
                filter: 'blur(20px)',
              }}
            />

            {/* Main Card */}
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg,
                  rgba(255, 255, 255, 0.1) 0%,
                  rgba(255, 255, 255, 0.05) 50%,
                  rgba(255, 255, 255, 0.02) 100%)`,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: `0 20px 40px -12px rgba(0, 0, 0, 0.2),
                           0 8px 16px -8px rgba(0, 0, 0, 0.1),
                           inset 0 1px 0 0 rgba(255, 255, 255, 0.1)`,
              }}
            >
              {/* Header */}
              <div
                className="px-4 py-3 border-b border-white/10"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                }}
              >
                <h2 className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-gray-100">
                  <div
                    className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg"
                  >
                    <FileText size={20} className="text-white" />
                  </div>
                  <span>{t('form_labels.bio')}</span>
                </h2>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                <div className="group/field">
                  <label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <FileText size={16} className="text-primary" />
                    <span>{t('form_labels.bio')}</span>
                  </label>
                  <div
                    className="px-4 py-3 rounded-xl bg-white/70 dark:bg-gray-800/70 border border-gray-200/50 dark:border-gray-700/50 shadow-sm min-h-[100px]"
                  >
                    <span className="text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                      {profile?.bio || t('common.not_specified')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="mt-8"
      >
        <GlassButton
          onClick={() => setIsEditing(true)}
          className="px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-300 hover:shadow-lg"
        >
          <div className="flex items-center gap-3">
            <Edit3 size={20} className="text-primary-foreground" />
            <span>{t('actions.edit')}</span>
          </div>
        </GlassButton>
      </motion.div>
    </div>
  );
};

export default UserProfileDisplay;
