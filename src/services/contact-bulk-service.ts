import { supabase } from '@/integrations/supabase/client';
import i18n from '@/integrations/i18n';

export const ContactBulkService = {
  async deleteContacts(contactIds: string[]): Promise<{ success: boolean; error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: i18n.t('errors.auth_required') };
    }

    try {
      const { error } = await supabase
        .from("contacts")
        .delete()
        .in("id", contactIds)
        .eq("user_id", user.id); // Ensure user owns the contacts

      if (error) throw error;
      return { success: true, error: null };
    } catch (error: unknown) {
      console.error("ContactBulkService.deleteContacts: Caught an error during bulk delete process:", error);
      return { success: false, error: error instanceof Error ? error.message : i18n.t('errors.unknown_error') };
    }
  },

  async assignContactsToGroup(contactIds: string[], groupId: string): Promise<{ success: boolean; error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: i18n.t('errors.auth_required') };
    }

    try {
      // First, remove existing group assignments for these contacts
      const { error: deleteError } = await supabase
        .from("contact_groups")
        .delete()
        .in("contact_id", contactIds)
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;

      // Then, add new group assignments
      const groupAssignments = contactIds.map(contactId => ({
        contact_id: contactId,
        group_id: groupId,
        user_id: user.id
      }));

      const { error: insertError } = await supabase
        .from("contact_groups")
        .insert(groupAssignments);

      if (insertError) throw insertError;

      return { success: true, error: null };
    } catch (error: unknown) {
      console.error("ContactBulkService.assignContactsToGroup: Caught an error during bulk group assignment:", error);
      return { success: false, error: error instanceof Error ? error.message : i18n.t('errors.unknown_error') };
    }
  },

  async removeContactsFromGroup(contactIds: string[]): Promise<{ success: boolean; error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: i18n.t('errors.auth_required') };
    }

    try {
      const { error } = await supabase
        .from("contact_groups")
        .delete()
        .in("contact_id", contactIds)
        .eq("user_id", user.id);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error: unknown) {
      console.error("ContactBulkService.removeContactsFromGroup: Caught an error during bulk group removal:", error);
      return { success: false, error: error instanceof Error ? error.message : i18n.t('errors.unknown_error') };
    }
  }
};