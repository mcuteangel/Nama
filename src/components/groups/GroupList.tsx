import { useEffect, useState, useCallback } from "react";
import { GlassButton, GradientGlassButton } from "@/components/ui/glass-button";
import { Edit, Trash2, Users, PlusCircle, Tag, Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/integrations/supabase/auth";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import GroupForm from "./GroupForm";
import { invalidateCache, fetchWithCache } from "@/utils/cache-helpers";
import LoadingMessage from "../common/LoadingMessage";
import { ErrorManager } from "@/lib/error-manager";
import EmptyState from '../common/EmptyState';
import LoadingSpinner from '../common/LoadingSpinner';
import { ModernCard } from "@/components/ui/modern-card";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";

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
  const [isHovered, setIsHovered] = useState(false);

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
      className="relative group overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-900/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10 flex flex-col h-full p-6">
        <div className="flex items-start gap-5">
          <div
            className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
            style={{
              backgroundColor: group.color || '#60A5FA',
              boxShadow: `0 8px 32px ${(group.color || '#60A5FA')}40`
            }}
          >
            <Users size={28} className="text-white/90 drop-shadow-md" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-2 truncate">
              {group.name}
            </h3>
            {group.color && (
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white/90"
                  style={{
                    backgroundColor: `${group.color}30`,
                    border: `1px solid ${group.color}50`,
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full mr-2"
                    style={{ backgroundColor: group.color }}
                  />
                  {group.color.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={`flex gap-3 mt-6 pt-4 border-t border-white/10 dark:border-gray-700/30 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <GlassButton
              variant="ghost"
              size="sm"
              className="flex-1 flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 dark:hover:bg-blue-400/10 transition-all duration-300 hover-lift py-2.5"
            >
              <Edit size={18} className="opacity-80" />
              <span className="font-medium">{t('actions.edit')}</span>
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchGroups = useCallback(async () => {
    if (isSessionLoading) return;

    if (!session?.user) {
      setGroups([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
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
      setIsLoading(false);
    }
  }, [session, isSessionLoading, t]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingMessage message={t('groups.loading_groups')} />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title={t('groups.no_groups_title')}
        description={t('groups.no_groups_description')}
      >
        <GradientGlassButton
          onClick={() => setIsCreatingGroup(true)}
          className="mt-6 px-6 py-3 text-base"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          {t('groups.create_first_group')}
        </GradientGlassButton>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('groups.your_groups')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('groups.manage_your_contact_groups')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t('groups.search_groups')}
              className="pl-10 pr-8 py-2 h-auto bg-white/50 dark:bg-gray-700/50 border-white/30 dark:border-gray-600/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <GradientGlassButton
            onClick={() => setIsCreatingGroup(true)}
            className="flex-shrink-0 px-5 py-2.5"
          >
            <PlusCircle size={18} className="mr-2" />
            {t('groups.add_group')}
          </GradientGlassButton>
        </div>
      </div>

      <Dialog open={isCreatingGroup} onOpenChange={setIsCreatingGroup}>
        <DialogContent className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-white/30 dark:border-gray-700/50 shadow-2xl p-0 overflow-hidden max-w-md">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('groups.add_group')}
              </DialogTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t('groups.new_group_description')}
              </p>
            </DialogHeader>
            <div className="mt-6">
              <GroupForm
                onSuccess={() => {
                  setIsCreatingGroup(false);
                  fetchGroups();
                }}
                onCancel={() => setIsCreatingGroup(false)}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {filteredGroups.length === 0 ? (
        <div className="py-12 text-center">
          <div className="max-w-md mx-auto p-6 bg-white/30 dark:bg-gray-800/30 rounded-2xl border border-dashed border-white/50 dark:border-gray-700/50">
            <Search size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-1">
              {t('groups.no_results')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {t('groups.no_groups_match', { query: searchQuery })}
            </p>
            <GradientGlassButton
              onClick={() => setSearchQuery('')}
              className="mt-4 px-5 py-2.5 text-sm"
            >
              {t('actions.clear_search')}
            </GradientGlassButton>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
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
