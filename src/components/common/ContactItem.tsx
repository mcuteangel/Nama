import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';
import StandardizedDeleteDialog from './StandardizedDeleteDialog';
import TouchGestureHandler from '../TouchGestureHandler';
import { GestureCallbacks } from '../TouchGestureHandler.types';
import {
  ContactAvatar,
  ContactInfo,
  ContactActions,
  ContactCheckbox,
  useContactItem,
  useContactDisplay,
  contactItemConstants
} from './contact-item';
import { Contact } from '@/types/contact.types';

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
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  // Use the modular hooks
  const contactItemLogic = useContactItem({
    contact,
    onContactDeleted,
    onContactEdited,
    multiSelect,
    isSelected,
    onSelect
  });

  const contactDisplay = useContactDisplay(contact);

  // Touch gesture callbacks for mobile
  const gestureCallbacks = useMemo(() => {
    const callbacks: GestureCallbacks = {
      onTap: contactItemLogic.handleContactClick,
      onLongPress: () => {
        // Show action menu on long press
      },
      onSwipeLeft: () => {
        if (isMobile) contactItemLogic.handleDelete();
      },
      onSwipeRight: () => {
        if (isMobile) contactItemLogic.handleEditClick();
      }
    };
    return callbacks;
  }, [contactItemLogic.handleContactClick, contactItemLogic.handleDelete, contactItemLogic.handleEditClick, isMobile]);

  const cardContent = useMemo(() => (
    <div
      className={`${contactItemConstants.cardStyles.base} ${className} ${multiSelect && isSelected ? contactItemConstants.cardStyles.selected : ''}`}
      onClick={contactItemLogic.handleContactClick}
      style={{
        background: isSelected
          ? contactItemConstants.cardStyles.background.selected
          : contactItemConstants.cardStyles.background.unselected,
        border: `1px solid ${isSelected
          ? contactItemConstants.cardStyles.border.selected
          : contactItemConstants.cardStyles.border.unselected}`,
        backdropFilter: contactItemConstants.cardStyles.backdropFilter,
        boxShadow: isSelected
          ? contactItemConstants.cardStyles.boxShadow.selected
          : contactItemConstants.cardStyles.boxShadow.unselected,
        padding: contactItemConstants.cardStyles.padding,
        transition: contactItemConstants.cardStyles.transition,
        width: '100%',
        pointerEvents: contactItemLogic.isDeleteDialogOpen || contactItemLogic.isDialogClosing ? contactItemConstants.cardStyles.pointerEvents.disabled : contactItemConstants.cardStyles.pointerEvents.normal,
        userSelect: contactItemLogic.isDeleteDialogOpen || contactItemLogic.isDialogClosing ? 'none' : 'auto',
        willChange: contactItemConstants.animations.willChange,
        position: 'relative',
        overflow: 'hidden',
        paddingRight: multiSelect ? '2.5rem' : contactItemConstants.cardStyles.padding,
      }}
    >
      {/* چک‌باکس انتخابی */}
      {multiSelect && (
        <ContactCheckbox
          isSelected={isSelected}
          onSelect={contactItemLogic.handleCheckboxChange}
        />
      )}

      {/* Background gradient overlay */}
      <div
        className={contactItemConstants.gradientOverlay.className}
        style={contactItemConstants.gradientOverlay.style}
      />

      <div className={contactItemConstants.borderOverlay.className} style={contactItemConstants.borderOverlay.style} />

      <div className={contactItemConstants.layout.container}>
        <div className={contactItemConstants.layout.content}>
          <ContactAvatar
            contact={contact}
            avatarFallback={contactDisplay.avatarFallback}
            displayGender={contactDisplay.displayGender}
          />

          <div className={contactItemConstants.layout.info}>
            <h3 style={contactItemConstants.typography.style}>
              {contact?.first_name} {contact?.last_name}
            </h3>

            <ContactInfo
              displayPhoneNumber={contactDisplay.displayPhoneNumber}
              displayEmail={contactDisplay.displayEmail}
            />
          </div>
        </div>

        <ContactActions
          onEdit={contactItemLogic.handleEditClick}
          onDelete={() => contactItemLogic.handleDialogOpenChange(true)}
          isDeleting={contactItemLogic.isDeleting}
          isDialogClosing={contactItemLogic.isDialogClosing}
        />

        <StandardizedDeleteDialog
          open={contactItemLogic.isDeleteDialogOpen}
          onOpenChange={contactItemLogic.handleDialogOpenChange}
          onConfirm={contactItemLogic.handleDelete}
          title={t('contacts.confirm_delete_title')}
          description={t('contacts.confirm_delete_description')}
          isDeleting={contactItemLogic.isDeleting}
        />
      </div>
    </div>
  ), [
    className,
    contactItemLogic.handleContactClick,
    contactItemLogic.handleCheckboxChange,
    contactItemLogic.handleEditClick,
    contactItemLogic.handleDialogOpenChange,
    contactItemLogic.handleDelete,
    contactItemLogic.isDeleteDialogOpen,
    contactItemLogic.isDialogClosing,
    contactItemLogic.isDeleting,
    contactDisplay.avatarFallback,
    contactDisplay.displayGender,
    contactDisplay.displayPhoneNumber,
    contactDisplay.displayEmail,
    contactItemConstants,
    multiSelect,
    isSelected,
    t
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
export type { Contact } from '@/types/contact.types';
