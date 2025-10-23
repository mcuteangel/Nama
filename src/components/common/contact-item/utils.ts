import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FaMale, FaFemale, FaGenderless } from 'react-icons/fa';
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

  const displayPosition = useMemo(() => {
    return contact.position || undefined;
  }, [contact.position]);

  const displayCompany = useMemo(() => {
    return contact.company || undefined;
  }, [contact.company]);

  const displayAddress = useMemo(() => {
    const parts = [];
    if (contact.city) parts.push(contact.city);
    if (contact.state) parts.push(contact.state);
    if (contact.country) parts.push(contact.country);

    return parts.length > 0 ? parts.join(', ') : undefined;
  }, [contact.city, contact.state, contact.country]);

  const displayGroups = useMemo(() => {
    if (contact.contact_groups && contact.contact_groups.length > 0) {
      return contact.contact_groups
        .map(cg => cg.groups)
        .flat()
        .filter(group => group && group.name);
    }
    return [];
  }, [contact.contact_groups]);

  const avatarFallback = useMemo(() => {
    const firstInitial = contact?.first_name ? contact.first_name[0] : "?";
    const lastInitial = contact?.last_name ? contact.last_name[0] : "";
    return lastInitial ? `${firstInitial} ${lastInitial}` : firstInitial;
  }, [contact?.first_name, contact?.last_name]);

  const fullName = useMemo(() => {
    return `${contact?.first_name || ''} ${contact?.last_name || ''}`.trim() || t('contacts.no_name');
  }, [contact?.first_name, contact?.last_name, t]);

  const displayGender = useMemo((): GenderDisplay => {
    if (contact.gender === 'male') {
      return {
        icon: 'male',
        color: designTokens.colors.primary[500],
        label: t('contacts.gender_male'),
        gender: contact.gender
      };
    } else if (contact.gender === 'female') {
      return {
        icon: 'female',
        color: designTokens.colors.secondary[500],
        label: t('contacts.gender_female'),
        gender: contact.gender
      };
    } else {
      return {
        icon: 'neutral',
        color: designTokens.colors.gray[500],
        label: t('contacts.gender_neutral'),
        gender: contact.gender
      };
    }
  }, [contact.gender, t]);

  return {
    displayPhoneNumber,
    displayEmail,
    displayPosition,
    displayCompany,
    displayAddress,
    displayGroups,
    avatarFallback,
    fullName,
    displayGender
  };
};

/**
 * Get checkbox styles based on selection state
 */
export const getCheckboxStyles = () => {
  return {
    base: 'absolute top-3 right-3 z-20 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-200',
    unselected: 'border-gray-300 bg-white group-hover:border-primary-400',
    selected: 'border-primary-500 bg-primary-500',
    checkIcon: 'h-4 w-4 text-white transition-transform duration-200',
    checkMark: 'h-3 w-3 text-white transition-all duration-200 scale-90 group-hover:scale-100',
    checkMarkSelected: 'scale-100'
  };
};
