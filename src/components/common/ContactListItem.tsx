import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassButton } from "@/components/ui/glass-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Trash2, Phone, Mail, MapPin, Building, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ContactCrudService } from "@/services/contact-crud-service";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import LoadingSpinner from './LoadingSpinner';
import TouchGestureHandler from '../TouchGestureHandler';
import { GestureCallbacks } from '../TouchGestureHandler.types';
import { useIsMobile } from '@/hooks/use-mobile';
import { Contact } from './ContactItem';
import { designTokens } from '@/lib/design-tokens';
import StandardizedDeleteDialog from './StandardizedDeleteDialog';

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
  className = ""
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDialogClosing, setIsDialogClosing] = useState(false);

  const onSuccessDelete = useCallback(() => {
    ErrorManager.notifyUser(t('contact_list.contact_deleted_success'), 'success');
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
    customErrorMessage: t('contact_list.error_deleting_contact'),
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
      : t('contact_list.no_phone');
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

  const displayGroups = useMemo(() => {
    if (contact.contact_groups && contact.contact_groups.length > 0) {
      return contact.contact_groups
        .map(cg => cg.groups)
        .flat()
        .filter(group => group && group.name);
    }
    return [];
  }, [contact.contact_groups]);

  const displayGender = useMemo(() => {
    if (contact.gender === 'male') {
      return { icon: '♂', label: t('contact_list.male') };
    } else if (contact.gender === 'female') {
      return { icon: '♀', label: t('contact_list.female') };
    } else {
      return { icon: '⚲', label: t('contact_list.unknown') };
    }
  }, [contact.gender, t]);

  const avatarFallback = useMemo(() => {
    const firstInitial = contact?.first_name ? contact.first_name[0] : "?";
    const lastInitial = contact?.last_name ? contact.last_name[0] : "";
    return lastInitial ? `${firstInitial} ${lastInitial}` : firstInitial;
  }, [contact?.first_name, contact?.last_name]);

  const fullName = useMemo(() => {
    return `${contact?.first_name || ''} ${contact?.last_name || ''}`.trim() || t('contact_list.no_name');
  }, [contact?.first_name, contact?.last_name, t]);

  const listItemContent = useMemo(() => (
    <div
      className={`group relative overflow-hidden rounded-3xl cursor-pointer ${className}`}
      onClick={handleContactClick}
      style={{
        background: designTokens.colors.glass.background,
        border: `1px solid ${designTokens.colors.glass.border}`,
        backdropFilter: 'blur(20px)',
        boxShadow: designTokens.shadows.glass,
        padding: designTokens.spacing[4],
        transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeOut}`,
        width: '100%',
        pointerEvents: isDeleteDialogOpen || isDialogClosing ? 'none' : 'auto',
        userSelect: isDeleteDialogOpen || isDialogClosing ? 'none' : 'auto'
      }}
    >
      {/* Background gradient overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
        style={{
          background: designTokens.gradients.sunset,
          borderRadius: designTokens.borderRadius['2xl']
        }}
      />

      <div className="relative z-10 flex items-start justify-between gap-8">
        <div className="flex items-start gap-6 flex-grow min-w-0">
          <div className="relative flex-shrink-0">
            <Avatar className="h-12 w-12 ring-2 transition-all duration-300 group-hover:ring-4"
              style={{
                border: `2px solid ${designTokens.colors.secondary[300]}`,
                boxShadow: designTokens.shadows.lg
              }}
            >
              <AvatarImage src={contact?.avatar_url || undefined} alt={contact?.first_name} />
              <AvatarFallback
                style={{
                  background: designTokens.gradients.purple,
                  color: 'white',
                  fontSize: designTokens.typography.sizes.lg,
                  fontWeight: designTokens.typography.weights.bold
                }}
              >
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
            {/* Gender indicator */}
            <div
              className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full border-3 border-white flex items-center justify-center text-sm font-bold"
              style={{
                background: displayGender.icon === '♂' ? designTokens.colors.primary[500] : designTokens.colors.secondary[500],
                boxShadow: designTokens.shadows.lg
              }}
              title={displayGender.label}
            >
              {typeof displayGender.icon === 'string' ? displayGender.icon : '⚲'}
            </div>
          </div>

          <div className="min-w-0 flex-grow space-y-4">
            {/* Name and groups in same row */}
            <div className="flex items-center gap-3 mb-2">
              <h3
                className="font-semibold text-base truncate"
                style={{
                  fontFamily: designTokens.typography.fonts.primary,
                  color: designTokens.colors.gray[800]
                }}
              >
                {fullName}
              </h3>

              {/* Groups inline with name */}
              {displayGroups.length > 0 && (
                <div className="flex gap-2">
                  {displayGroups.slice(0, 2).map((group, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold text-white"
                      style={{
                        background: group.color || designTokens.colors.gray[600],
                        fontFamily: designTokens.typography.fonts.secondary
                      }}
                      title={group.name}
                    >
                      {group.name}
                    </span>
                  ))}
                  {displayGroups.length > 2 && (
                    <span
                      className="text-xs text-gray-500 font-medium"
                      style={{ fontFamily: designTokens.typography.fonts.secondary }}
                    >
                      +{displayGroups.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Contact details in a compact horizontal layout */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Phone size={16} style={{ color: designTokens.colors.primary[600] }} />
                <span className="font-medium" style={{ color: designTokens.colors.gray[700] }}>
                  {displayPhoneNumber}
                </span>
              </div>

              {displayEmail && (
                <>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center gap-2">
                    <Mail size={16} style={{ color: designTokens.colors.secondary[600] }} />
                    <span className="font-medium" style={{ color: designTokens.colors.gray[700] }}>
                      {displayEmail}
                    </span>
                  </div>
                </>
              )}

              {(displayPosition || displayCompany) && (
                <>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center gap-3">
                    {displayPosition && (
                      <div className="flex items-center gap-1">
                        <User size={14} style={{ color: designTokens.colors.success[600] }} />
                        <span className="font-medium" style={{ color: designTokens.colors.gray[700] }}>
                          {displayPosition}
                        </span>
                      </div>
                    )}
                    {displayCompany && (
                      <>
                        {displayPosition && <span className="text-gray-400 mx-1">@</span>}
                        <div className="flex items-center gap-1">
                          <Building size={14} style={{ color: designTokens.colors.warning[600] }} />
                          <span className="font-medium" style={{ color: designTokens.colors.gray[700] }}>
                            {displayCompany}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}

              {displayAddress && (
                <>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} style={{ color: designTokens.colors.error[600] }} />
                    <span className="font-medium" style={{ color: designTokens.colors.gray[700] }}>
                      {displayAddress}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 flex-shrink-0" style={{ pointerEvents: 'auto' }}>
          <GlassButton
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 rounded-2xl"
            style={{
              background: 'rgba(59, 130, 246, 0.15)',
              border: `2px solid ${designTokens.colors.primary[300]}`,
              width: '44px',
              height: '44px',
              backdropFilter: 'blur(10px)'
            }}
            onClick={handleEditClick}
            aria-label="Edit contact"
          >
            <Edit size={24} style={{ color: designTokens.colors.primary[700] }} />
          </GlassButton>

          <GlassButton
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 rounded-2xl"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: `2px solid ${designTokens.colors.error[300]}`,
              width: '44px',
              height: '44px',
              backdropFilter: 'blur(10px)'
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setIsDeleteDialogOpen(true);
            }}
            disabled={isDeleting || isDialogClosing}
            aria-label="Delete contact"
          >
            {isDeleting ? (
              <LoadingSpinner size={24} />
            ) : (
              <Trash2 size={24} style={{ color: designTokens.colors.error[700] }} />
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
            title={t('contact_list.confirm_delete_title')}
            description={t('contact_list.confirm_delete_description')}
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
    avatarFallback,
    fullName,
    displayGroups,
    displayPhoneNumber,
    displayEmail,
    displayPosition,
    displayCompany,
    displayAddress,
    handleEditClick,
    isDeleting,
    t,
    handleDelete,
    isDeleteDialogOpen,
    isDialogClosing,
    displayGender
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
