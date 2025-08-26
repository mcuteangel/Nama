import { useState, useCallback, useMemo } from 'react';
import { useSession } from '@/integrations/supabase/auth';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { ErrorManager } from '@/lib/error-manager';
import { useTranslation } from 'react-i18next';
import { colors } from '@/components/common/ColorPicker';

interface UseGroupColorManagementReturn {
  existingGroupColors: string[];
  initialColor: string;
  memoizedInitialColor: string;
  isLoading: boolean;
  error: Error | null;
  fetchColorsWhenNeeded: () => Promise<void>;
}

/**
 * Custom hook for managing group colors
 * Handles fetching existing colors, finding unique colors, and managing state
 */
export const useGroupColorManagement = (): UseGroupColorManagementReturn => {
  const { session, isLoading: isSessionLoading } = useSession();
  const { t } = useTranslation();
  const [existingGroupColors, setExistingGroupColors] = useState<string[]>([]);
  const [initialColor, setInitialColor] = useState<string>('#60A5FA');

  // Memoize the unique color finder for performance
  const findUniqueColor = useCallback((usedColors: string[]): string => {
    for (const color of colors) {
      if (!usedColors.includes(color)) {
        return color;
      }
    }
    return '#60A5FA'; // Default fallback color
  }, []);

  // Memoize the initial color to prevent unnecessary recalculations
  const memoizedInitialColor = useMemo(() => {
    return findUniqueColor(existingGroupColors);
  }, [existingGroupColors, findUniqueColor]);

  const onSuccessFetchColors = useCallback((result: { 
    data: { color: string }[] | null; 
    error: string | null; 
    fromCache: boolean 
  }) => {
    const currentColors = result.data?.map((g: { color: string }) => g.color).filter(Boolean) as string[] || [];
    setExistingGroupColors(currentColors);
    setInitialColor(findUniqueColor(currentColors));
  }, [findUniqueColor]);

  const onErrorFetchColors = useCallback((err: Error) => {
    console.error("Error fetching existing group colors:", err);
    ErrorManager.notifyUser(t('settings.error_loading_group_colors'), 'error');
    setInitialColor('#60A5FA');
    setExistingGroupColors([]);
  }, [t]);

  const {
    isLoading,
    error,
    executeAsync: executeFetchColors,
  } = useErrorHandler(null, {
    showToast: false,
    onSuccess: onSuccessFetchColors,
    onError: onErrorFetchColors,
  });

  const fetchColorsWhenNeeded = useCallback(async () => {
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

      return { data, error: null, fromCache: false };
    });
  }, [session, isSessionLoading, executeFetchColors]);

  return {
    existingGroupColors,
    initialColor,
    memoizedInitialColor,
    isLoading,
    error,
    fetchColorsWhenNeeded,
  };
};