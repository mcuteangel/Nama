import { Group, GroupWithContacts, ContactPreview, PhoneNumber } from '@/types/group.types';

/**
 * Map API contact data to ContactPreview format
 */
export const mapApiContactToPreview = (apiContact: any): ContactPreview => {
  return {
    id: apiContact.id,
    first_name: apiContact.first_name || '',
    last_name: apiContact.last_name || '',
    avatar_url: apiContact.avatar_url || null,
    gender: apiContact.gender || null,
    phone_number: apiContact.phone_numbers?.[0]?.phone_number || '',
    phone_numbers: apiContact.phone_numbers || [],
    email: apiContact.email_addresses?.[0]?.email_address || undefined
  };
};

/**
 * Map API group data to Group format
 */
export const mapApiGroupToGroup = (apiGroup: any): Group => {
  return {
    id: apiGroup.id,
    name: apiGroup.name,
    description: apiGroup.description,
    color: apiGroup.color,
    created_at: apiGroup.created_at,
    updated_at: apiGroup.updated_at,
    contacts: apiGroup.contacts?.map(mapApiContactToPreview) || [],
    contact_count: apiGroup.contact_count || 0
  };
};

/**
 * Map API group with contacts data to GroupWithContacts format
 */
export const mapApiGroupWithContactsToGroupWithContacts = (apiGroup: any): GroupWithContacts => {
  return {
    ...mapApiGroupToGroup(apiGroup),
    contacts: apiGroup.contacts?.map(mapApiContactToPreview) || []
  };
};

/**
 * Extract phone numbers from contact data
 */
export const extractPhoneNumbers = (contact: ContactPreview): PhoneNumber[] => {
  if (contact.phone_numbers && Array.isArray(contact.phone_numbers)) {
    return contact.phone_numbers;
  }

  if (contact.phone_number) {
    return [{
      id: `temp-${Math.random().toString(36).substr(2, 9)}`,
      phone_number: contact.phone_number,
      phone_type: 'mobile',
      extension: null
    }];
  }

  return [];
};
