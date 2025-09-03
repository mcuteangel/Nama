import React, { useEffect, useCallback, useState, useMemo } from 'react';
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
import { Key, Brain, Shield, CheckCircle, AlertTriangle, Zap, Info } from 'lucide-react';
import AIBaseCard from './AIBaseCard';

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

const GeminiSettings: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const { session, isLoading: isSessionLoading } = useSession();
  const [availableGeminiModels, setAvailableGeminiModels] = useState<GeminiModel[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');

  const form = useForm<GeminiSettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      geminiApiKey: '',
      geminiModel: 'gemini-pro',
    },
  });

  // محاسبات آماری با useMemo برای عملکرد بهتر
  const stats = useMemo(() => ({
    totalModels: availableGeminiModels.length,
    hasApiKey: !!form.watch('geminiApiKey'),
    selectedModel: form.watch('geminiModel'),
    connectionStatus,
  }), [availableGeminiModels.length, form, connectionStatus]);

  const onErrorSubmit = useCallback((err: Error) => {
    ErrorManager.logError(err, { component: "GeminiSettings", action: "submitSettings" });
    setConnectionStatus('error');
  }, []);

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
    setConnectionStatus('connected');
  }, [session, t]);

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

  const onSuccessFetchSettings = useCallback((result: { data: { gemini_api_key: string | null; gemini_model: string | null } | null; error: string | null; fromCache: boolean }) => {
    if (result.data) {
      form.reset({
        geminiApiKey: result.data.gemini_api_key ?? '',
        geminiModel: result.data.gemini_model ?? 'gemini-pro',
      });
      setConnectionStatus(result.data.gemini_api_key ? 'connected' : 'unknown');
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
    return (
      <AIBaseCard
        title={t('settings.loading_gemini_settings')}
        variant="secondary"
        compact
      >
        <div className="text-center py-4">
          <LoadingSpinner size={24} className="mx-auto" />
        </div>
      </AIBaseCard>
    );
  }

  return (
    <AIBaseCard
      title={t('settings.gemini_settings')}
      description={t('settings.gemini_description')}
      icon={<Brain size={20} />}
      variant="primary"
      compact
      simple
    >
      {/* Status Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gradient-to-r from-green-50/60 to-blue-50/60 dark:from-green-900/30 dark:to-blue-900/30 rounded-lg border border-green-200/30 dark:border-green-700/30">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            {stats.connectionStatus === 'connected' ? (
              <CheckCircle size={14} className="text-green-600" />
            ) : stats.connectionStatus === 'error' ? (
              <AlertTriangle size={14} className="text-red-600" />
            ) : (
              <Shield size={14} className="text-gray-600" />
            )}
          </div>
          <div className="text-xs font-bold text-green-600 dark:text-green-400">
            {stats.connectionStatus === 'connected' ? t('settings.connected', 'متصل') :
             stats.connectionStatus === 'error' ? t('settings.error', 'خطا') :
             t('settings.not_configured', 'پیکربندی نشده')}
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.totalModels}</div>
          <div className="text-xs text-blue-500 dark:text-blue-300">{t('settings.available_models', 'مدل موجود')}</div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="bg-gradient-to-r from-purple-50/30 to-blue-50/30 dark:from-purple-900/20 dark:to-blue-900/20 p-3 rounded-lg border border-white/30 backdrop-blur-sm shadow-sm">
            <h5 className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-2 flex items-center gap-2">
              <Shield size={16} className="text-purple-600" />
              {t('settings.security_settings')}
            </h5>

            <FormField
              control={form.control}
              name="geminiApiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-200 flex items-center gap-2 text-xs">
                    <Key className="h-3 w-3 text-purple-500" />
                    {t('settings.gemini_api_key')}
                  </FormLabel>
                  <FormControl>
                    <ModernInput
                      type="password"
                      placeholder={t('settings.enter_gemini_api_key')}
                      variant="glass"
                      className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                      disabled={isSubmitting}
                      aria-describedby="api-key-description"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription id="api-key-description" className="text-xs text-gray-500 dark:text-gray-400">
                    {t('settings.gemini_api_key_description')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="bg-gradient-to-r from-blue-50/30 to-indigo-50/30 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-lg border border-white/30 backdrop-blur-sm shadow-sm">
            <h5 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
              <Brain size={16} className="text-blue-600" />
              {t('settings.model_settings')}
            </h5>

            <FormField
              control={form.control}
              name="geminiModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-200 flex items-center gap-2 text-xs">
                    <Brain className="h-3 w-3 text-blue-500" />
                    {t('settings.gemini_model')}
                  </FormLabel>
                  <ModernSelect
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting || loadingModels}
                    aria-describedby="model-description"
                  >
                    <FormControl>
                      <ModernSelectTrigger variant="glass" className="w-full text-sm">
                        <ModernSelectValue placeholder={t('settings.select_gemini_model')} />
                      </ModernSelectTrigger>
                    </FormControl>
                    <ModernSelectContent variant="glass">
                      {loadingModels ? (
                        <ModernSelectItem value="loading" disabled>{t('settings.loading_gemini_models')}</ModernSelectItem>
                      ) : availableGeminiModels.length > 0 ? (
                        availableGeminiModels.map((model) => (
                          <ModernSelectItem 
                            key={model.name} 
                            value={model.name}
                            title={model.description} // Show description as tooltip
                          >
                            <div className="flex items-center gap-2">
                              <Zap size={12} className="text-blue-500" />
                              <div className="font-medium">{model.displayName}</div>
                              <Info size={12} className="text-gray-400 ml-auto" />
                            </div>
                          </ModernSelectItem>
                        ))
                      ) : (
                        <ModernSelectItem value="no-models" disabled>{t('settings.no_gemini_models_found')}</ModernSelectItem>
                      )}
                    </ModernSelectContent>
                  </ModernSelect>
                  
                  {/* Show selected model description outside the dropdown */}
                  {availableGeminiModels.length > 0 && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-gray-600 dark:text-gray-300">
                      <div className="font-medium mb-1">
                        {t('settings.selected_model_info')}:
                      </div>
                      {availableGeminiModels.find(m => m.name === form.watch('geminiModel'))?.description || 
                       availableGeminiModels[0].description}
                    </div>
                  )}
                  
                  <FormDescription id="model-description" className="text-xs text-gray-500 dark:text-gray-400">
                    {t('settings.gemini_model_description')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {submitError && (
            <div className="text-xs text-destructive flex items-center justify-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <span>{submitErrorMessage}</span>
              {submitRetryCount > 0 && (
                <GlassButton
                  variant="outline"
                  size="sm"
                  onClick={retrySubmit}
                  disabled={isSubmitting}
                  className="text-destructive hover:bg-destructive/10 text-xs"
                  aria-label={t('actions.retry')}
                >
                  {t('actions.retry_count', { count: submitRetryCount })}
                </GlassButton>
              )}
            </div>
          )}

          <GlassButton
            type="submit"
            variant="gradient-primary"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm shadow-lg backdrop-blur-md border border-white/20"
            disabled={isSubmitting}
            aria-label={t('common.save')}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size={14} />
                {t('common.saving')}
              </>
            ) : (
              <>
                <Shield size={14} />
                {t('common.save')}
              </>
            )}
          </GlassButton>
        </form>
      </Form>
    </AIBaseCard>
  );
});

GeminiSettings.displayName = 'GeminiSettings';

export default GeminiSettings;