import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/integrations/supabase/auth";
import { fetchWithCache, invalidateCache } from "@/utils/cache-helpers";
import { useErrorHandler } from "./use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import { useTranslation } from "react-i18next";

interface Group {
  id: string;
  name: string;
  color?: string;
}

export const useGroups = () => {
  const { session, isLoading: isSessionLoading } = useSession();
  const { t } = useTranslation();
  const [groups, setGroups] = useState<Group[]>([]);

  const onSuccessGroups = useCallback((result: { data: Group[] | null; error: string | null; fromCache: boolean }) => {
    if (result && !result.fromCache) {
      ErrorManager.notifyUser(t('groups.load_success'), 'success');
    }
  }, [t]);

  const onErrorGroups = useCallback((err: unknown) => {
    ErrorManager.logError(err, { component: 'useGroups', action: 'fetchGroups' });
  }, []);

  const {
    isLoading: loadingGroups,
    executeAsync,
  } = useErrorHandler<{ data: Group[] | null; error: string | null; fromCache: boolean }>(null, {
    maxRetries: 3,
    retryDelay: 1000,
    showToast: false,
    customErrorMessage: t('groups.load_error'),
    onSuccess: onSuccessGroups,
    onError: onErrorGroups,
  });

  // Memoize the cache key to prevent unnecessary re-renders
  const cacheKey = useMemo(() => {
    const key = `user_groups_${session?.user?.id}`;
    console.log('Cache key generated:', key);
    return key;
  }, [session?.user?.id]);

  const fetchGroups = useCallback(async () => {
    if (isSessionLoading || !session?.user) {
      setGroups([]);
      return;
    }

    await executeAsync(async () => {
      const { data, error, fromCache } = await fetchWithCache<Group[]>(
        cacheKey,
        async () => {
          const { data, error } = await supabase
            .from("groups")
            .select("id, name, color")
            .eq("user_id", session.user.id)
            .order("name", { ascending: true });

          return { data: data as Group[], error: error?.message || null };
        }
      );

      if (error) {
        throw new Error(error);
      }
      setGroups(data || []);
      return { data, error: null, fromCache };
    });
  }, [session, isSessionLoading, executeAsync, cacheKey]);

  // Add a function to refresh groups when needed
  const refreshGroups = useCallback(() => {
    invalidateCache(cacheKey);
    fetchGroups();
  }, [cacheKey, fetchGroups]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(() => ({
    groups,
    loadingGroups,
    fetchGroups,
    refreshGroups
  }), [groups, loadingGroups, fetchGroups, refreshGroups]);
};