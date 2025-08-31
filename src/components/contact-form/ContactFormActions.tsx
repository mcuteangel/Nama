import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassButton } from "@/components/ui/glass-button";
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
    <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
      <CancelButton 
        onClick={onCancel} 
        disabled={isSubmitting} 
        text={buttonLabels.cancel} 
      />
      <GlassButton 
        type="submit" 
        variant="gradient-primary"
        effect="lift"
        className="px-6 py-2 font-semibold shadow-lg hover:shadow-xl" 
        disabled={isSubmitting}
      >
        {isSubmitting && <ModernLoader variant="spinner" size="sm" className="me-2" />}
        {buttonLabels.submit}
      </GlassButton>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.isSubmitting === nextProps.isSubmitting &&
    prevProps.contactId === nextProps.contactId
  );
});

ContactFormActions.displayName = 'ContactFormActions';

export default ContactFormActions;