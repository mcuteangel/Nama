import React, { useEffect, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Label } from '@/components/ui/label';
import { ModernInput } from '@/components/ui/modern-input';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import ColorPicker from '../common/ColorPicker';
import { useSession } from '@/integrations/supabase/auth';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { ErrorManager } from '@/lib/error-manager';
import CancelButton from '../common/CancelButton';
import LoadingSpinner from '../common/LoadingSpinner';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent, ModernCardFooter } from "@/components/ui/modern-card";
import { GlassButton, GradientGlassButton } from "@/components/ui/glass-button";
import { useTranslation } from 'react-i18next';
import { Plus, CheckCircle, AlertCircle, Palette, Type } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, { message: 'groups.name_required' }),
  color: z.string().optional(),
});

type GroupFormValues = z.infer<typeof formSchema>;

interface GroupFormProps {
  initialData?: {
    id?: string;
    name: string;
    color?: string;
  };
  onSuccess?: (newGroupId?: string) => void;
  onCancel?: () => void;
}

const GroupForm: React.FC<GroupFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session } = useSession();
  const [isSuccess, setIsSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting, isValid } } = useForm<GroupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || { name: '', color: '#60A5FA' },
    mode: 'onChange'
  });

  const selectedColor = watch('color');
  const nameValue = watch('name');

  const onSuccessCallback = useCallback((result: { id: string } | undefined) => {
    setIsSuccess(true);
    ErrorManager.notifyUser(initialData?.id ? t('groups.edit_success') : t('groups.add_success'), 'success');

    setTimeout(() => {
      onSuccess?.(result?.id);
      setIsSuccess(false);
    }, 1500);
  }, [initialData?.id, onSuccess, t]);

  const onErrorCallback = useCallback((err: unknown) => {
    ErrorManager.logError(err as Error, { component: "GroupForm", action: initialData?.id ? "updateGroup" : "addGroup" });
  }, [initialData?.id]);

  const {
    isLoading: isSaving,
    error,
    errorMessage,
    retry: retrySave,
    executeAsync: executeSave,
    retryCount,
  } = useErrorHandler<{id: string} | undefined>(null, {
    maxRetries: 3,
    retryDelay: 1000,
    showToast: true,
    customErrorMessage: initialData?.id ? t('groups.edit_error') : t('groups.add_error'),
    onSuccess: onSuccessCallback,
    onError: onErrorCallback,
  });

  useEffect(() => {
    if (initialData) {
      setValue('name', initialData.name);
      setValue('color', initialData.color || '#60A5FA');
    }
  }, [initialData, setValue]);

  const onSubmit = async (values: GroupFormValues) => {
    if (!session?.user) {
      ErrorManager.notifyUser(t('common.auth_required'), 'error');
      navigate('/login');
      return;
    }
    const userId = session.user.id;

    await executeSave(async (): Promise<{id: string} | undefined> => {
      let res;
      if (initialData?.id) {
        res = await supabase
          .from('groups')
          .update({ name: values.name, color: values.color, user_id: userId })
          .eq('id', initialData.id)
          .select('id')
          .single();
      } else {
        res = await supabase
          .from('groups')
          .insert({ name: values.name, color: values.color, user_id: userId })
          .select('id')
          .single();
      }

      if (res.error) {
        throw new Error(res.error.message);
      }
      return res.data;
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-lg mx-auto">
      <ModernCard
        variant="glass"
        className={`
          rounded-3xl shadow-2xl overflow-hidden
          border-2 border-white/40 dark:border-gray-600/40
          backdrop-blur-xl
          bg-gradient-to-br from-white/60 via-white/40 to-white/30
          dark:from-gray-800/60 dark:via-gray-800/40 dark:to-gray-800/30
          transition-all duration-500 ease-out
          hover:shadow-3xl hover:shadow-purple-500/20 dark:hover:shadow-purple-900/30
          hover:border-purple-300/50 dark:hover:border-purple-600/50
          ${isSuccess ? 'ring-4 ring-green-400/50 animate-pulse' : ''}
          ${error ? 'ring-4 ring-red-400/50' : ''}
        `}
      >
        <ModernCardHeader className="pb-6 border-b border-white/30 dark:border-gray-700/50 relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className={`
              w-12 h-12 rounded-2xl flex items-center justify-center
              ${initialData?.id
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                : 'bg-gradient-to-br from-purple-500 to-pink-600'
              }
              shadow-lg transform transition-all duration-300 hover:scale-110
            `}>
              {initialData?.id ? (
                <Type size={24} className="text-white" />
              ) : (
                <Plus size={24} className="text-white" />
              )}
            </div>
            <ModernCardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {initialData?.id ? t('groups.edit_title') : t('groups.add_title')}
            </ModernCardTitle>
          </div>

          {isSuccess && (
            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 animate-bounce">
              <CheckCircle size={20} />
              <span className="font-medium">{t('common.success')}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center gap-2 text-red-500 dark:text-red-400">
              <AlertCircle size={20} />
              <span className="font-medium">{errorMessage}</span>
              {retryCount > 0 && (
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={retrySave}
                  disabled={isSaving}
                  className="text-red-500 hover:bg-red-100/30 dark:hover:bg-red-900/20 px-3 py-1 rounded-lg text-sm ml-2"
                >
                  {t('actions.retry_count', { count: retryCount })}
                </GlassButton>
              )}
            </div>
          )}
        </ModernCardHeader>

        <ModernCardContent className="p-8 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center
                bg-gradient-to-br from-blue-500/20 to-indigo-600/20
                border border-blue-200/50 dark:border-blue-800/50
                transition-all duration-300
                ${focusedField === 'name' ? 'scale-110 shadow-lg shadow-blue-500/30' : ''}
              `}>
                <Type size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <Label
                htmlFor="name"
                className="text-lg font-semibold text-gray-700 dark:text-gray-300"
              >
                {t('groups.group_name')}
              </Label>
            </div>

            <div className="relative group">
              <ModernInput
                id="name"
                disabled={isSubmitting || isSuccess}
                placeholder={t('groups.group_name_placeholder')}
                className={`
                  w-full px-6 py-4 text-lg rounded-2xl
                  border-2 bg-white/60 dark:bg-gray-700/60
                  backdrop-blur-sm
                  transition-all duration-300 ease-out
                  focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400
                  hover:bg-white/80 dark:hover:bg-gray-600/80
                  hover:shadow-lg hover:shadow-blue-500/20
                  ${errors.name ? 'border-red-400 focus:ring-red-500/30' : 'border-white/50 dark:border-gray-600/50'}
                  ${focusedField === 'name' ? 'scale-[1.02] shadow-xl' : ''}
                  ${nameValue ? 'border-green-400' : ''}
                `}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                {...register('name')}
              />

              {nameValue && !errors.name && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <CheckCircle size={20} className="text-green-500 animate-pulse" />
                </div>
              )}

              {errors.name && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <AlertCircle size={20} className="text-red-500" />
                </div>
              )}

              {errors.name && (
                <p className="mt-3 text-sm text-red-500 dark:text-red-400 flex items-center gap-2 animate-slide-in">
                  <AlertCircle size={16} />
                  {t(errors.name.message as string)}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center
                bg-gradient-to-br from-purple-500/20 to-pink-600/20
                border border-purple-200/50 dark:border-purple-800/50
                transition-all duration-300
                ${focusedField === 'color' ? 'scale-110 shadow-lg shadow-purple-500/30' : ''}
              `}>
                <Palette size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <Label className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {t('groups.group_color')}
              </Label>
            </div>

            <div className={`
              p-6 rounded-2xl
              bg-gradient-to-br from-white/40 to-white/20
              dark:from-gray-700/40 dark:to-gray-800/20
              backdrop-blur-sm border-2
              transition-all duration-300 ease-out
              hover:shadow-lg hover:shadow-purple-500/20
              ${focusedField === 'color' ? 'scale-[1.02] shadow-xl border-purple-300/70' : 'border-white/30 dark:border-gray-600/30'}
            `}>
              <ColorPicker
                selectedColor={selectedColor || '#60A5FA'}
                onSelectColor={(color: string) => {
                  setValue('color', color);
                  setFocusedField('color');
                  setTimeout(() => setFocusedField(null), 500);
                }}
              />

              <div className="mt-4 flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl border-4 border-white/50 shadow-lg"
                  style={{ backgroundColor: selectedColor }}
                ></div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {selectedColor?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </ModernCardContent>

        <ModernCardFooter className="px-8 py-6 bg-gradient-to-r from-white/40 to-white/20 dark:from-gray-800/40 dark:to-gray-900/20 border-t border-white/30 dark:border-gray-700/50 rounded-b-3xl">
          <div className="flex justify-end gap-4 w-full">
            <CancelButton
              onClick={onCancel}
              disabled={isSubmitting || isSuccess}
            />

            <GradientGlassButton
              type="submit"
              disabled={isSubmitting || isSuccess || !isValid}
              className={`
                px-8 py-3 rounded-2xl font-bold text-lg
                bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600
                hover:from-blue-600 hover:via-purple-700 hover:to-indigo-700
                text-white shadow-xl hover:shadow-2xl
                hover:shadow-purple-500/40
                transition-all duration-300 ease-out
                transform hover:-translate-y-1 hover:scale-105
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                focus:ring-4 focus:ring-purple-500/50 focus:outline-none
                ${isSuccess ? 'bg-gradient-to-r from-green-500 to-emerald-600' : ''}
              `}
            >
              {isSuccess ? (
                <div className="flex items-center gap-3">
                  <CheckCircle size={24} className="animate-bounce" />
                  <span>{t('common.success')}</span>
                </div>
              ) : isSubmitting ? (
                <div className="flex items-center gap-3">
                  <LoadingSpinner size={24} className="text-white" />
                  <span>{t('common.saving')}</span>
                </div>
              ) : initialData?.id ? (
                <div className="flex items-center gap-3">
                  <CheckCircle size={24} />
                  <span>{t('actions.save_changes')}</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Plus size={24} />
                  <span>{t('actions.create')}</span>
                </div>
              )}
            </GradientGlassButton>
          </div>
        </ModernCardFooter>
      </ModernCard>
    </form>
  );
};

export default GroupForm;