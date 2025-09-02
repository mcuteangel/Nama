import { useState, useCallback } from "react";
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
  ArrowRight
} from "lucide-react";
import { useGroups } from "@/hooks/use-groups";
import { useSession } from "@/integrations/supabase/auth";
import { supabase } from "@/integrations/supabase/client";
import { invalidateCache } from "@/utils/cache-helpers";
import { ErrorManager } from "@/lib/error-manager";
import { useTranslation } from "react-i18next";
import GroupForm from "./GroupForm";
import AddGroupDialog from "./AddGroupDialog";
import EmptyState from "../common/EmptyState";
import LoadingSpinner from "../common/LoadingSpinner";
import LoadingMessage from "../common/LoadingMessage";
import { useDialogFocus } from "@/hooks/use-dialog-focus";
import StandardizedDeleteDialog from "@/components/common/StandardizedDeleteDialog";

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
  const { storeTriggerElement } = useDialogFocus();

  // Determine back icon based on language direction

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
    
    // Refresh ungrouped contacts if we're showing suggestions
    if (contactsWithoutGroup.length > 0) {
      fetchContactsWithoutGroup();
    }
  }, [session, refreshGroups, contactsWithoutGroup.length, fetchContactsWithoutGroup]);

  // Open edit dialog
  const handleEditGroup = useCallback((group: Group) => {
    setEditingGroup(group);
    setIsAddDialogOpen(true);
  }, []);

  // Fetch ungrouped contacts when suggestions section is opened

  if (loadingGroups) {
    return <LoadingMessage message={t('groups.loading')} />;
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <ModernCard variant="glass" className="fade-in-up rounded-2xl shadow-xl">
        <ModernCardHeader className="text-center pb-6">
          <div className="flex justify-between items-center mb-4">
            <GlassButton
              onClick={() => window.history.back()}
              variant="glass"
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold border border-white/30 dark:border-gray-600/30 hover:bg-white/10 dark:hover:bg-gray-700/30 transition-all duration-300 hover-lift"
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
            <ModernCardTitle className="text-3xl font-bold flex items-center gap-3 mx-auto">
              <Users className="text-purple-500" size={32} />
              <span className="text-gradient">{t('groups.title')}</span>
            </ModernCardTitle>
            <div className="w-24"></div> {/* Spacer for alignment */}
          </div>
          <ModernCardDescription className="text-lg">
            {t('groups.description')}
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <GradientGlassButton
              onClick={() => {
                setEditingGroup(null);
                setIsAddDialogOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold shadow-xl text-lg w-full sm:w-auto"
            >
              <Plus size={24} />
              {t('groups.add_new')}
            </GradientGlassButton>
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Smart Group Suggestions */}
      {contactsWithoutGroup.length > 0 && groupSuggestions.length > 0 && (
        <ModernCard variant="glass" className="fade-in-up rounded-2xl shadow-xl">
          <ModernCardHeader className="pb-4">
            <ModernCardTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles size={24} className="text-yellow-500" />
              {t('groups.smart_suggestions_title')}
            </ModernCardTitle>
            <ModernCardDescription>
              {t('groups.smart_suggestions_description')}
            </ModernCardDescription>
          </ModernCardHeader>
          <ModernCardContent className="space-y-4">
            <div className="space-y-4">
              {groupSuggestions.map((suggestion) => (
                <div 
                  key={`${suggestion.contact_id}-${suggestion.suggested_group_id}`} 
                  className="flex items-center justify-between p-5 glass rounded-2xl shadow-lg hover-lift border border-white/30 dark:border-gray-600/30 backdrop-blur-lg"
                >
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 dark:text-gray-100 text-lg">
                      {suggestion.contact_name}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2 mt-2">
                      {t('groups.suggested_group')}:
                      <span 
                        className="px-3 py-1.5 rounded-full text-white font-medium shadow-inner inline-flex items-center"
                        style={{ backgroundColor: suggestion.suggested_group_color || '#cccccc' }}
                      >
                        {suggestion.suggested_group_name}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-3 ms-4">
                    <GlassButton
                      variant="ghost"
                      size="icon"
                      onClick={() => handleApplySuggestion(suggestion)}
                      className="text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-gray-700 hover-lift w-12 h-12"
                    >
                      <CheckCircle size={24} />
                    </GlassButton>
                    <GlassButton
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDiscardSuggestion(suggestion.contact_id)}
                      className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-700 hover-lift w-12 h-12"
                    >
                      <XCircle size={24} />
                    </GlassButton>
                  </div>
                </div>
              ))}
            </div>
          </ModernCardContent>
        </ModernCard>
      )}

      {/* Groups List */}
      <ModernCard variant="glass" className="fade-in-up rounded-2xl shadow-xl">
        <ModernCardHeader className="pb-4">
          <ModernCardTitle className="text-xl font-bold flex items-center gap-2">
            <Users size={24} className="text-blue-500" />
            {t('groups.existing_groups')}
          </ModernCardTitle>
          <ModernCardDescription>
            {t('groups.groups_list_description')}
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent>
          {groups.length === 0 ? (
            <EmptyState
              icon={Users}
              title={t('groups.empty_title')}
              description={t('groups.empty_description')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <ModernCard 
                  key={group.id} 
                  variant="glass" 
                  hover="lift" 
                  className="flex flex-col p-5 rounded-2xl shadow-lg border border-white/30 dark:border-gray-600/30 backdrop-blur-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-white/50 dark:border-gray-400/50 shadow-lg glass-advanced" 
                        style={{ backgroundColor: group.color || "#cccccc" }}
                      >
                        <Users size={24} className="text-white drop-shadow-md" />
                      </div>
                      <div>
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
                  </div>
                  
                  <div className="flex gap-3 mt-auto pt-4 border-t border-white/20 dark:border-gray-700/50">
                    <GlassButton
                      variant="glass"
                      size="sm"
                      onClick={() => handleEditGroup(group)}
                      className="flex-1 flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100/30 dark:hover:bg-blue-400/20 transition-all duration-300 hover-lift py-2.5 border border-white/30 dark:border-gray-600/30"
                    >
                      <Edit size={18} />
                      {t('actions.edit')}
                    </GlassButton>
                    
                    <GlassButton
                      variant="glass"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGroup({ id: group.id, name: group.name });
                        setDeleteDialogOpen(true);
                        storeTriggerElement();
                      }}
                      className="flex-1 flex items-center justify-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-100/30 dark:hover:bg-red-400/20 transition-all duration-300 hover-lift py-2.5 px-4 rounded-lg border border-white/30 dark:border-gray-600/30 text-sm font-medium"
                    >
                      <Trash2 size={18} />
                      {t('actions.delete')}
                    </GlassButton>
                  </div>
                </ModernCard>
              ))}
            </div>
          )}
        </ModernCardContent>
      </ModernCard>

      {/* Standardized Delete Dialog */}
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
          description={t('groups.delete_confirm_description')}
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
      
      {/* Hidden form for editing (will be shown in dialog) */}
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