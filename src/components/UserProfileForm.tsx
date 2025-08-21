"use client";

import React, { useEffect, useCallback, useState } from 'react';
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
import LoadingMessage from './LoadingMessage';
import { showLoading, dismissToast, showSuccess, showError } from '@/utils/toast'; // Import toast functions

const profileSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const UserProfileForm: React.FC = () => {
  const { session, isLoading: isSessionLoading } = useSession();

  const onSuccessSubmit = useCallback(() => {
    ErrorManager.notifyUser('پروفایل با موفقیت به‌روزرسانی شد.', 'success');
    invalidateCache(`user_profile_${session?.user?.id}`);
  }, [session]);

  const onErrorSubmit = useCallback((err: Error) => {
    ErrorManager.logError(err, { component: "UserProfileForm", action: "submitProfile" });
  }, []);

  const {
    isLoading: isSubmitting,
    error: submitError, // Renamed to avoid conflict
    errorMessage: submitErrorMessage, // Renamed
    retry: retrySubmit, // Renamed
    executeAsync: executeSubmit, // Renamed
    retryCount: submitRetryCount, // Renamed
  } = useErrorHandler(null, {
    maxRetries: 3,
    retryDelay: 1000,
    showToast: true, // We want toast for submit success/error
    customErrorMessage: "خطایی در به‌روزرسانی پروفایل رخ داد",
    onSuccess: onSuccessSubmit,
    onError: onErrorSubmit,
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: undefined,
      last_name: undefined,
    },
  });

  const [loadingProfile, setLoadingProfile] = useState(true); // New state for loading profile
  const [profileFetchError, setProfileFetchError] = useState<string | null>(null); // New state for fetch error

  const fetchProfile = useCallback(async () => {
    if (isSessionLoading || !session?.user) {
      setLoadingProfile(false);
      return;
    }

    setLoadingProfile(true);
    setProfileFetchError(null);
    const toastId = showLoading("در حال بارگذاری پروفایل...");

    try {
      const cacheKey = `user_profile_${session.user.id}`;
      const { data, error, fromCache } = await fetchWithCache<{ first_name: string | null; last_name: string | null }>(
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
        }
      );

      if (error) {
        throw new Error(error);
      }

      form.reset({
        first_name: data?.first_name ?? undefined,
        last_name: data?.last_name ?? undefined,
      });

      if (!fromCache) { // Only show success toast if not from cache
        showSuccess("پروفایل با موفقیت بارگذاری شد.");
      }
    } catch (err: any) {
      const msg = ErrorManager.getErrorMessage(err);
      setProfileFetchError(msg);
      showError(`خطا در بارگذاری پروفایل: ${msg}`);
      ErrorManager.logError(err, { component: "UserProfileForm", action: "fetchProfile" });
    } finally {
      dismissToast(toastId);
      setLoadingProfile(false);
    }
  }, [session, isSessionLoading, form]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!session?.user) {
      ErrorManager.notifyUser('برای به‌روزرسانی پروفایل باید وارد شوید.', 'error');
      return;
    }

    await executeSubmit(async () => { // Use executeSubmit here
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
    });
  };

  if (loadingProfile) { // Use new loading state
    return <LoadingMessage message="در حال بارگذاری پروفایل..." />;
  }

  return (
    <Card className="w-full max-w-md glass rounded-xl p-6 bg-white/90 dark:bg-gray-900/90">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          پروفایل کاربری
        </CardTitle>
        {submitError && ( // Use submitError
          <div className="text-sm text-destructive flex items-center justify-center gap-2 mt-2">
            <span>{submitErrorMessage}</span>
            {submitRetryCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={retrySubmit}
                disabled={isSubmitting}
                className="text-destructive hover:bg-destructive/10"
              >
                تلاش مجدد ({submitRetryCount} از ۳)
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