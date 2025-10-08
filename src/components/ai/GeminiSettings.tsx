"use client";

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
import { Key, Brain, Shield, CheckCircle, AlertTriangle, Zap, Info, Eye, EyeOff, RefreshCw, TestTube, Sparkles, Trash2 } from 'lucide-react';
import SettingsSection from '../settings/SettingsSection';
import SettingsCard from '../settings/SettingsCard';

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
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error' | 'testing'>('unknown');
  const [showApiKey, setShowApiKey] = useState(false);
  const [testResults, setTestResults] = useState<{
    success: boolean;
    message: string;
    timestamp: Date;
  } | null>(null);

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
    isConfigured: !!form.watch('geminiApiKey') && form.watch('geminiModel') !== '',
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
    setTestResults(null);
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

  // تابع تست اتصال به API
  const testConnection = useCallback(async () => {
    if (!session?.user || !form.watch('geminiApiKey')) {
      ErrorManager.notifyUser(t('settings.enter_api_key_first'), 'warning');
      return;
    }

    setConnectionStatus('testing');
    setTestResults(null);

    const {
      isLoading: isTesting,
      executeAsync: executeTest,
    } = useErrorHandler<{ success: boolean; message: string }>(null, {
      showToast: false,
      onSuccess: (result) => {
        setConnectionStatus(result.success ? 'connected' : 'error');
        setTestResults({
          success: result.success,
          message: result.message,
          timestamp: new Date(),
        });
        ErrorManager.notifyUser(
          result.success ? t('settings.test_success') : t('settings.test_failed'),
          result.success ? 'success' : 'error'
        );
      },
      onError: (err) => {
        setConnectionStatus('error');
        setTestResults({
          success: false,
          message: err.message,
          timestamp: new Date(),
        });
        ErrorManager.notifyUser(t('settings.test_failed'), 'error');
      },
    });

    await executeTest(async () => {
      const res = await SettingsService.testGeminiConnection({
        apiKey: form.watch('geminiApiKey'),
        model: form.watch('geminiModel'),
      });
      if (res.error) {
        throw new Error(res.error);
      }
      return res.data;
    });
  }, [session, form, t]);

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

  const clearSettings = useCallback(async () => {
    form.reset({
      geminiApiKey: '',
      geminiModel: 'gemini-pro',
    });
    setConnectionStatus('unknown');
    setTestResults(null);
    ErrorManager.notifyUser(t('settings.settings_cleared'), 'info');
  }, [form, t]);

  if (loadingSettings || loadingModels) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4">
        <LoadingSpinner size={32} className="mx-auto" />
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('settings.loading_gemini_settings')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('settings.please_wait')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {/* Status Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-3 bg-gradient-to-r from-green-50/60 to-blue-50/60 dark:from-green-900/30 dark:to-blue-900/30 rounded-lg border border-green-200/30 dark:border-green-700/30">
            <div className="flex items-center justify-center gap-1 mb-1">
              {stats.connectionStatus === 'connected' ? (
                <CheckCircle size={14} className="text-green-600" />
              ) : stats.connectionStatus === 'error' ? (
                <AlertTriangle size={14} className="text-red-600" />
              ) : stats.connectionStatus === 'testing' ? (
                <RefreshCw size={14} className="text-blue-600 animate-spin" />
              ) : (
                <Shield size={14} className="text-gray-600" />
              )}
            </div>
            <div className="text-xs font-bold text-green-600 dark:text-green-400">
              {stats.connectionStatus === 'connected' ? t('settings.connected', 'متصل') :
               stats.connectionStatus === 'error' ? t('settings.error', 'خطا') :
               stats.connectionStatus === 'testing' ? t('settings.testing', 'در حال تست') :
               t('settings.not_configured', 'پیکربندی نشده')}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              وضعیت اتصال
            </div>
          </div>

          <div className="text-center p-3 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border border-blue-200/30 dark:border-blue-700/30">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.totalModels}</div>
            <div className="text-xs text-blue-500 dark:text-blue-300">{t('settings.available_models', 'مدل موجود')}</div>
          </div>

          <div className="text-center p-3 bg-gradient-to-r from-purple-50/60 to-pink-50/60 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg border border-purple-200/30 dark:border-purple-700/30">
            <div className={`text-lg font-bold ${stats.isConfigured ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
              {stats.isConfigured ? '✓' : '?'}
            </div>
            <div className={`text-xs ${stats.isConfigured ? 'text-green-500 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'}`}>
              {t('settings.configured', 'پیکربندی شده')}
            </div>
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <SettingsCard
            title={testResults.success ? t('settings.test_success') : t('settings.test_failed')}
            description={testResults.message}
            icon={testResults.success ? <CheckCircle size={16} className="text-green-600" /> : <AlertTriangle size={16} className="text-red-600" />}
            gradient={testResults.success ? "green" : "orange"}
            className="mb-4"
          >
            <div className="text-xs text-gray-500">
              {testResults.timestamp.toLocaleTimeString()}
            </div>
          </SettingsCard>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Security Settings */}
            <SettingsCard
              title={t('settings.security_settings')}
              description={t('settings.gemini_api_key_description')}
              icon={<Key size={16} className="text-purple-600" />}
              gradient="purple"
            >
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
                      <div className="relative">
                        <ModernInput
                          type={showApiKey ? "text" : "password"}
                          placeholder={t('settings.enter_gemini_api_key')}
                          variant="glass"
                          className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm pr-10"
                          disabled={isSubmitting}
                          aria-describedby="api-key-description"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                          aria-label={showApiKey ? t('common.hide') : t('common.show')}
                        >
                          {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </SettingsCard>

            {/* Model Settings */}
            <SettingsCard
              title={t('settings.model_settings')}
              description={t('settings.gemini_model_description')}
              icon={<Brain size={16} className="text-blue-600" />}
              gradient="blue"
            >
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
                          <ModernSelectItem value="loading" disabled>
                            <div className="flex items-center gap-2">
                              <LoadingSpinner size={12} />
                              {t('settings.loading_gemini_models')}
                            </div>
                          </ModernSelectItem>
                        ) : availableGeminiModels.length > 0 ? (
                          availableGeminiModels.map((model) => (
                            <ModernSelectItem
                              key={model.name}
                              value={model.name}
                              title={model.description}
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

                    {/* Show selected model description */}
                    {availableGeminiModels.length > 0 && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-gray-600 dark:text-gray-300">
                        <div className="font-medium mb-1">
                          {t('settings.selected_model_info')}:
                        </div>
                        {availableGeminiModels.find(m => m.name === form.watch('geminiModel'))?.description ||
                         availableGeminiModels[0].description}
                      </div>
                    )}

                    <FormMessage />
                  </FormItem>
                )}
              />
            </SettingsCard>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <GlassButton
                type="button"
                variant="outline"
                onClick={testConnection}
                disabled={isSubmitting || !stats.hasApiKey}
                className="group relative overflow-hidden rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200/50 dark:border-blue-700/50 hover:border-blue-300 dark:hover:border-blue-600 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
                aria-label={t('settings.test_connection')}
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {connectionStatus === 'testing' ? (
                    <LoadingSpinner size={14} />
                  ) : (
                    <TestTube size={14} />
                  )}
                  {t('settings.test_connection')}
                </div>
              </GlassButton>

              <GlassButton
                type="button"
                variant="outline"
                onClick={clearSettings}
                disabled={isSubmitting}
                className="group relative overflow-hidden rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200/50 dark:border-red-700/50 hover:border-red-300 dark:hover:border-red-600 text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
                aria-label={t('settings.clear_settings')}
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <Trash2 size={14} />
                  {t('settings.clear')}
                </div>
              </GlassButton>
            </div>

            {/* Error Display */}
            {submitError && (
              <div className="text-xs text-destructive flex items-center justify-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <span>{submitErrorMessage}</span>
                {submitRetryCount > 0 && (
                  <GlassButton
                    variant="outline"
                    size="sm"
                    onClick={retrySubmit}
                    disabled={isSubmitting}
                    className="group relative overflow-hidden rounded-lg font-medium text-xs transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200/50 dark:border-red-700/50 hover:border-red-300 dark:hover:border-red-600 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
                    aria-label={t('actions.retry')}
                  >
                    <div className="relative z-10">
                      {t('actions.retry_count', { count: submitRetryCount })}
                    </div>
                  </GlassButton>
                )}
              </div>
            )}

            {/* Submit Button */}
            <GlassButton
              type="submit"
              variant="gradient-primary"
              className="w-full group relative overflow-hidden rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-2 border-emerald-400/50 hover:border-emerald-300 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
              disabled={isSubmitting}
              aria-label={t('common.save')}
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size={14} />
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    {t('common.save')}
                  </>
                )}
              </div>
            </GlassButton>
          </form>
        </Form>
      </div>
    </div>
  );
});

GeminiSettings.displayName = 'GeminiSettings';

export default GeminiSettings;
