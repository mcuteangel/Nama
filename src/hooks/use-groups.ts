import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/integrations/supabase/auth";
import { showError, showLoading, dismissToast, showSuccess } from "@/utils/toast"; // Import toast functions
import { fetchWithCache, invalidateCache } from "@/utils/cache-helpers"; // Import caching helpers

interface Group {
  id: string;
  name: string;
  color?: string;
}

export const useGroups = () => {
  const { session, isLoading: isSessionLoading } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const fetchGroups = useCallback(async () => {
    if (isSessionLoading) {
      setLoadingGroups(true);
      return;
    }

    if (!session?.user) {
      setGroups([]);
      setLoadingGroups(false);
      return;
    }

    const cacheKey = `user_groups_${session.user.id}`;
    
    setLoadingGroups(true);
    const toastId = showLoading("در حال بارگذاری گروه‌ها..."); // Add toast

    const { data, error } = await fetchWithCache<Group[]>(
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
      console.error("Error fetching groups:", error);
      showError(`خطا در بارگذاری گروه‌ها: ${error || "خطای ناشناخته"}`); // Fixed: Use error directly
      setGroups([]);
    } else {
      setGroups(data || []);
      showSuccess("گروه‌ها با موفقیت بارگذاری شدند."); // Add success toast
    }
    dismissToast(toastId); // Dismiss toast
    setLoadingGroups(false);
  }, [session, isSessionLoading]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return { groups, loadingGroups, fetchGroups };
};