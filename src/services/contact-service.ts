import { supabase } from '@/integrations/supabase/client';
import { CustomFieldTemplate, CreateCustomFieldTemplateInput, UpdateCustomFieldTemplateInput } from '@/domain/schemas/custom-field-template';
import moment from 'moment-jalaali'; // Import moment-jalaali for date calculations
import { invalidateCache } from '@/utils/cache-helpers'; // Import invalidateCache

export const ContactService = {
  async getAllCustomFieldTemplates(): Promise<{ data: CustomFieldTemplate[] | null; error: string | null }> {
    const { data, error } = await supabase
      .from('custom_field_templates')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data as CustomFieldTemplate[], error: null };
  },

  async addCustomFieldTemplate(template: CreateCustomFieldTemplateInput): Promise<{ data: CustomFieldTemplate | null; error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'کاربر احراز هویت نشده است.' };
    }

    const { data, error } = await supabase
      .from('custom_field_templates')
      .insert({ ...template, user_id: user.id })
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }
    invalidateCache(`custom_field_templates_${user.id}`); // Invalidate cache after add
    return { data: data as CustomFieldTemplate, error: null };
  },

  async updateCustomFieldTemplate(id: string, template: UpdateCustomFieldTemplateInput): Promise<{ data: CustomFieldTemplate | null; error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'کاربر احراز هویت نشده است.' };
    }

    const { data, error } = await supabase
      .from('custom_field_templates')
      .update(template)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns the template
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }
    invalidateCache(`custom_field_templates_${user.id}`); // Invalidate cache after update
    return { data: data as CustomFieldTemplate, error: null };
  },

  async deleteCustomFieldTemplate(id: string): Promise<{ success: boolean; error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'کاربر احراز هویت نشده است.' };
    }

    const { error } = await supabase
      .from('custom_field_templates')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure user owns the template

    if (error) {
      return { success: false, error: error.message };
    }
    invalidateCache(`custom_field_templates_${user.id}`); // Invalidate cache after delete
    return { success: true, error: null };
  },

  async getFilteredContacts(
    userId: string,
    searchTerm: string,
    selectedGroup: string,
    companyFilter: string,
    sortOption: string
  ): Promise<{ data: any[] | null; error: string | null }> {
    let query = supabase
      .from("contacts")
      .select("id, first_name, last_name, gender, position, company, street, city, state, zip_code, country, notes, created_at, updated_at, birthday, phone_numbers(phone_number, phone_type, extension), email_addresses(email_address, email_type), social_links(type, url), contact_groups(group_id, groups(name, color)), custom_fields(id, template_id, field_value, custom_field_templates(name, type, options))")
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

    switch (sortOption) {
      case "first_name_asc":
        sortByColumn = "first_name";
        ascendingOrder = true;
        break;
      case "first_name_desc":
        sortByColumn = "first_name";
        ascendingOrder = false;
        break;
      case "last_name_asc":
        sortByColumn = "last_name";
        ascendingOrder = true;
        break;
      case "last_name_desc":
        sortByColumn = "last_name";
        ascendingOrder = false;
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
        sortByColumn = "first_name";
        ascendingOrder = true;
        break;
    }

    const { data, error } = await query.order(sortByColumn, { ascending: ascendingOrder });

    if (error) {
      return { data: null, error: error.message };
    }
    return { data, error: null };
  },

  // --- New Statistics Functions ---

  async getTotalContacts(userId: string): Promise<{ data: number | null; error: string | null }> {
    const { count, error } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      return { data: null, error: error.message };
    }
    return { data: count, error: null };
  },

  async getContactsByGender(userId: string): Promise<{ data: Array<{ gender: string; count: number }> | null; error: string | null }> {
    const { data, error } = await supabase.rpc('get_gender_counts', { user_id_param: userId });

    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data as Array<{ gender: string; count: number }>, error: null };
  },

  async getContactsByGroup(userId: string): Promise<{ data: Array<{ name: string; color?: string; count: number }> | null; error: string | null }> {
    // Now calling the new RPC function for server-side aggregation
    const { data, error } = await supabase.rpc('get_contacts_by_group_counts', { user_id_param: userId });

    if (error) {
      return { data: null, error: error.message };
    }
    // The RPC function already returns 'name', 'color', and 'count' in the correct format
    return { data: data as Array<{ name: string; color?: string; count: number }>, error: null };
  },

  async getContactsByPreferredMethod(userId: string): Promise<{ data: Array<{ method: string; count: number }> | null; error: string | null }> {
    const { data, error } = await supabase.rpc('get_preferred_method_counts', { user_id_param: userId });

    if (error) {
      return { data: null, error: error.message };
    }
    // The RPC function already returns 'method' and 'count' in the correct format
    return { data: data as Array<{ method: string; count: number }>, error: null };
  },

  async getUpcomingBirthdays(userId: string): Promise<{ data: Array<{ id: string; first_name: string; last_name: string; birthday: string; days_until_birthday: number }> | null; error: string | null }> {
    const { data, error } = await supabase.rpc('get_upcoming_birthdays', { user_id_param: userId });

    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data as Array<{ id: string; first_name: string; last_name: string; birthday: string; days_until_birthday: number }>, error: null };
  },

  async getContactsByCreationMonth(userId: string): Promise<{ data: Array<{ month_year: string; count: number }> | null; error: string | null }> {
    const { data, error } = await supabase.rpc('get_contacts_by_creation_month', { user_id_param: userId });
    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data as Array<{ month_year: string; count: number }>, error: null };
  },

  async getTopCompanies(userId: string, limit: number = 5): Promise<{ data: Array<{ company: string; count: number }> | null; error: string | null }> {
    const { data, error } = await supabase.rpc('get_top_companies', { user_id_param: userId, limit_param: limit });
    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data as Array<{ company: string; count: number }>, error: null };
  },

  async getTopPositions(userId: string, limit: number = 5): Promise<{ data: Array<{ position: string; count: number }> | null; error: string | null }> {
    const { data, error } = await supabase.rpc('get_top_positions', { user_id_param: userId, limit_param: limit });
    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data as Array<{ position: string; count: number }>, error: null };
  },
};