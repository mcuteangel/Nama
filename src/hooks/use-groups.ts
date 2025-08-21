import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/integrations/supabase/auth";
import { fetchWithCache, invalidateCache } from "@/utils/cache-helpers";
import { useErrorHandler } from "./use-error-handler";
import { ErrorManager } from "@/lib/error-manager";

interface Group {
  id: string;
  name: string;
  color?: string;
}

export const useGroups = () => {
  const { session, isLoading: isSessionLoading } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);

  const onSuccessGroups = useCallback((result: { data: Group[] | null; error: string | null; fromCache: boolean }) => {
    if (result && !result.fromCache) {
      ErrorManager.notifyUser("گروه‌ها با موفقیت بارگذاری شدند.", 'success');
    }
  }, []);

  const onErrorGroups = useCallback((err) => {
    ErrorManager.logError(err, { component: 'useGroups', action: 'fetchGroups' });
  }, []);

  const {
    isLoading: loadingGroups,
    executeAsync,
  } = useErrorHandler<{ data: Group[] | null; error: string | null; fromCache: boolean }>(null, { // Explicitly define TResult here
    maxRetries: 3,
    retryDelay: 1000,
    showToast: true,
    customErrorMessage: "خطا در بارگذاری گروه‌ها",
    onSuccess: onSuccessGroups,
    onError: onErrorGroups,
  });

  const fetchGroups = useCallback(async () => {
    if (isSessionLoading || !session?.user) {
      setGroups([]);
      return;
    }

    const cacheKey = `user_groups_${session.user.id}`;
    
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
      return { data, error: null, fromCache }; // Added error: null
    });
  }, [session, isSessionLoading, executeAsync]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return { groups, loadingGroups, fetchGroups };
};