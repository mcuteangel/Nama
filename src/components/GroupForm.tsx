import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import ColorPicker, { colors } from './ColorPicker'; // Corrected import statement and imported colors
import { useSession } from '@/integrations/supabase/auth'; // Import useSession

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
  onCancel?: () => void; // New optional prop for cancel action
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
    defaultValues: initialData || { name: '', color: '#60A5FA' }, // Default color blue-400, will be overridden
  });

  const selectedColor = watch('color');

  const findUniqueColor = useCallback((usedColors: string[]): string => {
    for (const color of colors) {
      if (!usedColors.includes(color)) {
        return color;
      }
    }
    return '#60A5FA'; // Fallback if all predefined colors are used
  }, []);

  useEffect(() => {
    const fetchExistingColorsAndSetDefault = async () => {
      if (isSessionLoading) {
        setIsFetchingColors(true); // Keep loading state true while session is loading
        return;
      }

      if (!session?.user) {
        setExistingGroupColors([]);
        setIsFetchingColors(false);
        // If no user, default color will be the fallback in findUniqueColor
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

        if (!initialData) { // Only set default color for new groups
          const uniqueColor = findUniqueColor(currentColors);
          setValue('color', uniqueColor);
        } else {
          // For existing groups, ensure the initial color is set
          setValue('color', initialData.color || findUniqueColor(currentColors));
        }
      } catch (error) {
        console.error("Error fetching existing group colors:", error);
        // Fallback to a default if fetching fails
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
    try {
      if (!session?.user) {
        toast.error('برای افزودن/ویرایش گروه باید وارد شوید.');
        navigate('/login');
        return;
      }
      const userId = session.user.id;

      let error = null;
      if (initialData) {
        // Update existing group
        const { error: updateError } = await supabase
          .from('groups')
          .update({ name: values.name, color: values.color, user_id: userId })
          .eq('id', initialData.id);
        error = updateError;
      } else {
        // Add new group
        const { error: insertError } = await supabase
          .from('groups')
          .insert({ name: values.name, color: values.color, user_id: userId });
        error = insertError;
      }

      if (error) {
        throw error;
      }

      toast.success(initialData ? 'گروه با موفقیت ویرایش شد.' : 'گروه با موفقیت اضافه شد.');
      onSuccess?.(); // Call onSuccess to handle closing dialog and refreshing list
      // Removed navigate('/groups'); as navigation should be handled by parent component
    } catch (error: any) {
      console.error('Error saving group:', error);
      toast.error(`خطا در ذخیره گروه: ${error.message || 'خطای ناشناخته'}`);
    }
  };

  const handleCancelClick = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/groups');
    }
  };

  if (isFetchingColors && !initialData) { // Show loading only for new group creation while fetching colors
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
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">نام گروه</Label>
            <Input
              id="name"
              {...register('name')}
              className="mt-1 block w-full bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100"
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="color" className="text-gray-700 dark:text-gray-300">رنگ گروه</Label>
            <ColorPicker selectedColor={selectedColor || '#60A5FA'} onSelectColor={(color) => setValue('color', color)} />
            {errors.color && <p className="text-red-500 text-sm mt-1">{errors.color.message}</p>}
          </div>

          <CardFooter className="flex justify-end gap-4 p-0 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelClick}
              className="px-6 py-2 rounded-md text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              disabled={isSubmitting}
            >
              لغو
            </Button>
            <Button
              type="submit"
              className="px-6 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? (initialData ? "در حال ویرایش..." : "در حال افزودن...") : (initialData ? "ویرایش" : "افزودن")}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};

export default GroupForm;