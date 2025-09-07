import { useEffect, useState, useCallback, useMemo } from "react";
import { GlassButton, GradientGlassButton } from "@/components/ui/glass-button";
import { Users, PlusCircle, Search, X, BarChart3, Sparkles, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/integrations/supabase/auth";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import GroupForm from "./GroupForm";
import GroupItem from "./GroupItem";
import { invalidateCache, fetchWithCache } from "@/utils/cache-helpers";
import LoadingMessage from "../common/LoadingMessage";
import { ErrorManager } from "@/lib/error-manager";
import EmptyState from '../common/EmptyState';
import LoadingSpinner from '../common/LoadingSpinner';
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";

interface Group {
  id: string;
  name: string;
  color?: string;
  created_at?: string;
}

const GroupList = () => {
  const { t } = useTranslation();
  const { session, isLoading: isSessionLoading } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Calculate statistics
  const stats = useMemo(() => ({
    totalGroups: groups.length,
    recentGroups: groups.filter(g => {
      const createdAt = new Date(g.created_at || '');
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdAt > weekAgo;
    }).length,
    coloredGroups: groups.filter(g => g.color).length,
    avgNameLength: groups.length > 0 ? Math.round(groups.reduce((sum, g) => sum + g.name.length, 0) / groups.length) : 0
  }), [groups]);

  const filteredAndSortedGroups = useMemo(() => {
    let filtered = groups.filter(group =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'created_at') {
        comparison = new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [groups, searchQuery, sortBy, sortOrder]);

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

  const handleEditGroup = useCallback((group: Group) => {
    // For now, we'll use a simple approach - in a real app you'd want a proper edit dialog
    console.log('Edit group:', group);
    // You could open a dialog here or navigate to an edit page
  }, []);

  const handleDeleteGroup = useCallback(async (groupId: string, groupName: string) => {
    if (!session?.user) {
      showError(t('groups.delete_auth_required'));
      return;
    }
    const toastId = showLoading(t('groups.deleting_group'));
    try {
      const { error } = await supabase
        .from("groups")
        .delete()
        .eq("id", groupId)
        .eq("user_id", session.user.id);

      if (error) throw error;
      showSuccess(t('groups.delete_success', { groupName }));
      invalidateCache(`user_groups_${session.user.id}`);
      fetchGroups();
    } catch (error) {
      console.error("Error deleting group:", error);
      showError(`${t('groups.delete_error')}: ${(error as Error).message || t('errors.unknown')}`);
    } finally {
      dismissToast(toastId);
    }
  }, [session, fetchGroups, t]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size={48} className="text-purple-500 mx-auto" />
          <LoadingMessage message={t('groups.loading_groups')} />
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 p-4 md:p-6 lg:p-8">
        <ModernCard variant="glass" className="max-w-2xl mx-auto rounded-3xl shadow-2xl border-2 border-white/40 dark:border-gray-600/40 backdrop-blur-xl bg-gradient-to-br from-white/60 via-white/40 to-white/30 dark:from-gray-800/60 dark:via-gray-800/40 dark:to-gray-800/30 overflow-hidden">
          <ModernCardContent className="p-12 text-center">
            <div className="relative mb-8">
              <Users size={80} className="text-purple-400 mx-auto animate-pulse" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full animate-ping"></div>
            </div>
            <ModernCardTitle className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {t('groups.no_groups_title')}
            </ModernCardTitle>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              {t('groups.no_groups_description')}
            </p>
            <GradientGlassButton
              onClick={() => setIsCreatingGroup(true)}
              className="px-8 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-purple-500 via-blue-600 to-indigo-600 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
            >
              <PlusCircle size={24} className="mr-3" />
              {t('groups.create_first_group')}
            </GradientGlassButton>
          </ModernCardContent>
        </ModernCard>

        <Dialog open={isCreatingGroup} onOpenChange={setIsCreatingGroup}>
          <DialogContent className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl border-2 border-white/40 dark:border-gray-600/40 shadow-3xl p-0 overflow-hidden max-w-lg">
            <div className="p-8">
              <DialogHeader className="text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                    <PlusCircle size={24} className="text-white" />
                  </div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {t('groups.add_group')}
                  </DialogTitle>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('groups.new_group_description')}
                </p>
              </DialogHeader>
              <GroupForm
                onSuccess={() => {
                  setIsCreatingGroup(false);
                  fetchGroups();
                }}
                onCancel={() => setIsCreatingGroup(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 p-4 md:p-6 lg:p-8 space-y-8">
      {/* Header with Enhanced Design */}
      <ModernCard variant="glass" className="rounded-3xl shadow-2xl border-2 border-white/40 dark:border-gray-600/40 backdrop-blur-xl bg-gradient-to-r from-white/60 via-white/40 to-white/30 dark:from-gray-800/60 dark:via-gray-800/40 dark:to-gray-800/30 overflow-hidden">
        <ModernCardHeader className="pb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <Users size={40} className="text-blue-500" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                </div>
                <div>
                  <ModernCardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {t('groups.your_groups')}
                  </ModernCardTitle>
                  <ModernCardDescription className="text-lg">
                    {t('groups.manage_your_contact_groups')}
                  </ModernCardDescription>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 rounded-2xl p-4 border border-blue-200/30 dark:border-blue-800/30 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <BarChart3 size={20} className="text-blue-500" />
                    <div>
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.totalGroups}</div>
                      <div className="text-xs text-blue-500 dark:text-blue-300">{t('groups.total', 'کل')}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 rounded-2xl p-4 border border-green-200/30 dark:border-green-800/30 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Sparkles size={20} className="text-green-500" />
                    <div>
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">{stats.recentGroups}</div>
                      <div className="text-xs text-green-500 dark:text-green-300">{t('groups.recent', 'اخیر')}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-500/20 dark:to-purple-600/20 rounded-2xl p-4 border border-purple-200/30 dark:border-purple-800/30 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-purple-600"></div>
                    <div>
                      <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats.coloredGroups}</div>
                      <div className="text-xs text-purple-500 dark:text-purple-300">{t('groups.colored', 'رنگی')}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 dark:from-orange-500/20 dark:to-orange-600/20 rounded-2xl p-4 border border-orange-200/30 dark:border-orange-800/30 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Filter size={20} className="text-orange-500" />
                    <div>
                      <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{filteredAndSortedGroups.length}</div>
                      <div className="text-xs text-orange-500 dark:text-orange-300">{t('groups.filtered', 'فیلتر')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-4 w-full lg:w-auto">
              {/* Search and Sort */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={t('groups.search_groups')}
                    className="pl-12 pr-10 py-3 h-auto bg-white/60 dark:bg-gray-700/60 border-2 border-white/40 dark:border-gray-600/40 rounded-2xl backdrop-blur-sm focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>

                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-');
                    setSortBy(sort as 'name' | 'created_at');
                    setSortOrder(order as 'asc' | 'desc');
                  }}
                  className="px-4 py-3 bg-white/60 dark:bg-gray-700/60 border-2 border-white/40 dark:border-gray-600/40 rounded-2xl backdrop-blur-sm focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-300"
                >
                  <option value="name-asc">{t('groups.sort_name_asc', 'نام (صعودی)')}</option>
                  <option value="name-desc">{t('groups.sort_name_desc', 'نام (نزولی)')}</option>
                  <option value="created_at-desc">{t('groups.sort_date_desc', 'تاریخ (جدیدترین)')}</option>
                  <option value="created_at-asc">{t('groups.sort_date_asc', 'تاریخ (قدیمی‌ترین)')}</option>
                </select>
              </div>

              {/* Add Group Button */}
              <GradientGlassButton
                onClick={() => setIsCreatingGroup(true)}
                className="w-full lg:w-auto px-6 py-3 font-semibold rounded-2xl bg-gradient-to-r from-purple-500 via-blue-600 to-indigo-600 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
              >
                <PlusCircle size={20} className="mr-2" />
                {t('groups.add_group')}
              </GradientGlassButton>
            </div>
          </div>
        </ModernCardHeader>
      </ModernCard>

      {/* Groups Grid with Enhanced Design */}
      {filteredAndSortedGroups.length === 0 ? (
        <ModernCard variant="glass" className="rounded-3xl shadow-2xl border-2 border-white/40 dark:border-gray-600/40 backdrop-blur-xl bg-gradient-to-br from-white/50 via-white/30 to-white/20 dark:from-gray-800/50 dark:via-gray-800/30 dark:to-gray-800/20 overflow-hidden">
          <ModernCardContent className="p-12 text-center">
            <div className="relative mb-6">
              <Search size={64} className="text-gray-400 mx-auto animate-pulse" />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-gray-400 rounded-full animate-ping"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {t('groups.no_results')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t('groups.no_groups_match', { query: searchQuery })}
            </p>
            <GlassButton
              onClick={() => setSearchQuery('')}
              variant="gradient-primary"
              className="px-6 py-3 rounded-2xl font-semibold hover:scale-105 transition-all duration-300"
            >
              {t('actions.clear_search')}
            </GlassButton>
          </ModernCardContent>
        </ModernCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredAndSortedGroups.map((group, index) => (
            <div
              key={group.id}
              className="animate-slide-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <GroupItem
                group={group}
                onEdit={handleEditGroup}
                onDelete={handleDeleteGroup}
              />
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Create Group Dialog */}
      <Dialog open={isCreatingGroup} onOpenChange={setIsCreatingGroup}>
        <DialogContent className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl border-2 border-white/40 dark:border-gray-600/40 shadow-3xl p-0 overflow-hidden max-w-lg">
          <div className="p-8">
            <DialogHeader className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                  <PlusCircle size={24} className="text-white" />
                </div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {t('groups.add_group')}
                </DialogTitle>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                {t('groups.new_group_description')}
              </p>
            </DialogHeader>
            <GroupForm
              onSuccess={() => {
                setIsCreatingGroup(false);
                fetchGroups();
              }}
              onCancel={() => setIsCreatingGroup(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupList;
