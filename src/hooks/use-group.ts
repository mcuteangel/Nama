import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from './use-error-handler';
// Define a simplified contact interface for preview purposes
interface ContactPreview {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  email?: string;
  name?: string; // For backward compatibility
}

interface Group {
  id: string;
  name: string;
  description?: string;
  color?: string;
  contacts: ContactPreview[];
}

export const useGroup = (groupId: string | undefined) => {
  const [group, setGroup] = useState<Group | null>(null);
  const { isLoading, error, executeAsync } = useErrorHandler<Group | null>(null);

  const fetchGroup = useCallback(async () => {
    if (!groupId) return;

    await executeAsync(async () => {
      // First, get the group details
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('id, name, color, created_at')
        .eq('id', groupId)
        .single();

      if (groupError) {
        console.error('Error fetching group:', groupError);
        throw groupError;
      }

      // Then get the contacts for this group
      // First, get the contact IDs in this group
      const { data: contactGroups, error: cgError } = await supabase
        .from('contact_groups')
        .select('contact_id')
        .eq('group_id', groupId);

      if (cgError) {
        console.error('Error fetching contact groups:', cgError);
        throw cgError;
      }

      const contactIds = contactGroups?.map(cg => cg.contact_id) || [];

      // Then fetch the contacts with their phone numbers and emails
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select(`
          id,
          first_name,
          last_name,
          avatar_url,
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

      const formattedData = {
        ...groupData,
        contacts: contactsData.map((contact: any) => ({
          id: contact.id,
          first_name: contact.first_name || '',
          last_name: contact.last_name || '',
          avatar_url: contact.avatar_url || null,
          phone_number: contact.phone_numbers?.[0]?.phone_number || '',
          phone_numbers: contact.phone_numbers || []
        } as ContactPreview)),
      };

      setGroup(formattedData as Group);
      return formattedData as Group;
    });
  }, [groupId, executeAsync]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  return { group, isLoading, error, refresh: fetchGroup };
};
