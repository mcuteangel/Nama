import React, { useEffect, useCallback } from 'react';
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
import { Plus } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, { message: 'group.name_required' }), // Will be translated in UI
  color: z.string().optional(),
});

type GroupFormValues = z.infer<typeof formSchema>;

interface GroupFormProps {
  initialData?: {
    id?: string; // Make id optional for new groups
    name: string;
    color?: string;
  };
  onSuccess?: (newGroupId?: string) => void; // Modified to accept new group ID
  onCancel?: () => void;
}

const GroupForm: React.FC<GroupFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session } = useSession();

  // Assign the result of useForm to a variable named 'form'
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<GroupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || { name: '', color: '#60A5FA' },
  });

  const selectedColor = watch('color');

  const onSuccessCallback = useCallback((result: { id: string } | undefined) => {
    ErrorManager.notifyUser(initialData?.id ? t('groups.edit_success') : t('groups.add_success'), 'success');
    onSuccess?.(result?.id);
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
      // Using setValue directly instead of form.reset for better type safety
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
          .select('id') // Select the ID to return it
          .single();
      } else {
        res = await supabase
          .from('groups')
          .insert({ name: values.name, color: values.color, user_id: userId })
          .select('id') // Select the ID to return it
          .single();
      }

      if (res.error) {
        throw new Error(res.error.message);
      }
      return res.data; // Return the data (which includes the ID)
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto">
      <ModernCard variant="glass" className="rounded-3xl shadow-2xl border-2 border-white/30 dark:border-gray-600/30 backdrop-blur-xl bg-white/40 dark:bg-gray-800/60 overflow-hidden transition-all duration-300 hover:shadow-3xl hover:border-white/50 dark:hover:border-gray-500/50">
        <ModernCardHeader className="pb-4 border-b border-white/20 dark:border-gray-700/50">
          <ModernCardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
            {initialData?.id ? t('groups.edit_title') : t('groups.add_title')}
          </ModernCardTitle>
          {error && (
            <div className="mt-2 text-sm text-red-500 dark:text-red-400 flex items-center justify-center gap-2">
              <span>{errorMessage}</span>
              {retryCount > 0 && (
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={retrySave}
                  disabled={isSaving}
                  className="text-red-500 hover:bg-red-100/30 dark:hover:bg-red-900/20 px-2 py-1 rounded-md text-xs"
                >
                  {t('actions.retry_count', { count: retryCount })}
                </GlassButton>
              )}
            </div>
          )}
        </ModernCardHeader>
        
        <ModernCardContent className="p-6 space-y-6">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('groups.group_name')}
            </Label>
            <div className="relative">
              <ModernInput
                id="name"
                disabled={isSubmitting}
                placeholder={t('groups.group_name_placeholder')}
                className="w-full px-4 py-3 rounded-xl border-2 border-white/30 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                {...register('name')}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                  {t(errors.name.message as string)}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('groups.group_color')}
            </Label>
            <div className="p-4 rounded-2xl bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm border border-white/30 dark:border-gray-600/30">
              <ColorPicker
                selectedColor={selectedColor || '#60A5FA'}
                onSelectColor={(color: string) => setValue('color', color)}
              />
            </div>
          </div>
        </ModernCardContent>
        
        <ModernCardFooter className="px-6 py-4 bg-white/30 dark:bg-gray-800/40 border-t border-white/20 dark:border-gray-700/50 rounded-b-3xl">
          <div className="flex justify-end gap-3 w-full">
            <div className="px-5 py-2.5">
              <CancelButton
                onClick={onCancel}
                disabled={isSubmitting}
              />
            </div>
            <GradientGlassButton
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <LoadingSpinner className="w-5 h-5 text-white" />
              ) : initialData?.id ? (
                t('actions.save_changes')
              ) : (
                <span className="flex items-center gap-2">
                  <Plus size={18} />
                  {t('actions.create')}
                </span>
              )}
            </GradientGlassButton>
          </div>
        </ModernCardFooter>
      </ModernCard>
    </form>
  );
};

export default GroupForm;