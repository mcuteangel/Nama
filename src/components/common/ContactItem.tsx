import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';
import { designTokens } from '@/lib/design-tokens';
import TouchGestureHandler from '../TouchGestureHandler';
import { GestureCallbacks } from './contact-item/types';
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
  displayMode?: 'grid' | 'list'; // Display mode for different layouts
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
  onSelect,
  displayMode = 'list'
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
      onTap: () => contactItemLogic.handleContactClick(),
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
        height: contactItemConstants.cardStyles.height,
        aspectRatio: contactItemConstants.cardStyles.aspectRatio,
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
        {/* Row 1: Avatar and groups */}
        <div className="flex items-center justify-center gap-3 w-full">
          <ContactAvatar
            contact={contact}
            avatarFallback={contactDisplay.avatarFallback}
            displayGender={contactDisplay.displayGender}
          />

          {/* Groups inline with avatar */}
          {displayMode === 'grid' && contactDisplay.displayGroups.length > 0 && (
            <div className="flex gap-1">
              {contactDisplay.displayGroups.slice(0, 2).map((group, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold text-white"
                  style={{
                    background: group.color || designTokens.colors.gray[600],
                    fontFamily: designTokens.typography.fonts.secondary,
                    fontSize: '10px'
                  }}
                  title={group.name}
                >
                  {group.name}
                </span>
              ))}
              {contactDisplay.displayGroups.length > 2 && (
                <span
                  className="text-xs text-gray-500 font-medium"
                  style={{ fontFamily: designTokens.typography.fonts.secondary }}
                >
                  +{contactDisplay.displayGroups.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        <div className={contactItemConstants.layout.info}>
          <ContactInfo
            displayPhoneNumber={contactDisplay.displayPhoneNumber}
            displayEmail={contactDisplay.displayEmail}
            displayPosition={contactDisplay.displayPosition}
            displayCompany={contactDisplay.displayCompany}
            displayAddress={contactDisplay.displayAddress}
            displayGroups={displayMode === 'grid' ? [] : contactDisplay.displayGroups} // Don't show groups in grid mode here
            fullName={contactDisplay.fullName}
            avatarFallback={contactDisplay.avatarFallback}
            displayGender={contactDisplay.displayGender}
            displayMode={displayMode}
          />
        </div>

        {/* Center the actions */}
        <div className="flex justify-center mt-2">
          <ContactActions
            onEdit={contactItemLogic.handleEditClick}
            onDelete={contactItemLogic.handleDelete}
            onDialogOpenChange={contactItemLogic.handleDialogOpenChange}
            isDeleting={contactItemLogic.isDeleting}
            isDeleteDialogOpen={contactItemLogic.isDeleteDialogOpen}
            isDialogClosing={contactItemLogic.isDialogClosing}
            deleteTitle={t('contacts.confirm_delete_title')}
            deleteDescription={t('contacts.confirm_delete_description')}
          />
        </div>
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
    contactDisplay.displayPosition,
    contactDisplay.displayCompany,
    contactDisplay.displayAddress,
    contactDisplay.displayGroups,
    contactDisplay.fullName,
    contactDisplay.avatarFallback,
    contactDisplay.displayGender,
    contactItemConstants,
    multiSelect,
    isSelected,
    t,
    displayMode
  ]);

  if (!contact) return null;

  return (
    <div style={style} className="px-0">
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
