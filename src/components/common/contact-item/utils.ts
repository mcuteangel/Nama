import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { designTokens } from '@/lib/design-tokens';
import { Contact, GenderDisplay } from '@/types/contact.types';

/**
 * Custom hook for calculating contact display values
 */
export const useContactDisplay = (contact: Contact) => {
  const { t } = useTranslation();

  // Memoize display values to prevent unnecessary re-calculations
  const displayPhoneNumber = useMemo(() => {
    return contact.phone_numbers.length > 0
      ? contact.phone_numbers[0].phone_number
      : t('contacts.no_phone');
  }, [contact.phone_numbers, t]);

  const displayEmail = useMemo(() => {
    return contact.email_addresses.length > 0
      ? contact.email_addresses[0].email_address
      : undefined;
  }, [contact.email_addresses]);

  const avatarFallback = useMemo(() => {
    const firstInitial = contact?.first_name ? contact.first_name[0] : "?";
    const lastInitial = contact?.last_name ? contact.last_name[0] : "";
    return lastInitial ? `${firstInitial} ${lastInitial}` : firstInitial;
  }, [contact?.first_name, contact?.last_name]);

  const displayGender = useMemo((): GenderDisplay => {
    if (contact.gender === 'male') {
      return { icon: '♂', color: designTokens.colors.primary[500] };
    } else if (contact.gender === 'female') {
      return { icon: '♀', color: designTokens.colors.secondary[500] };
    } else {
      return { icon: '⚲', color: designTokens.colors.gray[500] };
    }
  }, [contact.gender]);

  return {
    displayPhoneNumber,
    displayEmail,
    avatarFallback,
    displayGender
  };
};

/**
 * Get checkbox styles based on selection state
 */
export const getCheckboxStyles = () => {
  return {
    base: 'absolute top-3 left-3 z-20 h-5 w-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center',
    unselected: 'border-gray-300 bg-white group-hover:border-primary-400',
    selected: 'border-primary-500 bg-primary-500',
    checkIcon: 'h-3.5 w-3.5 text-white transition-transform duration-200',
    checkMark: 'h-3 w-3 text-white transition-all duration-200 scale-90 group-hover:scale-100',
    checkMarkSelected: 'scale-100'
  };
};
