import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import ColorPicker, { colors } from './ColorPicker';
import { useSession } from '@/integrations/supabase/auth';
import { useErrorHandler } from '@/hooks/use-error-handler'; // Import useErrorHandler
import { ErrorManager } from '@/lib/error-manager'; // Import ErrorManager
import CancelButton from './CancelButton'; // Import CancelButton

const formSchema = z.object({
  name: z.string().min(1, { message: 'نام گروه نمی‌تواند خالی باشد.' }),
  color: z.string().optional(),
});

type GroupFormValues = z.infer<typeof formSchema>;

interface GroupFormProps {
  initialData?: {
    id: string;
    name: string;
    color?: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const GroupForm: React.FC<GroupFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const { session, isLoading: isSessionLoading } = useSession();
  const [existingGroupColors, setExistingGroupColors] = useState<string[]>([]);
  const [isFetchingColors, setIsFetchingColors] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GroupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || { name: '', color: '#60A5FA' },
  });

  const selectedColor = watch('color');

  const findUniqueColor = useCallback((usedColors: string[]): string => {
    for (const color of colors) {
      if (!usedColors.includes(color)) {
        return color;
      }
    }
    return '#60A5FA';
  }, []);

  const onSuccessCallback = useCallback(() => {
    ErrorManager.notifyUser(initialData ? 'گروه با موفقیت ویرایش شد.' : 'گروه با موفقیت اضافه شد.', 'success');
    onSuccess?.();
  }, [initialData, onSuccess]);

  const onErrorCallback = useCallback((err) => {
    ErrorManager.logError(err, { component: "GroupForm", action: initialData ? "updateGroup" : "addGroup" });
  }, [initialData]);

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
    customErrorMessage: initialData ? "خطایی در ویرایش گروه رخ داد" : "خطایی در افزودن گروه رخ داد",
    onSuccess: onSuccessCallback,
    onError: onErrorCallback,
  });

  useEffect(() => {
    const fetchExistingColorsAndSetDefault = async () => {
      if (isSessionLoading) {
        setIsFetchingColors(true);
        return;
      }

      if (!session?.user) {
        setExistingGroupColors([]);
        setIsFetchingColors(false);
        if (!initialData) {
          setValue('color', '#60A5FA');
        }
        return;
      }

      setIsFetchingColors(true);
      try {
        const { data, error } = await supabase
          .from('groups')
          .select('color')
          .eq('user_id', session.user.id);

        if (error) throw error;

        const currentColors = data.map(g => g.color).filter(Boolean) as string[];
        setExistingGroupColors(currentColors);

        if (!initialData) {
          const uniqueColor = findUniqueColor(currentColors);
          setValue('color', uniqueColor);
        } else {
          setValue('color', initialData.color || findUniqueColor(currentColors));
        }
      } catch (error: any) {
        console.error("Error fetching existing group colors:", error);
        if (!initialData) {
          setValue('color', '#60A5FA');
        }
      } finally {
        setIsFetchingColors(false);
      }
    };

    fetchExistingColorsAndSetDefault();
  }, [session, isSessionLoading, initialData, setValue, findUniqueColor]);

  const onSubmit = async (values: GroupFormValues) => {
    if (!session?.user) {
      ErrorManager.notifyUser('برای افزودن/ویرایش گروه باید وارد شوید.', 'error');
      navigate('/login');
      return;
    }
    const userId = session.user.id;

    await executeSave(async () => {
      let res;
      if (initialData) {
        res = await supabase
          .from('groups')
          .update({ name: values.name, color: values.color, user_id: userId })
          .eq('id', initialData.id);
      } else {
        res = await supabase
          .from('groups')
          .insert({ name: values.name, color: values.color, user_id: userId });
      }

      if (res.error) {
        throw new Error(res.error.message);
      }
    });
  };

  if (isFetchingColors && !initialData) {
    return (
      <Card className="w-full max-w-md glass rounded-xl p-6 bg-white/90 dark:bg-gray-900/90">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            در حال بارگذاری...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 dark:text-gray-400">در حال آماده‌سازی فرم گروه...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md glass rounded-xl p-6 bg-white/90 dark:bg-gray-900/90">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {initialData ? "ویرایش گروه" : "افزودن گروه جدید"}
        </CardTitle>
        {error && (
          <div className="text-sm text-destructive flex items-center justify-center gap-2 mt-2">
            <span>{errorMessage}</span>
            {retryCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={retrySave}
                disabled={isSaving}
                className="text-destructive hover:bg-destructive/10"
              >
                تلاش مجدد ({retryCount} از ۳)
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">نام گروه</Label>
            <Input
              id="name"
              {...register('name')}
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

          <CardFooter className="flex justify-end gap-4 p-0 pt-4">
            <CancelButton onClick={onCancel} disabled={isSaving} /> {/* Use CancelButton */}
            <Button
              type="submit"
              className="px-6 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              disabled={isSaving}
            >
              {isSaving ? (initialData ? "در حال ویرایش..." : "در حال افزودن...") : (initialData ? "ویرایش" : "افزودن")}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};

export default GroupForm;