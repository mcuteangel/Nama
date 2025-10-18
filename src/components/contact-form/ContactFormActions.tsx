import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassButton } from "@/components/ui/glass-button";
import { ModernLoader } from '@/components/ui/modern-loader';
import CancelButton from '@/components/common/CancelButton';
import { Save, X, Sparkles } from 'lucide-react';
import { designTokens } from '@/lib/design-tokens';
import { useIsMobile } from '@/hooks/use-mobile';

interface ContactFormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  contactId?: string;
}

const ContactFormActions: React.FC<ContactFormActionsProps> = React.memo(({ isSubmitting, onCancel, contactId }) => {
  useTranslation();
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(true);

  // Handle scroll visibility for mobile FABs
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Show FABs when near bottom or when scrolled up
      setIsVisible(scrollY < windowHeight * 0.3 || scrollY > documentHeight - windowHeight * 1.5);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  const { t } = useTranslation();
  
  // Memoize button labels to prevent unnecessary re-renders
  const buttonLabels = useMemo(() => ({
    submit: contactId ? t('form_actions.update_contact') : t('form_actions.save_contact'),
    cancel: t('form_actions.cancel')
  }), [contactId, t]);

  return (
    <>
      {/* Enhanced Desktop Layout */}
      {!isMobile && (
        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-10 pt-8 border-t border-white/20 dark:border-gray-700/20">
          <CancelButton
            onClick={onCancel}
            disabled={isSubmitting}
            text={buttonLabels.cancel}
            className="px-8 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/30 dark:border-gray-600/30 backdrop-blur-md transition-all duration-300 hover:scale-105"
          />
          <GlassButton
            type="submit"
            variant="gradient-primary"
            effect="lift"
            className="px-8 py-3 font-bold shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 rounded-2xl relative overflow-hidden group"
            disabled={isSubmitting}
            style={{
              background: designTokens.gradients.primary,
              fontFamily: designTokens.typography.fonts.primary
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-3">
              {isSubmitting ? (
                <ModernLoader variant="spinner" size="sm" />
              ) : (
                <Sparkles size={20} className="animate-pulse" />
              )}
              <span className="text-lg">{buttonLabels.submit}</span>
            </div>
          </GlassButton>
        </div>
      )}

      {/* Enhanced Mobile Floating Action Buttons */}
      {isMobile && (
        <div className={`fixed bottom-6 left-6 flex flex-col gap-3 z-50 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-2'}`}>
          <GlassButton
            type="button"
            variant="glass"
            effect="lift"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-12 h-12 rounded-xl p-0 flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white/90 dark:bg-gray-800/90 border border-white/30 dark:border-gray-600/30 backdrop-blur-xl"
            aria-label={buttonLabels.cancel}
          >
            <X size={20} className="text-gray-700 dark:text-gray-300" />
          </GlassButton>

          <GlassButton
            type="submit"
            variant="gradient-primary"
            effect="lift"
            className="w-12 h-12 rounded-xl p-0 flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
            disabled={isSubmitting}
            aria-label={buttonLabels.submit}
            style={{
              background: designTokens.gradients.primary
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
            <div className="relative flex items-center justify-center">
              {isSubmitting ? (
                <ModernLoader variant="spinner" size="sm" />
              ) : (
                <Save size={20} className="text-white" />
              )}
            </div>
          </GlassButton>
        </div>
      )}

    </>
  );
});

ContactFormActions.displayName = 'ContactFormActions';

export default ContactFormActions;