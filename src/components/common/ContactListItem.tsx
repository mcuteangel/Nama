import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassButton } from "@/components/ui/glass-button";
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
import { Edit, Trash2, Phone, Mail, MapPin, Building, User, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ContactCrudService } from "@/services/contact-crud-service";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import LoadingSpinner from './LoadingSpinner';
import TouchGestureHandler from '../TouchGestureHandler';
import { GestureCallbacks } from '../TouchGestureHandler.types';
import { useIsMobile } from '@/hooks/use-mobile';
import { Contact } from './ContactItem';

interface ContactListItemProps {
  contact: Contact;
  onContactDeleted: (id: string) => void;
  onContactEdited: (id: string) => void;
  style?: React.CSSProperties; // For virtualized lists
  className?: string;
}

export const ContactListItem = React.memo<ContactListItemProps>(({ 
  contact, 
  onContactDeleted, 
  onContactEdited, 
  style,
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
    ErrorManager.logError(err, { component: 'ContactListItem', action: 'deleteContact', contactId: contact.id });
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

  // Touch gesture callbacks for mobile
  const gestureCallbacks = useMemo(() => {
    const callbacks: GestureCallbacks = {
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
    return callbacks;
  }, [handleContactClick, handleDelete, handleEditClick, isMobile]);

  // Memoize display values to prevent unnecessary re-calculations
  const displayPhoneNumber = useMemo(() => {
    return contact.phone_numbers.length > 0 
      ? contact.phone_numbers[0].phone_number 
      : t('contact_list.no_phone', 'No phone number');
  }, [contact.phone_numbers, t]);

  const displayEmail = useMemo(() => {
    return contact.email_addresses.length > 0 
      ? contact.email_addresses[0].email_address 
      : undefined;
  }, [contact.email_addresses]);

  const displayPosition = useMemo(() => {
    return contact.position || undefined;
  }, [contact.position]);

  const displayCompany = useMemo(() => {
    return contact.company || undefined;
  }, [contact.company]);

  const displayAddress = useMemo(() => {
    const parts = [];
    if (contact.city) parts.push(contact.city);
    if (contact.state) parts.push(contact.state);
    if (contact.country) parts.push(contact.country);
    
    return parts.length > 0 ? parts.join(', ') : undefined;
  }, [contact.city, contact.state, contact.country]);

  const displayGender = useMemo(() => {
    if (contact.gender === 'male') {
      return { icon: '♂', label: t('contact_list.male', 'Male') };
    } else if (contact.gender === 'female') {
      return { icon: '♀', label: t('contact_list.female', 'Female') };
    } else {
      return { icon: <UserCircle size={14} />, label: t('contact_list.unknown', 'Unknown') };
    }
  }, [contact.gender, t]);

  const displayGroups = useMemo(() => {
    if (contact.contact_groups && contact.contact_groups.length > 0) {
      return contact.contact_groups
        .map(cg => cg.groups)
        .flat()
        .filter(group => group && group.name);
    }
    return [];
  }, [contact.contact_groups]);

  const avatarFallback = useMemo(() => {
    return contact?.first_name ? contact.first_name[0] : "?";
  }, [contact?.first_name]);

  const fullName = useMemo(() => {
    return `${contact?.first_name || ''} ${contact?.last_name || ''}`.trim() || t('contact_list.no_name', 'No name');
  }, [contact?.first_name, contact?.last_name, t]);

  const listItemContent = useMemo(() => (
    <ModernCard
      variant="glass"
      hover="lift"
      style={style}
      className={`flex items-center justify-between p-3 sm:p-4 rounded-lg w-full ${className} border border-white/20 backdrop-blur-md cursor-pointer`}
      onClick={handleContactClick}
    >
      <div className="flex items-center gap-4 flex-grow min-w-0">
        <Avatar className="h-12 w-12 border border-white/50 dark:border-gray-600/50 flex-shrink-0">
          <AvatarImage src={contact?.avatar_url || undefined} alt={contact?.first_name} />
          <AvatarFallback className="bg-blue-500 text-white dark:bg-blue-700">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-grow">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">
              {fullName}
            </p>
            <div 
              className="flex items-center text-lg font-bold text-gray-500 dark:text-gray-400" 
              title={displayGender.label}
            >
              {typeof displayGender.icon === 'string' ? (
                <span className="text-lg">{displayGender.icon}</span>
              ) : (
                displayGender.icon
              )}
            </div>
          </div>
          {/* Display groups with their colors */}
          {displayGroups.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {displayGroups.map((group, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                  style={{
                    backgroundColor: group.color || '#6b7280', // Default to gray if no color
                  }}
                  title={group.name}
                >
                  {group.name}
                </span>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
            <div className="flex items-center gap-1">
              <Phone size={14} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-300 truncate">{displayPhoneNumber}</span>
            </div>
            {displayEmail && (
              <div className="flex items-center gap-1">
                <Mail size={14} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-300 truncate">{displayEmail}</span>
              </div>
            )}
            {displayPosition && (
              <div className="flex items-center gap-1">
                <User size={14} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-300 truncate">{displayPosition}</span>
              </div>
            )}
            {displayCompany && (
              <div className="flex items-center gap-1">
                <Building size={14} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-300 truncate">{displayCompany}</span>
              </div>
            )}
            {displayAddress && (
              <div className="flex items-center gap-1 sm:col-span-2">
                <MapPin size={14} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-300 truncate">{displayAddress}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-1 ms-2">
        <GlassButton 
          variant="ghost" 
          size="icon" 
          className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-600/50 transition-all duration-200 h-8 w-8" 
          onClick={handleEditClick}
        >
          <Edit size={16} />
        </GlassButton>
        <ModernAlertDialog>
          <ModernAlertDialogTrigger asChild>
            <GlassButton 
              variant="ghost" 
              size="icon" 
              className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-600/50 transition-all duration-200 h-8 w-8" 
              onClick={(e) => e.stopPropagation()} 
              disabled={isDeleting}
            >
              {isDeleting ? <LoadingSpinner size={16} /> : <Trash2 size={16} />}
            </GlassButton>
          </ModernAlertDialogTrigger>
          <ModernAlertDialogContent className="glass rounded-xl p-6 border border-white/20 backdrop-blur-md">
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
              <ModernAlertDialogAction 
                onClick={handleDelete} 
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold" 
                disabled={isDeleting}
              >
                {isDeleting && <LoadingSpinner size={16} className="me-2" />}
                {t('common.delete', 'Delete')}
              </ModernAlertDialogAction>
            </ModernAlertDialogFooter>
          </ModernAlertDialogContent>
        </ModernAlertDialog>
      </div>
    </ModernCard>
  ), [
    style,
    className,
    handleContactClick,
    contact?.avatar_url,
    contact?.first_name,
    avatarFallback,
    fullName,
    displayGender,
    displayGroups,
    displayPhoneNumber,
    displayEmail,
    displayPosition,
    displayCompany,
    displayAddress,
    handleEditClick,
    isDeleting,
    t,
    handleDelete
  ]);

  return (
    <div className="px-0 sm:px-2">
      {isMobile ? (
        <TouchGestureHandler callbacks={gestureCallbacks}>
          {listItemContent}
        </TouchGestureHandler>
      ) : (
        listItemContent
      )}
    </div>
  );
});

ContactListItem.displayName = 'ContactListItem';

export default ContactListItem;


