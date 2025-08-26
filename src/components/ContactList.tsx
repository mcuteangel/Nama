import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Phone, Mail, Users, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ContactCrudService } from "@/services/contact-crud-service"; // Updated import
import { ContactListService } from "@/services/contact-list-service"; // Updated import
import { fetchWithCache, invalidateCache } from "@/utils/cache-helpers";
import { useSession } from "@/integrations/supabase/auth";
import LoadingMessage from "./common/LoadingMessage";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import EmptyState from './common/EmptyState';
import LoadingSpinner from './common/LoadingSpinner';
import VirtualizedContactList from './VirtualizedContactList';
import TouchGestureHandler from './TouchGestureHandler';
import { GestureCallbacks } from './TouchGestureHandler/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';

/**
 * Phone number data structure
 * @interface PhoneNumber
 */
interface PhoneNumber {
  /** Unique identifier for the phone number */
  id: string;
  /** The phone number string */
  phone_number: string;
  /** Type of phone number (mobile, home, work, etc.) */
  phone_type: string;
  /** Optional extension number */
  extension?: string | null;
}

/**
 * Email address data structure
 * @interface EmailAddress
 */
interface EmailAddress {
  /** Unique identifier for the email address */
  id: string;
  /** The email address string */
  email_address: string;
  /** Type of email address (personal, work, etc.) */
  email_type: string;
}

/**
 * Contact data structure
 * @interface Contact
 */
interface Contact {
  /** Unique identifier for the contact */
  id: string;
  /** Contact's first name */
  first_name: string;
  /** Contact's last name */
  last_name: string;
  /** Contact's gender */
  gender: string;
  /** Contact's job position */
  position?: string | null;
  /** Contact's company */
  company?: string | null;
  /** Street address */
  street?: string | null;
  /** City */
  city?: string | null;
  /** State or province */
  state?: string | null;
  /** ZIP or postal code */
  zip_code?: string | null;
  /** Country */
  country?: string | null;
  /** Additional notes */
  notes?: string | null;
  /** Array of phone numbers */
  phone_numbers: PhoneNumber[];
  /** Array of email addresses */
  email_addresses: EmailAddress[];
  /** URL to contact's avatar image */
  avatar_url?: string | null;
}

/**
 * Props for the ContactList component
 * @interface ContactListProps
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
}

/**
 * ContactItem component for displaying individual contact information
 * 
 * Features:
 * - Touch gesture support (swipe, tap, long press, double tap)
 * - RTL/LTR layout support for different languages
 * - Action panel with edit, delete, call, and email actions
 * - Responsive design for mobile and desktop
 * - Error handling for delete operations
 * - Accessibility support
 * 
 * @param props - Component props
 * @param props.contact - Contact data to display
 * @param props.onContactDeleted - Callback when contact is deleted
 * @param props.onContactEdited - Callback when contact is edited
 * @returns JSX element representing a contact item
 */
