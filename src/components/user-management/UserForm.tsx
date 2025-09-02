import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ModernInput } from "@/components/ui/modern-input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";
import { UserManagementService } from "@/services/user-management-service";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import { useTranslation } from "react-i18next";
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from "@/components/ui/modern-select";
import { GlassButton } from "@/components/ui/glass-button";
import CancelButton from "@/components/common/CancelButton";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface UserFormProps {
  initialData?: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    role: 'user' | 'admin';
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  
  const formSchema = useMemo(() => {
    return z.object({
      email: z.string().email({ message: t('errors.invalid_email') }),
      password: z.string().min(6, { message: t('errors.password_min_length') }).optional().or(z.literal("")),
      first_name: z.string().min(1, { message: t('errors.first_name_required') }).optional().or(z.literal("")),
      last_name: z.string().min(1, { message: t('errors.last_name_required') }).optional().or(z.literal("")),
      role: z.enum(["user", "admin"], { message: t('errors.invalid_role') }),
    }).refine(data => {
      if (!data.first_name && !data.last_name && !data.email) {
        return false;
      }
      return true;
    }, {
      message: t('errors.minimum_field_required'),
      path: ["email"],
    });
  }, [t]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: initialData?.email || "",
      password: "",
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      role: initialData?.role || "user",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        email: initialData.email,
        first_name: initialData.first_name || "",
        last_name: initialData.last_name || "",
        role: initialData.role,
        password: "",
      });
    }
  }, [initialData, form]);

  const {
    isLoading,
    executeAsync,
  } = useErrorHandler(null, {
    showToast: true,
    customErrorMessage: initialData ? t('user_management.error_updating_user') : t('user_management.error_creating_user'),
    onSuccess: () => {
      ErrorManager.notifyUser(initialData ? t('user_management.user_updated_success') : t('user_management.user_created_success'), 'success');
      onSuccess();
    },
    onError: (err) => {
      ErrorManager.logError(err, { component: 'UserForm', action: initialData ? 'updateUser' : 'createUser', initialData });
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await executeAsync(async () => {
      if (initialData) {
        const updateRoleRes = await UserManagementService.updateUserRole({
          userId: initialData.id,
          role: values.role,
        });
        if (updateRoleRes.error) throw new Error(updateRoleRes.error);

        const updateProfileRes = await UserManagementService.updateUserProfile({
          userId: initialData.id,
          first_name: values.first_name || null,
          last_name: values.last_name || null,
        });
        if (updateProfileRes.error) throw new Error(updateProfileRes.error);

        if (values.password) {
          const updatePasswordRes = await UserManagementService.updateUserPassword({
            userId: initialData.id,
            newPassword: values.password,
          });
          if (updatePasswordRes.error) throw new Error(updatePasswordRes.error);
        }
      } else {
        const res = await UserManagementService.createUser({
          email: values.email,
          password: values.password || undefined,
          first_name: values.first_name || undefined,
          last_name: values.last_name || undefined,
          role: values.role,
        });
        if (res.error) throw new Error(res.error);
      }
    });
  };

  return (
    <ModernCard variant="glass" className="w-full max-w-md rounded-xl p-6">
      <ModernCardHeader className="text-center">
        <ModernCardTitle className="text-2xl font-bold">
          {initialData ? t('user_management.edit_user') : t('user_management.add_new_user')}
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">{t('common.email')}</FormLabel>
                  <FormControl>
                    <ModernInput
                      placeholder={t('common.email_placeholder')}
                      {...field}
                      type="email"
                      disabled={!!initialData}
                      variant="glass"
                      className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">{t('common.password')}</FormLabel>
                  <FormControl>
                    <ModernInput
                      placeholder={initialData ? t('user_management.leave_blank_for_no_change') : t('common.password_placeholder')}
                      {...field}
                      type="password"
                      variant="glass"
                      className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">{t('common.first_name')}</FormLabel>
                  <FormControl>
                    <ModernInput
                      placeholder={t('common.first_name_placeholder')}
                      {...field}
                      variant="glass"
                      className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">{t('common.last_name')}</FormLabel>
                  <FormControl>
                    <ModernInput
                      placeholder={t('common.last_name_placeholder')}
                      {...field}
                      variant="glass"
                      className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">{t('user_management.role')}</FormLabel>
                  <ModernSelect onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <ModernSelectTrigger variant="glass" className="w-full">
                        <ModernSelectValue placeholder={t('user_management.select_role')} />
                      </ModernSelectTrigger>
                    </FormControl>
                    <ModernSelectContent variant="glass">
                      <ModernSelectItem value="user">{t('user_management.role_user')}</ModernSelectItem>
                      <ModernSelectItem value="admin">{t('user_management.role_admin')}</ModernSelectItem>
                    </ModernSelectContent>
                  </ModernSelect>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 mt-6">
              <CancelButton onClick={onCancel} disabled={isLoading} />
              <GlassButton
                type="submit"
                variant="gradient-primary"
                className="px-4 py-2 rounded-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading && <LoadingSpinner size={16} className="me-2" />}
                {isLoading ? (initialData ? t('common.saving') : t('common.creating')) : (initialData ? t('common.save') : t('common.create'))}
              </GlassButton>
            </div>
          </form>
        </Form>
      </ModernCardContent>
    </ModernCard>
  );
};

export default UserForm;