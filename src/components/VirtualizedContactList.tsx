import React, { useMemo } from 'react';
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

const ContactItemWrapper = React.memo<ContactItemWrapperProps>(({ index, style, data }) => {
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

const VirtualizedContactList = React.memo<VirtualizedContactListProps>(({ 
  contacts, 
  onContactDeleted, 
  onContactEdited, 
  height, 
  itemHeight = 100 
}) => {
  const itemData = useMemo(() => ({
    contacts,
    onContactDeleted,
    onContactEdited,
  }), [contacts, onContactDeleted, onContactEdited]);

  return (
    <List
      height={height}
      width="100%"
      itemCount={contacts.length}
      itemSize={itemHeight}
      itemData={itemData}
    >
      {ContactItemWrapper}
    </List>
  );
});

VirtualizedContactList.displayName = 'VirtualizedContactList';

export default VirtualizedContactList;


