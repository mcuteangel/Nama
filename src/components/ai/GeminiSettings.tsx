"use client";

import React, { useEffect, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { GlassButton } from "@/components/ui/glass-button";
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
import { Key, Brain, Sparkles, Zap, Shield, Settings } from 'lucide-react';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardDescription, ModernCardContent } from "@/components/ui/modern-card";

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

  // Define these callbacks before they are used
  const onSuccessFetchModels = useCallback((result: { data: GeminiModel[] | null; error: string | null; fromCache: boolean }) => {
    if (result.data) {
      setAvailableGeminiModels(result.data);
    }
  }, []);

  const onErrorFetchModels = useCallback((err: Error) => {
    ErrorManager.logError(err, { component: "GeminiSettings", action: "fetchModels" });
    ErrorManager.notifyUser(t('settings.error_loading_gemini_models'), 'error');
  }, [t]);

  // Declare executeFetchModels before onSuccessSubmit to avoid dependency issues
  const {
    isLoading: loadingModels,
    executeAsync: executeFetchModels,
  } = useErrorHandler<{ data: GeminiModel[] | null; error: string | null; fromCache: boolean }>(null, {
    showToast: false,
    onSuccess: onSuccessFetchModels,
    onError: onErrorFetchModels,
  });

  // Define onSuccessSubmit after executeFetchModels is declared
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
    onSuccess: onSuccessSubmit, // Use the defined callback here
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
    <ModernCard variant="glass" className="rounded-xl p-6 shadow-lg">
      <ModernCardHeader className="text-center relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3">
          <Sparkles size={24} className="text-yellow-400 animate-bounce" />
        </div>
        <ModernCardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          <Brain className="inline h-8 w-8 text-purple-500 mr-2 animate-pulse" />
          {t('settings.gemini_settings')}
        </ModernCardTitle>
        <ModernCardDescription className="text-lg text-gray-600 dark:text-gray-300">
          پیکربندی هوش مصنوعی برای تجربه بهتر 🤖
        </ModernCardDescription>
      </ModernCardHeader>
      <ModernCardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                <h5 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-purple-600" />
                  تنظیمات امنیتی
                </h5>

                <FormField
                  control={form.control}
                  name="geminiApiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <Key className="h-4 w-4 text-purple-500" />
                        {t('settings.gemini_api_key')}
                      </FormLabel>
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
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                <h5 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
                  <Settings size={20} className="text-blue-600" />
                  تنظیمات مدل
                </h5>

                <FormField
                  control={form.control}
                  name="geminiModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <Brain className="h-4 w-4 text-blue-500" />
                        {t('settings.gemini_model')}
                      </FormLabel>
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
                                <div className="flex items-center gap-2">
                                  <Zap size={16} className="text-yellow-500" />
                                  {model.displayName}
                                </div>
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
              </div>
            </div>

            {submitError && (
              <div className="text-sm text-destructive flex items-center justify-center gap-2 mt-2">
                <span>{submitErrorMessage}</span>
                {submitRetryCount > 0 && (
                  <GlassButton
                    variant="outline"
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
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold shadow-md transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size={18} className="me-2" />
                  {t('common.saving')}
                </>
              ) : (
                <>
                  <Sparkles size={18} className="me-2 animate-pulse" />
                  {t('common.save')}
                </>
              )}
            </GlassButton>
          </form>
        </Form>
      </ModernCardContent>
    </ModernCard>
  );
};

export default GeminiSettings;