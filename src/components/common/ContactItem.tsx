import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassButton } from "@/components/ui/glass-button";
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
import { designTokens } from '@/lib/design-tokens';

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

interface Group {
  name: string;
  color?: string;
}

interface ContactGroup {
  group_id: string;
  groups: Group[];
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
  contact_groups: ContactGroup[];
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

  const avatarFallback = useMemo(() => {
    const firstInitial = contact?.first_name ? contact.first_name[0] : "?";
    const lastInitial = contact?.last_name ? contact.last_name[0] : "";
    return lastInitial ? `${firstInitial} ${lastInitial}` : firstInitial;
  }, [contact?.first_name, contact?.last_name]);

  const displayGender = useMemo(() => {
    if (contact.gender === 'male') {
      return { icon: '♂', color: designTokens.colors.primary[500] };
    } else if (contact.gender === 'female') {
      return { icon: '♀', color: designTokens.colors.secondary[500] };
    } else {
      return { icon: '⚲', color: designTokens.colors.gray[500] };
    }
  }, [contact.gender]);

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

  const cardContent = useMemo(() => (
    <div
      className={`group relative overflow-hidden rounded-2xl cursor-pointer ${className}`}
      onClick={handleContactClick}
      style={{
        background: designTokens.colors.glass.background,
        border: `1px solid ${designTokens.colors.glass.border}`,
        backdropFilter: 'blur(15px)',
        boxShadow: designTokens.shadows.glass,
        padding: designTokens.spacing[3],
        transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeOut}`,
        width: '100%'
      }}
    >
      {/* Background gradient overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
        style={{
          background: designTokens.gradients.primary,
          borderRadius: designTokens.borderRadius.xl
        }}
      />

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-6 flex-grow min-w-0">
          <div className="relative">
            <Avatar className="h-16 w-16 ring-2 transition-all duration-300 group-hover:ring-4"
              style={{
                border: `2px solid ${designTokens.colors.primary[300]}`,
                boxShadow: designTokens.shadows.lg
              }}
            >
              <AvatarImage src={contact?.avatar_url || undefined} alt={contact?.first_name} />
              <AvatarFallback
                style={{
                  background: designTokens.gradients.primary,
                  color: 'white',
                  fontSize: designTokens.typography.sizes.xl,
                  fontWeight: designTokens.typography.weights.bold
                }}
              >
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
            {/* Gender indicator */}
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold"
              style={{
                background: displayGender.color,
                boxShadow: designTokens.shadows.md
              }}
            >
              {displayGender.icon}
            </div>
          </div>

          <div className="min-w-0 flex-grow">
            <h3
              className="font-semibold text-base mb-1 truncate"
              style={{
                fontFamily: designTokens.typography.fonts.primary,
                color: designTokens.colors.gray[800],
                marginBottom: designTokens.spacing[1]
              }}
            >
              {contact?.first_name} {contact?.last_name}
            </h3>

            <div className="grid grid-cols-1 gap-2">
              <div
                className="flex items-center gap-3 p-2 rounded-xl"
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: `1px solid rgba(59, 130, 246, 0.2)`
                }}
              >
                <Phone size={16} style={{ color: designTokens.colors.primary[600] }} />
                <span
                  className="text-sm font-medium truncate"
                  style={{ color: designTokens.colors.gray[700] }}
                >
                  {displayPhoneNumber}
                </span>
              </div>

              {displayEmail && (
                <div
                  className="flex items-center gap-3 p-2 rounded-xl"
                  style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: `1px solid rgba(139, 92, 246, 0.2)`
                  }}
                >
                  <Mail size={16} style={{ color: designTokens.colors.secondary[600] }} />
                  <span
                    className="text-sm font-medium truncate"
                    style={{ color: designTokens.colors.gray[700] }}
                  >
                    {displayEmail}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-3 bottom-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0">
          <GlassButton
            variant="ghost"
            size="icon"
            className="w-9 h-9 hover:scale-105 rounded-xl shadow-md backdrop-blur-md border-0 hover:shadow-lg transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(37, 99, 235, 0.95))',
              boxShadow: '0 6px 20px -6px rgba(59, 130, 246, 0.4)'
            }}
            onClick={handleEditClick}
          >
            <Edit size={15} style={{ color: 'white' }} />
          </GlassButton>

          <ModernAlertDialog>
            <ModernAlertDialogTrigger asChild>
              <GlassButton
                variant="ghost"
                size="icon"
                className="w-9 h-9 hover:scale-105 rounded-xl shadow-md backdrop-blur-md border-0 hover:shadow-lg transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))',
                  boxShadow: '0 6px 20px -6px rgba(239, 68, 68, 0.4)'
                }}
                onClick={(e) => e.stopPropagation()}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <LoadingSpinner size={16} className="text-white" />
                ) : (
                  <Trash2 size={15} style={{ color: 'white' }} />
                )}
              </GlassButton>
            </ModernAlertDialogTrigger>
            <ModernAlertDialogContent
              className="glass rounded-2xl"
              style={{
                background: designTokens.colors.glass.background,
                border: `1px solid ${designTokens.colors.glass.border}`,
                backdropFilter: 'blur(20px)',
                boxShadow: designTokens.shadows.glass3d,
                padding: designTokens.spacing[6]
              }}
            >
              <ModernAlertDialogHeader>
                <ModernAlertDialogTitle
                  style={{
                    color: designTokens.colors.gray[800],
                    fontSize: designTokens.typography.sizes.xl,
                    fontWeight: designTokens.typography.weights.bold,
                    fontFamily: designTokens.typography.fonts.primary
                  }}
                >
                  {t('contact_list.confirm_delete_title', 'Are you sure you want to delete this contact?')}
                </ModernAlertDialogTitle>
                <ModernAlertDialogDescription
                  style={{
                    color: designTokens.colors.gray[600],
                    fontSize: designTokens.typography.sizes.base,
                    marginTop: designTokens.spacing[2]
                  }}
                >
                  {t('contact_list.confirm_delete_description', 'This action cannot be undone. This contact will be permanently deleted.')}
                </ModernAlertDialogDescription>
              </ModernAlertDialogHeader>
              <ModernAlertDialogFooter style={{ gap: designTokens.spacing[3], marginTop: designTokens.spacing[6] }}>
                <ModernAlertDialogCancel
                  style={{
                    padding: `${designTokens.spacing[3]} ${designTokens.spacing[5]}`,
                    borderRadius: designTokens.borderRadius.xl,
                    background: designTokens.colors.gray[200],
                    color: designTokens.colors.gray[800],
                    fontWeight: designTokens.typography.weights.semibold,
                    border: 'none',
                    transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeOut}`
                  }}
                >
                  {t('common.cancel', 'Cancel')}
                </ModernAlertDialogCancel>
                <ModernAlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  style={{
                    padding: `${designTokens.spacing[3]} ${designTokens.spacing[5]}`,
                    borderRadius: designTokens.borderRadius.xl,
                    background: designTokens.colors.error[600],
                    color: 'white',
                    fontWeight: designTokens.typography.weights.semibold,
                    border: 'none',
                    transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeOut}`
                  }}
                >
                  {isDeleting && <LoadingSpinner size={18} className="me-2" />}
                  {t('common.delete', 'Delete')}
                </ModernAlertDialogAction>
              </ModernAlertDialogFooter>
            </ModernAlertDialogContent>
          </ModernAlertDialog>
        </div>
      </div>
    </div>
  ), [
    className,
    handleContactClick,
    contact?.avatar_url,
    contact?.first_name,
    contact?.last_name,
    avatarFallback,
    displayPhoneNumber,
    displayEmail,
    displayGender.color,
    displayGender.icon,
    handleEditClick,
    isDeleting,
    t,
    handleDelete
  ]);

  if (!contact) return null;

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
