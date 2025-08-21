"use client";

import React, { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/integrations/supabase/auth';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { ErrorManager } from '@/lib/error-manager';
import { User } from 'lucide-react';
import { fetchWithCache, invalidateCache } from "@/utils/cache-helpers";
import LoadingMessage from './LoadingMessage'; // Import LoadingMessage

const profileSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const UserProfileForm: React.FC = () => {
  const { session, isLoading: isSessionLoading } = useSession();

  const handleSuccess = useCallback(() => {
    ErrorManager.notifyUser('پروفایل با موفقیت به‌روزرسانی شد.', 'success');
    invalidateCache(`user_profile_${session?.user?.id}`);
  }, [session]);

  const handleError = useCallback((err: Error) => {
    console.error("Supabase profile operation error:", err);
    ErrorManager.logError(err, {
      component: "UserProfileForm",
      action: "profileOperation",
    });
  }, []);

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
    customErrorMessage: "خطایی در به‌روزرسانی پروفایل رخ داد",
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: undefined,
      last_name: undefined,
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (isSessionLoading || !session?.user) {
        return;
      }

      const cacheKey = `user_profile_${session.user.id}`;
      await executeAsync(async () => {
        const { data, error } = await fetchWithCache<{ first_name: string | null; last_name: string | null }>(
          cacheKey,
          async () => {
            const { data, error } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', session.user.id)
              .maybeSingle();

            if (error) {
              throw new Error(error.message || "خطا در دریافت اطلاعات پروفایل");
            }
            return { data: data, error: null };
          },
          {
            loadingMessage: "در حال بارگذاری پروفایل...",
            successMessage: "پروفایل با موفقیت بارگذاری شد.",
            errorMessage: "خطا در دریافت اطلاعات پروفایل",
            showLoadingToast: false
          }
        );

        form.reset({
          first_name: data?.first_name ?? undefined,
          last_name: data?.last_name ?? undefined,
        });
      }, {
        component: "UserProfileForm",
        action: "fetchProfile"
      });
    };

    fetchProfile();
  }, [session, isSessionLoading, form, executeAsync]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!session?.user) {
      ErrorManager.notifyUser('برای به‌روزرسانی پروفایل باید وارد شوید.', 'error');
      return;
    }

    await executeAsync(async () => {
      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            id: session.user.id,
            first_name: values.first_name === '' ? null : values.first_name,
            last_name: values.last_name === '' ? null : values.last_name,
          },
          { onConflict: 'id' }
        );

      if (error) {
        throw new Error(error.message || "خطا در ذخیره پروفایل");
      }
    }, {
      component: "UserProfileForm",
      action: "submitProfile"
    });
  };

  if (isSessionLoading) {
    return <LoadingMessage message="در حال بارگذاری پروفایل..." />;
  }

  return (
    <Card className="w-full max-w-md glass rounded-xl p-6 bg-white/90 dark:bg-gray-900/90">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          پروفایل کاربری
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
            <Label htmlFor="first_name" className="text-gray-700 dark:text-gray-200">نام</Label>
            <Input
              id="first_name"
              {...form.register('first_name')}
              placeholder="نام خود را وارد کنید"
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
              placeholder="نام خانوادگی خود را وارد کنید"
              className="mt-1 block w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              disabled={isSubmitting}
            />
            {form.formState.errors.last_name && <p className="text-red-500 text-sm mt-1">{form.formState.errors.last_name.message}</p>}
          </div>

          <div>
            <Label className="text-gray-700 dark:text-gray-200">ایمیل</Label>
            <Input
              value={session?.user?.email || ''}
              readOnly
              className="mt-1 block w-full bg-gray-100/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-gray-700 dark:text-gray-300 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">ایمیل از طریق تنظیمات حساب کاربری قابل تغییر است.</p>
          </div>

          <CardFooter className="flex justify-end gap-4 p-0 pt-4">
            <Button
              type="submit"
              className="px-6 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserProfileForm;