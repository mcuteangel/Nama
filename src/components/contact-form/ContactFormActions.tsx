import React from 'react';
import { useTranslation } from 'react-i18next';
import { ModernButton } from '@/components/ui/modern-button';
import { ModernLoader } from '@/components/ui/modern-loader';
import CancelButton from '@/components/common/CancelButton';

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
      <ModernButton 
        type="submit" 
        variant="glass"
        className="hover-lift" 
        disabled={isSubmitting}
      >
        {isSubmitting && <ModernLoader variant="spinner" size="sm" className="me-2" />}
        {contactId ? t('common.update_contact') : t('common.save_contact')}
      </ModernButton>
    </div>
  );
};

export default ContactFormActions;