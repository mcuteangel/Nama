import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassButton } from "@/components/ui/glass-button";
import { ModernLoader } from '@/components/ui/modern-loader';
import CancelButton from '@/components/common/CancelButton';
import { Save, X } from 'lucide-react';

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
    <>
      {/* Traditional buttons for larger screens */}
      <div className="hidden sm:flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-border/50">
        <CancelButton 
          onClick={onCancel} 
          disabled={isSubmitting} 
          text={buttonLabels.cancel} 
        />
        <GlassButton 
          type="submit" 
          variant="gradient-primary"
          effect="lift"
          className="px-6 py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5" 
          disabled={isSubmitting}
        >
          {isSubmitting && <ModernLoader variant="spinner" size="sm" className="me-2" />}
          {buttonLabels.submit}
        </GlassButton>
      </div>

      {/* Floating Action Buttons for mobile screens */}
      <div className="sm:hidden fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <GlassButton
          type="button"
          variant="glass"
          effect="lift"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-14 h-14 rounded-full p-0 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30"
          aria-label={buttonLabels.cancel}
        >
          <X size={24} className="text-gray-700 dark:text-gray-300" />
        </GlassButton>
        
        <GlassButton 
          type="submit" 
          variant="gradient-primary"
          effect="lift"
          className="w-14 h-14 rounded-full p-0 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          disabled={isSubmitting}
          aria-label={buttonLabels.submit}
        >
          {isSubmitting ? (
            <ModernLoader variant="spinner" size="sm" />
          ) : (
            <Save size={24} className="text-white" />
          )}
        </GlassButton>
      </div>

      {/* Alternative layout for mobile with buttons at bottom of form */}
      <div className="sm:hidden flex justify-between gap-3 mt-8 pt-6 border-t border-border/50">
        <CancelButton 
          onClick={onCancel} 
          disabled={isSubmitting} 
          text={buttonLabels.cancel} 
          className="flex-1 py-3"
        />
        <GlassButton 
          type="submit" 
          variant="gradient-primary"
          effect="lift"
          className="flex-1 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300" 
          disabled={isSubmitting}
        >
          {isSubmitting && <ModernLoader variant="spinner" size="sm" className="me-2" />}
          {buttonLabels.submit}
        </GlassButton>
      </div>
    </>
  );
});

ContactFormActions.displayName = 'ContactFormActions';

export default ContactFormActions;