import React, { useEffect, useState, useCallback, useMemo } from "react";
import { ModernLoader } from "@/components/ui/modern-loader";
import { ModernGrid } from "@/components/ui/modern-grid";
import { Users } from "lucide-react";
import { ContactListService } from "@/services/contact-list-service";
import { invalidateCache } from "@/utils/cache-helpers";
import { useSession } from "@/integrations/supabase/auth";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import EmptyState from './common/EmptyState';
import ContactItem, { Contact } from './common/ContactItem';
import ContactListItem from './common/ContactListItem';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';

/**
 * Props for the ContactList component
 */
interface ContactListProps {
  /** Search term to filter contacts */
  searchTerm: string;
  /** Selected group ID to filter contacts */
  selectedGroup: string;
  /** Company name to filter contacts */
  companyFilter: string;
  /** Sort option for contact ordering */
  sortOption: string;
  /** Current page for pagination */
  currentPage: number;
  /** Items per page for pagination */
  itemsPerPage: number;
  /** Total number of contacts */
  totalItems: number;
  /** Callback to update pagination */
  onPaginationChange: (page: number, limit: number) => void;
  /** Callback to update total items */
  onTotalChange: (total: number) => void;
  /** Display mode for contacts: 'grid' or 'list' */
  displayMode?: 'grid' | 'list';
  /** Enable multi-select mode */
  multiSelect?: boolean;
  /** Currently selected contacts */
  selectedContacts: Set<string>;
  /** Callback for contact selection */
  onSelectContact?: (contactId: string, selected: boolean) => void;
  /** Callback for select all */
  onSelectAll?: (selected: boolean) => void;
}

/**
 * Main ContactList component that handles both regular and virtualized rendering
 * based on the number of contacts
 */
const ContactList: React.FC<ContactListProps> = ({ 
  searchTerm, 
  selectedGroup, 
  companyFilter, 
  sortOption,
  currentPage,
  itemsPerPage,
  totalItems,
  onPaginationChange,
  onTotalChange,
  displayMode = 'grid',
  multiSelect = false,
  selectedContacts,
  onSelectContact,
  onSelectAll
}) => {
  const { session, isLoading: isSessionLoading } = useSession();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [contacts, setContacts] = useState<Contact[]>([]);

  const onSuccessContacts = useCallback((result: { data: Contact[] | null; error: string | null; total: number }) => {
    if (result.data) {
      setContacts(result.data);
    }
    if (result.total !== undefined) {
      onTotalChange(result.total);
    }
    ErrorManager.notifyUser(t('contact_list.contacts_loaded_success'), 'success');
  }, [t, onTotalChange]);

  const onErrorContacts = useCallback((err: Error) => {
    ErrorManager.logError(err, { component: 'ContactList', action: 'fetchContacts' });
  }, []);

  const {
    isLoading,
    executeAsync,
  } = useErrorHandler<{ data: Contact[] | null; error: string | null; total: number }>(null, {
    maxRetries: 3,
    retryDelay: 1000,
    showToast: false,
    customErrorMessage: t('contact_list.error_loading_contacts' ),
    onSuccess: onSuccessContacts,
    onError: onErrorContacts,
  });

  // Memoize the filter dependencies to prevent unnecessary re-renders
  const filterDeps = useMemo(() => ({
    searchTerm, selectedGroup, companyFilter, sortOption, currentPage, itemsPerPage, displayMode
  }), [searchTerm, selectedGroup, companyFilter, sortOption, currentPage, itemsPerPage, displayMode]);

  const fetchContacts = useCallback(async () => {
    if (isSessionLoading || !session?.user) {
      setContacts([]);
      return;
    }

    await executeAsync(async () => {
      const result = await ContactListService.getFilteredContacts(
        session.user.id,
        searchTerm,
        selectedGroup,
        companyFilter,
        sortOption,
        currentPage,
        itemsPerPage
      );
      // برگرداندن نتیجه مستقیم از سرویس
      return { data: result.data, error: result.error, total: result.total };
    });
  }, [session, isSessionLoading, searchTerm, selectedGroup, companyFilter, sortOption, currentPage, itemsPerPage, executeAsync]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleContactDeleted = useCallback((_deletedId: string) => {
    fetchContacts();
  }, [fetchContacts]);

  const handleContactEdited = useCallback(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Memoize the contact list rendering to prevent unnecessary re-renders
  const contactListContent = useMemo(() => {
    if (contacts.length === 0) {
      return (
        <EmptyState
          icon={Users}
          title={t('empty_states.no_contacts_found')}
          description={t('empty_states.add_first_contact')}
        />
      );
    }
    
    // Use list view when displayMode is 'list'
    if (displayMode === 'list') {
      return (
        <div className="w-full space-y-3 sm:space-y-4 px-0">
          {contacts.map((contact) => (
            <ContactListItem
              key={contact.id}
              contact={contact}
              onContactDeleted={handleContactDeleted}
              onContactEdited={handleContactEdited}
              multiSelect={multiSelect}
              isSelected={selectedContacts.has(contact.id)}
              onSelect={onSelectContact}
            />
          ))}
        </div>
      );
    }
    
    // Use regular grid for small datasets with better UX
    return (
      <ModernGrid
        cols={1}
        gap="sm"
        className="w-full"
      >
        {contacts.map((contact) => (
          <ContactItem
            key={contact.id}
            contact={contact}
            onContactDeleted={handleContactDeleted}
            onContactEdited={handleContactEdited}
            enableGestures={isMobile}
            multiSelect={multiSelect}
            isSelected={selectedContacts.has(contact.id)}
            onSelect={onSelectContact}
          />
        ))}
      </ModernGrid>
    );
  }, [contacts, handleContactDeleted, handleContactEdited, isMobile, t, displayMode, multiSelect, selectedContacts]);

  if (isLoading || isSessionLoading) {
    return (
      <div className="loading-container">
        <ModernLoader variant="spinner" size="lg" />
      </div>
    );
  }

  return (
    <div className="contact-list-container">
      {contactListContent}
    </div>
  );
};

export default ContactList;