import { supabase } from '@/integrations/supabase/client';
import { ContactFormValues } from '@/types/contact';
import { invalidateCache } from '@/utils/cache-helpers';

export const ContactCrudService = {
  async addContact(values: ContactFormValues): Promise<{ data: { id: string } | null; error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'کاربر احراز هویت نشده است.' };
    }

    try {
      console.log("ContactCrudService.addContact: Received values:", JSON.stringify(values, null, 2)); // Log received values

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
        console.log("ContactCrudService.addContact: Phones to insert:", JSON.stringify(phonesToInsert, null, 2)); // Log phones to insert
        const { data: insertedPhones, error: phoneError } = await supabase
          .from("phone_numbers")
          .insert(phonesToInsert)
          .select('id'); // Select ID to confirm insertion
        if (phoneError) {
          console.error("ContactCrudService.addContact: Error inserting phones:", phoneError.message);
          throw phoneError;
        }
        console.log("ContactCrudService.addContact: Phones inserted successfully. IDs:", insertedPhones?.map(p => p.id));
      }

      if (values.emailAddresses && values.emailAddresses.length > 0) {
        const emailsToInsert = values.emailAddresses.map(email => ({
          user_id: user.id,
          contact_id: currentContactId,
          email_type: email.email_type,
          email_address: email.email_address,
        }));
        const { data: insertedEmails, error: emailError } = await supabase
          .from("email_addresses")
          .insert(emailsToInsert)
          .select('id');
        if (emailError) {
          console.error("ContactCrudService.addContact: Error inserting emails:", emailError.message);
          throw emailError;
        }
        console.log("ContactCrudService.addContact: Emails inserted successfully. IDs:", insertedEmails?.map(e => e.id));
      }

      if (values.socialLinks && values.socialLinks.length > 0) {
        const linksToInsert = values.socialLinks.map(link => ({
          user_id: user.id,
          contact_id: currentContactId,
          type: link.type,
          url: link.url,
        }));
        const { data: insertedLinks, error: socialLinkError } = await supabase
          .from("social_links")
          .insert(linksToInsert)
          .select('id');
        if (socialLinkError) {
          console.error("ContactCrudService.addContact: Error inserting social links:", socialLinkError.message);
          throw socialLinkError;
        }
        console.log("ContactCrudService.addContact: Social links inserted successfully. IDs:", insertedLinks?.map(l => l.id));
      }

      if (values.groupId) {
        const { data: insertedGroup, error: groupAssignmentError } = await supabase
          .from("contact_groups")
          .insert({
            user_id: user.id,
            contact_id: currentContactId,
            group_id: values.groupId,
          })
          .select('group_id');
        if (groupAssignmentError) {
          console.error("ContactCrudService.addContact: Error inserting group assignment:", groupAssignmentError.message);
          throw groupAssignmentError;
        }
        console.log("ContactCrudService.addContact: Group assignment inserted. Group ID:", insertedGroup?.[0]?.group_id);
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
          const { data: insertedCustomFields, error: customFieldsError } = await supabase
            .from("custom_fields")
            .insert(customFieldsToInsert)
            .select('id');
          if (customFieldsError) {
            console.error("ContactCrudService.addContact: Error inserting custom fields:", customFieldsError.message);
            throw customFieldsError;
          }
          console.log("ContactCrudService.addContact: Custom fields inserted successfully. IDs:", insertedCustomFields?.map(cf => cf.id));
        }
      }
      return { data: { id: currentContactId }, error: null };
    } catch (error: any) {
      console.error("ContactCrudService.addContact: Caught an error during add process:", error.message);
      return { data: null, error: error.message };
    }
  },

  async updateContact(contactId: string, values: ContactFormValues): Promise<{ success: boolean; error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log("ContactCrudService.updateContact: User not authenticated.");
      return { success: false, error: 'کاربر احراز هویت نشده است.' };
    }

    console.log(`ContactCrudService.updateContact: Starting update for contactId: ${contactId}, userId: ${user.id}`);
    console.log("ContactCrudService.updateContact: Received values:", JSON.stringify(values, null, 2)); // Log received values

    try {
      // 1. Update main contacts table
      console.log("ContactCrudService.updateContact: Updating main contact details...");
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

      if (contactError) {
        console.error("ContactCrudService.updateContact: Error updating main contact:", contactError.message);
        throw contactError;
      }
      console.log("ContactCrudService.updateContact: Main contact updated successfully.");

      // --- Handle Phone Numbers ---
      console.log("ContactCrudService.updateContact: Handling phone numbers...");
      const existingPhoneNumbers = (await supabase
        .from("phone_numbers")
        .select("id, phone_type, phone_number, extension")
        .eq("contact_id", contactId)
        .eq("user_id", user.id)).data || [];
      console.log("ContactCrudService.updateContact: Existing phone numbers from DB:", JSON.stringify(existingPhoneNumbers, null, 2));

      const newPhoneNumbers = values.phoneNumbers || [];
      console.log("ContactCrudService.updateContact: New phone numbers from form:", JSON.stringify(newPhoneNumbers, null, 2));

      const phonesToDelete = existingPhoneNumbers.filter(
        (existingPhone) => !newPhoneNumbers.some((newPhone) => newPhone.id === existingPhone.id)
      );
      if (phonesToDelete.length > 0) {
        console.log("ContactCrudService.updateContact: Deleting phones:", phonesToDelete.map(p => p.id));
        const { error: deleteError } = await supabase
          .from("phone_numbers")
          .delete()
          .in("id", phonesToDelete.map((p) => p.id));
        if (deleteError) {
          console.error("ContactCrudService.updateContact: Error deleting phones:", deleteError.message);
          throw deleteError;
        }
        console.log("ContactCrudService.updateContact: Phones deleted successfully.");
      }

      for (const phone of newPhoneNumbers) {
        if (phone.id) {
          console.log("ContactCrudService.updateContact: Updating phone:", phone.id, "with data:", JSON.stringify(phone, null, 2));
          const { data: updatedPhone, error: updateError } = await supabase
            .from("phone_numbers")
            .update({
              phone_type: phone.phone_type,
              phone_number: phone.phone_number,
              extension: phone.extension || null,
            })
            .eq("id", phone.id)
            .eq("user_id", user.id)
            .select('id');
          if (updateError) {
            console.error("ContactCrudService.updateContact: Error updating phone:", updateError.message);
            throw updateError;
          }
          console.log("ContactCrudService.updateContact: Phone updated successfully. ID:", updatedPhone?.[0]?.id);
        } else {
          console.log("ContactCrudService.updateContact: Inserting new phone with data:", JSON.stringify(phone, null, 2));
          const { data: insertedPhone, error: insertError } = await supabase
            .from("phone_numbers")
            .insert({
              user_id: user.id,
              contact_id: contactId,
              phone_type: phone.phone_type,
              phone_number: phone.phone_number,
              extension: phone.extension || null,
            })
            .select('id');
          if (insertError) {
            console.error("ContactCrudService.updateContact: Error inserting phone:", insertError.message);
            throw insertError;
          }
          console.log("ContactCrudService.updateContact: Phone inserted successfully. ID:", insertedPhone?.[0]?.id);
        }
      }
      console.log("ContactCrudService.updateContact: Phone numbers handled.");

      // --- Handle Email Addresses ---
      console.log("ContactCrudService.updateContact: Handling email addresses...");
      const existingEmailAddresses = (await supabase
        .from("email_addresses")
        .select("id, email_type, email_address")
        .eq("contact_id", contactId)
        .eq("user_id", user.id)).data || [];
      console.log("ContactCrudService.updateContact: Existing email addresses:", JSON.stringify(existingEmailAddresses, null, 2));

      const newEmailAddresses = values.emailAddresses || [];
      console.log("ContactCrudService.updateContact: New email addresses from form:", JSON.stringify(newEmailAddresses, null, 2));

      const emailsToDelete = existingEmailAddresses.filter(
        (existingEmail) => !newEmailAddresses.some((newEmail) => newEmail.id === existingEmail.id)
      );
      if (emailsToDelete.length > 0) {
        console.log("ContactCrudService.updateContact: Deleting emails:", emailsToDelete.map(e => e.id));
        const { error: deleteError } = await supabase
          .from("email_addresses")
          .delete()
          .in("id", emailsToDelete.map((e) => e.id));
        if (deleteError) {
          console.error("ContactCrudService.updateContact: Error deleting emails:", deleteError.message);
          throw deleteError;
        }
        console.log("ContactCrudService.updateContact: Emails deleted successfully.");
      }

      for (const email of newEmailAddresses) {
        if (email.id) {
          console.log("ContactCrudService.updateContact: Updating email:", email.id, "with data:", JSON.stringify(email, null, 2));
          const { data: updatedEmail, error: updateError } = await supabase
            .from("email_addresses")
            .update({
              email_type: email.email_type,
              email_address: email.email_address,
            })
            .eq("id", email.id)
            .eq("user_id", user.id)
            .select('id');
          if (updateError) {
            console.error("ContactCrudService.updateContact: Error updating email:", updateError.message);
            throw updateError;
          }
          console.log("ContactCrudService.updateContact: Email updated successfully. ID:", updatedEmail?.[0]?.id);
        } else {
          console.log("ContactCrudService.updateContact: Inserting new email with data:", JSON.stringify(email, null, 2));
          const { data: insertedEmail, error: insertError } = await supabase
            .from("email_addresses")
            .insert({
              user_id: user.id,
              contact_id: contactId,
              email_type: email.email_type,
              email_address: email.email_address,
            })
            .select('id');
          if (insertError) {
            console.error("ContactCrudService.updateContact: Error inserting email:", insertError.message);
            throw insertError;
          }
          console.log("ContactCrudService.updateContact: Email inserted successfully. ID:", insertedEmail?.[0]?.id);
        }
      }
      console.log("ContactCrudService.updateContact: Email addresses handled.");

      // --- Handle Social Links ---
      console.log("ContactCrudService.updateContact: Handling social links...");
      const existingSocialLinks = (await supabase
        .from("social_links")
        .select("id, type, url")
        .eq("contact_id", contactId)
        .eq("user_id", user.id)).data || [];
      console.log("ContactCrudService.updateContact: Existing social links:", JSON.stringify(existingSocialLinks, null, 2));

      const newSocialLinks = values.socialLinks || [];
      console.log("ContactCrudService.updateContact: New social links from form:", JSON.stringify(newSocialLinks, null, 2));

      const linksToDelete = existingSocialLinks.filter(
        (existingLink) => !newSocialLinks.some((newLink) => newLink.id === existingLink.id)
      );
      if (linksToDelete.length > 0) {
        console.log("ContactCrudService.updateContact: Deleting social links:", linksToDelete.map(l => l.id));
        const { error: deleteError } = await supabase
          .from("social_links")
          .delete()
          .in("id", linksToDelete.map((l) => l.id));
        if (deleteError) {
          console.error("ContactCrudService.updateContact: Error deleting social links:", deleteError.message);
          throw deleteError;
        }
        console.log("ContactCrudService.updateContact: Social links deleted successfully.");
      }

      for (const link of newSocialLinks) {
        if (link.id) {
          console.log("ContactCrudService.updateContact: Updating social link:", link.id, "with data:", JSON.stringify(link, null, 2));
          const { data: updatedLink, error: updateError } = await supabase
            .from("social_links")
            .update({
              type: link.type,
              url: link.url,
            })
            .eq("id", link.id)
            .eq("user_id", user.id)
            .select('id');
          if (updateError) {
            console.error("ContactCrudService.updateContact: Error updating social link:", updateError.message);
            throw updateError;
          }
          console.log("ContactCrudService.updateContact: Social link updated successfully. ID:", updatedLink?.[0]?.id);
        } else {
          console.log("ContactCrudService.updateContact: Inserting new social link with data:", JSON.stringify(link, null, 2));
          const { data: insertedLink, error: insertError } = await supabase
            .from("social_links")
            .insert({
              user_id: user.id,
              contact_id: contactId,
              type: link.type,
              url: link.url,
            })
            .select('id');
          if (insertError) {
            console.error("ContactCrudService.updateContact: Error inserting social link:", insertError.message);
            throw insertError;
          }
          console.log("ContactCrudService.updateContact: Social link inserted successfully. ID:", insertedLink?.[0]?.id);
        }
      }
      console.log("ContactCrudService.updateContact: Social links handled.");

      // --- Handle group assignment ---
      console.log("ContactCrudService.updateContact: Handling group assignment...");
      const { error: deleteExistingGroupsError } = await supabase
        .from("contact_groups")
        .delete()
        .eq("contact_id", contactId)
        .eq("user_id", user.id);

      if (deleteExistingGroupsError) {
        console.error("ContactCrudService.updateContact: Error deleting existing groups:", deleteExistingGroupsError.message);
        throw deleteExistingGroupsError;
      }
      console.log("ContactCrudService.updateContact: Existing groups deleted.");

      if (values.groupId) {
        console.log("ContactCrudService.updateContact: Inserting new group assignment:", values.groupId);
        const { data: insertedGroup, error: insertGroupError } = await supabase
          .from("contact_groups")
          .insert({
            user_id: user.id,
            contact_id: contactId,
            group_id: values.groupId,
          })
          .select('group_id');
        if (insertGroupError) {
          console.error("ContactCrudService.updateContact: Error inserting group assignment:", insertGroupError.message);
          throw insertGroupError;
        }
        console.log("ContactCrudService.updateContact: Group assignment inserted. Group ID:", insertedGroup?.[0]?.group_id);
      } else {
        console.log("ContactCrudService.updateContact: No group assigned.");
      }

      // Handle custom fields update/insert/delete
      console.log("ContactCrudService.updateContact: Handling custom fields...");
      const existingCustomFields = (await supabase
        .from("custom_fields")
        .select("id, template_id, field_value")
        .eq("contact_id", contactId)
        .eq("user_id", user.id)).data || [];
      console.log("ContactCrudService.updateContact: Existing custom fields:", JSON.stringify(existingCustomFields, null, 2));

      const newCustomFields = values.customFields || [];
      console.log("ContactCrudService.updateContact: New custom fields from form:", JSON.stringify(newCustomFields, null, 2));

      const fieldsToDelete = existingCustomFields.filter(
        (existingField) => !newCustomFields.some((newField) => newField.template_id === existingField.template_id)
      );
      if (fieldsToDelete.length > 0) {
        console.log("ContactCrudService.updateContact: Deleting custom fields:", fieldsToDelete.map(f => f.id));
        const { error: deleteError } = await supabase
          .from("custom_fields")
          .delete()
          .in("id", fieldsToDelete.map((f) => f.id));
        if (deleteError) {
          console.error("ContactCrudService.updateContact: Error deleting custom fields:", deleteError.message);
          throw deleteError;
        }
        console.log("ContactCrudService.updateContact: Custom fields deleted successfully.");
      }

      for (const field of newCustomFields) {
        const existingField = existingCustomFields.find(f => f.template_id === field.template_id);
        if (existingField) {
          if (existingField.field_value !== field.value) {
            console.log("ContactCrudService.updateContact: Updating custom field:", existingField.id, "with value:", field.value);
            const { data: updatedCustomField, error: updateError } = await supabase
              .from("custom_fields")
              .update({ field_value: field.value })
              .eq("id", existingField.id)
              .eq("user_id", user.id)
              .select('id');
            if (updateError) {
              console.error("ContactCrudService.updateContact: Error updating custom field:", updateError.message);
              throw updateError;
            }
            console.log("ContactCrudService.updateContact: Custom field updated successfully. ID:", updatedCustomField?.[0]?.id);
          }
        } else {
          if (field.value && field.value.trim() !== '') {
            console.log("ContactCrudService.updateContact: Inserting new custom field for template:", field.template_id, "with value:", field.value);
            const { data: insertedCustomField, error: insertError } = await supabase
              .from("custom_fields")
              .insert({
                user_id: user.id,
                contact_id: contactId,
                template_id: field.template_id,
                field_value: field.value,
              })
              .select('id');
            if (insertError) {
              console.error("ContactCrudService.updateContact: Error inserting custom field:", insertError.message);
              throw insertError;
            }
            console.log("ContactCrudService.updateContact: Custom field inserted successfully. ID:", insertedCustomField?.[0]?.id);
          }
        }
      }
      console.log("ContactCrudService.updateContact: Custom fields handled.");

      console.log("ContactCrudService.updateContact: All updates completed successfully.");
      return { success: true, error: null };
    } catch (error: any) {
      console.error("ContactCrudService.updateContact: Caught an error during update process:", error.message);
      return { success: false, error: error.message };
    }
  },

  async deleteContact(contactId: string): Promise<{ success: boolean; error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'کاربر احراز هویت نشده است.' };
    }

    try {
      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", contactId)
        .eq("user_id", user.id); // Ensure user owns the contact

      if (error) throw error;
      return { success: true, error: null };
    } catch (error: any) {
      console.error("ContactCrudService.deleteContact: Caught an error during delete process:", error.message);
      return { success: false, error: error.message };
    }
  },
};