import PageHeader from "@/components/ui/PageHeader";
import { GradientButton, GlassButton } from "@/components/ui/glass-button";
import { ModernLoader } from "@/components/ui/modern-loader";
import { useToast } from "@/components/ui/use-toast";
import { ModernInput } from "@/components/ui/modern-input";
import { PlusCircle, Search, Download, Grid, List, ChevronLeft, ChevronRight, CheckSquare, Square, Trash2, Users } from "lucide-react";
import ContactList from "@/components/ContactList";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDebounce } from '@/hooks/use-performance';
import SuspenseWrapper from '@/components/common/SuspenseWrapper';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from "@/components/ui/modern-select";
import { ModernTooltip, ModernTooltipContent, ModernTooltipTrigger } from "@/components/ui/modern-tooltip";
import { useGroups } from "@/hooks/use-groups";
import { exportContactsToCsv } from "@/utils/export-contacts";
import { useSession } from "@/integrations/supabase/auth";
import { useTranslation } from 'react-i18next';
import { useAppSettings } from '@/hooks/use-app-settings';
import { useIsMobile } from '@/hooks/use-mobile';
import { designTokens } from '@/lib/design-tokens';
import { GroupAssignmentService } from "@/services/contact";
import { GroupSelectionDialog } from "@/components/groups";

