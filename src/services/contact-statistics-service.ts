import { supabase } from '@/integrations/supabase/client';

export const ContactStatisticsService = {
  async getTotalContacts(userId: string, startDate?: string | null, endDate?: string | null): Promise<{ data: number | null; error: string | null }> {
    let query = supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Apply date range filter if provided
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { count, error } = await query;

    if (error) {
      return { data: null, error: error.message };
    }
    return { data: count, error: null };
  },

  async getContactsByGender(userId: string, startDate?: string | null, endDate?: string | null): Promise<{ data: Array<{ gender: string; count: number }> | null; error: string | null }> {
    // Pass date range parameters to the RPC function
    const { data, error } = await supabase.rpc('get_gender_counts', { 
      user_id_param: userId,
      start_date_param: startDate || null,
      end_date_param: endDate || null
    });

    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data as Array<{ gender: string; count: number }>, error: null };
  },

  async getContactsByGroup(userId: string, startDate?: string | null, endDate?: string | null): Promise<{ data: Array<{ name: string; color?: string; count: number }> | null; error: string | null }> {
    const { data, error } = await supabase.rpc('get_contacts_by_group_counts', { 
      user_id_param: userId,
      start_date_param: startDate || null,
      end_date_param: endDate || null
    });

    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data as Array<{ name: string; color?: string; count: number }>, error: null };
  },

  async getContactsByPreferredMethod(userId: string, startDate?: string | null, endDate?: string | null): Promise<{ data: Array<{ method: string; count: number }> | null; error: string | null }> {
    const { data, error } = await supabase.rpc('get_preferred_method_counts', { 
      user_id_param: userId,
      start_date_param: startDate || null,
      end_date_param: endDate || null
    });

    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data as Array<{ method: string; count: number }>, error: null };
  },

  async getUpcomingBirthdays(userId: string, startDate?: string | null, endDate?: string | null): Promise<{ data: Array<{ id: string; first_name: string; last_name: string; birthday: string; days_until_birthday: number }> | null; error: string | null }> {
    const { data, error } = await supabase.rpc('get_upcoming_birthdays', { 
      user_id_param: userId,
      start_date_param: startDate || null,
      end_date_param: endDate || null
    });

    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data as Array<{ id: string; first_name: string; last_name: string; birthday: string; days_until_birthday: number }>, error: null };
  },

  async getContactsByCreationMonth(userId: string, startDate?: string | null, endDate?: string | null): Promise<{ data: Array<{ month_year: string; count: number }> | null; error: string | null }> {
    const { data, error } = await supabase.rpc('get_contacts_by_creation_month', { 
      user_id_param: userId,
      start_date_param: startDate || null,
      end_date_param: endDate || null
    });
    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data as Array<{ month_year: string; count: number }>, error: null };
  },

  async getTopCompanies(userId: string, limit: number = 5, startDate?: string | null, endDate?: string | null): Promise<{ data: Array<{ company: string; count: number }> | null; error: string | null }> {
    const { data, error } = await supabase.rpc('get_top_companies', { 
      user_id_param: userId, 
      limit_param: limit,
      start_date_param: startDate || null,
      end_date_param: endDate || null
    });
    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data as Array<{ company: string; count: number }>, error: null };
  },

  async getTopPositions(userId: string, limit: number = 5, startDate?: string | null, endDate?: string | null): Promise<{ data: Array<{ position: string; count: number }> | null; error: string | null }> {
    const { data, error } = await supabase.rpc('get_top_positions', {
      user_id_param: userId,
      limit_param: limit,
      start_date_param: startDate || null,
      end_date_param: endDate || null
    });
    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data as Array<{ position: string; count: number }>, error: null };
  },

  // جدید: دریافت لیست شرکت‌های منحصر به فرد برای فیلتر
  async getUniqueCompanies(userId: string): Promise<{ data: string[] | null; error: string | null }> {
    const { data, error } = await supabase
      .from('contacts')
      .select('company')
      .eq('user_id', userId)
      .not('company', 'is', null)
      .not('company', 'eq', '');

    if (error) {
      return { data: null, error: error.message };
    }

    const uniqueCompanies = [...new Set(data.map(item => item.company))].filter(Boolean);
    return { data: uniqueCompanies, error: null };
  },

  // جدید: دریافت لیست موقعیت‌های شغلی منحصر به فرد برای فیلتر
  async getUniquePositions(userId: string): Promise<{ data: string[] | null; error: string | null }> {
    const { data, error } = await supabase
      .from('contacts')
      .select('position')
      .eq('user_id', userId)
      .not('position', 'is', null)
      .not('position', 'eq', '');

    if (error) {
      return { data: null, error: error.message };
    }

    const uniquePositions = [...new Set(data.map(item => item.position))].filter(Boolean);
    return { data: uniquePositions, error: null };
  },
};