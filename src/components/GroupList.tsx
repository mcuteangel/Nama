import React, { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Users, PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/integrations/supabase/auth";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import GroupForm from "./GroupForm";
import { invalidateCache } from "@/utils/cache-helpers"; // Import invalidateCache

interface Group {
  id: string;
  name: string;
  color?: string;
  created_at: string;
}

const GroupItem = ({ group, onGroupUpdated, onGroupDeleted }: { group: Group; onGroupUpdated: () => void; onGroupDeleted: () => void }) => {
  const { session } = useSession();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (!session?.user) {
      showError("برای حذف گروه باید وارد شوید.");
      return;
    }
    const toastId = showLoading("در حال حذف گروه...");
    try {
      const { error } = await supabase
        .from("groups")
        .delete()
        .eq("id", group.id)
        .eq("user_id", session.user.id); // Ensure user owns the group

      if (error) throw error;
      showSuccess("گروه با موفقیت حذف شد.");
      invalidateCache(`user_groups_${session.user.id}`); // Invalidate groups cache
      onGroupDeleted();
    } catch (error: any) {
      console.error("Error deleting group:", error);
      showError(`خطا در حذف گروه: ${error.message || "خطای ناشناخته"}`);
    } finally {
      dismissToast(toastId);
    }
  };

  return (
    <Card className="flex items-center justify-between p-4 glass rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center border border-white/50 dark:border-gray-600/50" style={{ backgroundColor: group.color || "#cccccc" }}>
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
            <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-600/50 transition-all duration-200">
              <Edit size={20} />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] p-0 border-none bg-transparent shadow-none">
            <GroupForm
              initialData={group}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                invalidateCache(`user_groups_${session?.user?.id}`); // Invalidate groups cache
                onGroupUpdated();
              }}
              onCancel={() => setIsEditDialogOpen(false)} // Pass onCancel to close dialog
            />
          </DialogContent>
        </Dialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-600/50 transition-all duration-200">
              <Trash2 size={20} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass rounded-xl p-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-800 dark:text-gray-100">آیا از حذف این گروه مطمئن هستید؟</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                این عمل قابل بازگشت نیست. این گروه برای همیشه حذف خواهد شد.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100">لغو</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold">حذف</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
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

    const toastId = showLoading("در حال بارگذاری گروه‌ها...");
    setLoadingGroups(true);

    try {
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .eq("user_id", session.user.id)
        .order("name", { ascending: true });

      if (error) throw error;

      setGroups(data as Group[]);
      showSuccess("گروه‌ها با موفقیت بارگذاری شدند.");
    } catch (error: any) {
      console.error("Error fetching groups:", error);
      showError(`خطا در بارگذاری گروه‌ها: ${error.message || "خطای ناشناخته"}`);
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
    return <p className="text-center text-gray-500 dark:text-gray-400">در حال بارگذاری گروه‌ها...</p>;
  }

  return (
    <div className="space-y-4">
      <Dialog open={isAddGroupDialogOpen} onOpenChange={setIsAddGroupDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="w-full px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
          >
            {/* Wrap the children in a single span */}
            <span className="flex items-center gap-2">
              <PlusCircle size={20} className="me-2" />
              افزودن گروه جدید
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] p-0 border-none bg-transparent shadow-none">
          <GroupForm
            onSuccess={() => {
              setIsAddGroupDialogOpen(false);
              invalidateCache(`user_groups_${session?.user?.id}`); // Invalidate groups cache
              fetchGroups();
            }}
            onCancel={() => setIsAddGroupDialogOpen(false)} // Pass onCancel to close dialog
          />
        </DialogContent>
      </Dialog>

      {groups.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">هیچ گروهی یافت نشد.</p>
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