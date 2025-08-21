import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/integrations/supabase/auth";
import { showError } from "@/utils/toast";

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

    setLoadingGroups(true);
    try {
      const { data, error } = await supabase
        .from("groups")
        .select("id, name, color")
        .eq("user_id", session.user.id)
        .order("name", { ascending: true });

      if (error) throw error;
      setGroups(data as Group[]);
    } catch (error: any) {
      console.error("Error fetching groups:", error);
      showError(`خطا در بارگذاری گروه‌ها: ${error.message || "خطای ناشناخته"}`);
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  }, [session, isSessionLoading]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return { groups, loadingGroups, fetchGroups };
};