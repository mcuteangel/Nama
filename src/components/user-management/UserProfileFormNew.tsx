import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { GlassButton } from "@/components/ui/glass-button";
import { Label } from '@/components/ui/label';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent, ModernCardFooter } from '@/components/ui/modern-card';
import { useSession } from '@/integrations/supabase/auth';
import LoadingMessage from '../common/LoadingMessage';
import LoadingSpinner from '../common/LoadingSpinner';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useProfile, ProfileData } from '@/hooks/useProfile';
import ProfileAvatar from './ProfileAvatar';
import ProfileCompletionIndicator from './ProfileCompletionIndicator';
import { User, Mail, Phone, FileText, Save, CheckCircle, MapPin, Calendar } from 'lucide-react';

// Schema validation for profile form
const profileSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  birthday: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const UserProfileFormNew: React.FC = () => {
  const { t } = useTranslation();
  const { session } = useSession();
  const { profile, loading, error, updateProfile, clearError } = useProfile();

  // React Hook Form setup
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      phone: '',
      bio: '',
    },
  });

  // Update form when profile data changes
  React.useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        location: profile.location || '',
        birthday: profile.birthday || '',
      });
    }
  }, [profile]);

  // Handle form submission
  const onSubmit = async (values: ProfileFormValues) => {
    try {
      clearError();
      const dataToUpdate: Partial<ProfileData> = {
        first_name: values.first_name || null,
        last_name: values.last_name || null,
        phone: values.phone || null,
        bio: values.bio || null,
        location: values.location || null,
        birthday: values.birthday || null,
      };
      await updateProfile(dataToUpdate);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  // Memoize form fields to prevent unnecessary re-renders
  const formFields = useMemo(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* First Name Field */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-3"
      >
        <Label htmlFor="first_name" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <User size={16} className="text-primary" />
          {t('form_labels.first_name')}
        </Label>
        <div className="relative">
          <ModernInput
            id="first_name"
            {...form.register('first_name')}
            placeholder={t('form_placeholders.enter_name')}
            variant="glass"
            className="pl-4 pr-4 py-3 bg-white/60 dark:bg-gray-800/60 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-xl text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            disabled={loading}
            aria-invalid={!!form.formState.errors.first_name}
            aria-describedby={form.formState.errors.first_name ? "first-name-error" : undefined}
          />
          {form.watch('first_name') && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <CheckCircle size={16} className="text-green-500" />
            </motion.div>
          )}
        </div>
        {form.formState.errors.first_name && (
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            id="first-name-error"
            className="text-red-500 text-sm flex items-center gap-1"
          >
            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            {form.formState.errors.first_name.message}
          </motion.p>
        )}
      </motion.div>

      {/* Last Name Field */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-3"
      >
        <Label htmlFor="last_name" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <User size={16} className="text-primary" />
          {t('form_labels.last_name')}
        </Label>
        <div className="relative">
          <ModernInput
            id="last_name"
            {...form.register('last_name')}
            placeholder={t('form_placeholders.enter_last_name')}
            variant="glass"
            className="pl-4 pr-4 py-3 bg-white/60 dark:bg-gray-800/60 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-xl text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            disabled={loading}
            aria-invalid={!!form.formState.errors.last_name}
            aria-describedby={form.formState.errors.last_name ? "last-name-error" : undefined}
          />
          {form.watch('last_name') && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <CheckCircle size={16} className="text-green-500" />
            </motion.div>
          )}
        </div>
        {form.formState.errors.last_name && (
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            id="last-name-error"
            className="text-red-500 text-sm flex items-center gap-1"
          >
            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            {form.formState.errors.last_name.message}
          </motion.p>
        )}
      </motion.div>

      {/* Phone Field */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="space-y-3"
      >
        <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Phone size={16} className="text-primary" />
          {t('form_labels.phone')}
        </Label>
        <div className="relative">
          <ModernInput
            id="phone"
            {...form.register('phone')}
            placeholder={t('form_placeholders.enter_phone')}
            variant="glass"
            className="pl-4 pr-4 py-3 bg-white/60 dark:bg-gray-800/60 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-xl text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            disabled={loading}
            aria-invalid={!!form.formState.errors.phone}
            aria-describedby={form.formState.errors.phone ? "phone-error" : undefined}
          />
          {form.watch('phone') && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <CheckCircle size={16} className="text-green-500" />
            </motion.div>
          )}
        </div>
        {form.formState.errors.phone && (
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            id="phone-error"
            className="text-red-500 text-sm flex items-center gap-1"
          >
            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            {form.formState.errors.phone.message}
          </motion.p>
        )}
      </motion.div>

      {/* Bio Field */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="md:col-span-2 space-y-3"
      >
        <Label htmlFor="bio" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <FileText size={16} className="text-primary" />
          {t('form_labels.bio')}
        </Label>
        <div className="relative">
          <textarea
            id="bio"
            {...form.register('bio')}
            placeholder={t('form_placeholders.enter_bio')}
            className="w-full pl-4 pr-4 py-3 bg-white/60 dark:bg-gray-800/60 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-xl text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none"
            rows={4}
            disabled={loading}
            aria-invalid={!!form.formState.errors.bio}
            aria-describedby={form.formState.errors.bio ? "bio-error" : undefined}
          />
          {form.watch('bio') && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3 top-3"
            >
              <CheckCircle size={16} className="text-green-500" />
            </motion.div>
          )}
        </div>
        {form.formState.errors.bio && (
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            id="bio-error"
            className="text-red-500 text-sm flex items-center gap-1"
          >
            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            {form.formState.errors.bio.message}
          </motion.p>
        )}
      </motion.div>

      {/* Location Field */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="space-y-3"
      >
        <Label htmlFor="location" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <MapPin size={16} className="text-primary" />
          {t('form_labels.location')}
        </Label>
        <div className="relative">
          <input
            id="location"
            {...form.register('location')}
            placeholder={t('form_placeholders.enter_location')}
            className="w-full pl-4 pr-4 py-3 bg-white/60 dark:bg-gray-800/60 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-xl text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            disabled={loading}
            aria-invalid={!!form.formState.errors.location}
            aria-describedby={form.formState.errors.location ? "location-error" : undefined}
          />
          {form.watch('location') && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <CheckCircle size={16} className="text-green-500" />
            </motion.div>
          )}
        </div>
        {form.formState.errors.location && (
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            id="location-error"
            className="text-red-500 text-sm flex items-center gap-1"
          >
            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            {form.formState.errors.location.message}
          </motion.p>
        )}
      </motion.div>

      {/* Birthday Field */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="space-y-3"
      >
        <Label htmlFor="birthday" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Calendar size={16} className="text-primary" />
          {t('form_labels.birthday')}
        </Label>
        <div className="relative">
          <input
            id="birthday"
            type="date"
            {...form.register('birthday')}
            className="w-full pl-4 pr-4 py-3 bg-white/60 dark:bg-gray-800/60 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-xl text-gray-800 dark:text-gray-100 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            disabled={loading}
            aria-invalid={!!form.formState.errors.birthday}
            aria-describedby={form.formState.errors.birthday ? "birthday-error" : undefined}
          />
          {form.watch('birthday') && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <CheckCircle size={16} className="text-green-500" />
            </motion.div>
          )}
        </div>
        {form.formState.errors.birthday && (
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            id="birthday-error"
            className="text-red-500 text-sm flex items-center gap-1"
          >
            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            {form.formState.errors.birthday.message}
          </motion.p>
        )}
      </motion.div>

      {/* Email Field (Read-only) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="md:col-span-2 space-y-3"
      >
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Mail size={16} className="text-primary" />
          {t('form_labels.user_email')}
        </Label>
        <ModernInput
          value={session?.user?.email || ''}
          readOnly
          variant="glass"
          className="pl-4 pr-4 py-3 bg-gray-100/60 dark:bg-gray-800/60 border-2 border-gray-300/50 dark:border-gray-700/50 rounded-xl text-gray-600 dark:text-gray-400 cursor-not-allowed"
          aria-describedby="email-change-notice"
        />
        <p id="email-change-notice" className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
          {t('email_change_notice.message')}
        </p>
      </motion.div>
    </div>
  ), [form, loading, session?.user?.email, t]);

  // Loading state
  if (loading && !profile) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <LoadingMessage message={t('loading_messages.loading_profile')} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center w-full"
    >
      <div className="w-full space-y-6">
        {/* Profile Completion Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <ProfileCompletionIndicator compact />
        </motion.div>

        {/* Profile Form Card */}
        <ModernCard
          variant="glass"
          hover="lift"
          className="backdrop-blur-2xl border border-white/30 shadow-2xl"
        >
          <ModernCardHeader className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <ProfileAvatar
                avatarUrl={profile?.avatar_url}
                onAvatarUpdate={(url: string) => {
                  // The profile will be refreshed automatically by the hook
                }}
                size="lg"
              />
            </motion.div>
            <ModernCardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
              {t('form_labels.profile_user')}
            </ModernCardTitle>
            <p className="text-gray-600 dark:text-gray-400">
              {t('profile.description')}
            </p>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <p className="text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  {error}
                </p>
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  disabled={loading}
                  className="mt-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40"
                >
                  {t('actions.retry')}
                </GlassButton>
              </motion.div>
            )}
          </ModernCardHeader>
          <ModernCardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {formFields}

              {/* Form Actions */}
              <ModernCardFooter className="flex justify-center gap-4 p-0 pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 max-w-xs"
                >
                  <GlassButton
                    type="submit"
                    className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                    aria-label={loading ? t('actions.saving_progress') : t('actions.save_changes')}
                  >
                    <div className="flex items-center justify-center gap-3">
                      {loading ? (
                        <LoadingSpinner size={20} className="text-white" />
                      ) : (
                        <Save size={20} />
                      )}
                      <span>
                        {loading ? t('actions.saving_progress') : t('actions.save_changes')}
                      </span>
                    </div>
                  </GlassButton>
                </motion.div>
              </ModernCardFooter>
            </form>
          </ModernCardContent>
        </ModernCard>
      </div>
    </motion.div>
  );
};

export default UserProfileFormNew;