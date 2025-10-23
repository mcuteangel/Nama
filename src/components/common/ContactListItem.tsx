import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { designTokens } from '@/lib/design-tokens';
import { ContactAvatar } from './contact-item/ContactAvatar';
import { ContactInfo } from './contact-item/ContactInfo';
import { ContactActions } from './contact-item/ContactActions';
import { ContactCheckbox } from './contact-item/ContactCheckbox';
import { useContactDisplay } from './contact-item/utils';
import { useContactItem } from './contact-item/hooks';
import TouchGestureHandler from '../TouchGestureHandler';
import { GestureCallbacks } from './contact-item/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { Contact } from '@/types/contact.types';

interface ContactListItemProps {
  contact: Contact;
  onContactDeleted: (id: string) => void;
  onContactEdited: (id: string) => void;
  style?: React.CSSProperties;
  className?: string;
  multiSelect?: boolean;
  isSelected?: boolean;
  onSelect?: (contactId: string, selected: boolean) => void;
  displayMode?: 'grid' | 'list';
}

export const ContactListItem = React.memo<ContactListItemProps>(({
  contact,
  onContactDeleted,
  onContactEdited,
  className = "",
  multiSelect = false,
  isSelected = false,
  onSelect,
  displayMode = 'list'
}) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  // Calculate display values
  const displayData = useContactDisplay(contact);

  // Hook for managing contact item state and actions
  const {
    isDeleting,
    isDeleteDialogOpen,
    isDialogClosing,
    handleContactClick,
    handleDelete,
    handleEditClick,
    handleCheckboxChange,
    handleDialogOpenChange
  } = useContactItem({
    contact,
    onContactDeleted,
    onContactEdited,
    multiSelect,
    isSelected,
    onSelect
  });

  // Touch gesture callbacks for mobile
  const gestureCallbacks = useMemo(() => {
    const callbacks: GestureCallbacks = {
      onTap: handleContactClick,
      onLongPress: () => {
        // Show action menu on long press
      },
      onSwipeLeft: handleDelete,
      onSwipeRight: handleEditClick
    };
    return callbacks;
  }, [handleContactClick, handleDelete, handleEditClick]);

  // Main list item content
  const listItemContent = useMemo(() => (
    <div
      className={`group relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-300 ease-in-out ${className} ${multiSelect && isSelected ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''}`}
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

      {/* Multi-select checkbox */}
      {multiSelect && (
        <ContactCheckbox
          isSelected={isSelected}
          onSelect={handleCheckboxChange}
        />
      )}

      <div className="relative z-10 flex items-start justify-between gap-8">
        <div className="flex items-start gap-6 flex-grow min-w-0">
          <ContactAvatar
            contact={contact}
            avatarFallback={displayData.avatarFallback}
            displayGender={displayData.displayGender}
          />

          <ContactInfo
            {...displayData}
            displayMode={displayMode}
          />
        </div>

        <ContactActions
          onEdit={handleEditClick}
          onDelete={handleDelete}
          onDialogOpenChange={handleDialogOpenChange}
          isDeleting={isDeleting}
          isDeleteDialogOpen={isDeleteDialogOpen}
          isDialogClosing={isDialogClosing}
          deleteTitle={t('contacts.confirm_delete_title')}
          deleteDescription={t('contacts.confirm_delete_description')}
        />
      </div>
    </div>
  ), [
    className,
    handleContactClick,
    contact,
    displayData,
    handleEditClick,
    isDeleting,
    handleDelete,
    isDeleteDialogOpen,
    isDialogClosing,
    handleDialogOpenChange,
    multiSelect,
    isSelected,
    handleCheckboxChange,
    t,
    displayMode
  ]);

  return (
    <div className="px-0">
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
