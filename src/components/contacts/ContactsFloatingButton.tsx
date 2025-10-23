import React from 'react';
import { useTranslation } from 'react-i18next';
import { GradientButton } from '@/components/ui/glass-button';
import { ModernTooltip, ModernTooltipContent, ModernTooltipTrigger } from '@/components/ui/modern-tooltip';
import { PlusCircle } from 'lucide-react';
import { designTokens } from '@/lib/design-tokens';
import type { ContactsFloatingButtonProps } from '@/types/contact-page.types';

export const ContactsFloatingButton: React.FC<ContactsFloatingButtonProps> = ({
  onAddContact,
  isMobile,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <div className={`fixed ${isMobile ? 'bottom-20' : 'bottom-6'} left-6 z-50 ${className || ''}`}>
      <ModernTooltip>
        <ModernTooltipTrigger asChild>
          <GradientButton
            data-testid="add-contact-button"
            gradientType="primary"
            onClick={onAddContact}
            className="w-14 h-14 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
            style={{
              background: designTokens.gradients.primary,
              boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4), 0 4px 10px rgba(0, 0, 0, 0.1)',
              fontFamily: designTokens.typography.fonts.primary
            }}
            aria-label={t('actions.add_contact')}
          >
            <PlusCircle size={24} className="text-white" />
          </GradientButton>
        </ModernTooltipTrigger>
        <ModernTooltipContent side="right">
          <p>{t('actions.add_contact')}</p>
        </ModernTooltipContent>
      </ModernTooltip>
    </div>
  );
};

ContactsFloatingButton.displayName = 'ContactsFloatingButton';
