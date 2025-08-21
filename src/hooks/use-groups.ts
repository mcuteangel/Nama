import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/integrations/supabase/auth";
import { showError } from "@/utils/toast";
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

    const { data, error } = await fetchWithCache<Group[]>(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from("groups")
          .select("id, name, color")
          .eq("user_id", session.user.id)
          .order("name", { ascending: true });

        return { data: data as Group[], error: error?.message || null };
      },
      {
        loadingMessage: "در حال بارگذاری گروه‌ها...",
        successMessage: "گروه‌ها با موفقیت بارگذاری شدند.",
        errorMessage: "خطا در بارگذاری گروه‌ها",
      }
    );

    if (error) {
      console.error("Error fetching groups:", error);
      setGroups([]);
    } else {
      setGroups(data || []);
    }
    setLoadingGroups(false);
  }, [session, isSessionLoading]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return { groups, loadingGroups, fetchGroups };
};