const Contacts = React.memo(() => {
  const navigate = useNavigate();
  const { groups, fetchGroups } = useGroups();
  const { session } = useSession();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { settings, updateSettings } = useAppSettings();
  const isMobile = useIsMobile();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [companyFilter, setCompanyFilter] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("last_name_asc");
  const [isExporting, setIsExporting] = useState(false);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [showGroupSelectionDialog, setShowGroupSelectionDialog] = useState(false);
  const displayMode = settings.contactDisplayMode || 'grid';

  // Debounce search terms for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedCompanyFilter = useDebounce(companyFilter, 300);

  // Memoize filter values to prevent unnecessary re-renders
  const filterValues = useMemo(() => ({
    searchTerm: debouncedSearchTerm,
    selectedGroup,
    companyFilter: debouncedCompanyFilter,
    sortOption,
    currentPage,
    itemsPerPage,
  }), [debouncedSearchTerm, selectedGroup, debouncedCompanyFilter, sortOption, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleAddContactClick = useCallback(() => {
    toast.info(t('notifications.navigating_to_add_contact'));
    navigate("/add-contact");
  }, [navigate, t, toast]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleGroupChange = useCallback((value: string) => {
    setSelectedGroup(value === "all" ? "" : value);
  }, []);

  const handleCompanyChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyFilter(event.target.value);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSortOption(value);
  }, []);

  const handleExportClick = useCallback(async () => {
    if (!session?.user) {
      toast.error(t('errors.auth_required'));
      return;
    }

    setIsExporting(true);
    toast.info(t('notifications.export_started'));
    try {
      await exportContactsToCsv(session, filterValues);
      toast.success(t('notifications.export_success'));
    } catch (error) {
      toast.error(t('notifications.export_error'));
    } finally {
      setIsExporting(false);
    }
  }, [session, toast, t, filterValues]);

  const handleSelectContact = useCallback((contactId: string, selected: boolean) => {
    setSelectedContacts(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(contactId);
      } else {
        newSet.delete(contactId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    // This will be handled by ContactList
  }, []);

  const handleDeselectAll = useCallback(() => {
    setSelectedContacts(new Set());
  }, []);

  const handleToggleMultiSelect = useCallback(() => {
    setMultiSelectMode(prev => !prev);
    setSelectedContacts(new Set());
  }, []);

  const handleBulkDelete = useCallback(async () => {
    if (selectedContacts.size === 0) return;

    // TODO: Implement bulk delete with confirmation dialog
    toast.info(`حذف ${selectedContacts.size} مخاطب انتخابی`);
    // For now, just clear selection
    setSelectedContacts(new Set());
    setMultiSelectMode(false);
  }, [selectedContacts, toast]);

  const handleBulkGroup = useCallback(async () => {
    if (selectedContacts.size === 0) return;

    setShowGroupSelectionDialog(true);
  }, [selectedContacts]);

  const handleGroupSelected = useCallback(async (groupId: string) => {
    if (!session?.user || selectedContacts.size === 0) return;

    try {
      const result = await GroupAssignmentService.addContactsToGroup(
        session.user.id,
        Array.from(selectedContacts),
        groupId
      );

      if (result.success) {
        const selectedGroup = groups.find(g => g.id === groupId);
        if (result.addedCount && result.addedCount > 0) {
          toast.success(
            t('groups.contacts_added_to_group', {
              count: result.addedCount,
              groupName: selectedGroup?.name || t('groups.selected_group')
            })
          );
        }

        if (result.failedCount && result.failedCount > 0) {
          toast.warning(
            t('groups.some_contacts_failed', { count: result.failedCount })
          );
        }

        // Refresh groups to update contact counts
        fetchGroups();

        // Clear selection and exit multi-select mode
        setSelectedContacts(new Set());
        setMultiSelectMode(false);
      } else {
        toast.error(result.error || t('errors.group_assignment_failed'));
      }
    } catch (error) {
      console.error('Error adding contacts to group:', error);
      toast.error(t('errors.group_assignment_failed'));
    }
  }, [session, selectedContacts, groups, fetchGroups, toast, t]);

  return (
    <div
      className={`min-h-screen w-full ${settings.theme === 'dark' ? 'dark' : ''}`}
      style={{
        padding: designTokens.spacing[6]
      }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Compact Header Section */}
        {/* Page Header */}
        <PageHeader
          title={t('pages.contacts.management')}
          description={t('pages.contacts.management_description')}
          showBackButton={false}
        />

        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: designTokens.colors.glass.background,
            border: `1px solid ${designTokens.colors.glass.border}`,
            backdropFilter: 'blur(15px)',
            boxShadow: designTokens.shadows.glass
          }}
        >
          {/* Compact Search and Actions Section */}
          <div
            className="px-8 py-6 border-b"
            style={{
              borderColor: designTokens.colors.glass.border,
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 flex-grow">
                {/* Search Input */}
                <div className="relative flex-grow max-w-md">
                  <ModernInput
                    type="text"
                    placeholder={t('pages.contacts.search_placeholder')}
                    className="w-full pl-12 pr-4 py-3 rounded-xl focus:ring-4 focus:ring-blue-500/30"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: `2px solid ${designTokens.colors.glass.border}`,
                      backdropFilter: 'blur(10px)',
                      fontSize: designTokens.typography.sizes.base,
                      fontFamily: designTokens.typography.fonts.primary,
                      boxShadow: designTokens.shadows.glass,
                      transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeOut}`
                    }}
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2"
                    size={18}
                    style={{ color: designTokens.colors.gray[500] }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <ModernTooltip>
                    <ModernTooltipTrigger asChild>
                      <GlassButton
                        onClick={handleToggleMultiSelect}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
                        style={{
                          background: multiSelectMode ? designTokens.colors.primary[500] : designTokens.colors.glass.background,
                          border: `2px solid ${multiSelectMode ? designTokens.colors.primary[500] : designTokens.colors.glass.border}`,
                          backdropFilter: 'blur(10px)',
                          boxShadow: designTokens.shadows.glass,
                          fontFamily: designTokens.typography.fonts.primary,
                          transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeOut}`
                        }}
                      >
                        {multiSelectMode ? <CheckSquare size={20} /> : <Square size={20} />}
                        <span className="hidden sm:inline">{multiSelectMode ? t('actions.exit_multi_select') : t('actions.multi_select')}</span>
                      </GlassButton>
                    </ModernTooltipTrigger>
                    <ModernTooltipContent>
                      <p>{multiSelectMode ? t('actions.exit_multi_select') : t('actions.multi_select')}</p>
                    </ModernTooltipContent>
                  </ModernTooltip>

                  <ModernTooltip>
                    <ModernTooltipTrigger asChild>
                      <GradientButton
                        gradientType="primary"
                        onClick={handleAddContactClick}
                        className="flex items-center gap-2 px-6 py-3 font-semibold rounded-xl"
                        style={{
                          background: designTokens.gradients.primary,
                          boxShadow: designTokens.shadows.primary,
                          fontFamily: designTokens.typography.fonts.primary,
                          transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeOut}`
                        }}
                      >
                        <PlusCircle size={20} />
                        <span className="hidden sm:inline">{t('actions.add_contact')}</span>
                      </GradientButton>
                    </ModernTooltipTrigger>
                    <ModernTooltipContent>
                      <p>{t('actions.add_contact')}</p>
                    </ModernTooltipContent>
                  </ModernTooltip>

                  <ModernTooltip>
                    <ModernTooltipTrigger asChild>
                      <GlassButton
                        onClick={handleExportClick}
                        disabled={isExporting || !session?.user}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
                        style={{
                          background: designTokens.colors.glass.background,
                          border: `2px solid ${designTokens.colors.glass.border}`,
                          backdropFilter: 'blur(10px)',
                          boxShadow: designTokens.shadows.glass,
                          fontFamily: designTokens.typography.fonts.primary,
                          transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeOut}`
                        }}
                      >
                        {isExporting ? (
                          <ModernLoader variant="spinner" size="sm" />
                        ) : (
                          <Download size={20} />
                        )}
                        <span className="hidden sm:inline">{t('actions.export')}</span>
                      </GlassButton>
                    </ModernTooltipTrigger>
                    <ModernTooltipContent>
                      <p>{t('actions.export')}</p>
                    </ModernTooltipContent>
                  </ModernTooltip>
                </div>
              </div>
            </div>
          </div>

          {/* Multi-select actions */}
          {multiSelectMode && (
            <div
              className="px-8 py-4 border-b"
              style={{
                borderColor: designTokens.colors.glass.border,
                background: 'rgba(59, 130, 246, 0.1)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium" style={{ color: designTokens.colors.gray[700] }}>
                    {selectedContacts.size} مخاطب انتخاب شده
                  </span>
                  {selectedContacts.size > 0 && (
                    <ModernTooltip>
                      <ModernTooltipTrigger asChild>
                        <GlassButton
                          onClick={handleDeselectAll}
                          className="flex items-center gap-2 px-3 py-1 rounded-lg font-semibold text-sm"
                          style={{
                            background: 'rgba(156, 163, 175, 0.15)',
                            border: `2px solid ${designTokens.colors.gray[300]}`,
                            backdropFilter: 'blur(10px)',
                            fontFamily: designTokens.typography.fonts.primary,
                            transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeOut}`
                          }}
                        >
                          <Square size={14} />
                          <span className="hidden sm:inline">لغو انتخاب همه</span>
                        </GlassButton>
                      </ModernTooltipTrigger>
                      <ModernTooltipContent>
                        <p>لغو انتخاب همه مخاطبین</p>
                      </ModernTooltipContent>
                    </ModernTooltip>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <ModernTooltip>
                    <ModernTooltipTrigger asChild>
                      <GlassButton
                        onClick={handleBulkDelete}
                        disabled={selectedContacts.size === 0}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold"
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: `2px solid ${designTokens.colors.error[300]}`,
                          backdropFilter: 'blur(10px)',
                          fontFamily: designTokens.typography.fonts.primary,
                          transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeOut}`
                        }}
                      >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">حذف</span>
                      </GlassButton>
                    </ModernTooltipTrigger>
                    <ModernTooltipContent>
                      <p>حذف مخاطبین انتخابی</p>
                    </ModernTooltipContent>
                  </ModernTooltip>

                  <ModernTooltip>
                    <ModernTooltipTrigger asChild>
                      <GlassButton
                        onClick={handleBulkGroup}
                        disabled={selectedContacts.size === 0}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold"
                        style={{
                          background: 'rgba(34, 197, 94, 0.15)',
                          border: `2px solid ${designTokens.colors.success[300]}`,
                          backdropFilter: 'blur(10px)',
                          fontFamily: designTokens.typography.fonts.primary,
                          transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeOut}`
                        }}
                      >
                        <Users size={16} />
                        <span className="hidden sm:inline">افزودن به گروه</span>
                      </GlassButton>
                    </ModernTooltipTrigger>
                    <ModernTooltipContent>
                      <p>افزودن به گروه</p>
                    </ModernTooltipContent>
                  </ModernTooltip>
                </div>
              </div>
            </div>
          )}

          {/* Compact Filters Section */}
          <div
            className="px-8 py-4"
            style={{
              background: designTokens.colors.glass.background,
              borderBottom: `1px solid ${designTokens.colors.glass.border}`,
              backdropFilter: 'blur(15px)'
            }}
          >
            <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-stretch ${isMobile ? '' : 'lg:items-center'} gap-4 ${isMobile ? '' : 'lg:justify-between'}`}>
              <div className={`flex ${isMobile ? 'flex-row items-center justify-between' : 'flex-row'} items-stretch ${isMobile ? '' : 'sm:items-center'} gap-4`}>
                {/* Group Filter */}
                <ModernTooltip>
                  <ModernTooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <ModernSelect onValueChange={handleGroupChange} value={selectedGroup || "all"}>
                        <ModernSelectTrigger
                          className="w-full sm:w-48 rounded-xl focus:ring-4 focus:ring-blue-500/30 text-gray-800 dark:text-gray-100 rtl:text-right ltr:text-left"
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: `2px solid ${designTokens.colors.glass.border}`,
                            backdropFilter: 'blur(10px)',
                            fontSize: designTokens.typography.sizes.sm,
                            boxShadow: designTokens.shadows.glass
                          }}
                        >
                          <ModernSelectValue placeholder={t('groups.all_groups')} />
                        </ModernSelectTrigger>
                        <ModernSelectContent
                          className="rtl:text-right ltr:text-left"
                          style={{
                            background: designTokens.colors.glass.background,
                            border: `1px solid ${designTokens.colors.glass.border}`,
                            backdropFilter: 'blur(15px)'
                          }}
                        >
                          <ModernSelectItem value="all">{t('groups.all_groups')}</ModernSelectItem>
                          {groups.map((group) => (
                            <ModernSelectItem key={group.id} value={group.id}>
                              {group.name}
                            </ModernSelectItem>
                          ))}
                        </ModernSelectContent>
                      </ModernSelect>
                    </div>
                  </ModernTooltipTrigger>
                  <ModernTooltipContent>
                    <p>{t('contact_form.group')}</p>
                  </ModernTooltipContent>
                </ModernTooltip>

                {/* Company Filter */}
                <ModernTooltip>
                  <ModernTooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <ModernInput
                        type="text"
                        placeholder={t('pages.contacts.company_placeholder')}
                        className="w-full sm:w-48 rounded-xl focus:ring-4 focus:ring-blue-500/30 text-gray-800 dark:text-gray-100 rtl:text-right ltr:text-left"
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: `2px solid ${designTokens.colors.glass.border}`,
                          backdropFilter: 'blur(10px)',
                          fontSize: designTokens.typography.sizes.sm,
                          boxShadow: designTokens.shadows.glass
                        }}
                        value={companyFilter}
                        onChange={handleCompanyChange}
                      />
                    </div>
                  </ModernTooltipTrigger>
                  <ModernTooltipContent>
                    <p>{t('contact_form.company')}</p>
                  </ModernTooltipContent>
                </ModernTooltip>
              </div>

              {/* Sort and Display Controls Row */}
              <div className={`flex ${isMobile ? 'flex-row items-center justify-center' : 'flex-row items-center justify-end'} gap-3`}>
                {/* Sort Filter */}
                <ModernTooltip>
                  <ModernTooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <ModernSelect onValueChange={handleSortChange} value={sortOption}>
                        <ModernSelectTrigger
                          className={`${isMobile ? 'w-32' : 'w-full sm:w-48'} rounded-xl focus:ring-4 focus:ring-blue-500/30 text-gray-800 dark:text-gray-100 rtl:text-right ltr:text-left`}
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: `2px solid ${designTokens.colors.glass.border}`,
                            backdropFilter: 'blur(10px)',
                            fontSize: designTokens.typography.sizes.sm,
                            boxShadow: designTokens.shadows.glass
                          }}
                        >
                          <ModernSelectValue placeholder={t('sorting.sort_by')} />
                        </ModernSelectTrigger>
                        <ModernSelectContent
                          className="rtl:text-right ltr:text-left"
                          style={{
                            background: designTokens.colors.glass.background,
                            border: `1px solid ${designTokens.colors.glass.border}`,
                            backdropFilter: 'blur(15px)'
                          }}
                        >
                          <ModernSelectItem value="first_name_asc">{t('sorting.first_name_asc')}</ModernSelectItem>
                          <ModernSelectItem value="first_name_desc">{t('sorting.first_name_desc')}</ModernSelectItem>
                          <ModernSelectItem value="last_name_asc">{t('sorting.last_name_asc')}</ModernSelectItem>
                          <ModernSelectItem value="last_name_desc">{t('sorting.last_name_desc')}</ModernSelectItem>
                          <ModernSelectItem value="created_at_desc">{t('sorting.created_at_desc')}</ModernSelectItem>
                          <ModernSelectItem value="created_at_asc">{t('sorting.created_at_asc')}</ModernSelectItem>
                        </ModernSelectContent>
                      </ModernSelect>
                    </div>
                  </ModernTooltipTrigger>
                  <ModernTooltipContent>
                    <p>{t('actions.sort')}</p>
                  </ModernTooltipContent>
                </ModernTooltip>

                {/* Display Mode Toggle */}
                <div className={`flex items-center ${isMobile ? 'justify-center' : 'justify-end'} gap-2`}>
                  <div
                    className="flex rounded-xl overflow-hidden border-2"
                    style={{
                      borderColor: designTokens.colors.glass.border,
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: designTokens.shadows.glass
                    }}
                  >
                    <ModernTooltip>
                      <ModernTooltipTrigger asChild>
                        <GlassButton
                          variant={displayMode === 'grid' ? "default" : "ghost"}
                          size="sm"
                          className="flex items-center justify-center p-3"
                          style={{
                            background: displayMode === 'grid' ? designTokens.colors.primary[500] : 'transparent',
                            color: displayMode === 'grid' ? 'white' : 'gray',
                            borderRadius: 0,
                            transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeOut}`
                          }}
                          onClick={() => updateSettings({ contactDisplayMode: 'grid' })}
                        >
                          <Grid size={18} />
                        </GlassButton>
                      </ModernTooltipTrigger>
                      <ModernTooltipContent>
                        <p>{t('common.display_modes.grid')}</p>
                      </ModernTooltipContent>
                    </ModernTooltip>

                    <ModernTooltip>
                      <ModernTooltipTrigger asChild>
                        <GlassButton
                          variant={displayMode === 'list' ? "default" : "ghost"}
                          size="sm"
                          className="flex items-center justify-center p-3"
                          style={{
                            background: displayMode === 'list' ? designTokens.colors.primary[500] : 'transparent',
                            color: displayMode === 'list' ? 'white' : designTokens.colors.gray[600],
                            borderRadius: 0,
                            transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeOut}`
                          }}
                          onClick={() => updateSettings({ contactDisplayMode: 'list' })}
                        >
                          <List size={18} />
                        </GlassButton>
                      </ModernTooltipTrigger>
                      <ModernTooltipContent>
                        <p>{t('common.display_modes.list')}</p>
                      </ModernTooltipContent>
                    </ModernTooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact List Section */}
          <div
            className="p-8"
            style={{
              background: 'rgba(255,255,255,0.05)',
              minHeight: '500px'
            }}
          >
            <SuspenseWrapper>
              <ContactList
                searchTerm={filterValues.searchTerm}
                selectedGroup={filterValues.selectedGroup}
                companyFilter={filterValues.companyFilter}
                sortOption={filterValues.sortOption}
                currentPage={filterValues.currentPage}
                itemsPerPage={filterValues.itemsPerPage}
                totalItems={totalItems}
                onPaginationChange={(page, limit) => {
                  setCurrentPage(page);
                  setItemsPerPage(limit);
                }}
                onTotalChange={setTotalItems}
                displayMode={displayMode}
                multiSelect={multiSelectMode}
                selectedContacts={selectedContacts}
                onSelectContact={handleSelectContact}
                onSelectAll={handleSelectAll}
              />
            </SuspenseWrapper>
          </div>

          {/* Contact Count Display */}
          <div
            className="px-8 py-4"
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderTop: `1px solid ${designTokens.colors.glass.border}`,
              backdropFilter: 'blur(15px)'
            }}
          >
            <div className="flex items-center justify-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {totalItems > 0
                  ? `تعداد کل مخاطبین: ${totalItems}`
                  : 'هیچ مخاطبی یافت نشد'
                }
              </span>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalItems > 0 && (
            <div
              className="px-8 py-4 border-t"
              style={{
                borderColor: designTokens.colors.glass.border,
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(15px)'
              }}
            >
              <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center ${isMobile ? 'gap-4' : 'justify-center'} gap-4`}>
                {/* Items per page selector - جمع و جورتر */}
                <div className="flex items-center gap-2">
                  <ModernSelect
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <ModernSelectTrigger className="w-20 h-8 text-xs rtl:text-left ltr:text-right">
                      <ModernSelectValue />
                    </ModernSelectTrigger>
                    <ModernSelectContent className="rtl:text-left ltr:text-right rtl:right-0 ltr:left-0 w-20" position="popper">
                      <ModernSelectItem value="10">۱۰</ModernSelectItem>
                      <ModernSelectItem value="20">۲۰</ModernSelectItem>
                      <ModernSelectItem value="50">۵۰</ModernSelectItem>
                      <ModernSelectItem value="100">۱۰۰</ModernSelectItem>
                    </ModernSelectContent>
                  </ModernSelect>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    در صفحه
                  </span>
                </div>

                {/* Modern Pagination with page numbers */}
                <div className="flex items-center gap-1">
                  {/* Next button - اول در RTL */}
                  <GlassButton
                    onClick={() => setCurrentPage(Math.min(Math.ceil(totalItems / itemsPerPage), currentPage + 1))}
                    disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
                    className="h-8 w-8 p-0 rounded-md"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: `1px solid ${designTokens.colors.glass.border}`,
                    }}
                  >
                    <ChevronRight size={14} />
                  </GlassButton>

                  {/* Page numbers - جمع و جور */}
                  <div className="flex items-center gap-1 mx-2">
                    {Array.from({ length: Math.min(5, Math.ceil(totalItems / itemsPerPage)) }, (_, i) => {
                      const pageNumber = Math.max(1, currentPage - 2) + i;
                      if (pageNumber > Math.ceil(totalItems / itemsPerPage)) return null;

                      return (
                        <GlassButton
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`h-8 w-8 p-0 rounded-md text-xs ${
                            pageNumber === currentPage
                              ? 'bg-blue-500 text-white'
                              : 'bg-transparent text-gray-600 dark:text-gray-400'
                          }`}
                          style={{
                            background: pageNumber === currentPage ? designTokens.colors.primary[500] : 'rgba(255,255,255,0.1)',
                            border: `1px solid ${designTokens.colors.glass.border}`,
                          }}
                        >
                          {pageNumber}
                        </GlassButton>
                      );
                    })}
                  </div>

                  {/* Previous button - دوم در RTL */}
                  <GlassButton
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0 rounded-md"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: `1px solid ${designTokens.colors.glass.border}`,
                    }}
                  >
                    <ChevronLeft size={14} />
                  </GlassButton>
                </div>

                {/* Page info - جمع و جورتر */}
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  صفحه {currentPage} از {Math.max(1, Math.ceil(totalItems / itemsPerPage))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <div className={`fixed ${isMobile ? 'bottom-20' : 'bottom-6'} left-6 z-50`}>
          <ModernTooltip>
            <ModernTooltipTrigger asChild>
              <GradientButton
                data-testid="add-contact-button"
                gradientType="primary"
                onClick={handleAddContactClick}
                className="w-14 h-14 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
                style={{
                  background: designTokens.gradients.primary,
                  boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4), 0 4px 10px rgba(0, 0, 0, 0.1)',
                  fontFamily: designTokens.typography.fonts.primary
                }}
                aria-label={t('actions.add_contact')}
              >
                <PlusCircle size={24} className="text-white" />
              </GradientButton>
            </ModernTooltipTrigger>
            <ModernTooltipContent side="right">
              <p>{t('actions.add_contact')}</p>
            </ModernTooltipContent>
          </ModernTooltip>
        </div>
      </div>

      {/* Group Selection Dialog */}
      <GroupSelectionDialog
        open={showGroupSelectionDialog}
        onOpenChange={setShowGroupSelectionDialog}
        onGroupSelected={handleGroupSelected}
        selectedContactCount={selectedContacts.size}
      />
    </div>
  );
});

Contacts.displayName = 'Contacts';

export default Contacts;