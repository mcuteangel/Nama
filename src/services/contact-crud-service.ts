import { supabase } from '@/integrations/supabase/client';
import { ContactFormValues } from '@/types/contact';
import {
  syncPhoneNumbers,
  syncEmailAddresses,
  syncSocialLinks,
  syncGroupAssignment,
  syncCustomFields,
} from '@/services/contact-crud/helpers'; // Import helper functions
import i18n from '@/integrations/i18n';

export const ContactCrudService = {
  async addContact(values: ContactFormValues): Promise<{ data: { id: string } | null; error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: i18n.t('errors.auth_required') };
    }

    try {
      // 1. Insert main contacts table entry
      const { data: contactData, error: contactError } = await supabase
        .from("contacts")
        .insert({
          user_id: user.id,
          first_name: values.firstName,
          last_name: values.lastName,
          gender: values.gender,
          position: values.position || null,
          company: values.company || null,
          street: values.street ?? null,
          city: values.city ?? null,
          state: values.state ?? null,
          zip_code: values.zipCode ?? null,
          country: values.country ?? null,
          notes: values.notes ?? null,
          birthday: values.birthday ?? null,
          avatar_url: values.avatarUrl ?? null,
          preferred_contact_method: values.preferredContactMethod ?? null,
        })
        .select('id')
        .single();

      if (contactError) throw contactError;

      const currentContactId = contactData.id;

      // 2. Insert related data using helper functions (no diffing needed for new contacts)
      if (values.phoneNumbers && values.phoneNumbers.length > 0) {
        await syncPhoneNumbers(supabase, user.id, currentContactId, values.phoneNumbers);
      }
      if (values.emailAddresses && values.emailAddresses.length > 0) {
        await syncEmailAddresses(supabase, user.id, currentContactId, values.emailAddresses);
      }
      if (values.socialLinks && values.socialLinks.length > 0) {
        await syncSocialLinks(supabase, user.id, currentContactId, values.socialLinks);
      }
      if (values.groupId) {
        await syncGroupAssignment(supabase, user.id, currentContactId, values.groupId);
      }
      if (values.customFields && values.customFields.length > 0) {
        await syncCustomFields(supabase, user.id, currentContactId, values.customFields);
      }

      return { data: { id: currentContactId }, error: null };
    } catch (error: unknown) {
      console.error("ContactCrudService.addContact: Caught an error during add process:", error);
      return { data: null, error: error instanceof Error ? error.message : i18n.t('errors.unknown_error') };
    }
  },

  async updateContact(contactId: string, values: ContactFormValues): Promise<{ success: boolean; error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: i18n.t('errors.auth_required') };
    }

    try {
      // 1. Update main contacts table
      const { error: contactError } = await supabase
        .from("contacts")
        .update({
          first_name: values.firstName,
          last_name: values.lastName,
          gender: values.gender,
          position: values.position || null,
          company: values.company || null,
          street: values.street ?? null,
          city: values.city ?? null,
          state: values.state ?? null,
          zip_code: values.zipCode ?? null,
          country: values.country ?? null,
          notes: values.notes ?? null,
          birthday: values.birthday ?? null,
          avatar_url: values.avatarUrl ?? null,
          preferred_contact_method: values.preferredContactMethod ?? null,
        })
        .eq("id", contactId)
        .eq("user_id", user.id);

      if (contactError) throw contactError;

      // 2. Synchronize related data using helper functions
      await syncPhoneNumbers(supabase, user.id, contactId, values.phoneNumbers || []);
      await syncEmailAddresses(supabase, user.id, contactId, values.emailAddresses || []);
      await syncSocialLinks(supabase, user.id, contactId, values.socialLinks || []);
      await syncGroupAssignment(supabase, user.id, contactId, values.groupId || null);
      await syncCustomFields(supabase, user.id, contactId, values.customFields || []);

      return { success: true, error: null };
    } catch (error: unknown) {
      console.error("ContactCrudService.updateContact: Caught an error during update process:", error);
      return { success: false, error: error instanceof Error ? error.message : i18n.t('errors.unknown_error') };
    }
  },

  async deleteContact(contactId: string): Promise<{ success: boolean; error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: i18n.t('errors.auth_required') };
    }

    try {
      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", contactId)
        .eq("user_id", user.id); // Ensure user owns the contact

      if (error) throw error;
      return { success: true, error: null };
    } catch (error: unknown) {
      console.error("ContactCrudService.deleteContact: Caught an error during delete process:", error);
      return { success: false, error: error instanceof Error ? error.message : i18n.t('errors.unknown_error') };
    }
  },
};