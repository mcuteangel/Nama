import React, { useEffect, useState, useCallback } from "react";
import { GlassButton } from "@/components/ui/glass-button";
import { Edit, Trash2, Users, PlusCircle, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/integrations/supabase/auth";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import GroupForm from "./GroupForm";
import { invalidateCache, fetchWithCache } from "@/utils/cache-helpers";
import LoadingMessage from "../common/LoadingMessage";
import CancelButton from "../common/CancelButton";
import { ErrorManager } from "@/lib/error-manager";
import EmptyState from '../common/EmptyState';
import LoadingSpinner from '../common/LoadingSpinner';
import { ModernCard } from "@/components/ui/modern-card";

interface Group {
  id: string;
  name: string;
  color?: string;
  created_at: string;
}

const GroupItem = ({ group, onGroupUpdated, onGroupDeleted }: { group: Group; onGroupUpdated: () => void; onGroupDeleted: () => void }) => {
  const { session } = useSession();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!session?.user) {
      showError("برای حذف گروه باید وارد شوید.");
      return;
    }
    setIsDeleting(true);
    const toastId = showLoading("در حال حذف گروه...");
    try {
      const { error } = await supabase
        .from("groups")
        .delete()
        .eq("id", group.id)
        .eq("user_id", session.user.id);

      if (error) throw error;
      showSuccess("گروه با موفقیت حذف شد.");
      invalidateCache(`user_groups_${session.user.id}`);
      onGroupDeleted();
    } catch (error: any) {
      console.error("Error deleting group:", error);
      showError(`خطا در حذف گروه: ${error.message || "خطای ناشناخته"}`);
    } finally {
      dismissToast(toastId);
      setIsDeleting(false);
    }
  };

  return (
    <ModernCard variant="glass" hover="lift" className="flex items-center justify-between p-4 rounded-lg">
      <div className="flex items-center gap-4">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center border border-white/50 dark:border-gray-600/50" 
          style={{ backgroundColor: group.color || "#cccccc" }}
        >
          <Users size={20} className="text-white" />
        </div>
        <div>
          <p className="font-semibold text-lg text-gray-800 dark:text-gray-100">
            {group.name}
          </p>
          {group.color && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              رنگ: {group.color}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <GlassButton variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-600/50 transition-all duration-200">
              <Edit size={20} />
            </GlassButton>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] p-0 border-none bg-transparent shadow-none">
            <GroupForm
              initialData={group}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                invalidateCache(`user_groups_${session?.user?.id}`);
                onGroupUpdated();
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <GlassButton variant="ghost" size="icon" className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-600/50 transition-all duration-200" disabled={isDeleting}>
              {isDeleting ? <LoadingSpinner size={20} /> : <Trash2 size={20} />}
            </GlassButton>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass rounded-xl p-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-800 dark:text-gray-100">آیا از حذف این گروه مطمئن هستید؟</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                این عمل قابل بازگشت نیست. این گروه برای همیشه حذف خواهد شد.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <CancelButton onClick={() => {}} text="لغو" />
              <AlertDialogAction onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold" disabled={isDeleting}>
                {isDeleting && <LoadingSpinner size={16} className="me-2" />}
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ModernCard>
  );
};

const GroupList = () => {
  const { session, isLoading: isSessionLoading } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);

  const fetchGroups = useCallback(async () => {
    if (isSessionLoading) return;

    if (!session?.user) {
      setGroups([]);
      setLoadingGroups(false);
      return;
    }

    setLoadingGroups(true);
    const cacheKey = `user_groups_${session.user.id}`;
    const toastId = showLoading("در حال بارگذاری گروه‌ها...");

    try {
      const { data, error, fromCache } = await fetchWithCache<Group[]>(
        cacheKey,
        async () => {
          const { data, error } = await supabase
            .from("groups")
            .select("*")
            .eq("user_id", session.user.id)
            .order("name", { ascending: true });

          if (error) throw error;

          return { data: data as Group[], error: null };
        }
      );

      if (error) {
        throw new Error(error);
      }

      setGroups(data as Group[]);
      if (!fromCache) {
        showSuccess("گروه‌ها با موفقیت بارگذاری شدند.");
      }
    } catch (error: any) {
      console.error("Error fetching groups:", error);
      showError(`خطا در بارگذاری گروه‌ها: ${ErrorManager.getErrorMessage(error) || "خطای ناشناخته"}`);
      setGroups([]);
    } finally {
      dismissToast(toastId);
      setLoadingGroups(false);
    }
  }, [session, isSessionLoading]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  if (loadingGroups) {
    return <LoadingMessage message="در حال بارگذاری گروه‌ها..." />;
  }

  return (
    <div className="space-y-4">
      <Dialog open={isAddGroupDialogOpen} onOpenChange={setIsAddGroupDialogOpen}>
        <DialogTrigger asChild>
          <GlassButton
            className="w-full px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
          >
            <span className="flex items-center gap-2">
              <PlusCircle size={20} className="me-2" />
              افزودن گروه جدید
            </span>
          </GlassButton>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] p-0 border-none bg-transparent shadow-none">
          <GroupForm
            onSuccess={() => {
              setIsAddGroupDialogOpen(false);
              invalidateCache(`user_groups_${session?.user?.id}`);
              fetchGroups();
            }}
            onCancel={() => setIsAddGroupDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {groups.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="هیچ گروهی یافت نشد."
          description="برای سازماندهی مخاطبین خود، یک گروه جدید اضافه کنید."
        />
      ) : (
        groups.map((group) => (
          <GroupItem
            key={group.id}
            group={group}
            onGroupUpdated={fetchGroups}
            onGroupDeleted={fetchGroups}
          />
        ))
      )}
    </div>
  );
};

export default GroupList;





