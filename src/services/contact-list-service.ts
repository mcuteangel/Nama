import { supabase } from '@/integrations/supabase/client';

// Define proper types for the contact data as returned by Supabase
interface PhoneNumber {
  id: string;
  phone_number: string;
  phone_type: string;
  extension?: string | null;
}

interface EmailAddress {
  id: string;
  email_address: string;
  email_type: string;
}

interface SocialLink {
  type: string;
  url: string;
}

interface Group {
  name: string;
  color?: string;
}

interface ContactGroup {
  group_id: string;
  groups: Group[];
}

interface CustomFieldTemplate {
  name: string;
  type: string;
  options?: string | null;
}

interface CustomField {
  id: string;
  template_id: string;
  field_value: string;
  custom_field_templates: CustomFieldTemplate[];
}

interface Contact {
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

export const ContactListService = {
  async getFilteredContacts(
    userId: string,
    searchTerm: string,
    selectedGroup: string,
    companyFilter: string,
    sortOption: string
  ): Promise<{ data: Contact[] | null; error: string | null }> {
    try {
      let query = supabase
        .from("contacts")
        .select(`
          id, 
          first_name, 
          last_name, 
          gender, 
          position, 
          company, 
          street, 
          city, 
          state, 
          zip_code, 
          country, 
          notes, 
          created_at, 
          updated_at, 
          birthday,
          phone_numbers(
            id, 
            phone_number, 
            phone_type, 
            extension
          ), 
          email_addresses(
            id, 
            email_address, 
            email_type
          ), 
          social_links(
            type, 
            url
          ), 
          contact_groups(
            group_id, 
            groups(
              name, 
              color
            )
          ), 
          custom_fields(
            id, 
            template_id, 
            field_value, 
            custom_field_templates(
              name, 
              type, 
              options
            )
          )
        `)
        .eq("user_id", userId);

      // Apply group filter if selected
      if (selectedGroup) {
        query = query.filter('contact_groups.group_id', 'eq', selectedGroup);
      }

      // Apply company filter if provided
      if (companyFilter) {
        query = query.ilike('company', `%${companyFilter}%`);
      }

      // Apply search term across multiple fields
      if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        query = query.or(
          `first_name.ilike.%${lowerCaseSearchTerm}%,last_name.ilike.%${lowerCaseSearchTerm}%,company.ilike.%${lowerCaseSearchTerm}%`
        );
      }

      // Determine sort parameters
      let sortByColumn: string;
      let ascendingOrder: boolean;
      let collation: string | undefined;

      switch (sortOption) {
        case "first_name_asc":
          sortByColumn = "first_name";
          ascendingOrder = true;
          collation = "fa_IR";
          break;
        case "first_name_desc":
          sortByColumn = "first_name";
          ascendingOrder = false;
          collation = "fa_IR";
          break;
        case "last_name_asc":
          sortByColumn = "last_name";
          ascendingOrder = true;
          collation = "fa_IR";
          break;
        case "last_name_desc":
          sortByColumn = "last_name";
          ascendingOrder = false;
          collation = "fa_IR";
          break;
        case "created_at_desc":
          sortByColumn = "created_at";
          ascendingOrder = false;
          break;
        case "created_at_asc":
          sortByColumn = "created_at";
          ascendingOrder = true;
          break;
        default:
          sortByColumn = "last_name";
          ascendingOrder = true;
          collation = "fa_IR";
          break;
      }

      // Apply sorting with collation for Persian text when needed
      const orderOptions: { ascending: boolean; collate?: string } = { ascending: ascendingOrder };
      if (collation) {
        orderOptions.collate = collation;
      }
      
      query = query.order(sortByColumn, orderOptions);

      const { data, error } = await query;

      if (error) {
        return { data: null, error: error.message };
      }
      
      // Cast the data to the expected type since Supabase returns 'any' by default
      return { data: data as Contact[], error: null };
    } catch (error: unknown) {
      console.error("Error in ContactListService.getFilteredContacts:", error);
      if (error instanceof Error) {
        return { data: null, error: error.message || "Unknown error occurred" };
      }
      return { data: null, error: "Unknown error occurred" };
    }
  },
};