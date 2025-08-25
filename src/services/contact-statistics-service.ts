import { supabase } from '@/integrations/supabase/client';

export const ContactStatisticsService = {
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
    const { data, error } = await supabase.rpc('get_contacts_by_group_counts', { user_id_param: userId });

    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data as Array<{ name: string; color?: string; count: number }>, error: null };
  },

  async getContactsByPreferredMethod(userId: string): Promise<{ data: Array<{ method: string; count: number }> | null; error: string | null }> {
    const { data, error } = await supabase.rpc('get_preferred_method_counts', { user_id_param: userId });

    if (error) {
      return { data: null, error: error.message };
    }
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