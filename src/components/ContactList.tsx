import React, { useEffect, useState, useCallback, useMemo } from "react";
import { ModernLoader } from "@/components/ui/modern-loader";
import { ModernGrid } from "@/components/ui/modern-grid";
import { Users } from "lucide-react";
import { ContactListService } from "@/services/contact-list-service";
import { fetchWithCache, invalidateCache } from "@/utils/cache-helpers";
import { useSession } from "@/integrations/supabase/auth";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import EmptyState from './common/EmptyState';
import ContactItem, { Contact } from './common/ContactItem';
import ContactListItem from './common/ContactListItem';
import VirtualizedContactList from './VirtualizedContactList';
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
  /** Display mode for contacts: 'grid' or 'list' */
  displayMode?: 'grid' | 'list';
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
  displayMode = 'grid'
}) => {
  const { session, isLoading: isSessionLoading } = useSession();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [contacts, setContacts] = useState<Contact[]>([]);

  const onSuccessContacts = useCallback((result: { data: Contact[] | null; error: string | null; fromCache: boolean }) => {
    if (result.data) {
      setContacts(result.data);
    }
    if (result && !result.fromCache) {
      ErrorManager.notifyUser(t('contact_list.contacts_loaded_success'), 'success');
    }
  }, [t]);

  const onErrorContacts = useCallback((err: Error) => {
    ErrorManager.logError(err, { component: 'ContactList', action: 'fetchContacts' });
  }, []);

  const {
    isLoading,
    executeAsync,
  } = useErrorHandler<{ data: Contact[] | null; error: string | null; fromCache: boolean }>(null, {
    maxRetries: 3,
    retryDelay: 1000,
    showToast: false,
    customErrorMessage: t('contact_list.error_loading_contacts' ),
    onSuccess: onSuccessContacts,
    onError: onErrorContacts,
  });

  // Memoize the cache key to prevent unnecessary re-renders
  const cacheKey = useMemo(() => {
    return `contacts_list_${session?.user?.id}_${searchTerm}_${selectedGroup}_${companyFilter}_${sortOption}_${displayMode}`;
  }, [session?.user?.id, searchTerm, selectedGroup, companyFilter, sortOption, displayMode]);

  const fetchContacts = useCallback(async () => {
    if (isSessionLoading || !session?.user) {
      setContacts([]);
      return;
    }

    await executeAsync(async () => {
      return await fetchWithCache(
        cacheKey,
        async () => {
          const result = await ContactListService.getFilteredContacts(
            session.user.id,
            searchTerm,
            selectedGroup,
            companyFilter,
            sortOption
          );
          // Convert to the expected format for fetchWithCache
          return { data: result.data, error: result.error };
        }
      );
    });
  }, [session, isSessionLoading, searchTerm, selectedGroup, companyFilter, sortOption, executeAsync, cacheKey]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleContactDeleted = useCallback((_deletedId: string) => {
    invalidateCache(cacheKey);
    fetchContacts();
  }, [cacheKey, fetchContacts]);

  const handleContactEdited = useCallback(() => {
    invalidateCache(cacheKey);
    fetchContacts();
  }, [cacheKey, fetchContacts]);

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
            />
          ))}
        </div>
      );
    }
    
    if (contacts.length > 50) {
      // Use virtualized list for large datasets
      return (
        <VirtualizedContactList
          contacts={contacts}
          onContactDeleted={handleContactDeleted}
          onContactEdited={handleContactEdited}
          height={600}
          itemHeight={100}
        />
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
          />
        ))}
      </ModernGrid>
    );
  }, [contacts, handleContactDeleted, handleContactEdited, isMobile, t, displayMode]);

  if (isLoading || isSessionLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <ModernLoader variant="spinner" size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-4 w-full px-0">
      {contactListContent}
    </div>
  );
};

export default ContactList;