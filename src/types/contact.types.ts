// انواع داده‌های مرتبط با مخاطبین
export interface GenderDisplay {
  icon: string;
  color: string;
}

export interface PhoneNumber {
  id: string;
  phone_number: string;
  phone_type: string;
  extension?: string | null;
}

export interface EmailAddress {
  id: string;
  email_address: string;
  email_type: string;
}

export interface SocialLink {
  type: string;
  url: string;
}

export interface Group {
  name: string;
  color?: string;
}

export interface ContactGroup {
  group_id: string;
  groups: Group[];
}

export interface CustomFieldTemplate {
  name: string;
  type: string;
  options?: string | null;
}

export interface CustomField {
  id: string;
  template_id: string;
  field_value: string;
  custom_field_templates: CustomFieldTemplate[];
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  position?: string | null;
  company?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  country?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  birthday?: string | null;
  phone_numbers: PhoneNumber[];
  email_addresses: EmailAddress[];
  social_links: SocialLink[];
  contact_groups: ContactGroup[];
  custom_fields: CustomField[];
  avatar_url?: string | null;
  preferred_contact_method?: string | null;
}

export interface ContactListResponse {
  data: Contact[] | null;
  error: string | null;
}

// انواع داده‌های مرتبط با مدیریت تماس‌های تکراری
export interface DuplicateContact {
  id: string;
  first_name: string;
  last_name: string;
  email_addresses: Array<{ email_address: string }>;
  phone_numbers: Array<{ phone_number: string }>;
  company?: string;
  position?: string;
  notes?: string;
  avatar_url?: string;
}

export interface FullContactData {
  id: string;
  first_name: string;
  last_name: string;
  company?: string;
  position?: string;
  notes?: string;
  avatar_url?: string;
  birthday?: string;
  preferred_contact_method?: string;
  street?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  email_addresses: Array<{ id?: string; email_address: string; contact_id: string }>;
  phone_numbers: Array<{ id?: string; phone_number: string; contact_id: string }>;
  social_links: Array<{ id?: string; url: string; contact_id: string }>;
  contact_groups: Array<{ id?: string; group_id: string; contact_id: string }>;
  custom_fields: Array<{ id?: string; template_id: string; contact_id: string }>;
}

export interface DuplicatePair {
  mainContact: DuplicateContact;
  duplicateContact: DuplicateContact;
  reason: string;
}

export interface DuplicateManagementStats {
  total: number;
  highConfidence: number;
  mediumConfidence: number;
}
