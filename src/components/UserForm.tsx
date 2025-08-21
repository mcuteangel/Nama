import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { UserManagementService } from '@/services/user-management-service';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { ErrorManager } from '@/lib/error-manager';
import { Save, X } from 'lucide-react';

const userFormSchema = z.object({
  email: z.string().email({ message: 'ایمیل معتبر نیست.' }),
  password: z.string().min(6, { message: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' }).optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  role: z.enum(['user', 'admin'], { message: 'نقش معتبر نیست.' }),
  userId: z.string().optional(), // Added userId to the schema
}).superRefine((data, ctx) => {
  // Password is required for new users
  if (!data.password && !data.userId) { // userId will be present for edits
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'رمز عبور برای کاربر جدید الزامی است.',
      path: ['password'],
    });
  }
});

type UserFormValues = z.infer<typeof userFormSchema>; // userId is now part of this type

interface UserFormProps {
  initialData?: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    role: 'user' | 'admin';
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const {
    isLoading: isSubmitting,
    error,
    errorMessage,
    retry: retryLastOperation,
    executeAsync,
    retryCount,
  } = useErrorHandler(null, {
    maxRetries: 3,
    retryDelay: 1000,
    showToast: true,
    customErrorMessage: initialData ? "خطایی در ویرایش کاربر رخ داد" : "خطایی در افزودن کاربر رخ داد",
    onSuccess: () => {
      ErrorManager.notifyUser(initialData ? 'کاربر با موفقیت ویرایش شد.' : 'کاربر با موفقیت اضافه شد.', 'success');
      onSuccess?.();
    },
    onError: (err) => {
      ErrorManager.logError(err, {
        component: "UserForm",
        action: initialData ? "updateUser" : "addUser",
      });
    }
  });

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: initialData?.email || "",
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      role: initialData?.role || "user",
      userId: initialData?.id, // Set userId for editing
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        email: initialData.email,
        first_name: initialData.first_name || "",
        last_name: initialData.last_name || "",
        role: initialData.role,
        userId: initialData.id,
        password: "", // Clear password field for existing users
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: UserFormValues) => {
    await executeAsync(async () => {
      if (data.userId) {
        // Editing existing user
        const res = await UserManagementService.updateUserRole({
          userId: data.userId,
          role: data.role,
        });
        if (res.error) throw new Error(res.error);
      } else {
        // Creating new user
        const res = await UserManagementService.createUser({
          email: data.email,
          password: data.password,
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role,
        });
        if (res.error) throw new Error(res.error);
      }
    });
  };

  return (
    <Card className="w-full max-w-md glass rounded-xl p-6 bg-white/90 dark:bg-gray-900/90">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {initialData ? "ویرایش کاربر" : "افزودن کاربر جدید"}
        </CardTitle>
        {error && (
          <div className="text-sm text-destructive flex items-center justify-center gap-2 mt-2">
            <span>{errorMessage}</span>
            {retryCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={retryLastOperation}
                disabled={isSubmitting}
                className="text-destructive hover:bg-destructive/10"
              >
                تلاش مجدد ({retryCount} از ۳)
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">ایمیل</Label>
            <Input
              id="email"
              {...form.register('email')}
              placeholder="example@domain.com"
              className="mt-1 block w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              disabled={isSubmitting || !!initialData} // Disable email edit for existing users
            />
            {form.formState.errors.email && <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>}
          </div>

          {!initialData && ( // Password only for new users
            <div>
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-200">رمز عبور</Label>
              <Input
                id="password"
                type="password"
                {...form.register('password')}
                placeholder="حداقل ۶ کاراکتر"
                className="mt-1 block w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isSubmitting}
              />
              {form.formState.errors.password && <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>}
            </div>
          )}

          <div>
            <Label htmlFor="first_name" className="text-gray-700 dark:text-gray-200">نام</Label>
            <Input
              id="first_name"
              {...form.register('first_name')}
              placeholder="نام کاربر"
              className="mt-1 block w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              disabled={isSubmitting}
            />
            {form.formState.errors.first_name && <p className="text-red-500 text-sm mt-1">{form.formState.errors.first_name.message}</p>}
          </div>

          <div>
            <Label htmlFor="last_name" className="text-gray-700 dark:text-gray-200">نام خانوادگی</Label>
            <Input
              id="last_name"
              {...form.register('last_name')}
              placeholder="نام خانوادگی کاربر"
              className="mt-1 block w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              disabled={isSubmitting}
            />
            {form.formState.errors.last_name && <p className="text-red-500 text-sm mt-1">{form.formState.errors.last_name.message}</p>}
          </div>

          <div>
            <Label htmlFor="role" className="text-gray-700 dark:text-gray-200">نقش</Label>
            <Select
              value={form.watch('role')}
              onValueChange={(value: 'user' | 'admin') => form.setValue('role', value, { shouldValidate: true })}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100">
                <SelectValue placeholder="انتخاب نقش" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                <SelectItem value="user">کاربر عادی</SelectItem>
                <SelectItem value="admin">مدیر</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.role && <p className="text-red-500 text-sm mt-1">{form.formState.errors.role.message}</p>}
          </div>

          <CardFooter className="flex justify-end gap-4 p-0 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-6 py-2 rounded-md text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              disabled={isSubmitting}
            >
              <X size={16} className="me-2" />
              لغو
            </Button>
            <Button
              type="submit"
              className="px-6 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? (initialData ? "در حال ویرایش..." : "در حال افزودن...") : (initialData ? "ویرایش" : "افزودن")}
              <Save size={16} className="me-2" />
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserForm;