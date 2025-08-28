import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ModernButton } from "@/components/ui/modern-button";
import { ModernCard } from "@/components/ui/modern-card";
import { 
  ModernAlertDialog, 
  ModernAlertDialogAction, 
  ModernAlertDialogCancel, 
  ModernAlertDialogContent, 
  ModernAlertDialogDescription, 
  ModernAlertDialogFooter, 
  ModernAlertDialogHeader, 
  ModernAlertDialogTitle, 
  ModernAlertDialogTrigger 
} from "@/components/ui/modern-alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Trash2, Phone, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ContactCrudService } from "@/services/contact-crud-service";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import LoadingSpinner from './LoadingSpinner';
import TouchGestureHandler from '../TouchGestureHandler';
import { GestureCallbacks } from '../TouchGestureHandler.types';
import { useIsMobile } from '@/hooks/use-mobile';

// Shared type definitions
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

export interface Contact {
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

interface ContactItemProps {
  contact: Contact;
  onContactDeleted: (id: string) => void;
  onContactEdited: (id: string) => void;
  style?: React.CSSProperties; // For virtualized lists
  enableGestures?: boolean; // Whether to enable touch gestures
  className?: string;
}

export const ContactItem = React.memo<ContactItemProps>(({ 
  contact, 
  onContactDeleted, 
  onContactEdited, 
  style, 
  enableGestures = false,
  className = ""
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const onSuccessDelete = useCallback(() => {
    ErrorManager.notifyUser(t('contact_list.contact_deleted_success', 'Contact deleted successfully.'), 'success');
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
    customErrorMessage: t('contact_list.error_deleting_contact', 'Error deleting contact'),
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
    onContactEdited(contact.id);
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

  if (!contact) return null;

  const displayPhoneNumber = contact.phone_numbers.length > 0 
    ? contact.phone_numbers[0].phone_number 
    : t('contact_list.no_phone', 'No phone number');
  const displayEmail = contact.email_addresses.length > 0 
    ? contact.email_addresses[0].email_address 
    : undefined;

  // Touch gesture callbacks for mobile
  const gestureCallbacks: GestureCallbacks = {
    onTap: handleContactClick,
    onLongPress: () => {
      // Show action menu on long press
    },
    onSwipeLeft: () => {
      if (isMobile) handleDelete();
    },
    onSwipeRight: () => {
      if (isMobile) handleEditClick();
    }
  };

  const cardContent = (
    <ModernCard
      variant="glass"
      hover="lift"
      className={`flex items-center justify-between p-3 sm:p-4 rounded-lg cursor-pointer w-full ${className}`}
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
        <ModernButton 
          variant="ghost" 
          size="icon" 
          className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-600/50 transition-all duration-200" 
          onClick={handleEditClick}
        >
          <Edit size={20} />
        </ModernButton>
        <ModernAlertDialog>
          <ModernAlertDialogTrigger asChild>
            <ModernButton 
              variant="ghost" 
              size="icon" 
              className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-600/50 transition-all duration-200" 
              onClick={(e) => e.stopPropagation()} 
              disabled={isDeleting}
            >
              {isDeleting ? <LoadingSpinner size={20} /> : <Trash2 size={20} />}
            </ModernButton>
          </ModernAlertDialogTrigger>
          <ModernAlertDialogContent className="glass rounded-xl p-6">
            <ModernAlertDialogHeader>
              <ModernAlertDialogTitle className="text-gray-800 dark:text-gray-100">
                {t('contact_list.confirm_delete_title', 'Are you sure you want to delete this contact?')}
              </ModernAlertDialogTitle>
              <ModernAlertDialogDescription className="text-gray-600 dark:text-gray-300">
                {t('contact_list.confirm_delete_description', 'This action cannot be undone. This contact will be permanently deleted.')}
              </ModernAlertDialogDescription>
            </ModernAlertDialogHeader>
            <ModernAlertDialogFooter>
              <ModernAlertDialogCancel className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100">
                {t('common.cancel', 'Cancel')}
              </ModernAlertDialogCancel>
              <ModernAlertDialogAction onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold" disabled={isDeleting}>
                {isDeleting && <LoadingSpinner size={16} className="me-2" />}
                {t('common.delete', 'Delete')}
              </ModernAlertDialogAction>
            </ModernAlertDialogFooter>
          </ModernAlertDialogContent>
        </ModernAlertDialog>
      </div>
    </ModernCard>
  );

  return (
    <div style={style} className="px-0 sm:px-2">
      {enableGestures && isMobile ? (
        <TouchGestureHandler callbacks={gestureCallbacks}>
          {cardContent}
        </TouchGestureHandler>
      ) : (
        cardContent
      )}
    </div>
  );
});

ContactItem.displayName = 'ContactItem';

export default ContactItem;






