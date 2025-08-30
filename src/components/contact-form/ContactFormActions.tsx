import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ModernButton } from '@/components/ui/modern-button';
import { ModernLoader } from '@/components/ui/modern-loader';
import CancelButton from '@/components/common/CancelButton';

interface ContactFormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  contactId?: string;
}

const ContactFormActions: React.FC<ContactFormActionsProps> = React.memo(({ isSubmitting, onCancel, contactId }) => {
  const { t } = useTranslation();
  
  // Memoize button labels to prevent unnecessary re-renders
  const buttonLabels = useMemo(() => ({
    submit: contactId ? t('common.update_contact') : t('common.save_contact'),
    cancel: t('common.cancel')
  }), [contactId, t]);

  return (
    <div className="flex justify-end gap-2">
      <CancelButton 
        onClick={onCancel} 
        disabled={isSubmitting} 
        text={buttonLabels.cancel} 
      />
      <ModernButton 
        type="submit" 
        variant="glass"
        className="hover-lift" 
        disabled={isSubmitting}
      >
        {isSubmitting && <ModernLoader variant="spinner" size="sm" className="me-2" />}
        {buttonLabels.submit}
      </ModernButton>
    </div>
  );
});

ContactFormActions.displayName = 'ContactFormActions';

export default ContactFormActions;