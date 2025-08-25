import { supabase } from '@/integrations/supabase/client';
import { CustomFieldTemplate, CreateCustomFieldTemplateInput, UpdateCustomFieldTemplateInput } from '@/domain/schemas/custom-field-template';
import moment from 'moment-jalaali'; // Import moment-jalaali for date calculations
import { invalidateCache } from '@/utils/cache-helpers'; // Import invalidateCache
import { ContactFormValues } from '@/types/contact'; // Import ContactFormValues

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
    let collation: string | undefined;

    switch (sortOption) {
      case "first_name_asc":
        sortByColumn = "first_name";
        ascendingOrder = true;
        collation = "fa_IR"; // Specify Persian collation
        break;
      case "first_name_desc":
        sortByColumn = "first_name";
        ascendingOrder = false;
        collation = "fa_IR"; // Specify Persian collation
        break;
      case "last_name_asc":
        sortByColumn = "last_name";
        ascendingOrder = true;
        collation = "fa_IR"; // Specify Persian collation
        break;
      case "last_name_desc":
        sortByColumn = "last_name";
        ascendingOrder = false;
        collation = "fa_IR"; // Specify Persian collation
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
        collation = "fa_IR"; // Default to Persian collation for name sorts
        break;
    }

    // Apply collation directly to the column name string if specified
    if (collation) {
      sortByColumn = `${sortByColumn} COLLATE "${collation}"`;
    }
    
    // Pass only 'ascending' in the options object, as 'collate' is now part of sortByColumn
    query = query.order(sortByColumn, { ascending: ascendingOrder });

    const { data, error } = await query;

    if (error) {
      return { data: null, error: error.message };
    }
    return { data, error: null };
  },

  // --- New Contact Management Functions for AI Suggestions ---
  async addContact(values: ContactFormValues): Promise<{ data: { id: string } | null; error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'کاربر احراز هویت نشده است.' };
    }

    try {
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

      if (values.phoneNumbers && values.phoneNumbers.length > 0) {
        const phonesToInsert = values.phoneNumbers.map(phone => ({
          user_id: user.id,
          contact_id: currentContactId,
          phone_type: phone.phone_type,
          phone_number: phone.phone_number,
          extension: phone.extension || null,
        }));
        const { error: phoneError } = await supabase
          .from("phone_numbers")
          .insert(phonesToInsert);
        if (phoneError) throw phoneError;
      }

      if (values.emailAddresses && values.emailAddresses.length > 0) {
        const emailsToInsert = values.emailAddresses.map(email => ({
          user_id: user.id,
          contact_id: currentContactId,
          email_type: email.email_type,
          email_address: email.email_address,
        }));
        const { error: emailError } = await supabase
          .from("email_addresses")
          .insert(emailsToInsert);
        if (emailError) throw emailError;
      }

      if (values.socialLinks && values.socialLinks.length > 0) {
        const linksToInsert = values.socialLinks.map(link => ({
          user_id: user.id,
          contact_id: currentContactId,
          type: link.type,
          url: link.url,
        }));
        const { error: socialLinkError } = await supabase
          .from("social_links")
          .insert(linksToInsert);
        if (socialLinkError) throw socialLinkError;
      }

      if (values.groupId) {
        const { error: groupAssignmentError } = await supabase
          .from("contact_groups")
          .insert({
            user_id: user.id,
            contact_id: currentContactId,
            group_id: values.groupId,
          });
        if (groupAssignmentError) throw groupAssignmentError;
      }

      if (values.customFields && values.customFields.length > 0) {
        const customFieldsToInsert = values.customFields
          .filter(field => field.value && field.value.trim() !== '')
          .map((field) => ({
            user_id: user.id,
            contact_id: currentContactId,
            template_id: field.template_id,
            field_value: field.value,
          }));
        if (customFieldsToInsert.length > 0) {
          const { error: customFieldsError } = await supabase
            .from("custom_fields")
            .insert(customFieldsToInsert);
          if (customFieldsError) throw customFieldsError;
        }
      }
      return { data: { id: currentContactId }, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async updateContact(contactId: string, values: ContactFormValues): Promise<{ success: boolean; error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'کاربر احراز هویت نشده است.' };
    }

    try {
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

      // --- Handle Phone Numbers ---
      const existingPhoneNumbers = (await supabase
        .from("phone_numbers")
        .select("id, phone_type, phone_number, extension")
        .eq("contact_id", contactId)
        .eq("user_id", user.id)).data || [];

      const newPhoneNumbers = values.phoneNumbers || [];

      const phonesToDelete = existingPhoneNumbers.filter(
        (existingPhone) => !newPhoneNumbers.some((newPhone) => newPhone.id === existingPhone.id)
      );
      if (phonesToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from("phone_numbers")
          .delete()
          .in("id", phonesToDelete.map((p) => p.id));
        if (deleteError) throw deleteError;
      }

      for (const phone of newPhoneNumbers) {
        if (phone.id) {
          const { error: updateError } = await supabase
            .from("phone_numbers")
            .update({
              phone_type: phone.phone_type,
              phone_number: phone.phone_number,
              extension: phone.extension || null,
            })
            .eq("id", phone.id)
            .eq("user_id", user.id);
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from("phone_numbers")
            .insert({
              user_id: user.id,
              contact_id: contactId,
              phone_type: phone.phone_type,
              phone_number: phone.phone_number,
              extension: phone.extension || null,
            });
          if (insertError) throw insertError;
        }
      }

      // --- Handle Email Addresses ---
      const existingEmailAddresses = (await supabase
        .from("email_addresses")
        .select("id, email_type, email_address")
        .eq("contact_id", contactId)
        .eq("user_id", user.id)).data || [];

      const newEmailAddresses = values.emailAddresses || [];

      const emailsToDelete = existingEmailAddresses.filter(
        (existingEmail) => !newEmailAddresses.some((newEmail) => newEmail.id === existingEmail.id)
      );
      if (emailsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from("email_addresses")
          .delete()
          .in("id", emailsToDelete.map((e) => e.id));
        if (deleteError) throw deleteError;
      }

      for (const email of newEmailAddresses) {
        if (email.id) {
          const { error: updateError } = await supabase
            .from("email_addresses")
            .update({
              email_type: email.email_type,
              email_address: email.email_address,
            })
            .eq("id", email.id)
            .eq("user_id", user.id);
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from("email_addresses")
            .insert({
              user_id: user.id,
              contact_id: contactId,
              email_type: email.email_type,
              email_address: email.email_address,
            });
          if (insertError) throw insertError;
        }
      }

      // --- Handle Social Links ---
      const existingSocialLinks = (await supabase
        .from("social_links")
        .select("id, type, url")
        .eq("contact_id", contactId)
        .eq("user_id", user.id)).data || [];

      const newSocialLinks = values.socialLinks || [];

      const linksToDelete = existingSocialLinks.filter(
        (existingLink) => !newSocialLinks.some((newLink) => newLink.id === existingLink.id)
      );
      if (linksToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from("social_links")
          .delete()
          .in("id", linksToDelete.map((l) => l.id));
        if (deleteError) throw deleteError;
      }

      for (const link of newSocialLinks) {
        if (link.id) {
          const { error: updateError } = await supabase
            .from("social_links")
            .update({
              type: link.type,
              url: link.url,
            })
            .eq("id", link.id)
            .eq("user_id", user.id);
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from("social_links")
            .insert({
              user_id: user.id,
              contact_id: contactId,
              type: link.type,
              url: link.url,
            });
          if (insertError) throw insertError;
        }
      }

      // --- Handle group assignment ---
      const { error: deleteExistingGroupsError } = await supabase
        .from("contact_groups")
        .delete()
        .eq("contact_id", contactId)
        .eq("user_id", user.id);

      if (deleteExistingGroupsError) throw deleteExistingGroupsError;

      if (values.groupId) {
        const { error: insertGroupError } = await supabase
          .from("contact_groups")
          .insert({
            user_id: user.id,
            contact_id: contactId,
            group_id: values.groupId,
          });
        if (insertGroupError) throw insertGroupError;
      }

      // Handle custom fields update/insert/delete
      const existingCustomFields = (await supabase
        .from("custom_fields")
        .select("id, template_id, field_value")
        .eq("contact_id", contactId)
        .eq("user_id", user.id)).data || [];

      const newCustomFields = values.customFields || [];

      const fieldsToDelete = existingCustomFields.filter(
        (existingField) => !newCustomFields.some((newField) => newField.template_id === existingField.template_id)
      );
      if (fieldsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from("custom_fields")
          .delete()
          .in("id", fieldsToDelete.map((f) => f.id));
        if (deleteError) throw deleteError;
      }

      for (const field of newCustomFields) {
        const existingField = existingCustomFields.find(f => f.template_id === field.template_id);
        if (existingField) {
          if (existingField.field_value !== field.value) {
            const { error: updateError } = await supabase
              .from("custom_fields")
              .update({ field_value: field.value })
              .eq("id", existingField.id)
              .eq("user_id", user.id);
            if (updateError) throw updateError;
          }
        } else {
          if (field.value && field.value.trim() !== '') {
            const { error: insertError } = await supabase
              .from("custom_fields")
              .insert({
                user_id: user.id,
                contact_id: contactId,
                template_id: field.template_id,
                field_value: field.value,
              });
            if (insertError) throw insertError;
          }
        }
      }
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // --- Existing Statistics Functions ---

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