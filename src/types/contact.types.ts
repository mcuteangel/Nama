// انواع داده‌های مرتبط با مخاطبین
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
