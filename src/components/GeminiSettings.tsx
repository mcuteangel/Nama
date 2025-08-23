"use client";

import React, { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'; // Added FormDescription
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/integrations/supabase/auth';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { ErrorManager } from '@/lib/error-manager';
import { SettingsService } from '@/services/settings-service';
import { fetchWithCache, invalidateCache } from '@/utils/cache-helpers';

const formSchema = z.object({
  geminiApiKey: z.string().optional(),
  geminiModel: z.enum(['gemini-pro', 'gemini-1.5-flash', 'gemini-1.5-pro']).default('gemini-pro'),
});

type GeminiSettingsFormValues = z.infer<typeof formSchema>;

const GeminiSettings: React.FC = () => {
  const { t } = useTranslation();
  const { session, isLoading: isSessionLoading } = useSession();

  const form = useForm<GeminiSettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      geminiApiKey: '',
      geminiModel: 'gemini-pro',
    },
  });

  const onSuccessSubmit = useCallback(() => {
    ErrorManager.notifyUser(t('settings.gemini_settings_saved_success'), 'success');
    invalidateCache(`user_settings_${session?.user?.id}`);
  }, [session, t]);

  const onErrorSubmit = useCallback((err: Error) => {
    ErrorManager.logError(err, { component: "GeminiSettings", action: "submitSettings" });
  }, []);

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
    customErrorMessage: t('settings.error_saving_gemini_settings'),
    onSuccess: onSuccessSubmit,
    onError: onErrorSubmit,
  });

  const onSuccessFetch = useCallback((result: { data: { gemini_api_key: string | null; gemini_model: string | null } | null; error: string | null; fromCache: boolean }) => {
    if (result.data) {
      form.reset({
        geminiApiKey: result.data.gemini_api_key ?? '',
        geminiModel: (result.data.gemini_model as GeminiSettingsFormValues['geminiModel']) ?? 'gemini-pro',
      });
    }
  }, [form]);

  const onErrorFetch = useCallback((err: Error) => {
    ErrorManager.logError(err, { component: "GeminiSettings", action: "fetchSettings" });
  }, []);

  const {
    isLoading: loadingSettings,
    executeAsync: executeFetch,
  } = useErrorHandler<{ data: { gemini_api_key: string | null; gemini_model: string | null } | null; error: string | null; fromCache: boolean }>(null, {
    showToast: false,
    onSuccess: onSuccessFetch,
    onError: onErrorFetch,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (isSessionLoading || !session?.user) {
        return;
      }

      await executeFetch(async () => {
        const cacheKey = `user_settings_${session.user.id}`;
        const { data, error, fromCache } = await fetchWithCache<{ gemini_api_key: string | null; gemini_model: string | null }>(
          cacheKey,
          async () => {
            const res = await SettingsService.getUserSettings(session.user.id);
            if (res.error) {
              throw new Error(res.error);
            }
            return { data: res.data, error: null };
          }
        );
        if (error) {
          throw new Error(error);
        }
        return { data, error: null, fromCache };
      });
    };

    fetchSettings();
  }, [session, isSessionLoading, executeFetch]);

  const onSubmit = useCallback(async (values: GeminiSettingsFormValues) => {
    if (!session?.user) {
      ErrorManager.notifyUser(t('common.auth_required'), 'error');
      return;
    }

    await executeSubmit(async () => {
      const res = await SettingsService.updateUserSettings({
        userId: session.user.id,
        gemini_api_key: values.geminiApiKey || null,
        gemini_model: values.geminiModel,
      });
      if (res.error) {
        throw new Error(res.error);
      }
    });
  }, [session, t, executeSubmit]);

  if (loadingSettings) {
    return <p className="text-center text-gray-500 dark:text-gray-400">{t('settings.loading_gemini_settings')}</p>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="geminiApiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-200">{t('settings.gemini_api_key')}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t('settings.enter_gemini_api_key')}
                  className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="geminiModel"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-200">{t('settings.gemini_model')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger className="w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100">
                    <SelectValue placeholder={t('settings.select_gemini_model')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                  <SelectItem value="gemini-pro">{t('settings.gemini_pro')}</SelectItem>
                  <SelectItem value="gemini-1.5-flash">{t('settings.gemini_1_5_flash')}</SelectItem>
                  <SelectItem value="gemini-1.5-pro">{t('settings.gemini_1_5_pro')}</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                {t('settings.gemini_model_description')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {submitError && (
          <div className="text-sm text-destructive flex items-center justify-center gap-2 mt-2">
            <span>{submitErrorMessage}</span>
            {submitRetryCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={retrySubmit}
                disabled={isSubmitting}
                className="text-destructive hover:bg-destructive/10"
              >
                {t('common.retry')} ({submitRetryCount} {t('common.of')} ۳)
              </Button>
            )}
          </div>
        )}
        <Button
          type="submit"
          className="w-full px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
          disabled={isSubmitting}
        >
          {isSubmitting ? t('common.saving') : t('common.save')}
        </Button>
      </form>
    </Form>
  );
};

export default GeminiSettings;