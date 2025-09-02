import React, { useState, useCallback, useEffect } from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import GroupForm from "./GroupForm";
import FormDialogWrapper from "../common/FormDialogWrapper";
import { useSession } from '@/integrations/supabase/auth';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { ErrorManager } from '@/lib/error-manager';
import LoadingMessage from '../common/LoadingMessage';
import { colors } from '../common/ColorPicker'; // Import colors array
import { useTranslation } from 'react-i18next';
import { GlassButton, GradientGlassButton } from "@/components/ui/glass-button";
import { ModernCard } from "@/components/ui/modern-card";

interface FetchColorsResult {
  data: { color: string }[];
  error: null;
}

interface AddGroupDialogProps {
  onGroupAdded: (newGroupId?: string) => void; // Modified to accept new group ID
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddGroupDialog: React.FC<AddGroupDialogProps> = ({ onGroupAdded, open, onOpenChange }) => {
  const { t } = useTranslation();
  const { session, isLoading: isSessionLoading } = useSession();
  const [, setExistingGroupColors] = useState<string[]>([]);
  const [initialColor, setInitialColor] = useState<string>('#60A5FA'); // Default color

  const findUniqueColor = useCallback((usedColors: string[]): string => {
    for (const color of colors) {
      if (!usedColors.includes(color)) {
        return color;
      }
    }
    return '#60A5FA';
  }, []);

  const onSuccessFetchColors = useCallback((result: FetchColorsResult) => {
    const currentColors = result.data.map((g: { color: string }) => g.color).filter(Boolean) as string[];
    setExistingGroupColors(currentColors);
    setInitialColor(findUniqueColor(currentColors));
  }, [findUniqueColor]);

  const onErrorFetchColors = useCallback((err: Error) => {
    console.error("Error fetching existing group colors in AddGroupDialog:", err);
    ErrorManager.notifyUser(t('errors.loading_group_colors'), 'error');
    setInitialColor('#60A5FA'); // Fallback to default color on error
  }, [t]);

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
        <GradientGlassButton
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold shadow-lg hover-lift"
        >
          <Plus size={18} />
          {t('actions.add_new_group')}
        </GradientGlassButton>
      </DialogTrigger>
      <FormDialogWrapper 
        title={t('groups.add_title')}
        description={t('groups.add_description', 'Form for creating a new contact group')}
      >
        {isFetchingColors ? (
          <ModernCard className="w-full max-w-md rounded-xl p-6">
            <LoadingMessage message={t('system_messages.preparing_group_form')} />
          </ModernCard>
        ) : fetchColorsError ? (
          <ModernCard className="w-full max-w-md rounded-xl p-6 text-center text-red-500 dark:text-red-400">
            <p>{fetchColorsError.message}</p>
            <GlassButton onClick={() => onOpenChange(false)} className="mt-4">{t('actions.close')}</GlassButton>
          </ModernCard>
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