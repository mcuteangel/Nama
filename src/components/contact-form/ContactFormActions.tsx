import React from 'react';
import { Button } from '@/components/ui/button';
import CancelButton from '../CancelButton'; // Import CancelButton
import { useTranslation } from 'react-i18next';

interface ContactFormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  contactId?: string;
}

const ContactFormActions: React.FC<ContactFormActionsProps> = ({ isSubmitting, onCancel, contactId }) => {
  const { t } = useTranslation();
  return (
    <div className="flex justify-end gap-2">
      <CancelButton onClick={onCancel} disabled={isSubmitting} text={t('common.cancel')} /> {/* Use CancelButton */}
      <Button type="submit" className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105" disabled={isSubmitting}>
        {contactId ? t('common.update_contact') : t('common.save_contact')}
      </Button>
    </div>
  );
};

export default ContactFormActions;