import React, { useEffect, useMemo } from 'react';
import { useForm, FormProvider, Form } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { User, Lock, UserCircle, Mail, Shield } from 'lucide-react';

// UI Components
import { ModernInput } from '@/components/ui/modern-input';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { GlassButton, GradientGlassButton } from '@/components/ui/glass-button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useCreateUser, useUpdateUserRole, useUpdateUserProfile, useUpdateUserPassword } from '@/features/user-management/hooks/useUsers';
import { UserProfile } from '@/features/user-management/types/user.types';
import { ErrorManager } from '@/lib/error-manager';
import { useJalaliCalendar } from '@/hooks/use-jalali-calendar';
import { ModernCard, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui';
import { CancelButton } from '@/components/common';

interface UserFormProps {
  initialData?: UserProfile;
  onSuccess: () => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const { t } = useTranslation();

  const formSchema = useMemo(() => {
    const baseSchema = z.object({
      email: z.string().email({ message: t('errors.invalid_email') }),
      password: z.string().min(6, { message: t('errors.password_min_length') }).optional().or(z.literal('')),
      first_name: z.string().min(1, { message: t('errors.first_name_required') }).optional().or(z.literal('')),
      last_name: z.string().min(1, { message: t('errors.last_name_required') }).optional().or(z.literal('')),
      role: z.enum(['user', 'admin'], { message: t('errors.invalid_role') }),
    }).refine(data => data.first_name || data.last_name || data.email, {
      message: t('errors.minimum_field_required'),
      path: ['email'],
    }); 
    return baseSchema;
  }, [t]);
  
  const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: initialData?.email || '',
      password: '',
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      role: initialData?.role || 'user',
    },
  });
  
  const { handleSubmit, formState: { isSubmitting } } = form;
  
  useEffect(() => {
    if (initialData) {
      form.reset({
        email: initialData.email,
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        role: initialData.role,
        password: '',
      });
    }
  }, [initialData, form]);

  const createUser = useCreateUser();
  const updateRole = useUpdateUserRole();
  const updateProfile = useUpdateUserProfile();
  const updatePassword = useUpdateUserPassword();

  const isLoading = createUser.isPending || updateRole.isPending || updateProfile.isPending || updatePassword.isPending;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (initialData) {
        // به‌روزرسانی کاربر موجود
        // به‌روزرسانی نقش
        await updateRole.mutateAsync({
          userId: initialData.id,
          role: values.role,
        });

        // به‌روزرسانی پروفایل
        await updateProfile.mutateAsync({
          userId: initialData.id,
          first_name: values.first_name || null,
          last_name: values.last_name || null,
        });

        // به‌روزرسانی رمز عبور اگر وارد شده باشد
        if (values.password) {
          await updatePassword.mutateAsync({
            userId: initialData.id,
            newPassword: values.password,
          });
        }
      } else {
        // ایجاد کاربر جدید
        await createUser.mutateAsync({
          email: values.email,
          password: values.password || undefined,
          first_name: values.first_name || undefined,
          last_name: values.last_name || undefined,
          role: values.role,
        });
      }

      ErrorManager.notifyUser(
        initialData ? t('user_management.user_updated_success') : t('user_management.user_created_success'),
        'success'
      );
      onSuccess();
    } catch (error) {
      ErrorManager.logError(error, {
        component: 'UserForm',
        action: initialData ? 'updateUser' : 'createUser',
        initialData
      });
    }
  };

  const { formatDate } = useJalaliCalendar();
  const creationDate = initialData?.created_at ? formatDate(new Date(initialData.created_at), 'jYYYY/jMM/jDD - HH:mm') : null;

  return (
    <FormProvider {...form}>
      <div className="w-full">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {initialData ? t('user_management.edit_user') : t('user_management.add_new_user')}
              </h2>
              {creationDate && (
                <p className="text-sm text-blue-100 mt-1">
                  {t('common.created_on')}: {creationDate}
                </p>
              )}
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <UserCircle className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-b-lg">
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('common.first_name')}
                    </FormLabel>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <FormControl>
                        <ModernInput
                          placeholder={t('common.first_name_placeholder')}
                          {...field}
                          variant="glass"
                          className="pl-3 pr-10 py-2 w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-xs text-red-500 mt-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('common.last_name')}
                    </FormLabel>
                    <FormControl>
                      <ModernInput
                        placeholder={t('common.last_name_placeholder')}
                        {...field}
                        variant="glass"
                        className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500 mt-1" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('common.email')}
                  </FormLabel>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <FormControl>
                      <ModernInput
                        placeholder={t('common.email_placeholder')}
                        {...field}
                        type="email"
                        disabled={!!initialData}
                        variant="glass"
                        className="pl-3 pr-10 py-2 w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60"
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('common.password')}
                    </FormLabel>
                    {initialData && (
                      <span className="text-xs text-gray-500">
                        {t('user_management.leave_blank_for_no_change')}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <FormControl>
                      <ModernInput
                        placeholder={t('common.password_placeholder')}
                        {...field}
                        type="password"
                        variant="glass"
                        className="pl-3 pr-10 py-2 w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('user_management.role')}
                  </FormLabel>
                  <div className="relative">
                    <Shield className="absolute right-12 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                    <ModernSelect 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <ModernSelectTrigger 
                          variant="glass"
                          className="w-full pl-3 pr-10 py-2 text-left"
                        >
                          <ModernSelectValue placeholder={t('user_management.select_role')} />
                        </ModernSelectTrigger>
                      </FormControl>
                      <ModernSelectContent variant="glass" className="w-[var(--radix-select-trigger-width)]">
                        <ModernSelectItem value="user" className="pl-3 pr-4 py-2">
                          <span className="flex items-center">
                            <span className="h-2 w-2 rounded-full bg-gray-400 mr-3"></span>
                            {t('user_management.role_user')}
                          </span>
                        </ModernSelectItem>
                        <ModernSelectItem value="admin" className="pl-3 pr-4 py-2">
                          <span className="flex items-center">
                            <span className="h-2 w-2 rounded-full bg-blue-500 mr-3"></span>
                            {t('user_management.role_admin')}
                          </span>
                        </ModernSelectItem>
                        <ModernSelectItem value="moderator" className="pl-3 pr-4 py-2">
                          <span className="flex items-center">
                            <span className="h-2 w-2 rounded-full bg-purple-500 mr-3"></span>
                            {t('user_management.role_moderator')}
                          </span>
                        </ModernSelectItem>
                      </ModernSelectContent>
                    </ModernSelect>
                  </div>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <CancelButton
                onClick={onCancel}
                text={t('common.cancel')}
                className="px-5 py-2.5 text-sm font-medium"
              />
              <GradientGlassButton
                type="submit"
                disabled={isLoading}
                gradientType="primary"
                className="px-5 py-2.5 text-sm font-medium rounded-lg transition-all transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isLoading ? (initialData ? t('common.saving') : t('common.creating')) : (initialData ? t('common.save') : t('common.create'))}
                  </span>
                ) : initialData ? (
                  t('common.save')
                ) : (
                  t('common.create')
                )}
              </GradientGlassButton>
            </div>
 </form>
 </div>
      </div>
    </FormProvider>
  );
};

export default UserForm;
