"use client";

import React, { useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { GlassButton } from "@/components/ui/glass-button";
import { Label } from '@/components/ui/label';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent, ModernCardFooter } from '@/components/ui/modern-card';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/integrations/supabase/auth';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { ErrorManager } from '@/lib/error-manager';
import { fetchWithCache, invalidateCache } from "@/utils/cache-helpers";
import LoadingMessage from '../common/LoadingMessage';
import { showSuccess, showError } from '@/utils/toast';
import LoadingSpinner from '../common/LoadingSpinner';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

// Schema validation for profile form
const profileSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const UserProfileForm: React.FC = () => {
  const { t } = useTranslation();
  const { session, isLoading: isSessionLoading } = useSession();

  // Success handler for profile submission
  const onSuccessSubmit = useCallback(() => {
    showSuccess(t('system_messages.profile_update_success'));
    if (session?.user?.id) {
      invalidateCache(`user_profile_${session.user.id}`);
    }
  }, [session?.user?.id, t]);

  // Error handler for profile submission
  const onErrorSubmit = useCallback((err: Error) => {
    ErrorManager.logError(err, { component: "UserProfileForm", action: "submitProfile" });
  }, []);

  // Error handler hook for form submission
  const {
    isLoading: isSubmitting,
    error: submitError,
    errorMessage: submitErrorMessage,
    retry: retrySubmit,
    executeAsync: executeSubmit,
    retryCount: submitRetryCount,
  } = useErrorHandler(null, {
    maxRetries: 3,
    retryDelay: 1000,
    showToast: true,
    customErrorMessage: t('errors.update_profile_error'),
    onSuccess: onSuccessSubmit,
    onError: onErrorSubmit,
  });

  // React Hook Form setup
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: undefined,
      last_name: undefined,
    },
  });

  // Success handler for fetching profile data
  const onSuccessFetchProfile = useCallback((result: { data: { first_name: string | null; last_name: string | null } | null; error: string | null; fromCache: boolean }) => {
    if (result.data) {
      form.reset({
        first_name: result.data.first_name ?? undefined,
        last_name: result.data.last_name ?? undefined,
      });
    }
    if (!result.fromCache) {
      showSuccess(t('system_messages.profile_loaded_success'));
    }
  }, [form, t]);

  // Error handler for fetching profile data
  const onErrorFetchProfile = useCallback((err: Error) => {
    const msg = ErrorManager.getErrorMessage(err);
    showError(t('errors.profile_load_error', { message: msg }));
    ErrorManager.logError(err, { component: "UserProfileForm", action: "fetchProfile" });
  }, [t]);

  // Error handler hook for fetching profile data
  const {
    isLoading: loadingProfile,
    executeAsync: executeFetchProfile,
  } = useErrorHandler<{ data: { first_name: string | null; last_name: string | null } | null; error: string | null; fromCache: boolean }>(null, {
    showToast: false,
    onSuccess: onSuccessFetchProfile,
    onError: onErrorFetchProfile,
  });

  // Memoize form fields to prevent unnecessary re-renders
  const formFields = useMemo(() => (
    <>
      {/* First Name Field */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-2"
      >
        <Label htmlFor="first_name" className="text-gray-700 dark:text-gray-200">
          {t('form_labels.first_name')}
        </Label>
        <ModernInput
          id="first_name"
          {...form.register('first_name')}
          placeholder={t('form_placeholders.enter_name')}
          variant="glass"
          className="mt-1 block w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          disabled={isSubmitting}
          aria-invalid={!!form.formState.errors.first_name}
          aria-describedby={form.formState.errors.first_name ? "first-name-error" : undefined}
        />
        {form.formState.errors.first_name && (
          <p id="first-name-error" className="text-red-500 text-sm mt-1">
            {form.formState.errors.first_name.message}
          </p>
        )}
      </motion.div>

      {/* Last Name Field */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-2"
      >
        <Label htmlFor="last_name" className="text-gray-700 dark:text-gray-200">
          {t('form_labels.last_name')}
        </Label>
        <ModernInput
          id="last_name"
          {...form.register('last_name')}
          placeholder={t('form_placeholders.enter_last_name')}
          variant="glass"
          className="mt-1 block w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          disabled={isSubmitting}
          aria-invalid={!!form.formState.errors.last_name}
          aria-describedby={form.formState.errors.last_name ? "last-name-error" : undefined}
        />
        {form.formState.errors.last_name && (
          <p id="last-name-error" className="text-red-500 text-sm mt-1">
            {form.formState.errors.last_name.message}
          </p>
        )}
      </motion.div>

      {/* Email Field (Read-only) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="space-y-2"
      >
        <Label className="text-gray-700 dark:text-gray-200">
          {t('form_labels.user_email')}
        </Label>
        <ModernInput
          value={session?.user?.email || ''}
          readOnly
          variant="glass"
          className="mt-1 block w-full bg-gray-100/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-gray-700 dark:text-gray-300 cursor-not-allowed"
          aria-describedby="email-change-notice"
        />
        <p id="email-change-notice" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t('email_change_notice.message')}
        </p>
      </motion.div>
    </>
  ), [form, isSubmitting, session?.user?.email, t]);

  // Fetch user profile data on component mount or session change
  useEffect(() => {
    const fetchProfileData = async () => {
      if (isSessionLoading || !session?.user) {
        return;
      }

      await executeFetchProfile(async () => {
        const cacheKey = `user_profile_${session.user.id}`;
        const { data, error, fromCache } = await fetchWithCache<{ first_name: string | null; last_name: string | null }>(
          cacheKey,
          async () => {
            const { data, error } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', session.user.id)
              .maybeSingle();

            if (error) {
              throw new Error(error.message || t('errors.profile_info_error'));
            }
            return { data, error: null };
          }
        );

        if (error) {
          throw new Error(error);
        }
        return { data, error: null, fromCache };
      });
    };

    fetchProfileData();
  }, [session, isSessionLoading, executeFetchProfile, t]);

  // Handle form submission
  const onSubmit = useCallback(async (values: ProfileFormValues) => {
    if (!session?.user) {
      ErrorManager.notifyUser(t('errors.update_profile_auth'), 'error');
      return;
    }

    await executeSubmit(async () => {
      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            id: session.user.id,
            first_name: values.first_name === '' ? null : values.first_name,
            last_name: values.last_name === '' ? null : values.last_name,
          },
          { onConflict: 'id' }
        );

      if (error) {
        throw new Error(error.message || t('errors.save_profile_error'));
      }
    });
  }, [session, executeSubmit, t]);

  // Loading state
  if (loadingProfile || isSessionLoading) {
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
      className="flex flex-col items-center justify-center p-4 w-full"
    >
      <ModernCard 
        variant="glass" 
        className="w-full max-w-md rounded-xl p-6 shadow-2xl backdrop-blur-xl border border-white/30 dark:border-gray-600/30"
      >
        <ModernCardHeader className="text-center">
          <ModernCardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {t('form_labels.profile_user')}
          </ModernCardTitle>
          {submitError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive flex items-center justify-center gap-2 mt-2"
            >
              <span>{submitErrorMessage}</span>
              {submitRetryCount > 0 && (
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={retrySubmit}
                  disabled={isSubmitting}
                  className="text-destructive hover:bg-destructive/10"
                >
                  {t('actions.retry_count', { count: submitRetryCount })}
                </GlassButton>
              )}
            </motion.div>
          )}
        </ModernCardHeader>
        <ModernCardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {formFields}
            
            {/* Form Actions */}
            <ModernCardFooter className="flex justify-end gap-4 p-0 pt-4">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <GlassButton
                  type="submit"
                  className="px-6 py-2 rounded-md bg-gradient-primary text-white transition-all duration-300 hover:opacity-90 shadow-lg"
                  disabled={isSubmitting}
                  aria-label={isSubmitting ? t('actions.saving_progress') : t('actions.save_changes')}
                >
                  {isSubmitting && <LoadingSpinner size={16} className="me-2" />}
                  {isSubmitting ? t('actions.saving_progress') : t('actions.save_changes')}
                </GlassButton>
              </motion.div>
            </ModernCardFooter>
          </form>
        </ModernCardContent>
      </ModernCard>
    </motion.div>
  );
};

export default UserProfileForm;