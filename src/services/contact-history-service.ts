import { supabase } from '@/integrations/supabase/client';

export interface ContactHistoryEntry {
  id: string;
  contact_id: string;
  user_id: string;
  action: 'created' | 'updated' | 'deleted';
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  timestamp: string;
  user_email: string;
}

export const ContactHistoryService = {
  async getContactHistory(contactId: string, userId: string): Promise<{ data: ContactHistoryEntry[] | null; error: string | null }> {
    try {
      // Since we don't have a dedicated history table, we'll simulate history data
      // In a real implementation, this would query a history table
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          id,
          created_at,
          updated_at,
          first_name,
          last_name,
          company,
          position
        `)
        .eq('id', contactId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      if (!data) {
        return { data: null, error: 'Contact not found' };
      }

      // Simulate history entries based on contact data
      const historyEntries: ContactHistoryEntry[] = [
        {
          id: `${data.id}-created`,
          contact_id: data.id,
          user_id: userId,
          action: 'created',
          field_name: 'contact',
          old_value: null,
          new_value: `${data.first_name} ${data.last_name}`,
          timestamp: data.created_at,
          user_email: 'کاربر فعلی' // We'll use a placeholder since we don't have access to user email in this context
        }
      ];

      // Add update entry if contact has been updated
      if (data.updated_at && data.updated_at !== data.created_at) {
        historyEntries.push({
          id: `${data.id}-updated`,
          contact_id: data.id,
          user_id: userId,
          action: 'updated',
          field_name: 'contact',
          old_value: null,
          new_value: 'Contact information updated',
          timestamp: data.updated_at,
          user_email: 'کاربر فعلی'
        });
      }

      // Sort by timestamp descending
      historyEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return { data: historyEntries, error: null };
    } catch (error) {
      console.error('Error fetching contact history:', error);
      return { data: null, error: (error as Error).message };
    }
  }
};