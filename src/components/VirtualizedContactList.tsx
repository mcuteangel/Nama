import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useTranslation } from 'react-i18next';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Phone, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ContactCrudService } from "@/services/contact-crud-service";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import LoadingSpinner from './common/LoadingSpinner';

interface PhoneNumber {
  id: string;
  phone_number: string;
  phone_type: string;
  extension?: string | null;
}

interface EmailAddress {
  id: string;
  email_address: string;
  email_type: string;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  position?: string | null;
  company?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  country?: string | null;
  notes?: string | null;
  phone_numbers: PhoneNumber[];
  email_addresses: EmailAddress[];
  avatar_url?: string | null;
}

interface VirtualizedContactListProps {
  contacts: Contact[];
  onContactDeleted: (id: string) => void;
  onContactEdited: (id: string) => void;
  height: number;
  itemHeight?: number;
}

interface ContactItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    contacts: Contact[];
    onContactDeleted: (id: string) => void;
    onContactEdited: (id: string) => void;
  };
}

const ContactItem = React.memo<ContactItemProps>(({ index, style, data }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { contacts, onContactDeleted, onContactEdited } = data;
  const contact = contacts[index];

  const onSuccessDelete = useCallback(() => {
    if (contact) {
      ErrorManager.notifyUser(t('contact_list.contact_deleted_success', 'Contact deleted successfully.'), 'success');
      onContactDeleted(contact.id);
    }
  }, [contact, onContactDeleted, t]);

  const onErrorDelete = useCallback((err: Error) => {
    if (contact) {
      ErrorManager.logError(err, { component: 'VirtualizedContactItem', action: 'deleteContact', contactId: contact.id });
    }
  }, [contact]);

  const {
    isLoading: isDeleting,
    executeAsync: executeDelete,
  } = useErrorHandler(null, {
    maxRetries: 3,
    retryDelay: 1000,
    showToast: true,
    customErrorMessage: t('contact_list.error_deleting_contact', 'Error deleting contact'),
    onSuccess: onSuccessDelete,
    onError: onErrorDelete,
  });

  const handleContactClick = useCallback(() => {
    if (contact) {
      navigate(`/contacts/${contact.id}`);
    }
  }, [navigate, contact]);

  const handleDelete = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (contact) {
      await executeDelete(async () => {
        const { error } = await ContactCrudService.deleteContact(contact.id);
        if (error) throw error;
      });
    }
  }, [executeDelete, contact]);

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (contact) {
      onContactEdited(contact.id);
      navigate(`/contacts/edit/${contact.id}`);
    }
  }, [onContactEdited, contact, navigate]);

  if (!contact) return null;

  const displayPhoneNumber = contact.phone_numbers.length > 0 
    ? contact.phone_numbers[0].phone_number 
    : t('contact_list.no_phone', 'No phone number');
  const displayEmail = contact.email_addresses.length > 0 
    ? contact.email_addresses[0].email_address 
    : undefined;

  return (
    <div style={style} className="px-0 sm:px-2">
      <Card
        className="flex items-center justify-between p-3 sm:p-4 glass rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01] cursor-pointer w-full"
        onClick={handleContactClick}
      >
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border border-white/50 dark:border-gray-600/50">
            <AvatarImage src={contact?.avatar_url || undefined} alt={contact?.first_name} />
            <AvatarFallback className="bg-blue-500 text-white dark:bg-blue-700">
              {contact?.first_name ? contact.first_name[0] : "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-lg text-gray-800 dark:text-gray-100">
              {contact?.first_name} {contact?.last_name}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <Phone size={14} /> {displayPhoneNumber}
            </p>
            {displayEmail && (
              <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                <Mail size={14} /> {displayEmail}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-600/50 transition-all duration-200" onClick={handleEditClick}>
            <Edit size={20} />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-600/50 transition-all duration-200" onClick={(e) => e.stopPropagation()} disabled={isDeleting}>
                {isDeleting ? <LoadingSpinner size={20} /> : <Trash2 size={20} />}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass rounded-xl p-6">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-gray-800 dark:text-gray-100">
                  {t('contact_list.confirm_delete_title', 'Are you sure you want to delete this contact?')}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                  {t('contact_list.confirm_delete_description', 'This action cannot be undone. This contact will be permanently deleted.')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100">
                  {t('common.cancel', 'Cancel')}
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold" disabled={isDeleting}>
                  {isDeleting && <LoadingSpinner size={16} className="me-2" />}
                  {t('common.delete', 'Delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>
    </div>
  );
});

ContactItem.displayName = 'VirtualizedContactItem';

const VirtualizedContactList = React.memo<VirtualizedContactListProps>(({ 
  contacts, 
  onContactDeleted, 
  onContactEdited, 
  height, 
  itemHeight = 100 
}) => {
  const itemData = useMemo(() => ({
    contacts,
    onContactDeleted,
    onContactEdited,
  }), [contacts, onContactDeleted, onContactEdited]);

  return (
    <List
      height={height}
      width="100%"
      itemCount={contacts.length}
      itemSize={itemHeight}
      itemData={itemData}
    >
      {ContactItem}
    </List>
  );
});

VirtualizedContactList.displayName = 'VirtualizedContactList';

export default VirtualizedContactList;


