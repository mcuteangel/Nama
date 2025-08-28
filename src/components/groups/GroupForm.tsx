import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Label } from '@/components/ui/label';
import { ModernInput } from '@/components/ui/modern-input';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import ColorPicker, { colors } from '../common/ColorPicker';
import { useSession } from '@/integrations/supabase/auth';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { ErrorManager } from '@/lib/error-manager';
import CancelButton from '../common/CancelButton';
import LoadingSpinner from '../common/LoadingSpinner';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent, ModernCardFooter } from "@/components/ui/modern-card";
import { ModernButton } from "@/components/ui/modern-button";

const formSchema = z.object({
  name: z.string().min(1, { message: 'نام گروه نمی‌تواند خالی باشد.' }),
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
  const navigate = useNavigate();
  const { session } = useSession();

  // Assign the result of useForm to a variable named 'form'
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || { name: '', color: '#60A5FA' },
  });

  // Destructure properties from the 'form' variable
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const selectedColor = watch('color');

  const onSuccessCallback = useCallback((result: { id: string } | undefined) => { // result will be the data from executeSave
    ErrorManager.notifyUser(initialData?.id ? 'گروه با موفقیت ویرایش شد.' : 'گروه با موفقیت اضافه شد.', 'success');
    onSuccess?.(result?.id); // Pass the new group's ID
  }, [initialData?.id, onSuccess]);

  const onErrorCallback = useCallback((err) => {
    ErrorManager.logError(err, { component: "GroupForm", action: initialData?.id ? "updateGroup" : "addGroup" });
  }, [initialData?.id]);

  const {
    isLoading: isSaving,
    error,
    errorMessage,
    retry: retrySave,
    executeAsync: executeSave,
    retryCount,
  } = useErrorHandler(null, {
    maxRetries: 3,
    retryDelay: 1000,
    showToast: true,
    customErrorMessage: initialData?.id ? "خطایی در ویرایش گروه رخ داد" : "خطایی در افزودن گروه رخ داد",
    onSuccess: onSuccessCallback,
    onError: onErrorCallback,
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        color: initialData.color || '#60A5FA',
      });
    }
  }, [initialData, form]);

  const onSubmit = async (values: GroupFormValues) => {
    if (!session?.user) {
      ErrorManager.notifyUser('برای افزودن/ویرایش گروه باید وارد شوید.', 'error');
      navigate('/login');
      return;
    }
    const userId = session.user.id;

    await executeSave(async () => {
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
    <ModernCard variant="glass" className="w-full max-w-md rounded-xl p-6">
      <ModernCardHeader className="text-center">
        <ModernCardTitle className="text-2xl font-bold">
          {initialData?.id ? "ویرایش گروه" : "افزودن گروه جدید"}
        </ModernCardTitle>
        {error && (
          <div className="text-sm text-destructive flex items-center justify-center gap-2 mt-2">
            <span>{errorMessage}</span>
            {retryCount > 0 && (
              <ModernButton
                variant="ghost"
                size="sm"
                onClick={retrySave}
                disabled={isSaving}
                className="text-destructive hover:bg-destructive/10"
              >
                تلاش مجدد ({retryCount} از ۳)
              </ModernButton>
            )}
          </div>
        )}
      </ModernCardHeader>
      <ModernCardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">نام گروه</Label>
            <ModernInput
              id="name"
              {...register('name')}
              variant="glass"
              className="mt-1 block w-full bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100"
              disabled={isSaving}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="color" className="text-gray-700 dark:text-gray-300">رنگ گروه</Label>
            <ColorPicker selectedColor={selectedColor || '#60A5FA'} onSelectColor={(color) => setValue('color', color)} />
            {errors.color && <p className="text-red-500 text-sm mt-1">{errors.color.message}</p>}
          </div>

          <ModernCardFooter className="flex justify-end gap-4 p-0 pt-4">
            <CancelButton onClick={onCancel} disabled={isSaving} />
            <ModernButton
              type="submit"
              variant="gradient-primary"
              className="px-6 py-2 rounded-md font-semibold"
              disabled={isSaving}
            >
              {isSaving && <LoadingSpinner size={16} className="me-2" />}
              {isSaving ? (initialData?.id ? "در حال ویرایش..." : "در حال افزودن...") : (initialData?.id ? "ویرایش" : "افزودن")}
            </ModernButton>
          </ModernCardFooter>
        </form>
      </ModernCardContent>
    </ModernCard>
  );
};

export default GroupForm;