import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import { ContactCrudService } from "@/services/contact-crud-service";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import { Contact } from '@/types/contact.types';

interface UseContactItemProps {
  contact: Contact;
  onContactDeleted: (id: string) => void;
  onContactEdited: (id: string) => void;
  multiSelect?: boolean;
  isSelected?: boolean;
  onSelect?: (contactId: string, selected: boolean) => void;
}

export const useContactItem = ({
  contact,
  onContactDeleted,
  onContactEdited,
  multiSelect = false,
  isSelected = false,
  onSelect
}: UseContactItemProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDialogClosing, setIsDialogClosing] = useState(false);

  const onSuccessDelete = useCallback(() => {
    ErrorManager.notifyUser(t('contacts.contact_deleted_success'), 'success');
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
    customErrorMessage: t('contacts.error_deleting_contact'),
    onSuccess: onSuccessDelete,
    onError: onErrorDelete,
  });

  const handleContactClick = useCallback(() => {
    if (multiSelect && isSelected) {
      onSelect?.(contact.id, false);
    } else if (multiSelect) {
      onSelect?.(contact.id, true);
    } else {
      navigate(`/contacts/${contact.id}`);
    }
  }, [navigate, contact.id, multiSelect, isSelected, onSelect]);

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

  const handleCheckboxChange = useCallback((selected: boolean) => {
    onSelect?.(contact.id, selected);
  }, [onSelect, contact.id]);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    if (!open) {
      // Set closing flag to prevent any immediate re-opening
      setIsDialogClosing(true);
      setIsDeleteDialogOpen(false);

      // Remove the flag after a short delay
      setTimeout(() => {
        setIsDialogClosing(false);
      }, 50); // Increased delay to match dialog delay
    } else {
      setIsDeleteDialogOpen(true);
      setIsDialogClosing(false);
    }
  }, []);

  return {
    isDeleting,
    isDeleteDialogOpen,
    isDialogClosing,
    handleContactClick,
    handleDelete,
    handleEditClick,
    handleCheckboxChange,
    handleDialogOpenChange
  };
};
