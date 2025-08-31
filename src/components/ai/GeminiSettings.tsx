"use client";

import React, { useEffect, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { GlassButton } from "@/components/ui/glass-button";
import { Label } from '@/components/ui/label';
import { ModernInput } from '@/components/ui/modern-input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/integrations/supabase/auth';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { ErrorManager } from '@/lib/error-manager';
import { SettingsService } from '@/services/settings-service';
import { fetchWithCache, invalidateCache } from '@/utils/cache-helpers';
import LoadingSpinner from '../common/LoadingSpinner';

interface GeminiModel {
  name: string;
  displayName: string;
  description: string;
}

const formSchema = z.object({
  geminiApiKey: z.string().optional(),
  geminiModel: z.string().default('gemini-pro'),
});

type GeminiSettingsFormValues = z.infer<typeof formSchema>;

const GeminiSettings: React.FC = () => {
  const { t } = useTranslation();
  const { session, isLoading: isSessionLoading } = useSession();
  const [availableGeminiModels, setAvailableGeminiModels] = useState<GeminiModel[]>([]);

  const form = useForm<GeminiSettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      geminiApiKey: '',
      geminiModel: 'gemini-pro',
    },
  });

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
    onSuccess: () => { /* Defined later to avoid hoisting issues */ },
    onError: onErrorSubmit,
  });

  const onSuccessFetchSettings = useCallback((result: { data: { gemini_api_key: string | null; gemini_model: string | null } | null; error: string | null; fromCache: boolean }) => {
    if (result.data) {
      form.reset({
        geminiApiKey: result.data.gemini_api_key ?? '',
        geminiModel: result.data.gemini_model ?? 'gemini-pro',
      });
    }
  }, [form]);

  const onErrorFetchSettings = useCallback((err: Error) => {
    ErrorManager.logError(err, { component: "GeminiSettings", action: "fetchSettings" });
  }, []);

  const {
    isLoading: loadingSettings,
    executeAsync: executeFetchSettings,
  } = useErrorHandler<{ data: { gemini_api_key: string | null; gemini_model: string | null } | null; error: string | null; fromCache: boolean }>(null, {
    showToast: false,
    onSuccess: onSuccessFetchSettings,
    onError: onErrorFetchSettings,
  });

  const onSuccessFetchModels = useCallback((result: { data: GeminiModel[] | null; error: string | null; fromCache: boolean }) => {
    if (result.data) {
      setAvailableGeminiModels(result.data);
    }
  }, []);

  const onErrorFetchModels = useCallback((err: Error) => {
    ErrorManager.logError(err, { component: "GeminiSettings", action: "fetchModels" });
    ErrorManager.notifyUser(t('settings.error_loading_gemini_models'), 'error');
  }, [t]);

  const {
    isLoading: loadingModels,
    executeAsync: executeFetchModels,
  } = useErrorHandler<{ data: GeminiModel[] | null; error: string | null; fromCache: boolean }>(null, {
    showToast: false,
    onSuccess: onSuccessFetchModels,
    onError: onErrorFetchModels,
  });

  const onSuccessSubmit = useCallback(() => {
    ErrorManager.notifyUser(t('settings.gemini_settings_saved_success'), 'success');
    invalidateCache(`user_settings_${session?.user?.id}`);
    executeFetchModels(async () => {
      const cacheKey = `available_gemini_models_${session?.user?.id}`;
      const { data, error, fromCache } = await fetchWithCache<GeminiModel[]>(
        cacheKey,
        async () => {
          const res = await SettingsService.listGeminiModels();
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
  }, [session, t, executeFetchModels]);

  useEffect(() => {
    (executeSubmit as any).onSuccess = onSuccessSubmit;
  }, [onSuccessSubmit, executeSubmit]);


  useEffect(() => {
    const fetchAllSettings = async () => {
      if (isSessionLoading || !session?.user) {
        return;
      }

      await executeFetchSettings(async () => {
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

      await executeFetchModels(async () => {
        const cacheKey = `available_gemini_models_${session.user.id}`;
        const { data, error, fromCache } = await fetchWithCache<GeminiModel[]>(
          cacheKey,
          async () => {
            const res = await SettingsService.listGeminiModels();
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

    fetchAllSettings();
  }, [session, isSessionLoading, executeFetchSettings, executeFetchModels]);

  const onSubmit = useCallback(async (values: GeminiSettingsFormValues) => {
    if (!session?.user) {
      ErrorManager.notifyUser(t('common.auth_required'), 'error');
      return;
    }

    await executeSubmit(async () => {
      const res = await SettingsService.updateUserSettings({
        userId: session.user.id,
        gemini_api_key: values.geminiApiKey === '' ? null : values.geminiApiKey,
        gemini_model: values.geminiModel,
      });
      if (res.error) {
        throw new Error(res.error);
      }
    });
  }, [session, t, executeSubmit]);

  if (loadingSettings || loadingModels) {
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
                <ModernInput
                  type="password"
                  placeholder={t('settings.enter_gemini_api_key')}
                  variant="glass"
                  className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                {t('settings.gemini_api_key_description')}
              </FormDescription>
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
              <ModernSelect onValueChange={field.onChange} value={field.value} disabled={isSubmitting || loadingModels}>
                <FormControl>
                  <ModernSelectTrigger variant="glass" className="w-full">
                    <ModernSelectValue placeholder={t('settings.select_gemini_model')} />
                  </ModernSelectTrigger>
                </FormControl>
                <ModernSelectContent variant="glass">
                  {loadingModels ? (
                    <ModernSelectItem value="loading" disabled>{t('settings.loading_gemini_models')}</ModernSelectItem>
                  ) : availableGeminiModels.length > 0 ? (
                    availableGeminiModels.map((model) => (
                      <ModernSelectItem key={model.name} value={model.name}>
                        {model.displayName}
                      </ModernSelectItem>
                    ))
                  ) : (
                    <ModernSelectItem value="no-models" disabled>{t('settings.no_gemini_models_found')}</ModernSelectItem>
                  )}
                </ModernSelectContent>
              </ModernSelect>
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
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={retrySubmit}
                disabled={isSubmitting}
                className="text-destructive hover:bg-destructive/10"
              >
                {t('common.retry')} ({submitRetryCount} {t('common.of')} ۳)
              </GlassButton>
            )}
          </div>
        )}
        <GlassButton
          type="submit"
          variant="gradient-primary"
          className="w-full px-6 py-2 rounded-lg font-semibold"
          disabled={isSubmitting}
        >
          {isSubmitting && <LoadingSpinner size={16} className="me-2" />}
          {isSubmitting ? t('common.saving') : t('common.save')}
        </GlassButton>
      </form>
    </Form>
  );
};

export default GeminiSettings;