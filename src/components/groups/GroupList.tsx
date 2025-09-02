import { useEffect, useState, useCallback } from "react";
import { GlassButton } from "@/components/ui/glass-button";
import { Edit, Trash2, Users, PlusCircle, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/integrations/supabase/auth";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import GroupForm from "./GroupForm";
import { invalidateCache, fetchWithCache } from "@/utils/cache-helpers";
import LoadingMessage from "../common/LoadingMessage";
import CancelButton from "../common/CancelButton";
import { ErrorManager } from "@/lib/error-manager";
import EmptyState from '../common/EmptyState';
import LoadingSpinner from '../common/LoadingSpinner';
import { ModernCard } from "@/components/ui/modern-card";
import { useTranslation } from "react-i18next";

interface Group {
  id: string;
  name: string;
  color?: string;
  created_at?: string;
}

const GroupItem = ({ group, onGroupUpdated, onGroupDeleted }: { group: Group; onGroupUpdated: () => void; onGroupDeleted: () => void }) => {
  const { t } = useTranslation();
  const { session } = useSession();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!session?.user) {
      showError(t('groups.delete_auth_required'));
      return;
    }
    setIsDeleting(true);
    const toastId = showLoading(t('groups.deleting_group'));
    try {
      const { error } = await supabase
        .from("groups")
        .delete()
        .eq("id", group.id)
        .eq("user_id", session.user.id);

      if (error) throw error;
      showSuccess(t('groups.delete_success'));
      invalidateCache(`user_groups_${session.user.id}`);
      onGroupDeleted();
    } catch (error) {
      console.error("Error deleting group:", error);
      showError(`${t('groups.delete_error')}: ${(error as Error).message || t('errors.unknown')}`);
    } finally {
      dismissToast(toastId);
      setIsDeleting(false);
    }
  };

  return (
    <ModernCard 
      variant="glass" 
      hover="lift" 
      className="flex flex-col p-5 rounded-2xl shadow-lg border border-white/30 dark:border-gray-600/30 backdrop-blur-lg"
    >
      <div className="flex items-start gap-4 mb-4">
        <div 
          className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-white/50 dark:border-gray-400/50 shadow-lg glass-advanced" 
          style={{ backgroundColor: group.color || "#cccccc" }}
        >
          <Users size={24} className="text-white drop-shadow-md" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100 mb-1 drop-shadow-sm">
            {group.name}
          </h3>
          {group.color && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('groups.color')}:</span>
              <span 
                className="px-3 py-1 rounded-full text-white text-sm font-medium shadow-lg glass-advanced"
                style={{ backgroundColor: group.color }}
              >
                {group.color}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-3 mt-auto pt-4 border-t border-white/20 dark:border-gray-700/50">
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <GlassButton 
              variant="glass" 
              size="sm" 
              className="flex-1 flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100/30 dark:hover:bg-blue-400/20 transition-all duration-300 hover-lift py-2.5 border border-white/30 dark:border-gray-600/30"
            >
              <Edit size={18} />
              {t('actions.edit')}
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
            <GlassButton 
              variant="glass" 
              size="sm" 
              className="flex-1 flex items-center justify-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-100/30 dark:hover:bg-red-400/20 transition-all duration-300 hover-lift py-2.5 border border-white/30 dark:border-gray-600/30" 
              disabled={isDeleting}
            >
              {isDeleting ? <LoadingSpinner size={18} /> : <Trash2 size={18} />}
              {t('actions.delete')}
            </GlassButton>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass rounded-2xl p-6 shadow-2xl border border-white/30 dark:border-gray-600/30 backdrop-blur-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-800 dark:text-gray-100 text-xl">{t('groups.delete_confirm_title')}</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                {t('groups.delete_confirm_description')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <CancelButton onClick={() => {}} text={t('actions.cancel')} />
              <AlertDialogAction 
                onClick={handleDelete} 
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold hover-lift transition-all duration-300 shadow-md hover:shadow-lg"
                disabled={isDeleting}
              >
                {isDeleting && <LoadingSpinner size={18} className="me-2" />}
                {t('actions.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ModernCard>
  );
};

const GroupList = () => {
  const { t } = useTranslation();
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
    const toastId = showLoading(t('groups.loading'));

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
        showSuccess(t('groups.load_success'));
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      showError(`${t('groups.load_error')}: ${ErrorManager.getErrorMessage(error) || t('errors.unknown')}`);
      setGroups([]);
    } finally {
      dismissToast(toastId);
      setLoadingGroups(false);
    }
  }, [session, isSessionLoading, t]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  if (loadingGroups) {
    return <LoadingMessage message={t('groups.loading')} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <GlassButton
          onClick={() => setIsAddGroupDialogOpen(true)}
          className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-primary text-white font-bold shadow-xl transition-all duration-300 transform hover-lift text-lg border border-white/30 dark:border-gray-600/30 glass-advanced"
        >
          <PlusCircle size={24} />
          {t('groups.add_new')}
        </GlassButton>
      </div>

      <Dialog open={isAddGroupDialogOpen} onOpenChange={setIsAddGroupDialogOpen}>
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
          title={t('groups.empty_title')}
          description={t('groups.empty_description')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupItem
              key={group.id}
              group={group}
              onGroupUpdated={fetchGroups}
              onGroupDeleted={fetchGroups}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupList;




