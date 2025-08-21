import { supabase } from '@/integrations/supabase/client';
import { CustomFieldTemplate, CreateCustomFieldTemplateInput, UpdateCustomFieldTemplateInput } from '@/domain/schemas/custom-field-template';
import moment from 'moment-jalaali'; // Import moment-jalaali for date calculations

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
    const { data, error } = await supabase
      .from('contacts')
      .select('gender, count')
      .eq('user_id', userId);

    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data as Array<{ gender: string; count: number }>, error: null };
  },

  async getContactsByGroup(userId: string): Promise<{ data: Array<{ name: string; color?: string; count: number }> | null; error: string | null }> {
    // This query fetches contacts and their associated group names and colors, then counts them.
    // Supabase's `group` on joined tables can be tricky. We'll fetch the raw data and process it in client.
    const { data, error } = await supabase
      .from('contact_groups')
      .select('groups(name, color)')
      .eq('user_id', userId);

    if (error) {
      return { data: null, error: error.message };
    }

    const groupCounts: { [key: string]: { name: string; color?: string; count: number } } = {};

    data.forEach((item: any) => {
      const group = item.groups;
      if (group) {
        const groupName = group.name || 'بدون گروه';
        if (groupCounts[groupName]) {
          groupCounts[groupName].count++;
        } else {
          groupCounts[groupName] = { name: groupName, color: group.color, count: 1 };
        }
      } else {
        // Handle contacts without a group explicitly
        const noGroupName = 'بدون گروه';
        if (groupCounts[noGroupName]) {
          groupCounts[noGroupName].count++;
        } else {
          groupCounts[noGroupName] = { name: noGroupName, count: 1 };
        }
      }
    });

    return { data: Object.values(groupCounts), error: null };
  },

  async getContactsByPreferredMethod(userId: string): Promise<{ data: Array<{ method: string; count: number }> | null; error: string | null }> {
    const { data, error } = await supabase
      .from('contacts')
      .select('preferred_contact_method, count')
      .eq('user_id', userId)
      .not('preferred_contact_method', 'is', null);

    if (error) {
      return { data: null, error: error.message };
    }
    // Map the data to the expected type
    const formattedData = data.map(item => ({
      method: item.preferred_contact_method,
      count: item.count,
    }));
    return { data: formattedData as Array<{ method: string; count: number }>, error: null };
  },

  async getUpcomingBirthdays(userId: string): Promise<{ data: Array<{ first_name: string; last_name: string; birthday: string }> | null; error: string | null }> {
    const currentMonth = moment().month() + 1; // Gregorian month (1-12)
    const currentDay = moment().date(); // Gregorian day of month

    const { data, error } = await supabase
      .from('contacts')
      .select('first_name, last_name, birthday')
      .eq('user_id', userId)
      .not('birthday', 'is', null)
      .filter('EXTRACT(MONTH FROM birthday)', 'eq', currentMonth)
      .order('EXTRACT(DAY FROM birthday)', { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    // Filter for upcoming birthdays in the current month (today and future)
    const upcoming = data.filter(contact => {
      const birthdayDate = new Date(contact.birthday);
      return birthdayDate.getDate() >= currentDay;
    });

    return { data: upcoming as Array<{ first_name: string; last_name: string; birthday: string }>, error: null };
  },
};