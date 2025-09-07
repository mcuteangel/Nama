import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
  Zap,
  Search,
  Filter,
  Palette,
  X
} from "lucide-react";
import { useGroups } from "@/hooks/use-groups";
import { useSession } from "@/integrations/supabase/auth";
import { supabase } from "@/integrations/supabase/client";
import { invalidateCache } from "@/utils/cache-helpers";
import { ErrorManager } from "@/lib/error-manager";
import { GlassButton, GradientGlassButton } from "@/components/ui/glass-button";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from "@/components/ui/modern-card";
import { ModernTabs, ModernTabsList, ModernTabsTrigger, ModernTabsContent } from "@/components/ui/modern-tabs";
import { ModernInput } from "@/components/ui/modern-input";
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from "@/components/ui/modern-select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import useAppSettings from '@/hooks/use-app-settings';
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

      const ungroupedContacts = contacts.filter((c: any) => c.contact_groups.length === 0);
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

      contactsWithoutGroup.forEach((contact: any) => {
        const companyName = contact.company?.trim();
        if (companyName) {
          const existingGroup = groups.find((g: any) => g.name.toLowerCase() === companyName.toLowerCase());
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
      setGroupSuggestions((prev: any) => prev.filter((s: any) => s.contact_id !== suggestion.contact_id));
      invalidateCache(`contacts_list_${session.user.id}_`);
      fetchContactsWithoutGroup();
    } catch (err: unknown) {
      ErrorManager.logError(err, { component: 'GroupsManagement', action: 'applyGroupSuggestion', suggestion });
      ErrorManager.notifyUser(`${t('ai_suggestions.error_applying_group_suggestion')}: ${ErrorManager.getErrorMessage(err)}`, 'error');
    }
  }, [session, t, fetchContactsWithoutGroup]);

  // Discard a group suggestion
  const handleDiscardSuggestion = useCallback((contactId: string) => {
    setGroupSuggestions((prev: any) => prev.filter((s: any) => s.contact_id !== contactId));
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

  // Tab configuration
  const tabs = [
    {
      id: 'overview' as const,
      label: t('groups.overview_tab', 'نمای کلی'),
      icon: Sparkles,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      description: t('groups.overview_description', 'مشاهده و مدیریت گروه‌ها'),
      gradient: 'from-blue-500 to-purple-600',
    },
    {
      id: 'manage' as const,
      label: t('groups.manage_tab', 'مدیریت پیشرفته'),
      icon: Palette,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      description: t('groups.manage_description', 'ابزارهای پیشرفته مدیریت'),
      gradient: 'from-purple-500 to-pink-600',
    },
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  // Get unique colors for filter
  const availableColors = useMemo(() => {
    const colors = new Set(groups.map((g: any) => g.color).filter(Boolean));
    return Array.from(colors);
  }, [groups]);

  const getColorIcon = (color: string | undefined) => {
    return color ? '🎨' : '⚪';
  };

  const getColorLabel = (color: string | undefined) => {
    if (!color) return t('groups.no_color', 'بدون رنگ');
    return `${t('groups.color', 'رنگ')} ${color}`;
  };

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
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'} transition-all duration-700 p-3 sm:p-4 md:p-6 lg:p-8`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <GlassButton
              onClick={() => navigate(-1)}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <ArrowLeft size={20} />
            </GlassButton>
            <div>
              <motion.h1
                className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {t('groups.title')}
              </motion.h1>
              <motion.p
                className="text-gray-600 dark:text-gray-400 mt-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {t('groups.description')}
              </motion.p>
            </div>
          </div>

          {/* Theme Toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <GlassButton
              onClick={handleThemeToggle}
              variant="ghost"
              size="sm"
              className="p-2"
              title={isDarkMode ? t('theme.switch_to_light', 'تغییر به تم روشن') : t('theme.switch_to_dark', 'تغییر به تم تاریک')}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </GlassButton>
          </motion.div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ModernTabs defaultValue="overview" className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            <ModernTabsList
              className="grid w-full grid-cols-1 sm:grid-cols-2 mb-6 sm:mb-8 bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20"
              glassEffect="default"
              hoverEffect="lift"
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <ModernTabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={`flex items-center gap-1 sm:gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:${tab.gradient} data-[state=active]:text-white transition-all duration-300 hover:scale-105 text-xs sm:text-sm`}
                    hoverEffect="scale"
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={14} className={isRTL ? 'rotate-180' : ''} />
                    <span className="hidden xs:inline">{tab.label}</span>
                  </ModernTabsTrigger>
                );
              })}
            </ModernTabsList>

            {/* Active Tab Indicator */}
            {activeTabData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className={`w-8 h-8 ${activeTabData.bgColor} rounded-lg flex items-center justify-center`}>
                  <activeTabData.icon size={16} className={activeTabData.color} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    {activeTabData.label}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activeTabData.description}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <ModernTabsContent value={activeTab} className="space-y-6 sm:space-y-8">
                <ModernCard variant="glass" hover="lift" className="backdrop-blur-2xl border border-white/30 shadow-2xl">
                  <ModernCardContent className="p-4 sm:p-6 md:p-8">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="animate-in fade-in duration-700"
                    >
                      {activeTab === 'overview' ? (
                        <div className="space-y-8">
                          {/* Statistics Bar */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 rounded-2xl p-4 border border-blue-200/30 dark:border-blue-800/30 backdrop-blur-sm">
                              <div className="flex items-center gap-3">
                                <BarChart3 size={24} className="text-blue-500" />
                                <div>
                                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalGroups}</div>
                                  <div className="text-sm text-blue-500 dark:text-blue-300">{t('groups.total_groups')}</div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 rounded-2xl p-4 border border-green-200/30 dark:border-green-800/30 backdrop-blur-sm">
                              <div className="flex items-center gap-3">
                                <TrendingUp size={24} className="text-green-500" />
                                <div>
                                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completionRate}%</div>
                                  <div className="text-sm text-green-500 dark:text-green-300">{t('groups.completion_rate')}</div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-500/20 dark:to-purple-600/20 rounded-2xl p-4 border border-purple-200/30 dark:border-purple-800/30 backdrop-blur-sm">
                              <div className="flex items-center gap-3">
                                <Activity size={24} className="text-purple-500" />
                                <div>
                                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.ungroupedContacts}</div>
                                  <div className="text-sm text-purple-500 dark:text-purple-300">{t('groups.ungrouped')}</div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 dark:from-orange-500/20 dark:to-orange-600/20 rounded-2xl p-4 border border-orange-200/30 dark:border-orange-800/30 backdrop-blur-sm">
                              <div className="flex items-center gap-3">
                                <Zap size={24} className="text-orange-500" />
                                <div>
                                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.totalSuggestions}</div>
                                  <div className="text-sm text-orange-500 dark:text-orange-300">{t('groups.suggestions')}</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Filters */}
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                                  <Filter className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {t('groups.filters_title', 'فیلترها')}
                                  </h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {t('groups.filters_description', 'گروه‌ها را بر اساس نام و رنگ فیلتر کنید')}
                                  </p>
                                </div>
                              </div>

                              {(searchTerm || colorFilter !== 'all') && (
                                <GlassButton
                                  variant="glass"
                                  size="sm"
                                  onClick={clearFilters}
                                  className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-all duration-300 hover:scale-105"
                                >
                                  <X size={16} className="mr-2" />
                                  {t('actions.clear_filters', 'پاک کردن فیلترها')}
                                </GlassButton>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Search Input */}
                              <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
                                <div className="relative">
                                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" size={20} />
                                  <ModernInput
                                    placeholder={t('groups.search_placeholder', 'جستجو گروه‌ها...')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 pr-4 py-4 text-base rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl"
                                    variant="glass"
                                  />
                                  {searchTerm && (
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                      <Badge variant="secondary" className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                        {t('groups.search_term')}: {searchTerm}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Color Filter */}
                              <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
                                <div className="relative">
                                  <ModernSelect
                                    value={colorFilter}
                                    onValueChange={setColorFilter}
                                  >
                                    <ModernSelectTrigger
                                      variant="glass"
                                      className="w-full py-4 text-base rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl"
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className="text-xl">{getColorIcon(colorFilter === 'all' ? undefined : colorFilter)}</span>
                                        <ModernSelectValue placeholder={t('groups.filter_all_colors', 'همه رنگ‌ها')} />
                                      </div>
                                    </ModernSelectTrigger>
                                    <ModernSelectContent
                                      variant="glass"
                                      className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl"
                                    >
                                      <ModernSelectItem
                                        value="all"
                                        className="py-3 px-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                                      >
                                        <div className="flex items-center gap-3">
                                          <span className="text-lg">🎯</span>
                                          <span className="font-medium">{t('groups.filter_all_colors')}</span>
                                        </div>
                                      </ModernSelectItem>
                                      {availableColors.map((color) => (
                                        <ModernSelectItem
                                          key={color}
                                          value={color}
                                          className="py-3 px-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                                        >
                                          <div className="flex items-center gap-3">
                                            <span className="text-lg">{getColorIcon(color)}</span>
                                            <span className="font-medium">{getColorLabel(color)}</span>
                                          </div>
                                        </ModernSelectItem>
                                      ))}
                                    </ModernSelectContent>
                                  </ModernSelect>
                                </div>
                              </div>
                            </div>

                            {/* Active Filters Summary */}
                            {(searchTerm || colorFilter !== 'all') && (
                              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('groups.active_filters', 'فیلترهای فعال')}:
                                  </span>
                                  {searchTerm && (
                                    <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600">
                                      {t('groups.search')}: "{searchTerm}"
                                    </Badge>
                                  )}
                                  {colorFilter !== 'all' && (
                                    <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600">
                                      {t('groups.color')}: {getColorLabel(colorFilter)}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Add Button */}
                          <div className="flex justify-center">
                            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                              <DialogTrigger asChild>
                                <GradientGlassButton
                                  className="flex items-center gap-4 px-8 py-5 text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 rounded-2xl"
                                >
                                  <Plus size={28} className="animate-pulse" />
                                  {t('groups.add_new')}
                                  <Sparkles className="w-5 h-5 animate-pulse" />
                                </GradientGlassButton>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[600px] p-0 border-none bg-transparent shadow-none">
                                <DialogHeader className="sr-only">
                                  <DialogTitle>{t('groups.add_title', 'افزودن گروه جدید')}</DialogTitle>
                                </DialogHeader>
                                <AddGroupDialog
                                  open={isAddDialogOpen}
                                  onOpenChange={setIsAddDialogOpen}
                                  onGroupAdded={handleGroupSuccess}
                                />
                              </DialogContent>
                            </Dialog>
                          </div>

                          {/* Groups List */}
                          <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-800">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg shadow-lg">
                                  <Users className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {t('groups.existing_groups')} ({stats.filteredGroups})
                                  </h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {t('groups.groups_list_description')}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="px-3 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                  {stats.filteredGroups} {t('groups.of', 'از')} {stats.totalGroups}
                                </div>
                              </div>
                            </div>

                            {filteredGroups.length === 0 ? (
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-900/10 dark:via-transparent dark:to-purple-900/10 rounded-2xl"></div>
                                <div className="relative p-8">
                                  <EmptyState
                                    icon={Users}
                                    title={searchTerm || colorFilter !== 'all' ? t('groups.no_filtered_groups', 'هیچ گروهی با فیلترهای انتخابی یافت نشد') : t('groups.empty_title')}
                                    description={searchTerm || colorFilter !== 'all' ? t('groups.try_different_filters', 'فیلترهای خود را تغییر دهید یا پاک کنید') : t('groups.empty_description')}
                                  >
                                    {(searchTerm || colorFilter !== 'all') && (
                                      <GlassButton
                                        variant="glass"
                                        onClick={clearFilters}
                                        className="px-6 py-3"
                                      >
                                        {t('actions.clear_filters')}
                                      </GlassButton>
                                    )}
                                  </EmptyState>
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredGroups.map((group: any, index: number) => (
                                  <motion.div
                                    key={group.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
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
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-16">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Palette className="w-16 h-16 mx-auto text-purple-500 mb-4" />
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                              {t('groups.manage_advanced_title', 'مدیریت پیشرفته')}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                              {t('groups.manage_advanced_description', 'ابزارهای پیشرفته مدیریت گروه‌ها به زودی اضافه خواهد شد')}
                            </p>
                            <GlassButton
                              variant="glass"
                              onClick={() => setActiveTab('overview')}
                              className="px-6 py-3"
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
        </motion.div>

        {/* Smart Group Suggestions */}
        {contactsWithoutGroup.length > 0 && activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
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
                      <motion.div
                        key={`${suggestion.contact_id}-${suggestion.suggested_group_id}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="group flex items-center justify-between p-6 rounded-3xl shadow-xl hover-lift border-2 border-white/40 dark:border-gray-600/40 backdrop-blur-lg bg-gradient-to-r from-white/60 via-white/40 to-white/20 dark:from-gray-800/60 dark:via-gray-800/40 dark:to-gray-800/20 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/20 hover:scale-[1.02]"
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
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Sparkles size={64} className="text-gray-400 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      {t('ai_suggestions.no_suggestions_available')}
                    </p>
                  </div>
                )}
              </ModernCardContent>
            </ModernCard>
          </motion.div>
        )}

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