import React from 'react';
import { Button } from '@/components/ui/button';
import CancelButton from '../CancelButton';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../LoadingSpinner';

interface ContactFormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  contactId?: string;
}

const ContactFormActions: React.FC<ContactFormActionsProps> = ({ isSubmitting, onCancel, contactId }) => {
  const { t } = useTranslation();
  console.log("ContactFormActions: isSubmitting prop:", isSubmitting); // Added log
  return (
    <div className="flex justify-end gap-2">
      <CancelButton onClick={onCancel} disabled={isSubmitting} text={t('common.cancel')} />
      <Button type="submit" className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105" disabled={isSubmitting}>
        {isSubmitting && <LoadingSpinner size={16} className="me-2" />}
        {contactId ? t('common.update_contact') : t('common.save_contact')}
      </Button>
    </div>
  );
};

export default ContactFormActions;