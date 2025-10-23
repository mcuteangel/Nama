import { ContactsHeader, ContactsSearchBar, ContactsFilters, ContactsMultiSelectActions, ContactsListContainer, ContactsPagination, ContactsFloatingButton, ContactsStats } from '@/components/contacts';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import { useContactsFilters } from '@/hooks/use-contacts-filters';
import { useContactsMultiSelect } from '@/hooks/use-contacts-multiselect';
import { useGroups } from "@/hooks/use-groups";
import { exportContactsToCsv } from "@/utils/export-contacts";
import { useSession } from "@/integrations/supabase/auth";
import { useTranslation } from 'react-i18next';
import { useAppSettings } from '@/hooks/use-app-settings';
import { useIsMobile } from '@/hooks/use-mobile';
import { designTokens } from '@/lib/design-tokens';
import { GroupSelectionDialog } from "@/components/groups";

const Contacts = React.memo(() => {
  const navigate = useNavigate();
  const { groups, fetchGroups } = useGroups();
  const { session } = useSession();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { settings, updateSettings } = useAppSettings();
  const isMobile = useIsMobile();

  // Use new modular hooks
  const filters = useContactsFilters();
  const multiSelect = useContactsMultiSelect({ groups, onGroupsRefresh: fetchGroups });

  const [totalItems, setTotalItems] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const displayMode = settings.contactDisplayMode || 'grid';

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleAddContactClick = useCallback(() => {
    toast.info(t('notifications.navigating_to_add_contact'));
    navigate("/add-contact");
  }, [navigate, t, toast]);

  const handleExportClick = useCallback(async () => {
    if (!session?.user) {
      toast.error(t('errors.auth_required'));
      return;
    }

    setIsExporting(true);
    toast.info(t('notifications.export_started'));
    try {
      await exportContactsToCsv(session, filters.filterValues);
      toast.success(t('notifications.export_success'));
    } catch (error) {
      toast.error(t('notifications.export_error'));
    } finally {
      setIsExporting(false);
    }
  }, [session, toast, t, filters.filterValues]);

  const handleDisplayModeChange = useCallback((mode: 'grid' | 'list') => {
    updateSettings({ contactDisplayMode: mode });
  }, [updateSettings]);

  return (
    <div
      className={`min-h-screen w-full ${settings.theme === 'dark' ? 'dark' : ''}`}
      style={{
        padding: designTokens.spacing[6]
      }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <ContactsHeader />

        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: designTokens.colors.glass.background,
            border: `1px solid ${designTokens.colors.glass.border}`,
            backdropFilter: 'blur(15px)',
            boxShadow: designTokens.shadows.glass
          }}
        >
          {/* Search and Actions Section */}
          <div
            className="px-8 py-6 border-b"
            style={{
              borderColor: designTokens.colors.glass.border,
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <ContactsSearchBar
              searchTerm={filters.searchTerm}
              multiSelectMode={multiSelect.isMultiSelectMode}
              selectedContactsCount={multiSelect.selectedContactsCount}
              isExporting={isExporting}
              session={session}
              onSearchChange={filters.handleSearchChange}
              onToggleMultiSelect={multiSelect.handleToggleMultiSelect}
              onDeselectAll={multiSelect.handleDeselectAll}
              onAddContact={handleAddContactClick}
              onExport={handleExportClick}
              onBulkDelete={multiSelect.handleBulkDelete}
              onBulkGroup={multiSelect.handleBulkGroup}
            />
          </div>

          {/* Multi-select actions */}
          {multiSelect.isMultiSelectMode && (
            <div
              className="px-8 py-4 border-b"
              style={{
                borderColor: designTokens.colors.glass.border,
                background: 'rgba(59, 130, 246, 0.1)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <ContactsMultiSelectActions
                selectedContactsCount={multiSelect.selectedContactsCount}
                onDeselectAll={multiSelect.handleDeselectAll}
                onBulkDelete={multiSelect.handleBulkDelete}
                onBulkGroup={multiSelect.handleBulkGroup}
              />
            </div>
          )}

          {/* Filters Section */}
          <div
            className="px-8 py-4 border-b"
            style={{
              borderColor: designTokens.colors.glass.border,
              background: designTokens.colors.glass.background,
              backdropFilter: 'blur(15px)'
            }}
          >
            <ContactsFilters
              selectedGroup={filters.selectedGroup}
              companyFilter={filters.companyFilter}
              sortOption={filters.sortOption}
              displayMode={displayMode}
              groups={groups}
              isMobile={isMobile}
              onGroupChange={filters.handleGroupChange}
              onCompanyChange={filters.handleCompanyChange}
              onSortChange={filters.handleSortChange}
              onDisplayModeChange={handleDisplayModeChange}
            />
          </div>

          {/* Contact List Section */}
          <div
            className="p-8"
            style={{
              background: 'rgba(255,255,255,0.05)',
              minHeight: '500px'
            }}
          >
            <ContactsListContainer
              searchTerm={filters.filterValues.searchTerm}
              selectedGroup={filters.filterValues.selectedGroup}
              companyFilter={filters.filterValues.companyFilter}
              sortOption={filters.filterValues.sortOption}
              currentPage={filters.filterValues.currentPage}
              itemsPerPage={filters.filterValues.itemsPerPage}
              totalItems={totalItems}
              displayMode={displayMode}
              multiSelectMode={multiSelect.isMultiSelectMode}
              selectedContacts={multiSelect.selectedContacts}
              onPaginationChange={filters.handlePageChange}
              onTotalChange={setTotalItems}
              onSelectContact={multiSelect.handleSelectContact}
              onSelectAll={multiSelect.handleSelectAll}
            />
          </div>

          {/* Contact Count Display */}
          <div
            className="px-8 py-4 border-t"
            style={{
              borderColor: designTokens.colors.glass.border,
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(15px)'
            }}
          >
            <ContactsStats totalItems={totalItems} />
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
              <ContactsPagination
                currentPage={filters.currentPage}
                itemsPerPage={filters.itemsPerPage}
                totalItems={totalItems}
                isMobile={isMobile}
                onPageChange={filters.handlePageChange}
                onItemsPerPageChange={filters.handleItemsPerPageChange}
              />
            </div>
          )}
        </div>

        <ContactsFloatingButton
          onAddContact={handleAddContactClick}
          isMobile={isMobile}
        />
      </div>

      <GroupSelectionDialog
        open={multiSelect.showGroupSelectionDialog}
        onOpenChange={() => {}}
        onGroupSelected={multiSelect.handleGroupSelected}
        selectedContactCount={multiSelect.selectedContactsCount}
      />
    </div>
  );
});

Contacts.displayName = 'Contacts';

export default Contacts;