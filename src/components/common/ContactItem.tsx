import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassButton } from "@/components/ui/glass-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Trash2, Phone, Mail, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ContactCrudService } from "@/services/contact-crud-service";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import LoadingSpinner from './LoadingSpinner';
import TouchGestureHandler from '../TouchGestureHandler';
import { GestureCallbacks } from '../TouchGestureHandler.types';
import { useIsMobile } from '@/hooks/use-mobile';
import { designTokens } from '@/lib/design-tokens';
import StandardizedDeleteDialog from './StandardizedDeleteDialog';

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
  multiSelect?: boolean;
  isSelected?: boolean;
  onSelect?: (contactId: string, selected: boolean) => void;
}

export const ContactItem = React.memo<ContactItemProps>(({
  contact,
  onContactDeleted,
  onContactEdited,
  style,
  enableGestures = false,
  className = "",
  multiSelect = false,
  isSelected = false,
  onSelect
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
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

  // Memoize display values to prevent unnecessary re-calculations
  const displayPhoneNumber = useMemo(() => {
    return contact.phone_numbers.length > 0
      ? contact.phone_numbers[0].phone_number
      : t('contacts.no_phone');
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

  const checkboxStyle = {
    base: 'absolute top-3 left-3 z-20 h-5 w-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center',
    unselected: 'border-gray-300 bg-white group-hover:border-primary-400',
    selected: 'border-primary-500 bg-primary-500',
    checkIcon: 'h-3.5 w-3.5 text-white transition-transform duration-200',
    checkMark: 'h-3 w-3 text-white transition-all duration-200 scale-90 group-hover:scale-100',
    checkMarkSelected: 'scale-100'
  };

  const cardContent = useMemo(() => (
    <div
      className={`group relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl ${className} ${multiSelect && isSelected ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''}`}
      onClick={handleContactClick}
      style={{
        background: isSelected 
          ? 'rgba(59, 130, 246, 0.1)' 
          : 'rgba(255, 255, 255, 0.7)',
        border: `1px solid ${isSelected 
          ? designTokens.colors.primary[400] 
          : 'rgba(0, 0, 0, 0.05)'}`,
        backdropFilter: 'blur(12px)',
        boxShadow: isSelected 
          ? '0 10px 25px -5px rgba(59, 130, 246, 0.2), 0 8px 10px -6px rgba(59, 130, 246, 0.2)'
          : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        padding: designTokens.spacing[4],
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        width: '100%',
        pointerEvents: isDeleteDialogOpen || isDialogClosing ? 'none' : 'auto',
        userSelect: isDeleteDialogOpen || isDialogClosing ? 'none' : 'auto',
        willChange: 'transform, box-shadow, border-color',
        position: 'relative',
        overflow: 'hidden',
        paddingRight: multiSelect ? '2.5rem' : designTokens.spacing[4],
      }}
    >
      {/* چک‌باکس انتخابی */}
      {multiSelect && (
        <div 
          className={`absolute top-3 right-3 z-20 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            isSelected 
              ? 'border-primary-500 bg-primary-500' 
              : 'border-gray-300 bg-white group-hover:border-primary-400'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(contact.id, !isSelected);
          }}
        >
          {isSelected && (
            <Check className="h-4 w-4 text-white transition-transform duration-200" />
          )}
        </div>
      )}
      {/* Background gradient overlay */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-all duration-500 ease-out"
        style={{
          background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
          borderRadius: '1.5rem',
          transform: 'scale(0.95) translateZ(0)',
          transition: 'opacity 0.3s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      />
      <div 
        className="absolute inset-0 border-2 border-transparent group-hover:border-blue-100 transition-all duration-300 rounded-3xl pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 20px rgba(59, 130, 246, 0.1)'
        }}
      />

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-6 flex-grow min-w-0">
          <div className="relative group/avatar">
            <div className="relative">
              <Avatar 
                className="h-16 w-16 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 transition-all duration-500 ease-out group-hover:ring-4 group-hover:ring-primary-400/50"
                style={{
                  border: `2px solid ${designTokens.colors.primary[300]}`,
                  boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.1)',
                  transform: 'translateZ(0)',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <AvatarImage 
                  src={contact?.avatar_url || undefined} 
                  alt={contact?.first_name} 
                  className="transition-transform duration-700 group-hover/avatar:scale-110"
                />
                <AvatarFallback
                  className="transition-all duration-500 group-hover/avatar:scale-110"
                  style={{
                    background: designTokens.gradients.primary,
                    color: 'white',
                    fontSize: designTokens.typography.sizes.xl,
                    fontWeight: designTokens.typography.weights.bold,
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
              
              {/* Animated gender indicator */}
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold transform transition-all duration-300 group-hover/avatar:scale-110 group-hover/avatar:-translate-y-1"
                style={{
                  background: displayGender.color,
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
                  zIndex: 10
                }}
              >
                <span className="transition-transform duration-300 group-hover/avatar:scale-125">
                  {displayGender.icon}
                </span>
              </div>
              
              {/* Subtle pulse effect */}
              <div 
                className="absolute inset-0 rounded-full bg-primary-100/30 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-700"
                style={{
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  transform: 'scale(1.1)'
                }}
              />
            </div>
          </div>

          <div className="min-w-0 flex-grow transition-all duration-300 group-hover:translate-x-1">
            <h3
              className="font-semibold text-base mb-1.5 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300"
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

        <div className="absolute top-0 left-3 bottom-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0" style={{ pointerEvents: 'auto' }}>

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

          <GlassButton
            variant="ghost"
            size="icon"
            className="w-9 h-9 hover:scale-105 rounded-xl shadow-md backdrop-blur-md border-0 hover:shadow-lg transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))',
              boxShadow: '0 6px 20px -6px rgba(239, 68, 68, 0.4)'
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setIsDeleteDialogOpen(true);
            }}
            disabled={isDeleting || isDialogClosing}
          >
            {isDeleting ? (
              <LoadingSpinner size={16} className="text-white" />
            ) : (
              <Trash2 size={15} style={{ color: 'white' }} />
            )}
          </GlassButton>

          <StandardizedDeleteDialog
            open={isDeleteDialogOpen}
            onOpenChange={(open) => {
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
            }}
            onConfirm={handleDelete}
            title={t('contacts.confirm_delete_title')}
            description={t('contacts.confirm_delete_description')}
            isDeleting={isDeleting}
          />
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
    displayGender,
    handleEditClick,
    isDeleting,
    t,
    handleDelete,
    isDeleteDialogOpen,
    isDialogClosing,
    multiSelect,
    isSelected,
    onSelect,
    contact.id
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
