import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '@/components/accessibilityHooks';
import { useAnnouncement } from '@/components/accessibilityHooks';

export interface ContactFormAccessibility {
  getAriaLabel: (key: string, fallback: string) => string;
  setAriaLabel: (key: string, label: string) => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

export const useContactFormAccessibility = (contactId?: string): ContactFormAccessibility => {
  const { t } = useTranslation();
  const { getAriaLabel, setAriaLabel } = useAccessibility();
  const announce = useAnnouncement();

  // Set up ARIA labels for form
  useEffect(() => {
    const formTitle = contactId
      ? t('accessibility.edit_contact_form')
      : t('accessibility.add_contact_form');

    setAriaLabel('contact-form', formTitle);
    setAriaLabel('contact-form-description',
      contactId
        ? t('accessibility.edit_contact_description')
        : t('accessibility.add_contact_description')
    );
  }, [contactId, t, setAriaLabel]);

  return {
    getAriaLabel,
    setAriaLabel,
    announce,
  };
};
