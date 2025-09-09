import React, { useState, useCallback, useEffect } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Plus, Sparkles, Palette, Users, Zap } from "lucide-react";
import GroupForm from "./GroupForm";
import { useSession } from '@/integrations/supabase/auth';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { ErrorManager } from '@/lib/error-manager';
import LoadingMessage from '../common/LoadingMessage';
import LoadingSpinner from '../common/LoadingSpinner';
import { colors } from '../common/ColorPicker';
import { useTranslation } from 'react-i18next';
import { GlassButton, GradientGlassButton } from "@/components/ui/glass-button";
import { ModernCard } from "@/components/ui/modern-card";

interface FetchColorsResult {
  data: { color: string }[];
  error: null;
}

interface AddGroupDialogProps {
  onGroupAdded: (newGroupId?: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddGroupDialog: React.FC<AddGroupDialogProps> = ({ onGroupAdded, open, onOpenChange }) => {
  const { t } = useTranslation();
  const { session, isLoading: isSessionLoading } = useSession();
  const [, setExistingGroupColors] = useState<string[]>([]);
  const [initialColor, setInitialColor] = useState<string>('#60A5FA');
  const [isAnimating, setIsAnimating] = useState(false);

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
    setInitialColor('#60A5FA');
  }, [t]);

  const {
    isLoading: isFetchingColors,
    error: fetchColorsError,
    executeAsync: executeFetchColors,
  } = useErrorHandler(null, {
    showToast: false,
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

        return { data, error: null };
      });
    };

    if (open) {
      setIsAnimating(true);
      fetchColors();
      setTimeout(() => setIsAnimating(false), 500);
    }
  }, [session, isSessionLoading, open, executeFetchColors]);

  const handleSuccess = (newGroupId?: string) => {
    onOpenChange(false);
    onGroupAdded(newGroupId);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (isSessionLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <LoadingSpinner size={32} className="text-purple-500 mx-auto" />
          <LoadingMessage message={t('common.loading')} />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <GradientGlassButton className="px-8 py-4 rounded-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-xl hover:shadow-purple-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 flex items-center gap-3">
            <Plus size={24} />
            <span>{t('groups.add_group')}</span>
          </GradientGlassButton>
        </DialogTrigger>
        <DialogContent className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl border-2 border-white/40 dark:border-gray-600/40 shadow-3xl p-0 overflow-hidden max-w-md">
          <div className="p-8 text-center">
            <div className="relative mb-6">
              <Users size={48} className="text-gray-400 mx-auto" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-ping"></div>
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              {t('groups.login_required_title', 'ورود لازم است')}
            </DialogTitle>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t('groups.login_required')}
            </p>
            <GlassButton
              onClick={() => onOpenChange(false)}
              className="px-6 py-3 rounded-2xl font-semibold hover:scale-105 transition-all duration-300"
            >
              {t('actions.close')}
            </GlassButton>
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
          className="flex items-center justify-center gap-3 px-6 py-3 rounded-2xl font-bold text-lg shadow-xl hover:shadow-purple-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 bg-gradient-to-r from-purple-500 via-blue-600 to-indigo-600 hover:from-purple-600 hover:via-blue-700 hover:to-indigo-700 text-white"
        >
          <div className="relative">
            <Plus size={24} />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
          </div>
          <span>{t('actions.add_new_group')}</span>
        </GradientGlassButton>
      </DialogTrigger>

      <DialogContent className={`
        bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl rounded-3xl border-2 border-white/50 dark:border-gray-600/50 shadow-3xl p-0 overflow-hidden max-w-2xl w-full
        transition-all duration-500 ease-out
        ${isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
        hover:shadow-purple-500/20 dark:hover:shadow-purple-900/30
      `}>
        <div className="relative">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-indigo-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

          {/* Header with enhanced design */}
          <div className="relative p-8 pb-6 border-b border-white/30 dark:border-gray-700/50">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-xl transform transition-all duration-300 hover:scale-110">
                  <Plus size={32} className="text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>

              <div className="text-center">
                <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {t('groups.add_title')}
                </DialogTitle>
                <p className="text-lg text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2">
                  <Sparkles size={18} className="text-yellow-500" />
                  <span>{t('groups.create_new_group_desc', 'یک گروه جدید بسازید')}</span>
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 rounded-2xl p-4 border border-blue-200/30 dark:border-blue-800/30 backdrop-blur-sm text-center">
                <Palette size={20} className="text-blue-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {t('groups.color_picker', 'انتخاب رنگ')}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 rounded-2xl p-4 border border-green-200/30 dark:border-green-800/30 backdrop-blur-sm text-center">
                <Zap size={20} className="text-green-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-green-600 dark:text-green-400">
                  {t('groups.smart_suggestions', 'پیشنهاد هوشمند')}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-500/20 dark:to-purple-600/20 rounded-2xl p-4 border border-purple-200/30 dark:border-purple-800/30 backdrop-blur-sm text-center">
                <Users size={20} className="text-purple-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  {t('groups.organize_contacts', 'سازماندهی مخاطبین')}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative p-8">
            {isFetchingColors ? (
              <ModernCard className="w-full rounded-2xl p-8 border-2 border-white/40 dark:border-gray-600/40 backdrop-blur-sm bg-white/60 dark:bg-gray-700/60">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <LoadingSpinner size={48} className="text-purple-500 mx-auto" />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full animate-pulse"></div>
                  </div>
                  <LoadingMessage message={t('system_messages.preparing_group_form')} />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t('groups.preparing_colors', 'در حال آماده‌سازی رنگ‌های منحصر به فرد...')}
                  </p>
                </div>
              </ModernCard>
            ) : fetchColorsError ? (
              <ModernCard className="w-full rounded-2xl p-8 border-2 border-red-200/40 dark:border-red-800/40 backdrop-blur-sm bg-red-50/60 dark:bg-red-900/20 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mx-auto">
                    <div className="w-8 h-8 bg-white rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">
                      {t('errors.color_load_failed', 'خطا در بارگذاری رنگ‌ها')}
                    </h3>
                    <p className="text-red-500 dark:text-red-300 text-sm">
                      {fetchColorsError.message}
                    </p>
                  </div>
                  <GlassButton
                    onClick={() => onOpenChange(false)}
                    className="px-6 py-3 rounded-2xl font-semibold hover:scale-105 transition-all duration-300 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
                  >
                    {t('actions.close')}
                  </GlassButton>
                </div>
              </ModernCard>
            ) : (
              <div className="space-y-6">
                {/* Success message preview */}
                <div className="bg-gradient-to-r from-green-50/60 to-emerald-50/60 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-4 border border-green-200/30 dark:border-green-800/30 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">
                        {t('groups.success_preview', 'پس از ایجاد گروه، به طور خودکار به لیست گروه‌ها اضافه خواهد شد')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <GroupForm
                  onSuccess={handleSuccess}
                  onCancel={handleCancel}
                  initialData={{ name: '', color: initialColor }}
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddGroupDialog;