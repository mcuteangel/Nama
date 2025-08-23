"use client";

import React, { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/integrations/supabase/auth';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { ErrorManager } from '@/lib/error-manager';
import { SettingsService } from '@/services/settings-service'; // Will create this service next
import { fetchWithCache, invalidateCache } from '@/utils/cache-helpers';

const formSchema = z.object({
  geminiApiKey: z.string().optional(),
});

type GeminiApiKeyFormValues = z.infer<typeof formSchema>;

const GeminiApiKeySetting: React.FC = () => {
  const { t } = useTranslation();
  const { session, isLoading: isSessionLoading } = useSession();

  const form = useForm<GeminiApiKeyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      geminiApiKey: '',
    },
  });

  const onSuccessSubmit = useCallback(() => {
    ErrorManager.notifyUser(t('settings.gemini_api_key_saved_success'), 'success');
    invalidateCache(`user_settings_${session?.user?.id}`);
  }, [session, t]);

  const onErrorSubmit = useCallback((err: Error) => {
    ErrorManager.logError(err, { component: "GeminiApiKeySetting", action: "submitApiKey" });
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
    customErrorMessage: t('settings.error_saving_gemini_api_key'),
    onSuccess: onSuccessSubmit,
    onError: onErrorSubmit,
  });

  const onSuccessFetch = useCallback((result: { data: { gemini_api_key: string | null } | null; error: string | null; fromCache: boolean }) => {
    if (result.data) {
      form.reset({
        geminiApiKey: result.data.gemini_api_key ?? '',
      });
    }
  }, [form]);

  const onErrorFetch = useCallback((err: Error) => {
    ErrorManager.logError(err, { component: "GeminiApiKeySetting", action: "fetchApiKey" });
  }, []);

  const {
    isLoading: loadingApiKey,
    executeAsync: executeFetch,
  } = useErrorHandler<{ data: { gemini_api_key: string | null } | null; error: string | null; fromCache: boolean }>(null, {
    showToast: false,
    onSuccess: onSuccessFetch,
    onError: onErrorFetch,
  });

  useEffect(() => {
    const fetchApiKey = async () => {
      if (isSessionLoading || !session?.user) {
        return;
      }

      await executeFetch(async () => {
        const cacheKey = `user_settings_${session.user.id}`;
        const { data, error, fromCache } = await fetchWithCache<{ gemini_api_key: string | null }>(
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

    fetchApiKey();
  }, [session, isSessionLoading, executeFetch]);

  const onSubmit = useCallback(async (values: GeminiApiKeyFormValues) => {
    if (!session?.user) {
      ErrorManager.notifyUser(t('common.auth_required'), 'error');
      return;
    }

    await executeSubmit(async () => {
      const res = await SettingsService.updateGeminiApiKey(session.user.id, values.geminiApiKey || null);
      if (res.error) {
        throw new Error(res.error);
      }
    });
  }, [session, t, executeSubmit]);

  if (loadingApiKey) {
    return <p className="text-center text-gray-500 dark:text-gray-400">{t('settings.loading_api_key')}</p>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
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

export default GeminiApiKeySetting;