const ContactItem = React.memo(({ contact, onContactDeleted, onContactEdited }: { contact: Contact; onContactDeleted: (id: string) => void; onContactEdited: () => void }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const [showActions, setShowActions] = useState(false);
  const [isPressed] = useState(false);
  
  const displayPhoneNumber = contact.phone_numbers.length > 0 ? contact.phone_numbers[0].phone_number : t('contact.no_phone', 'بدون شماره');
  const displayEmail = contact.email_addresses.length > 0 ? contact.email_addresses[0].email_address : undefined;

  const onSuccessDelete = useCallback(() => {
    ErrorManager.notifyUser(t('contact.delete_success', 'مخاطب با موفقیت حذف شد.'), 'success');
    onContactDeleted(contact.id);
  }, [contact.id, onContactDeleted, t]);

  const onErrorDelete = useCallback((err: Error) => {
    ErrorManager.logError(err, { component: 'ContactItem', action: 'deleteContact', contactId: contact.id });
  }, [contact.id]);

  const {
    isLoading: isDeleting,
    executeAsync: executeDelete,
  } = useErrorHandler(null, {
    maxRetries: 3,
    retryDelay: 1000,
    showToast: true,
    customErrorMessage: t('contact.delete_error', 'خطا در حذف مخاطب'),
    onSuccess: onSuccessDelete,
    onError: onErrorDelete,
  });

  const handleContactClick = useCallback(() => {
    navigate(`/contacts/${contact.id}`);
  }, [navigate, contact.id]);

  const handleDelete = useCallback(async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await executeDelete(async () => {
      const { error } = await ContactCrudService.deleteContact(contact.id);
      if (error) throw error;
    });
  }, [executeDelete, contact.id]);

  const handleEditClick = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onContactEdited();
    navigate(`/contacts/edit/${contact.id}`);
  }, [onContactEdited, contact.id, navigate]);

  const handleCall = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (contact.phone_numbers.length > 0) {
      window.location.href = `tel:${contact.phone_numbers[0].phone_number}`;
    }
  }, [contact.phone_numbers]);

  const handleEmail = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (contact.email_addresses.length > 0) {
      window.location.href = `mailto:${contact.email_addresses[0].email_address}`;
    }
  }, [contact.email_addresses]);

  // Touch gesture callbacks
  const gestureCallbacks: GestureCallbacks = useMemo(() => {
    return {
      onTap: () => {
        if (!showActions) {
          handleContactClick();
        } else {
          // If actions are shown, hide them on tap
          setShowActions(false);
        }
      },
      onSwipeLeft: () => {
        if (isMobile) {
          // In RTL (Persian), swipe left should SHOW actions
          // In LTR (English), swipe left should HIDE actions
          const isRTL = document.documentElement.dir === 'rtl';
          setShowActions(isRTL ? true : false);
        }
      },
      onSwipeRight: () => {
        if (isMobile) {
          // In RTL (Persian), swipe right should HIDE actions
          // In LTR (English), swipe right should SHOW actions
          const isRTL = document.documentElement.dir === 'rtl';
          setShowActions(isRTL ? false : true);
        }
      },
      onLongPress: () => {
        if (isMobile) {
          setShowActions(!showActions);
        }
      },
      onDoubleTap: () => {
        handleEditClick();
      },
    };
  }, [handleContactClick, handleEditClick, showActions, isMobile]);

  const gestureConfig = useMemo(() => ({
    swipeThreshold: 30,
    longPressDelay: 400,
    enableHapticFeedback: false,
  }), []);

  const cardContent = (
    <Card
      className={`
        flex items-center justify-between p-3 sm:p-4 glass rounded-lg shadow-sm 
        transition-all duration-300 cursor-pointer relative overflow-hidden
        min-h-[80px] sm:min-h-[auto] w-full
        ${isPressed ? 'scale-95 shadow-lg' : 'hover:shadow-md hover:scale-[1.01]'}
        ${showActions ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
      `}
      onClick={(e) => {
        // Only handle click if it's not on the more options button or action panel
        const target = e.target as HTMLElement;
        if (!target.closest('[data-action-button]') && !target.closest('[data-action-panel]')) {
          if (showActions) {
            setShowActions(false);
          } else {
            handleContactClick();
          }
        }
      }}
    >
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border border-white/50 dark:border-gray-600/50 flex-shrink-0">
          <AvatarImage src={contact?.avatar_url || undefined} alt={contact?.first_name} />
          <AvatarFallback className="bg-blue-500 text-white dark:bg-blue-700 text-sm sm:text-base">
            {contact?.first_name ? contact.first_name[0] : "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base sm:text-lg text-gray-800 dark:text-gray-100 truncate">
            {contact?.first_name} {contact?.last_name}
          </p>
          <p className="text-sm sm:text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1 truncate">
            <Phone size={14} className="sm:w-[14px] sm:h-[14px] flex-shrink-0" /> 
            <span className="truncate text-sm sm:text-sm">{displayPhoneNumber}</span>
          </p>
          {displayEmail && (
            <p className="text-sm sm:text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1 truncate">
              <Mail size={14} className="sm:w-[14px] sm:h-[14px] flex-shrink-0" /> 
              <span className="truncate text-sm sm:text-sm">{displayEmail}</span>
            </p>
          )}
        </div>
      </div>
      
      {/* Desktop Actions - Always visible */}
      {!isMobile && (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-gray-600/50 transition-all duration-200" 
            onClick={handleCall}
            disabled={contact.phone_numbers.length === 0}
          >
            <Phone size={20} />
          </Button>
          {contact.email_addresses.length > 0 && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-purple-600 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-gray-600/50 transition-all duration-200" 
              onClick={handleEmail}
            >
              <Mail size={20} />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-600/50 transition-all duration-200" 
            onClick={handleEditClick}
          >
            <Edit size={20} />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-600/50 transition-all duration-200" 
                onClick={(e) => e.stopPropagation()} 
                disabled={isDeleting}
              >
                {isDeleting ? <LoadingSpinner size={20} /> : <Trash2 size={20} />}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass rounded-xl p-6">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-gray-800 dark:text-gray-100">
                  {t('contact.delete_confirm_title', 'آیا از حذف این مخاطب مطمئن هستید؟')}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                  {t('contact.delete_confirm_message', 'این عمل قابل بازگشت نیست. این مخاطب برای همیشه حذف خواهد شود.')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100">
                  {t('common.cancel', 'لغو')}
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => handleDelete()} 
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold" 
                  disabled={isDeleting}
                >
                  {isDeleting && <LoadingSpinner size={16} className="me-2" />}
                  {t('common.delete', 'حذف')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
      
      {/* Mobile Actions - Slide-in panel */}
      {isMobile && (
        <>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600/50 flex-shrink-0 mr-1" 
            data-action-button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
          >
            <MoreHorizontal size={18} />
          </Button>
          
          {/* Action panel */}
          <div 
            data-action-panel
            className={`
              absolute top-0 h-full bg-white dark:bg-gray-800 shadow-xl z-50
              transition-transform duration-300 ease-in-out flex items-center gap-1 px-2
              border-gray-200 dark:border-gray-600
            `}
            style={{
              width: '140px',
              right: document.documentElement.dir === 'rtl' ? (showActions ? '0' : '-140px') : 'auto',
              left: document.documentElement.dir === 'rtl' ? 'auto' : (showActions ? '0' : '-140px'),
              borderLeftWidth: document.documentElement.dir === 'rtl' ? '1px' : 0,
              borderRightWidth: document.documentElement.dir === 'rtl' ? 0 : '1px',
              transition: 'right 0.3s ease-in-out, left 0.3s ease-in-out'
            }}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-green-600 hover:bg-green-100 dark:text-green-400 w-8 h-8" 
              onClick={handleCall}
              disabled={contact.phone_numbers.length === 0}
            >
              <Phone size={16} />
            </Button>
            {contact.email_addresses.length > 0 && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-purple-600 hover:bg-purple-100 dark:text-purple-400 w-8 h-8" 
                onClick={handleEmail}
              >
                <Mail size={16} />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 w-8 h-8" 
              onClick={handleEditClick}
            >
              <Edit size={16} />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-600 hover:bg-red-100 dark:text-red-400 w-8 h-8" 
                  disabled={isDeleting}
                >
                  {isDeleting ? <LoadingSpinner size={16} /> : <Trash2 size={16} />}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass rounded-xl p-6">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-gray-800 dark:text-gray-100">
                    {t('contact.delete_confirm_title', 'آیا از حذف این مخاطب مطمئن هستید؟')}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                    {t('contact.delete_confirm_message', 'این عمل قابل بازگشت نیست. این مخاطب برای همیشه حذف خواهد شود.')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100">
                    {t('common.cancel', 'لغو')}
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleDelete()} 
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold" 
                    disabled={isDeleting}
                  >
                    {isDeleting && <LoadingSpinner size={16} className="me-2" />}
                    {t('common.delete', 'حذف')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
      
      {/* Swipe indicator for mobile */}
      {isMobile && !showActions && (
        <div 
          className="absolute top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"
          style={{
            // In RTL (Persian): indicator on left (swipe left to show actions)
            // In LTR (English): indicator on right (swipe left to show actions)
            right: document.documentElement.dir === 'rtl' ? 'auto' : '8px',
            left: document.documentElement.dir === 'rtl' ? '8px' : 'auto'
          }}
        >
          <div className="flex items-center gap-1">
            <div className="w-1 h-4 bg-gray-300 rounded animate-pulse"></div>
            <div className="w-1 h-4 bg-gray-300 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-4 bg-gray-300 rounded animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}
    </Card>
  );

  // Use TouchGestureHandler only on mobile
  if (isMobile) {
    return (
      <TouchGestureHandler
        callbacks={gestureCallbacks}
        config={gestureConfig}
        className="block"
      >
        {cardContent}
      </TouchGestureHandler>
    );
  }

  // Desktop version without gesture handling
  return cardContent;
});

ContactItem.displayName = 'ContactItem';

const ContactList = React.memo(({ searchTerm, selectedGroup, companyFilter, sortOption }: ContactListProps) => {
  const { t } = useTranslation();
  const { session, isLoading: isSessionLoading } = useSession();
  const [contacts, setContacts] = useState<Contact[]>([]);

  const onSuccessFetch = useCallback((result: { data: Contact[] | null; error: string | null; fromCache: boolean }) => {
    if (result && !result.fromCache) {
      ErrorManager.notifyUser(t('system_messages.contacts_loaded_success'), 'success');
    }
  }, [t]);

  const onErrorFetch = useCallback((err: Error) => {
    ErrorManager.logError(err, { component: 'ContactList', action: 'fetchContacts' });
    console.error("Error fetching contacts in ContactList:", err);
  }, []);

  const {
    isLoading,
    executeAsync,
  } = useErrorHandler<{ data: Contact[] | null; error: string | null; fromCache: boolean }>(null, {
    maxRetries: 3,
    retryDelay: 1000,
    showToast: false,
    customErrorMessage: t('errors.load_contacts_error'),
    onSuccess: onSuccessFetch,
    onError: onErrorFetch,
  });

  const fetchContacts = useCallback(async () => {
    if (isSessionLoading || !session?.user) {
      setContacts([]);
      return;
    }

    const userId = session.user.id;
    const cacheKey = `contacts_list_${userId}_${searchTerm}_${selectedGroup}_${companyFilter}_${sortOption}`;
    
    await executeAsync(async () => {
      const { data, error, fromCache } = await fetchWithCache<Contact[]>(
        cacheKey,
        async () => {
          const result = await ContactListService.getFilteredContacts( // Updated service call
            userId,
            searchTerm,
            selectedGroup,
            companyFilter,
            sortOption
          );
          return { data: result.data as Contact[], error: result.error };
        }
      );

      if (error) {
        throw new Error(error);
      }
      setContacts(data || []);
      return { data, error: null, fromCache };
    });
  }, [session, isSessionLoading, searchTerm, selectedGroup, companyFilter, sortOption, executeAsync]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleContactDeleted = (_deletedId: string) => {
    const cacheKey = `contacts_list_${session?.user?.id}_${searchTerm}_${selectedGroup}_${companyFilter}_${sortOption}`;
    invalidateCache(cacheKey);
    fetchContacts();
  };

  const handleContactEdited = () => {
    const cacheKey = `contacts_list_${session?.user?.id}_${searchTerm}_${selectedGroup}_${companyFilter}_${sortOption}`;
    invalidateCache(cacheKey);
    fetchContacts();
  };

  if (isLoading || isSessionLoading) {
    return <LoadingMessage message={t('loading_messages.loading_contacts')} />;
  }

  return (
    <div className="space-y-2 sm:space-y-4 w-full px-0">
      {contacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t('empty_states.no_contacts_found')}
          description={t('empty_states.add_first_contact')}
        />
      ) : contacts.length > 50 ? (
        // Use virtualized list for large datasets
        <VirtualizedContactList
          contacts={contacts}
          onContactDeleted={handleContactDeleted}
          onContactEdited={handleContactEdited}
          height={600}
          itemHeight={100}
        />
      ) : (
        // Use regular list for smaller datasets
        contacts.map((contact) => (
          <ContactItem
            key={contact.id}
            contact={contact}
            onContactDeleted={handleContactDeleted}
            onContactEdited={handleContactEdited}
          />
        ))
      )}
    </div>
  );
});

ContactList.displayName = 'ContactList';

export default ContactList;

