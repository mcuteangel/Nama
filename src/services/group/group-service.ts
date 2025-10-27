import { supabase } from '@/integrations/supabase/client';
import { Group, GroupFormData, GroupWithContacts, ContactPreview } from '@/types/group.types';

export class GroupService {
  /**
   * دریافت یک گروه با مخاطبینش
   */
  static async getGroupById(groupId: string): Promise<GroupWithContacts | null> {
    try {
      // First, get the group details
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('id, name, color, created_at, description')
        .eq('id', groupId)
        .single();

      if (groupError) {
        console.error('Error fetching group:', groupError);
        throw groupError;
      }

      // Then get the contacts for this group
      const { data: contactGroups, error: cgError } = await supabase
        .from('contact_groups')
        .select('contact_id')
        .eq('group_id', groupId);

      if (cgError) {
        console.error('Error fetching contact groups:', cgError);
        throw cgError;
      }

      const contactIds = contactGroups?.map(cg => cg.contact_id) || [];

      if (contactIds.length === 0) {
        return {
          ...groupData,
          contacts: []
        };
      }

      // Then fetch the contacts with their phone numbers and emails
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select(`
          id,
          first_name,
          last_name,
          avatar_url,
          gender,
          phone_numbers (
            id,
            phone_number,
            phone_type,
            extension
          ),
          email_addresses (
            id,
            email_address,
            email_type
          )
        `)
        .in('id', contactIds);

      if (contactsError) {
        console.error('Error fetching group contacts:', contactsError);
        throw contactsError;
      }

      const contacts: ContactPreview[] = (contactsData as any[]).map((contact) => ({
        id: contact.id,
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        avatar_url: contact.avatar_url || null,
        gender: contact.gender || null,
        phone_number: contact.phone_numbers?.[0]?.phone_number || '',
        phone_numbers: contact.phone_numbers || [],
        email: contact.email_addresses?.[0]?.email_address || undefined
      }));

      return {
        ...groupData,
        contacts
      };
    } catch (error) {
      console.error('Error in getGroupById:', error);
      throw error;
    }
  }

  /**
   * ایجاد گروه جدید
   */
  static async createGroup(groupData: GroupFormData, userId: string): Promise<Group> {
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert({
          ...groupData,
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  /**
   * بروزرسانی گروه
   */
  static async updateGroup(groupId: string, groupData: Partial<GroupFormData>): Promise<Group> {
    try {
      const { data, error } = await supabase
        .from('groups')
        .update(groupData)
        .eq('id', groupId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  /**
   * حذف گروه
   */
  static async deleteGroup(groupId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  }

  /**
   * دریافت تمام گروه‌های کاربر
   */
  static async getUserGroups(userId: string): Promise<Group[]> {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, color, created_at, description, contact_count:contact_groups(count)')
        .eq('user_id', userId)
        .order('name', { ascending: true });

      if (error) throw error;

      const groupsWithCount = data?.map(g => ({
        ...g,
        contact_count: g.contact_count?.[0]?.count || 0,
        contacts: [] // Add empty contacts array for compatibility
      })) || [];

      return groupsWithCount;
    } catch (error) {
      console.error('Error fetching user groups:', error);
      throw error;
    }
  }
}
