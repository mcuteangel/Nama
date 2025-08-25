import React, { useState, useCallback, useEffect } from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import GroupForm from "./GroupForm";
import FormDialogWrapper from "./FormDialogWrapper";
import { useSession } from '@/integrations/supabase/auth';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { ErrorManager } from '@/lib/error-manager';
import LoadingMessage from './LoadingMessage';
import { colors } from './ColorPicker'; // Import colors array

interface AddGroupDialogProps {
  onGroupAdded: (newGroupId?: string) => void; // Modified to accept new group ID
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddGroupDialog: React.FC<AddGroupDialogProps> = ({ onGroupAdded, open, onOpenChange }) => {
  const { session, isLoading: isSessionLoading } = useSession();
  const [existingGroupColors, setExistingGroupColors] = useState<string[]>([]);
  const [initialColor, setInitialColor] = useState<string>('#60A5FA'); // Default color

  const findUniqueColor = useCallback((usedColors: string[]): string => {
    for (const color of colors) {
      if (!usedColors.includes(color)) {
        return color;
      }
    }
    return '#60A5FA';
  }, []);

  const onSuccessFetchColors = useCallback((result: any) => {
    const currentColors = result.data.map((g: { color: string }) => g.color).filter(Boolean) as string[];
    setExistingGroupColors(currentColors);
    setInitialColor(findUniqueColor(currentColors));
  }, [findUniqueColor]);

  const onErrorFetchColors = useCallback((err: Error) => {
    console.error("Error fetching existing group colors in AddGroupDialog:", err);
    ErrorManager.notifyUser("خطا در بارگذاری رنگ‌های گروه‌های موجود.", 'error');
    setInitialColor('#60A5FA'); // Fallback to default color on error
  }, []);

  const {
    isLoading: isFetchingColors,
    error: fetchColorsError,
    executeAsync: executeFetchColors,
  } = useErrorHandler(null, {
    showToast: false, // Handled by onErrorFetchColors callback
    onSuccess: onSuccessFetchColors,
    onError: onErrorFetchColors,
  });

  useEffect(() => {
    const fetchColors = async () => {
      if (isSessionLoading || !session?.user) {
        setExistingGroupColors([]);
        setInitialColor('#60A5FA');
        return;
      }

      await executeFetchColors(async () => {
        const { data, error } = await supabase
          .from('groups')
          .select('color')
          .eq('user_id', session.user.id);

        if (error) throw error;

        return { data, error: null }; // Return data in expected format for onSuccess
      });
    };

    if (open) { // Only fetch colors when the dialog is opened
      fetchColors();
    }
  }, [session, isSessionLoading, open, executeFetchColors]);

  const handleSuccess = (newGroupId?: string) => { // Receive new group ID
    onOpenChange(false); // Close dialog on success
    onGroupAdded(newGroupId); // Pass the new group's ID
  };

  const handleCancel = () => {
    onOpenChange(false); // Close dialog on cancel
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          <span className="flex items-center gap-1">
            <Plus size={16} />
            افزودن گروه جدید
          </span>
        </Button>
      </DialogTrigger>
      <FormDialogWrapper>
        {isFetchingColors ? (
          <div className="w-full max-w-md glass rounded-xl p-6 bg-white/90 dark:bg-gray-900/90">
            <LoadingMessage message="در حال آماده‌سازی فرم گروه..." />
          </div>
        ) : fetchColorsError ? (
          <div className="w-full max-w-md glass rounded-xl p-6 bg-white/90 dark:bg-gray-900/90 text-center text-red-500 dark:text-red-400">
            <p>{fetchColorsError.message}</p>
            <Button onClick={() => onOpenChange(false)} className="mt-4">بستن</Button>
          </div>
        ) : (
          <GroupForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            initialData={{ name: '', color: initialColor }} // Pass initial color
          />
        )}
      </FormDialogWrapper>
    </Dialog>
  );
};

export default AddGroupDialog;