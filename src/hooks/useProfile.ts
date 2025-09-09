import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/integrations/supabase/auth';
import { fetchWithCache, invalidateCache } from '@/utils/cache-helpers';
import { ErrorManager } from '@/lib/error-manager';
import { showSuccess, showError } from '@/utils/toast';
import { useTranslation } from 'react-i18next';

export interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  phone?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  location?: string | null;
  birthday?: string | null;
}

export interface UseProfileReturn {
  profile: ProfileData | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
  retryOperation: () => Promise<void>;
}

export const useProfile = (): UseProfileReturn => {
  const { session, isLoading: isSessionLoading } = useSession();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  // Declare fetchProfile first so it can be referenced by other functions
  const fetchProfile = useCallback(async (showToast = false) => {
    if (isSessionLoading || !session?.user) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cacheKey = `user_profile_${session.user.id}`;
      const { data, error: fetchError, fromCache } = await fetchWithCache<ProfileData>(
        cacheKey,
        async () => {
          const { data, error } = await supabase
            .from('profiles')
            .select('first_name, last_name, phone, bio, avatar_url, location, birthday')
            .eq('id', session.user.id)
            .maybeSingle();

          if (error) {
            return { data: null, error: error.message || t('errors.profile_info_error') };
          }
          return { data, error: null };
        }
      );

      if (fetchError) {
        throw new Error(fetchError);
      }

      setProfile(data);
      if (showToast && !fromCache) {
        showSuccess(t('system_messages.profile_loaded_success'));
      }
    } catch (err) {
      const errorMessage = ErrorManager.getErrorMessage(err as Error);
      setError(errorMessage);
      
      if (retryCount.current < maxRetries) {
        showError(t('errors.profile_load_retry', { 
          message: errorMessage,
          retryCount: retryCount.current + 1,
          maxRetries
        }));
      } else {
        showError(t('errors.profile_load_error', { message: errorMessage }));
      }
      
      ErrorManager.logError(err as Error, { component: "useProfile", action: "fetchProfile" });
    } finally {
      setLoading(false);
    }
  }, [session, isSessionLoading, t]);

  const clearError = useCallback(() => {
    setError(null);
    retryCount.current = 0;
  }, []);

  const retryOperation = useCallback(async () => {
    if (retryCount.current < maxRetries) {
      retryCount.current += 1;
      await fetchProfile(true);
    } else {
      showError(t('errors.max_retries_exceeded'));
    }
  }, [t]); // Removed fetchProfile from dependencies to break circular dependency

  const updateProfile = useCallback(async (data: Partial<ProfileData>) => {
    if (!session?.user) {
      throw new Error(t('errors.update_profile_auth'));
    }

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: session.user.id,
            ...data,
          },
          { onConflict: 'id' }
        );

      if (updateError) {
        throw new Error(updateError.message || t('errors.save_profile_error'));
      }

      // Invalidate cache and refresh profile
      const cacheKey = `user_profile_${session.user.id}`;
      invalidateCache(cacheKey);

      await fetchProfile(false);
      showSuccess(t('system_messages.profile_update_success'));
    } catch (err) {
      const errorMessage = ErrorManager.getErrorMessage(err as Error);
      setError(errorMessage);
      showError(t('errors.update_profile_error', { message: errorMessage }));
      ErrorManager.logError(err as Error, { component: "useProfile", action: "updateProfile" });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [session, fetchProfile, t]);

  const refreshProfile = useCallback(async () => {
    await fetchProfile(false);
  }, [fetchProfile]);

  // Initial fetch
  useEffect(() => {
    fetchProfile(false);
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile,
    clearError,
    retryOperation
  };
};