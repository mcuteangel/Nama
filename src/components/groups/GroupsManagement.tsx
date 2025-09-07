import { useState, useCallback, useEffect, useMemo } from "react";
import {
  ModernCard,
  ModernCardHeader,
  ModernCardTitle,
  ModernCardDescription,
  ModernCardContent
} from "@/components/ui/modern-card";
import { GlassButton, GradientGlassButton } from "@/components/ui/glass-button";
import {
  Users,
  Edit,
  Trash2,
  Plus,
  Sparkles,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  TrendingUp,
  Activity,
  Zap
} from "lucide-react";
import { useGroups } from "@/hooks/use-groups";
import { useSession } from "@/integrations/supabase/auth";
import { supabase } from "@/integrations/supabase/client";
import { invalidateCache } from "@/utils/cache-helpers";
import { ErrorManager } from "@/lib/error-manager";
import { useTranslation } from "react-i18next";
import GroupForm from "./GroupForm";
import GroupItem from "./GroupItem";
import AddGroupDialog from "./AddGroupDialog";
import EmptyState from "../common/EmptyState";
import LoadingMessage from "../common/LoadingMessage";
import { useDialogFocus } from "@/hooks/use-dialog-focus";
import StandardizedDeleteDialog from "@/components/common/StandardizedDeleteDialog";
import LoadingSpinner from "../common/LoadingSpinner";

interface Group {
  id: string;
  name: string;
  color?: string;
  created_at?: string;
}

interface ContactWithoutGroup {
  id: string;
  first_name: string;
  last_name: string;
  company?: string;
  position?: string;
  suggested_group_id?: string;
  suggested_group_name?: string;
}

interface GroupSuggestion {
  contact_id: string;
  contact_name: string;
  suggested_group_id: string;
  suggested_group_name: string;
  suggested_group_color?: string;
}

