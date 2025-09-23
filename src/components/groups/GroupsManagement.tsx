import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, Users, BarChart2, Filter, Search, Grid, List } from "lucide-react";

// Hooks
import { useGroups } from "@/hooks/use-groups";
import { useSession } from "@/integrations/supabase/auth";
import { supabase } from "@/integrations/supabase/client";
import { invalidateCache } from "@/utils/cache-helpers";
import { ErrorManager } from "@/lib/error-manager";
import useAppSettings from '@/hooks/use-app-settings';
import { useDialogFocus } from "@/hooks/use-dialog-focus";

// Modern UI Components
import { 
  ModernCard, 
  ModernCardHeader, 
  ModernCardTitle, 
  ModernCardContent,
  ModernCardDescription} from "@/components/ui/modern-card";
import { 
  ModernButton, 
  ModernButtonGroup,
  ModernButtonIcon
} from "@/components/ui/modern-button";
import { 
  ModernInput,
  InputLeftElement,
  InputGroup
} from "@/components/ui/modern-input";
import { 
  ModernDialog,
  ModernDialogContent,
  ModernDialogHeader,
  ModernDialogTitle,
  ModernDialogDescription} from "@/components/ui/modern-dialog";
import { 
  ModernTooltip,
  ModernTooltipContent,
  ModernTooltipTrigger
} from "@/components/ui/modern-tooltip";

