import React from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/ui/PageHeader';
import type { ContactsHeaderProps } from '@/types/contact-page.types';

export const ContactsHeader: React.FC<ContactsHeaderProps> = ({ className }) => {
  const { t } = useTranslation();

  return (
    <PageHeader
      title={t('pages.contacts.management')}
      description={t('pages.contacts.management_description')}
      showBackButton={false}
      className={className}
    />
  );
};

ContactsHeader.displayName = 'ContactsHeader';
