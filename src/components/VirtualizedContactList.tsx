import React, { useMemo, memo } from 'react';
import { FixedSizeList as List } from 'react-window';
import ContactItem, { Contact } from './common/ContactItem';

interface VirtualizedContactListProps {
  contacts: Contact[];
  onContactDeleted: (id: string) => void;
  onContactEdited: (id: string) => void;
  height: number;
  itemHeight?: number;
}

interface ContactItemWrapperProps {
  index: number;
  style: React.CSSProperties;
  data: {
    contacts: Contact[];
    onContactDeleted: (id: string) => void;
    onContactEdited: (id: string) => void;
  };
}

const ContactItemWrapper = memo<ContactItemWrapperProps>(({ index, style, data }) => {
  const { contacts, onContactDeleted, onContactEdited } = data;
  const contact = contacts[index];

  if (!contact) return null;

  return (
    <ContactItem
      contact={contact}
      onContactDeleted={onContactDeleted}
      onContactEdited={onContactEdited}
      style={style}
      enableGestures={false} // Disabled for virtualized list to avoid conflicts
    />
  );
});

ContactItemWrapper.displayName = 'ContactItemWrapper';

const VirtualizedContactList = memo<VirtualizedContactListProps>(({ 
  contacts, 
  onContactDeleted, 
  onContactEdited, 
  height, 
  itemHeight = 100 
}) => {
  // Memoize item data to prevent unnecessary re-renders
  const itemData = useMemo(() => ({
    contacts,
    onContactDeleted,
    onContactEdited,
  }), [contacts, onContactDeleted, onContactEdited]);

  // Memoize list props to prevent unnecessary re-renders
  const listProps = useMemo(() => ({
    height,
    width: "100%" as const,
    itemCount: contacts.length,
    itemSize: itemHeight,
    itemData,
  }), [height, contacts.length, itemHeight, itemData]);

  return (
    <List {...listProps}>
      {ContactItemWrapper}
    </List>
  );
});

VirtualizedContactList.displayName = 'VirtualizedContactList';

export default VirtualizedContactList;
