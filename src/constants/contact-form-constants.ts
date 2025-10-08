import { ContactFormValues } from '@/types/contact';

export const CONTACT_FORM_CONSTANTS = {
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
  CACHE_PREFIX: 'custom_field_templates',
} as const;

export const getContactFormDefaultValues = (): ContactFormValues => ({
  firstName: "",
  lastName: "",
  gender: "not_specified" as const,
  position: "",
  company: "",
  street: null,
  city: null,
  state: null,
  zipCode: null,
  country: null,
  notes: null,
  groupId: null,
  birthday: null,
  avatarUrl: null,
  preferredContactMethod: null,
  phoneNumbers: [],
  emailAddresses: [],
  socialLinks: [],
  customFields: [],
  tags: [],
});

export const FORM_SECTIONS = {
  AVATAR: 'avatar',
  BASIC_INFO: 'basic-info',
  PHONE: 'phone',
  EMAIL: 'email',
  SOCIAL: 'social',
  DATES: 'dates',
  OTHER_DETAILS: 'other-details',
  CUSTOM_FIELDS: 'custom-fields',
  TAGS: 'tags',
  PREVIEW: 'preview',
  HISTORY: 'history',
  ACTIONS: 'actions',
} as const;

export const ARIA_LABEL_KEYS = {
  CONTACT_FORM: 'contact-form',
  CONTACT_FORM_DESCRIPTION: 'contact-form-description',
  AVATAR_SECTION: 'accessibility.avatar_section',
  BASIC_INFO_SECTION: 'accessibility.basic_info_section',
  PHONE_SECTION: 'accessibility.phone_section',
  EMAIL_SECTION: 'accessibility.email_section',
  SOCIAL_SECTION: 'accessibility.social_section',
  DATES_SECTION: 'accessibility.dates_section',
  OTHER_DETAILS_SECTION: 'accessibility.other_details_section',
  CUSTOM_FIELDS_SECTION: 'accessibility.custom_fields_section',
  TAGS_SECTION: 'accessibility.tags_section',
  PREVIEW_SECTION: 'accessibility.preview_section',
  HISTORY_SECTION: 'accessibility.history_section',
  FORM_ACTIONS_SECTION: 'accessibility.form_actions_section',
} as const;
