// Group types for the application

export interface Group {
  id: string;
  name: string;
  description?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
  contacts: ContactPreview[];
  contact_count?: number;
}

// Define a simplified contact interface for preview purposes
export interface ContactPreview {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
  email?: string;
  phone_number?: string;
  phone_numbers?: PhoneNumber[];
  gender?: string | null;
  name?: string; // For backward compatibility
}

// Phone number type for contacts
export interface PhoneNumber {
  id: string;
  phone_number: string;
  phone_type: string;
  extension: string | null | undefined;
}

// Group creation/update interface
export interface GroupFormData {
  name: string;
  description?: string;
  color?: string;
}

// Group with contacts interface (used in GroupDetail)
export interface GroupWithContacts extends Group {
  contacts: ContactPreview[];
}

// API Response types
export interface GroupsResponse {
  data: Group[] | null;
  error: string | null;
  fromCache?: boolean;
}