// Components
import LoadingSpinner from "../common/LoadingSpinner";
import GroupForm from "./GroupForm";
import GroupsStats from "./GroupsStats";
import GroupsList from "./GroupsList";
import GroupsSuggestions from "./GroupsSuggestions";
import ParticleBackground from "./ParticleBackground";
import GroupsHeader from "./GroupsHeader";
import GroupsFilters from "./GroupsFilters";
import StandardizedDeleteDialog from "../common/StandardizedDeleteDialog";

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
  const { t } = useTranslation();
  const { session } = useSession();
  const { groups, loadingGroups, refreshGroups } = useGroups();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [contactsWithoutGroup, setContactsWithoutGroup] = useState<ContactWithoutGroup[]>([]);
  const [groupSuggestions, setGroupSuggestions] = useState<GroupSuggestion[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGroup] = useState<{id: string, name: string} | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const { storeTriggerElement } = useDialogFocus();

  // New states for enhanced functionality
  const [] = useState<'overview' | 'manage'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
    const colors = new Set(groups.map((g: Group) => g.color).filter((color): color is string => color !== undefined));
    return Array.from(colors);
  }, [groups]);

  if (loadingGroups) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-background/50 to-muted/20 transition-all duration-700 flex items-center justify-center p-4`}>
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <Sparkles className="w-10 h-10 text-white animate-spin" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-xs font-bold text-yellow-900">⚡</span>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-foreground">
              {t('groups.loading_title', 'در حال بارگذاری گروه‌ها...')}
            </h3>
            <p className="text-muted-foreground">
              {t('groups.loading_description', 'لطفاً کمی صبر کنید')}
            </p>
          </div>
          <LoadingSpinner size={48} className="text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background/50 to-muted/20 transition-all duration-700 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Particle Background */}
      <ParticleBackground isDarkMode={isDarkMode} />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <GroupsHeader 
          title={t('groups.title')}
          description={t('groups.description')}
          onAddClick={() => setIsAddDialogOpen(true)}
          isDarkMode={isDarkMode}
          handleThemeToggle={handleThemeToggle}
          isRTL={isRTL}
        />

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="w-full md:w-96">
            <InputGroup className="glass">
              <InputLeftElement>
                <Search className="w-4 h-4 text-muted-foreground" />
              </InputLeftElement>
              <ModernInput
                placeholder={t('common.searchGroups', 'جستجوی گروه‌ها...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>
          
          <div className="flex items-center gap-2">
            <ModernButton
              variant="outline"
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="glass"
            >
              <Filter className="w-4 h-4 ml-1" />
              {t('common.filters', 'فیلترها')}
            </ModernButton>
            
            <ModernButtonGroup className="glass">
              <ModernTooltip>
                <ModernTooltipTrigger asChild>
                  <ModernButtonIcon
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </ModernButtonIcon>
                </ModernTooltipTrigger>
                <ModernTooltipContent>{t('common.gridView', 'نمای شبکه‌ای')}</ModernTooltipContent>
              </ModernTooltip>
              
              <ModernTooltip>
                <ModernTooltipTrigger asChild>
                  <ModernButtonIcon
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </ModernButtonIcon>
                </ModernTooltipTrigger>
                <ModernTooltipContent>{t('common.listView', 'نمای لیستی')}</ModernTooltipContent>
              </ModernTooltip>
            </ModernButtonGroup>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Groups List */}
          <div className="lg:col-span-2 space-y-6">
            <ModernCard variant="glass" hover="lift" className="h-full">
              <ModernCardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <ModernCardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {t('groups.yourGroups', 'گروه‌های شما')}
                  </ModernCardTitle>
                  <span className="text-sm text-muted-foreground">
                    {groups.length} {t('groups.groups', 'گروه')}
                  </span>
                </div>
                {isFilterOpen && (
                  <div className="mt-4">
                    <GroupsFilters
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      colorFilter={colorFilter}
                      setColorFilter={setColorFilter}
                      availableColors={availableColors}
                      clearFilters={clearFilters}
                      isRTL={isRTL}
                    />
                  </div>
                )}
              </ModernCardHeader>
              <ModernCardContent>
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
              </ModernCardContent>
            </ModernCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics Card */}
            <ModernCard variant="glass" hover="lift">
              <ModernCardHeader>
                <ModernCardTitle className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5" />
                  {t('groups.statistics', 'آمار')}
                </ModernCardTitle>
              </ModernCardHeader>
              <ModernCardContent>
                <GroupsStats stats={stats} />
              </ModernCardContent>
            </ModernCard>

            {/* Suggestions Card */}
            <ModernCard variant="glass" hover="lift">
              <ModernCardHeader>
                <ModernCardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {t('groups.suggestions', 'پیشنهادات هوشمند')}
                </ModernCardTitle>
                <ModernCardDescription>
                  {t('groups.suggestionsDescription', 'پیشنهادات هوشمند برای مدیریت بهتر مخاطبین')}
                </ModernCardDescription>
              </ModernCardHeader>
              <ModernCardContent>
                <GroupsSuggestions 
                  contactsWithoutGroup={contactsWithoutGroup}
                  groupSuggestions={groupSuggestions}
                  isLoadingSuggestions={isLoadingSuggestions}
                  generateSuggestions={generateSuggestions}
                  handleApplySuggestion={handleApplySuggestion}
                  handleDiscardSuggestion={handleDiscardSuggestion} activeTab={"overview"}                />
              </ModernCardContent>
            </ModernCard>
          </div>
        </div>

        {/* Add/Edit Group Dialog */}
        <ModernDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <ModernDialogContent className="glass-dialog">
            <ModernDialogHeader>
              <ModernDialogTitle className="text-xl font-bold">
                {editingGroup ? t('groups.editGroup') : t('groups.addGroup')}
              </ModernDialogTitle>
              <ModernDialogDescription>
                {editingGroup 
                  ? t('groups.editGroupDescription')
                  : t('groups.addGroupDescription')}
              </ModernDialogDescription>
            </ModernDialogHeader>
            <div className="py-4">
              <GroupForm
                initialData={editingGroup ? { ...editingGroup } : undefined}
                onSuccess={handleGroupSuccess}
                onCancel={() => {
                  setIsAddDialogOpen(false);
                  setEditingGroup(null);
                }}
              />
            </div>
          </ModernDialogContent>
        </ModernDialog>

        {/* Delete Confirmation Dialog */}
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
      </div>
    </div>
  );
};

export default GroupsManagement;