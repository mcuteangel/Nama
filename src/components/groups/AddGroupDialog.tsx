import React, { useState, useCallback, useEffect } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import GroupForm from "./GroupForm";
import { useSession } from '@/integrations/supabase/auth';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { ErrorManager } from '@/lib/error-manager';
import LoadingMessage from '../common/LoadingMessage';
import { colors } from '../common/ColorPicker';
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
  const [initialColor, setInitialColor] = useState<string>('#60A5FA');

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

  if (isSessionLoading) {
    return <LoadingMessage message={t('common.loading')} />;
  }

  if (!session) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <GradientGlassButton className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            {t('groups.add_group')}
          </GradientGlassButton>
        </DialogTrigger>
        <DialogContent className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-white/30 dark:border-gray-700/50 shadow-2xl p-0 overflow-hidden">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('groups.add_group')}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <p className="text-gray-600 dark:text-gray-300">
                {t('groups.login_required')}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
      <DialogContent className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-white/30 dark:border-gray-700/50 shadow-2xl p-0 overflow-hidden">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('groups.add_title')}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddGroupDialog;