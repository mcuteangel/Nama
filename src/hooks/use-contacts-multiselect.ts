import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/integrations/supabase/auth';
import { GroupAssignmentService } from '@/services/contact';

interface UseContactsMultiSelectProps {
  groups: any[]; // TODO: Import proper group type
  onGroupsRefresh?: () => void;
}

export const useContactsMultiSelect = ({
  groups,
  onGroupsRefresh
}: UseContactsMultiSelectProps) => {
  const { session } = useSession();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Multi-select state
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [showGroupSelectionDialog, setShowGroupSelectionDialog] = useState(false);

  // Handler functions
  const handleToggleMultiSelect = useCallback(() => {
    setIsMultiSelectMode(prev => !prev);
    setSelectedContacts(new Set());
  }, []);

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
    // This will be handled by ContactList component
    // The actual implementation depends on what contacts are currently visible
  }, []);

  const handleDeselectAll = useCallback(() => {
    setSelectedContacts(new Set());
  }, []);

  const handleBulkDelete = useCallback(async () => {
    if (selectedContacts.size === 0) return;

    // TODO: Implement bulk delete with confirmation dialog
    toast.info(`حذف ${selectedContacts.size} مخاطب انتخابی`);

    // For now, just clear selection
    setSelectedContacts(new Set());
    setIsMultiSelectMode(false);
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
        onGroupsRefresh?.();

        // Clear selection and exit multi-select mode
        setSelectedContacts(new Set());
        setIsMultiSelectMode(false);
      } else {
        toast.error(result.error || t('errors.group_assignment_failed'));
      }
    } catch (error) {
      console.error('Error adding contacts to group:', error);
      toast.error(t('errors.group_assignment_failed'));
    }
  }, [session, selectedContacts, groups, onGroupsRefresh, toast, t]);

  const handleCloseGroupDialog = useCallback(() => {
    setShowGroupSelectionDialog(false);
  }, []);

  return {
    // State
    isMultiSelectMode,
    selectedContacts,
    showGroupSelectionDialog,
    selectedContactsCount: selectedContacts.size,

    // Handlers
    handleToggleMultiSelect,
    handleSelectContact,
    handleSelectAll,
    handleDeselectAll,
    handleBulkDelete,
    handleBulkGroup,
    handleGroupSelected,
    handleCloseGroupDialog,
  };
};
