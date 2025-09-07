import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, Palette } from "lucide-react";
import { useGroups } from "@/hooks/use-groups";
import { useSession } from "@/integrations/supabase/auth";
import { supabase } from "@/integrations/supabase/client";
import { invalidateCache } from "@/utils/cache-helpers";
import { ErrorManager } from "@/lib/error-manager";
import { GlassButton } from "@/components/ui/glass-button";
import { ModernCard, ModernCardContent } from "@/components/ui/modern-card";
import { ModernTabs, ModernTabsContent } from "@/components/ui/modern-tabs";
import useAppSettings from '@/hooks/use-app-settings';
import { useDialogFocus } from "@/hooks/use-dialog-focus";
import StandardizedDeleteDialog from "@/components/common/StandardizedDeleteDialog";
import LoadingSpinner from "../common/LoadingSpinner";
import GroupForm from "./GroupForm";
import ParticleBackground from "./ParticleBackground";
import GroupsHeader from "./GroupsHeader";
import GroupsStats from "./GroupsStats";
import GroupsFilters from "./GroupsFilters";
import GroupsList from "./GroupsList";
import GroupsSuggestions from "./GroupsSuggestions";

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
  contact_groups: { group_id: string }[];
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
  const navigate = useNavigate();
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

  // New states for enhanced functionality
  const [activeTab, setActiveTab] = useState<'overview' | 'manage'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Settings for theme and RTL support
  const { settings, updateSettings } = useAppSettings();
  const isRTL = useMemo(() => settings.language === 'fa', [settings.language]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (settings.theme === 'dark') return true;
    if (settings.theme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Update theme when settings change
  React.useEffect(() => {
    if (settings.theme === 'dark') {
      setIsDarkMode(true);
    } else if (settings.theme === 'light') {
      setIsDarkMode(false);
    } else {
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, [settings.theme]);

  // Handle theme toggle
  const handleThemeToggle = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    updateSettings({ theme: newTheme });
  };

  // Filtered groups based on search and color filter
  const filteredGroups = useMemo(() => {
    return groups.filter(group => {
      const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesColor = colorFilter === 'all' || group.color === colorFilter;
      return matchesSearch && matchesColor;
    });
  }, [groups, searchTerm, colorFilter]);

  // Calculate statistics
  const stats = useMemo(() => ({
    totalGroups: groups.length,
    filteredGroups: filteredGroups.length,
    totalSuggestions: groupSuggestions.length,
    ungroupedContacts: contactsWithoutGroup.length,
    averageGroupSize: groups.length > 0 ? Math.round(contactsWithoutGroup.length / groups.length) : 0,
    completionRate: groups.length > 0 ? Math.round((1 - contactsWithoutGroup.length / (contactsWithoutGroup.length + groups.length)) * 100) : 0
  }), [groups.length, filteredGroups.length, groupSuggestions.length, contactsWithoutGroup.length]);

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

      const ungroupedContacts = contacts.filter((c: ContactWithoutGroup) => c.contact_groups.length === 0);
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

      contactsWithoutGroup.forEach((contact: ContactWithoutGroup) => {
        const companyName = contact.company?.trim();
        if (companyName) {
          const existingGroup = groups.find((g: Group) => g.name.toLowerCase() === companyName.toLowerCase());
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
      setGroupSuggestions((prev: GroupSuggestion[]) => prev.filter((s: GroupSuggestion) => s.contact_id !== suggestion.contact_id));
      invalidateCache(`contacts_list_${session.user.id}_`);
      fetchContactsWithoutGroup();
    } catch (err: unknown) {
      ErrorManager.logError(err, { component: 'GroupsManagement', action: 'applyGroupSuggestion', suggestion });
      ErrorManager.notifyUser(`${t('ai_suggestions.error_applying_group_suggestion')}: ${ErrorManager.getErrorMessage(err)}`, 'error');
    }
  }, [session, t, fetchContactsWithoutGroup]);

  // Discard a group suggestion
  const handleDiscardSuggestion = useCallback((contactId: string) => {
    setGroupSuggestions((prev: GroupSuggestion[]) => prev.filter((s: GroupSuggestion) => s.contact_id !== contactId));
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

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setColorFilter('all');
  }, []);

  // Load suggestions when component mounts
  useEffect(() => {
    if (contactsWithoutGroup.length > 0 && groups.length > 0) {
      generateSuggestions();
    }
  }, [contactsWithoutGroup.length, groups.length, generateSuggestions]);

  // Get unique colors for filter
  const availableColors = useMemo(() => {
    const colors = new Set(groups.map((g: Group) => g.color).filter(Boolean));
    return Array.from(colors);
  }, [groups]);

  if (loadingGroups) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'} transition-all duration-700 flex items-center justify-center p-4`}>
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <Sparkles className="w-10 h-10 text-white animate-spin" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-xs font-bold text-yellow-900">⚡</span>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('groups.loading_title', 'در حال بارگذاری گروه‌ها...')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('groups.loading_description', 'لطفاً کمی صبر کنید')}
            </p>
          </div>
          <LoadingSpinner size={48} className="text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'} transition-all duration-700 p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 xl:p-12`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Particle Background */}
      <ParticleBackground isDarkMode={isDarkMode} />

      <div className="max-w-7xl mx-auto space-y-4 xs:space-y-6 sm:space-y-8 relative z-10">
        {/* Header */}
        <GroupsHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDarkMode={isDarkMode}
          handleThemeToggle={handleThemeToggle}
          isRTL={isRTL}
        />

        {/* Tab Content */}
        <ModernTabs value={activeTab} className="w-full">
          <AnimatePresence mode="wait">
            <ModernTabsContent value={activeTab} className="space-y-4 xs:space-y-6 sm:space-y-8">
              <ModernCard variant="glass" hover="lift" className="backdrop-blur-2xl border border-white/30 shadow-2xl">
                <ModernCardContent className="p-3 xs:p-4 sm:p-6 md:p-8">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="animate-in fade-in duration-700"
                  >
                    {activeTab === 'overview' ? (
                      <div className="space-y-6 xs:space-y-8">
                        {/* Statistics */}
                        <GroupsStats stats={stats} />

                        {/* Filters */}
                        <GroupsFilters
                          searchTerm={searchTerm}
                          setSearchTerm={setSearchTerm}
                          colorFilter={colorFilter}
                          setColorFilter={setColorFilter}
                          availableColors={availableColors}
                          clearFilters={clearFilters}
                          isRTL={isRTL}
                        />

                        {/* Groups List */}
                        <GroupsList
                          filteredGroups={filteredGroups}
                          stats={stats}
                          searchTerm={searchTerm}
                          colorFilter={colorFilter}
                          clearFilters={clearFilters}
                          handleEditGroup={handleEditGroup}
                          handleDeleteGroup={handleDeleteGroup}
                          isDeleting={isDeleting}
                          storeTriggerElement={storeTriggerElement}
                          isAddDialogOpen={isAddDialogOpen}
                          setIsAddDialogOpen={setIsAddDialogOpen}
                          handleGroupSuccess={handleGroupSuccess}
                          viewMode={viewMode}
                          setViewMode={setViewMode}
                        />
                      </div>
                    ) : (
                      <div className="text-center py-12 xs:py-16">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Palette className="w-12 h-12 xs:w-16 xs:h-16 mx-auto text-purple-500 mb-4" />
                          <h3 className="text-xl xs:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                            {t('groups.manage_advanced_title', 'مدیریت پیشرفته')}
                          </h3>
                          <p className="text-sm xs:text-base text-gray-600 dark:text-gray-400 mb-6">
                            {t('groups.manage_advanced_description', 'ابزارهای پیشرفته مدیریت گروه‌ها به زودی اضافه خواهد شد')}
                          </p>
                          <GlassButton
                            variant="glass"
                            onClick={() => setActiveTab('overview')}
                            className="px-4 py-2 xs:px-6 xs:py-3 text-sm xs:text-base"
                          >
                            {t('actions.back_to_overview', 'بازگشت به نمای کلی')}
                          </GlassButton>
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                </ModernCardContent>
              </ModernCard>
            </ModernTabsContent>
          </AnimatePresence>
        </ModernTabs>

        {/* Smart Group Suggestions */}
        <GroupsSuggestions
          contactsWithoutGroup={contactsWithoutGroup}
          groupSuggestions={groupSuggestions}
          isLoadingSuggestions={isLoadingSuggestions}
          generateSuggestions={generateSuggestions}
          handleApplySuggestion={handleApplySuggestion}
          handleDiscardSuggestion={handleDiscardSuggestion}
          activeTab={activeTab}
        />

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
    </div>
  );
};

export default GroupsManagement;