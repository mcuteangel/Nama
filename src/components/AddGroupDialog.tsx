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
  onGroupAdded: () => void;
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

  const {
    isLoading: isFetchingColors,
    error: fetchColorsError, // Get error state
    errorMessage: fetchColorsErrorMessage, // Get error message
    executeAsync: executeFetchColors,
  } = useErrorHandler(null, {
    showToast: true, // Keep toast for errors
    customErrorMessage: "خطا در بارگذاری رنگ‌های گروه‌های موجود.",
    onError: (err) => {
      console.error("Error fetching existing group colors in AddGroupDialog:", err);
      setInitialColor('#60A5FA'); // Fallback to default color on error
    }
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

        const currentColors = data.map(g => g.color).filter(Boolean) as string[];
        setExistingGroupColors(currentColors);
        setInitialColor(findUniqueColor(currentColors));
      });
    };

    if (open) { // Only fetch colors when the dialog is opened
      fetchColors();
    }
  }, [session, isSessionLoading, open, findUniqueColor, executeFetchColors]);

  const handleSuccess = () => {
    onOpenChange(false); // Close dialog on success
    onGroupAdded();
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
        ) : fetchColorsError ? ( // Display error message if fetching colors failed
          <div className="w-full max-w-md glass rounded-xl p-6 bg-white/90 dark:bg-gray-900/90 text-center text-red-500 dark:text-red-400">
            <p>{fetchColorsErrorMessage}</p>
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