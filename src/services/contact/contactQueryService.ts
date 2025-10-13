import { supabase } from "@/integrations/supabase/client";
import { ContactListResponse } from "@/types/contact.types";
import i18n from "@/integrations/i18n";

export const fetchContacts = async (
  userId: string,
  selectedGroup: string = '',
  companyFilter: string = ''
): Promise<ContactListResponse> => {
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

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return { data: null, error: i18n.t('errors.database_fetch_error') };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in fetchContacts:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : i18n.t('errors.unknown_contacts_fetch_error')
    };
  }
};