const GroupsManagement = () => {
  const { t, i18n } = useTranslation();
  const { session } = useSession();
  const { groups, loadingGroups, refreshGroups } = useGroups();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [contactsWithoutGroup, setContactsWithoutGroup] = useState<ContactWithoutGroup[]>([]);
  const [groupSuggestions, setGroupSuggestions] = useState<GroupSuggestion[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<{id: string, name: string} | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const { storeTriggerElement } = useDialogFocus();

  // Calculate statistics
  const stats = useMemo(() => ({
    totalGroups: groups.length,
    totalSuggestions: groupSuggestions.length,
    ungroupedContacts: contactsWithoutGroup.length,
    averageGroupSize: groups.length > 0 ? Math.round(contactsWithoutGroup.length / groups.length) : 0,
    completionRate: groups.length > 0 ? Math.round((1 - contactsWithoutGroup.length / (contactsWithoutGroup.length + groups.length)) * 100) : 0
  }), [groups.length, groupSuggestions.length, contactsWithoutGroup.length]);

  // Fetch contacts without group for smart suggestions
  const fetchContactsWithoutGroup = useCallback(async () => {
    if (!session?.user) return;

    try {
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select(`
          id,
          first_name,
          last_name,
          company,
          position,
          contact_groups(group_id)
        `)
        .eq('user_id', session.user.id);

      if (contactsError) throw new Error(contactsError.message);

      const ungroupedContacts = contacts.filter(c => c.contact_groups.length === 0);
      setContactsWithoutGroup(ungroupedContacts);
    } catch (error) {
      ErrorManager.logError(error as Error, { component: 'GroupsManagement', action: 'fetchContactsWithoutGroup' });
    }
  }, [session]);

  // Generate smart group suggestions
  const generateSuggestions = useCallback(async () => {
    if (!session?.user || contactsWithoutGroup.length === 0) return;

    setIsLoadingSuggestions(true);
    try {
      const newSuggestions: GroupSuggestion[] = [];

      contactsWithoutGroup.forEach(contact => {
        const companyName = contact.company?.trim();
        if (companyName) {
          const existingGroup = groups.find(g => g.name.toLowerCase() === companyName.toLowerCase());
          if (existingGroup) {
            newSuggestions.push({
              contact_id: contact.id,
              contact_name: `${contact.first_name} ${contact.last_name}`,
              suggested_group_id: existingGroup.id,
              suggested_group_name: existingGroup.name,
              suggested_group_color: existingGroup.color,
            });
          }
        }
      });

      setGroupSuggestions(newSuggestions);

      if (newSuggestions.length === 0) {
        ErrorManager.notifyUser(t('ai_suggestions.no_group_suggestions_found'), 'info');
      } else {
        ErrorManager.notifyUser(t('ai_suggestions.group_suggestions_generated'), 'success');
      }
    } catch (error) {
      ErrorManager.logError(error as Error, { component: 'GroupsManagement', action: 'generateSuggestions' });
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [session, contactsWithoutGroup, groups, t]);

  // Apply a group suggestion
  const handleApplySuggestion = useCallback(async (suggestion: GroupSuggestion) => {
    if (!session?.user) {
      ErrorManager.notifyUser(t('common.auth_required'), 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('contact_groups')
        .insert({
          user_id: session.user.id,
          contact_id: suggestion.contact_id,
          group_id: suggestion.suggested_group_id,
        });

      if (error) throw new Error(error.message);

      ErrorManager.notifyUser(t('ai_suggestions.group_suggestion_applied_success'), 'success');
      setGroupSuggestions(prev => prev.filter(s => s.contact_id !== suggestion.contact_id));
      invalidateCache(`contacts_list_${session.user.id}_`);
      fetchContactsWithoutGroup();
    } catch (err: unknown) {
      ErrorManager.logError(err, { component: 'GroupsManagement', action: 'applyGroupSuggestion', suggestion });
      ErrorManager.notifyUser(`${t('ai_suggestions.error_applying_group_suggestion')}: ${ErrorManager.getErrorMessage(err)}`, 'error');
    }
  }, [session, t, fetchContactsWithoutGroup]);

  // Discard a group suggestion
  const handleDiscardSuggestion = useCallback((contactId: string) => {
    setGroupSuggestions(prev => prev.filter(s => s.contact_id !== contactId));
    ErrorManager.notifyUser(t('ai_suggestions.group_suggestion_discarded'), 'info');
  }, [t]);

  // Handle group deletion
  const handleDeleteGroup = useCallback(async (groupId: string, groupName: string) => {
    if (!session?.user) {
      ErrorManager.notifyUser(t('groups.delete_auth_required'), 'error');
      return Promise.reject(new Error('Authentication required'));
    }

    setIsDeleting(groupId);
    try {
      const { error } = await supabase
        .from("groups")
        .delete()
        .eq("id", groupId)
        .eq("user_id", session.user.id);

      if (error) throw error;

      ErrorManager.notifyUser(t('groups.delete_success', { groupName }), 'success');
      invalidateCache(`user_groups_${session.user.id}`);
      refreshGroups();
      return Promise.resolve();
    } catch (error: unknown) {
      ErrorManager.logError(error as Error, { component: 'GroupsManagement', action: 'deleteGroup' });
      ErrorManager.notifyUser(`${t('groups.delete_error')}: ${ErrorManager.getErrorMessage(error)}`, 'error');
      return Promise.reject(error);
    } finally {
      setIsDeleting(null);
      setDeleteDialogOpen(false);
    }
  }, [session, refreshGroups, t]);

  // Handle successful group creation/update
  const handleGroupSuccess = useCallback(() => {
    setIsAddDialogOpen(false);
    setEditingGroup(null);
    invalidateCache(`user_groups_${session?.user?.id}`);
    refreshGroups();

    if (contactsWithoutGroup.length > 0) {
      fetchContactsWithoutGroup();
    }
  }, [session, refreshGroups, contactsWithoutGroup.length, fetchContactsWithoutGroup]);

  // Open edit dialog
  const handleEditGroup = useCallback((group: Group) => {
    setEditingGroup(group);
    setIsAddDialogOpen(true);
  }, []);

  // Load suggestions when component mounts
  useEffect(() => {
    if (contactsWithoutGroup.length > 0 && groups.length > 0) {
      generateSuggestions();
    }
  }, [contactsWithoutGroup.length, groups.length, generateSuggestions]);

  if (loadingGroups) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size={48} className="text-purple-500 mx-auto" />
          <LoadingMessage message={t('groups.loading')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 p-4 md:p-6 lg:p-8 space-y-8">
      {/* Header Section with Enhanced Design */}
      <ModernCard
        variant="glass"
        className="fade-in-up rounded-3xl shadow-2xl border-2 border-white/40 dark:border-gray-600/40 backdrop-blur-xl bg-gradient-to-r from-white/50 via-white/40 to-white/30 dark:from-gray-800/50 dark:via-gray-800/40 dark:to-gray-800/30 overflow-hidden transition-all duration-500 hover:shadow-3xl hover:border-purple-300/50 dark:hover:border-purple-600/50"
      >
        <ModernCardHeader className="text-center pb-6 relative">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-indigo-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

          <div className="flex justify-between items-center mb-6 relative z-10">
            <GlassButton
              onClick={() => window.history.back()}
              variant="glass"
              className="flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold border-2 border-white/40 dark:border-gray-600/40 bg-white/20 dark:bg-gray-800/50 hover:bg-white/30 dark:hover:bg-gray-700/50 transition-all duration-300 hover-lift hover:shadow-xl hover:shadow-purple-500/20 hover:scale-105"
            >
              {i18n.dir(i18n.language) === 'rtl' ? (
                <>
                  {t('actions.back')}
                  <ArrowRight size={20} />
                </>
              ) : (
                <>
                  <ArrowLeft size={20} />
                  {t('actions.back')}
                </>
              )}
            </GlassButton>

            <ModernCardTitle className="text-4xl font-bold flex items-center gap-4 mx-auto">
              <div className="relative">
                <Users className="text-purple-500 animate-pulse" size={40} />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">
                {t('groups.title')}
              </span>
            </ModernCardTitle>

            <div className="w-32"></div> {/* Spacer for alignment */}
          </div>

          <ModernCardDescription className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            {t('groups.description')}
          </ModernCardDescription>

          {/* Statistics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 rounded-2xl p-4 border border-blue-200/30 dark:border-blue-800/30 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <BarChart3 size={24} className="text-blue-500" />
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalGroups}</div>
                  <div className="text-sm text-blue-500 dark:text-blue-300">{t('groups.total_groups', 'کل گروه‌ها')}</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 rounded-2xl p-4 border border-green-200/30 dark:border-green-800/30 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <TrendingUp size={24} className="text-green-500" />
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completionRate}%</div>
                  <div className="text-sm text-green-500 dark:text-green-300">{t('groups.completion_rate', 'نرخ تکمیل')}</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-500/20 dark:to-purple-600/20 rounded-2xl p-4 border border-purple-200/30 dark:border-purple-800/30 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Activity size={24} className="text-purple-500" />
                <div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.ungroupedContacts}</div>
                  <div className="text-sm text-purple-500 dark:text-purple-300">{t('groups.ungrouped', 'بدون گروه')}</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 dark:from-orange-500/20 dark:to-orange-600/20 rounded-2xl p-4 border border-orange-200/30 dark:border-orange-800/30 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Zap size={24} className="text-orange-500" />
                <div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.totalSuggestions}</div>
                  <div className="text-sm text-orange-500 dark:text-orange-300">{t('groups.suggestions', 'پیشنهادات')}</div>
                </div>
              </div>
            </div>
          </div>
        </ModernCardHeader>

        <ModernCardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <GradientGlassButton
              onClick={() => {
                setEditingGroup(null);
                setIsAddDialogOpen(true);
              }}
              className="flex items-center gap-3 px-10 py-5 rounded-3xl font-bold text-xl w-full sm:w-auto border-2 border-white/50 dark:border-gray-600/50 bg-gradient-to-r from-purple-500 via-blue-600 to-indigo-600 text-white hover:shadow-2xl hover:shadow-purple-500/30 hover:-translate-y-1 transition-all duration-300 transform hover:scale-105 animate-pulse-slow"
            >
              <Plus size={28} />
              {t('groups.add_new')}
            </GradientGlassButton>
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Smart Group Suggestions with Enhanced Design */}
      {contactsWithoutGroup.length > 0 && (
        <ModernCard
          variant="glass"
          className="fade-in-up rounded-3xl shadow-2xl border-2 border-white/40 dark:border-gray-600/40 backdrop-blur-xl bg-gradient-to-br from-yellow-50/50 via-orange-50/30 to-red-50/20 dark:from-yellow-900/20 dark:via-orange-900/10 dark:to-red-900/5 overflow-hidden transition-all duration-500 hover:shadow-3xl hover:border-yellow-300/50 dark:hover:border-yellow-600/50"
        >
          <ModernCardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Sparkles size={32} className="text-yellow-500 animate-spin-slow" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                </div>
                <div>
                  <ModernCardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    {t('groups.smart_suggestions_title')}
                  </ModernCardTitle>
                  <ModernCardDescription className="text-lg">
                    {t('groups.smart_suggestions_description')}
                  </ModernCardDescription>
                </div>
              </div>

              <GlassButton
                onClick={generateSuggestions}
                disabled={isLoadingSuggestions}
                variant="gradient-primary"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold hover:scale-105 transition-all duration-300"
              >
                {isLoadingSuggestions ? (
                  <LoadingSpinner size={20} />
                ) : (
                  <Sparkles size={20} />
                )}
                {t('ai_suggestions.generate_suggestions')}
              </GlassButton>
            </div>
          </ModernCardHeader>

          <ModernCardContent className="space-y-6">
            {groupSuggestions.length > 0 ? (
              <div className="space-y-4">
                {groupSuggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion.contact_id}-${suggestion.suggested_group_id}`}
                    className="group flex items-center justify-between p-6 rounded-3xl shadow-xl hover-lift border-2 border-white/40 dark:border-gray-600/40 backdrop-blur-lg bg-gradient-to-r from-white/60 via-white/40 to-white/20 dark:from-gray-800/60 dark:via-gray-800/40 dark:to-gray-800/20 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/20 hover:scale-[1.02] animate-slide-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 dark:text-gray-100 text-xl mb-3 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors duration-300">
                        {suggestion.contact_name}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 flex items-center gap-3 text-lg">
                        {t('groups.suggested_group')}:
                        <span
                          className="px-4 py-2 rounded-2xl text-white font-semibold shadow-lg backdrop-blur-sm border-2 border-white/30 flex items-center gap-2 hover:scale-105 transition-all duration-300"
                          style={{ backgroundColor: suggestion.suggested_group_color || '#6366f1' }}
                        >
                          <div
                            className="w-3 h-3 rounded-full bg-white/30"
                            style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                          ></div>
                          {suggestion.suggested_group_name}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-4 ms-6">
                      <GlassButton
                        variant="ghost"
                        size="icon"
                        onClick={() => handleApplySuggestion(suggestion)}
                        className="text-green-600 hover:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-900/30 hover-lift w-14 h-14 border-2 border-green-200/50 dark:border-green-800/50 rounded-2xl hover:scale-110 transition-all duration-300"
                      >
                        <CheckCircle size={28} />
                      </GlassButton>
                      <GlassButton
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDiscardSuggestion(suggestion.contact_id)}
                        className="text-red-600 hover:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-900/30 hover-lift w-14 h-14 border-2 border-red-200/50 dark:border-red-800/50 rounded-2xl hover:scale-110 transition-all duration-300"
                      >
                        <XCircle size={28} />
                      </GlassButton>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Sparkles size={64} className="text-gray-400 mx-auto mb-4 animate-pulse" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  {t('ai_suggestions.no_suggestions_available', 'هیچ پیشنهادی موجود نیست')}
                </p>
              </div>
            )}
          </ModernCardContent>
        </ModernCard>
      )}

      {/* Groups List with Enhanced Design */}
      <ModernCard
        variant="glass"
        className="fade-in-up rounded-3xl shadow-2xl border-2 border-white/40 dark:border-gray-600/40 backdrop-blur-xl bg-gradient-to-br from-white/50 via-white/40 to-white/30 dark:from-gray-800/50 dark:via-gray-800/40 dark:to-gray-800/30 overflow-hidden transition-all duration-500 hover:shadow-3xl hover:border-blue-300/50 dark:hover:border-blue-600/50"
      >
        <ModernCardHeader className="pb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Users size={32} className="text-blue-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
            </div>
            <div>
              <ModernCardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {t('groups.existing_groups')}
              </ModernCardTitle>
              <ModernCardDescription className="text-lg">
                {t('groups.groups_list_description')}
              </ModernCardDescription>
            </div>
          </div>
        </ModernCardHeader>

        <ModernCardContent>
          {groups.length === 0 ? (
            <EmptyState
              icon={Users}
              title={t('groups.empty_title')}
              description={t('groups.empty_description')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {groups.map((group, index) => (
                <div
                  key={group.id}
                  className="animate-slide-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <GroupItem
                    group={group}
                    onEdit={handleEditGroup}
                    onDelete={(groupId: string, groupName: string) => {
                      setSelectedGroup({ id: groupId, name: groupName });
                      setDeleteDialogOpen(true);
                      storeTriggerElement();
                    }}
                    isDeleting={isDeleting === group.id}
                  />
                </div>
              ))}
            </div>
          )}
        </ModernCardContent>
      </ModernCard>

      {/* Enhanced Delete Dialog */}
      {selectedGroup && (
        <StandardizedDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={() => {
            if (selectedGroup) {
              handleDeleteGroup(selectedGroup.id, selectedGroup.name);
            }
          }}
          title={t('groups.delete_confirm_title')}
          description={t('groups.delete_confirm_description', { name: selectedGroup.name })}
          isDeleting={isDeleting === selectedGroup?.id}
        />
      )}

      {/* Add/Edit Group Dialog */}
      <AddGroupDialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) setEditingGroup(null);
        }}
        onGroupAdded={handleGroupSuccess}
      />

      {/* Hidden form for editing */}
      {editingGroup && (
        <div className="hidden">
          <GroupForm
            initialData={editingGroup}
            onSuccess={handleGroupSuccess}
            onCancel={() => {
              setEditingGroup(null);
              setIsAddDialogOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default GroupsManagement;