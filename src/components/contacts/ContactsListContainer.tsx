import React from 'react';
import ContactList from '@/components/ContactList';
import SuspenseWrapper from '@/components/common/SuspenseWrapper';
import type { ContactsListContainerProps } from '@/types/contact-page.types';

export const ContactsListContainer: React.FC<ContactsListContainerProps> = ({
  searchTerm,
  selectedGroup,
  companyFilter,
  sortOption,
  currentPage,
  itemsPerPage,
  totalItems,
  displayMode,
  multiSelectMode,
  selectedContacts,
  onPaginationChange,
  onTotalChange,
  onSelectContact,
  onSelectAll,
  className,
}) => {
  return (
    <div
      className={`p-8 ${className || ''}`}
      style={{
        background: 'rgba(255,255,255,0.05)',
        minHeight: '500px'
      }}
    >
      <SuspenseWrapper>
        <ContactList
          searchTerm={searchTerm}
          selectedGroup={selectedGroup}
          companyFilter={companyFilter}
          sortOption={sortOption}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onPaginationChange={onPaginationChange}
          onTotalChange={onTotalChange}
          displayMode={displayMode}
          multiSelect={multiSelectMode}
          selectedContacts={selectedContacts}
          onSelectContact={onSelectContact}
          onSelectAll={onSelectAll}
        />
      </SuspenseWrapper>
    </div>
  );
};

ContactsListContainer.displayName = 'ContactsListContainer';
