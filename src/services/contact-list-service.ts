import { supabase } from '@/integrations/supabase/client';

export const ContactListService = {
  async getFilteredContacts(
    userId: string,
    searchTerm: string,
    selectedGroup: string,
    companyFilter: string,
    sortOption: string
  ): Promise<{ data: any[] | null; error: string | null }> {
    let query = supabase
      .from("contacts")
      .select("id, first_name, last_name, gender, position, company, street, city, state, zip_code, country, notes, created_at, updated_at, birthday, phone_numbers(id, phone_number, phone_type, extension), email_addresses(id, email_address, email_type), social_links(type, url), contact_groups(group_id, groups(name, color)), custom_fields(id, template_id, field_value, custom_field_templates(name, type, options))")
      .eq("user_id", userId);

    if (selectedGroup) {
      query = query.filter('contact_groups.group_id', 'eq', selectedGroup);
    }

    if (companyFilter) {
      query = query.ilike('company', `%${companyFilter}%`);
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      query = query.or(
        `first_name.ilike.%${lowerCaseSearchTerm}%,last_name.ilike.%${lowerCaseSearchTerm}%,company.ilike.%${lowerCaseSearchTerm}%`
      );
    }

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

    const orderOptions: { ascending: boolean; collate?: string } = { ascending: ascendingOrder };
    if (collation) {
      orderOptions.collate = collation;
    }
    
    query = query.order(sortByColumn, orderOptions);

    const { data, error } = await query;

    if (error) {
      return { data: null, error: error.message };
    }
    return { data, error: null };
  },
};