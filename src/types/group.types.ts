// Define the shape of a phone number in our contact data
export interface PhoneNumberData {
  id: string;
  phone_number: string;
  phone_type: string;
  extension: string | null;
}

// Define the shape of the contact data we receive from the API
export interface ContactData {
  id: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  phone_numbers?: PhoneNumberData[];
  // Add other contact properties that might be used in the component
  email_addresses?: Array<{
    id: string;
    email_address: string;
    email_type: string;
  }>;
  contact_groups?: Array<{
    group_id: string;
    groups: Array<{
      id: string;
      name: string;
      color: string;
    }>;
  }>;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}
