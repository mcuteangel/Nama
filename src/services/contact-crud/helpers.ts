import { SupabaseClient } from '@supabase/supabase-js';
import { PhoneNumberFormData, EmailAddressFormData, SocialLinkFormData, CustomFieldFormData } from '@/types/contact';

/**
 * Synchronizes phone numbers for a given contact.
 * Compares new phone numbers from the form with existing ones in the database
 * and performs inserts, updates, or deletes as necessary.
 */
export async function syncPhoneNumbers(
  supabase: SupabaseClient,
  userId: string,
  contactId: string,
  newPhoneNumbers: PhoneNumberFormData[]
): Promise<void> {
  const { data: existingPhoneNumbers, error: fetchError } = await supabase
    .from("phone_numbers")
    .select("id, phone_type, phone_number, extension")
    .eq("contact_id", contactId)
    .eq("user_id", userId);

  if (fetchError) throw fetchError;

  const existingMap = new Map(existingPhoneNumbers.map(p => [p.id, p]));

  const phonesToInsert = [];
  const phonesToUpdate = [];
  const phonesToDeleteIds = new Set(existingPhoneNumbers.map(p => p.id));

  for (const newPhone of newPhoneNumbers) {
    if (newPhone.id && existingMap.has(newPhone.id)) {
      // Existing phone, check for updates
      const oldPhone = existingMap.get(newPhone.id);
      if (oldPhone && (
        oldPhone.phone_type !== newPhone.phone_type ||
        oldPhone.phone_number !== newPhone.phone_number ||
        oldPhone.extension !== (newPhone.extension || null)
      )) {
        phonesToUpdate.push({ ...newPhone, id: newPhone.id });
      }
      phonesToDeleteIds.delete(newPhone.id); // Keep this one
    } else {
      // New phone to insert
      phonesToInsert.push({
        user_id: userId,
        contact_id: contactId,
        phone_type: newPhone.phone_type,
        phone_number: newPhone.phone_number,
        extension: newPhone.extension || null,
      });
    }
  }

  // Perform operations
  if (phonesToDeleteIds.size > 0) {
    const { error } = await supabase.from("phone_numbers").delete().in("id", Array.from(phonesToDeleteIds));
    if (error) throw error;
  }
  if (phonesToUpdate.length > 0) {
    for (const phone of phonesToUpdate) {
      const { error } = await supabase
        .from("phone_numbers")
        .update({
          phone_type: phone.phone_type,
          phone_number: phone.phone_number,
          extension: phone.extension,
        })
        .eq("id", phone.id)
        .eq("user_id", userId);
      if (error) throw error;
    }
  }
  if (phonesToInsert.length > 0) {
    const { error } = await supabase.from("phone_numbers").insert(phonesToInsert);
    if (error) throw error;
  }
}

/**
 * Synchronizes email addresses for a given contact.
 * Compares new email addresses from the form with existing ones in the database
 * and performs inserts, updates, or deletes as necessary.
 */
export async function syncEmailAddresses(
  supabase: SupabaseClient,
  userId: string,
  contactId: string,
  newEmailAddresses: EmailAddressFormData[]
): Promise<void> {
  const { data: existingEmailAddresses, error: fetchError } = await supabase
    .from("email_addresses")
    .select("id, email_type, email_address")
    .eq("contact_id", contactId)
    .eq("user_id", userId);

  if (fetchError) throw fetchError;

  const existingMap = new Map(existingEmailAddresses.map(e => [e.id, e]));

  const emailsToInsert = [];
  const emailsToUpdate = [];
  const emailsToDeleteIds = new Set(existingEmailAddresses.map(e => e.id));

  for (const newEmail of newEmailAddresses) {
    if (newEmail.id && existingMap.has(newEmail.id)) {
      // Existing email, check for updates
      const oldEmail = existingMap.get(newEmail.id);
      if (oldEmail && (
        oldEmail.email_type !== newEmail.email_type ||
        oldEmail.email_address !== newEmail.email_address
      )) {
        emailsToUpdate.push({ ...newEmail, id: newEmail.id });
      }
      emailsToDeleteIds.delete(newEmail.id); // Keep this one
    } else {
      // New email to insert
      emailsToInsert.push({
        user_id: userId,
        contact_id: contactId,
        email_type: newEmail.email_type,
        email_address: newEmail.email_address,
      });
    }
  }

  // Perform operations
  if (emailsToDeleteIds.size > 0) {
    const { error } = await supabase.from("email_addresses").delete().in("id", Array.from(emailsToDeleteIds));
    if (error) throw error;
  }
  if (emailsToUpdate.length > 0) {
    for (const email of emailsToUpdate) {
      const { error } = await supabase
        .from("email_addresses")
        .update({
          email_type: email.email_type,
          email_address: email.email_address,
        })
        .eq("id", email.id)
        .eq("user_id", userId);
      if (error) throw error;
    }
  }
  if (emailsToInsert.length > 0) {
    const { error } = await supabase.from("email_addresses").insert(emailsToInsert);
    if (error) throw error;
  }
}

/**
 * Synchronizes social links for a given contact.
 * Compares new social links from the form with existing ones in the database
 * and performs inserts, updates, or deletes as necessary.
 */
export async function syncSocialLinks(
  supabase: SupabaseClient,
  userId: string,
  contactId: string,
  newSocialLinks: SocialLinkFormData[]
): Promise<void> {
  const { data: existingSocialLinks, error: fetchError } = await supabase
    .from("social_links")
    .select("id, type, url")
    .eq("contact_id", contactId)
    .eq("user_id", userId);

  if (fetchError) throw fetchError;

  const existingMap = new Map(existingSocialLinks.map(s => [s.id, s]));

  const linksToInsert = [];
  const linksToUpdate = [];
  const linksToDeleteIds = new Set(existingSocialLinks.map(s => s.id));

  for (const newLink of newSocialLinks) {
    if (newLink.id && existingMap.has(newLink.id)) {
      // Existing link, check for updates
      const oldLink = existingMap.get(newLink.id);
      if (oldLink && (
        oldLink.type !== newLink.type ||
        oldLink.url !== newLink.url
      )) {
        linksToUpdate.push({ ...newLink, id: newLink.id });
      }
      linksToDeleteIds.delete(newLink.id); // Keep this one
    } else {
      // New link to insert
      linksToInsert.push({
        user_id: userId,
        contact_id: contactId,
        type: newLink.type,
        url: newLink.url,
      });
    }
  }

  // Perform operations
  if (linksToDeleteIds.size > 0) {
    const { error } = await supabase.from("social_links").delete().in("id", Array.from(linksToDeleteIds));
    if (error) throw error;
  }
  if (linksToUpdate.length > 0) {
    for (const link of linksToUpdate) {
      const { error } = await supabase
        .from("social_links")
        .update({
          type: link.type,
          url: link.url,
        })
        .eq("id", link.id)
        .eq("user_id", userId);
      if (error) throw error;
    }
  }
  if (linksToInsert.length > 0) {
    const { error } = await supabase.from("social_links").insert(linksToInsert);
    if (error) throw error;
  }
}

/**
 * Synchronizes group assignment for a given contact.
 * Deletes existing group assignments and inserts the new one if provided.
 */
export async function syncGroupAssignment(
  supabase: SupabaseClient,
  userId: string,
  contactId: string,
  newGroupId: string | null
): Promise<void> {
  // Delete all existing group assignments for this contact
  const { error: deleteError } = await supabase
    .from("contact_groups")
    .delete()
    .eq("contact_id", contactId)
    .eq("user_id", userId);

  if (deleteError) throw deleteError;

  // Insert new group assignment if a groupId is provided
  if (newGroupId) {
    const { error: insertError } = await supabase
      .from("contact_groups")
      .insert({
        user_id: userId,
        contact_id: contactId,
        group_id: newGroupId,
      });
    if (insertError) throw insertError;
  }
}

/**
 * Synchronizes custom fields for a given contact.
 * Compares new custom fields from the form with existing ones in the database
 * and performs inserts, updates, or deletes as necessary.
 */
export async function syncCustomFields(
  supabase: SupabaseClient,
  userId: string,
  contactId: string,
  newCustomFields: CustomFieldFormData[]
): Promise<void> {
  const { data: existingCustomFields, error: fetchError } = await supabase
    .from("custom_fields")
    .select("id, template_id, field_value")
    .eq("contact_id", contactId)
    .eq("user_id", userId);

  if (fetchError) throw fetchError;

  const existingMap = new Map(existingCustomFields.map(cf => [cf.template_id, cf]));

  const fieldsToInsert = [];
  const fieldsToUpdate = [];
  const fieldsToDeleteIds = new Set(existingCustomFields.map(cf => cf.id));

  for (const newField of newCustomFields) {
    const existingField = existingMap.get(newField.template_id);
    if (existingField) {
      // Existing custom field, check for updates
      if (existingField.field_value !== newField.value) {
        fieldsToUpdate.push({ id: existingField.id, template_id: newField.template_id, value: newField.value });
      }
      // If it exists in newCustomFields, it should not be deleted
      fieldsToDeleteIds.delete(existingField.id);
    } else {
      // New custom field to insert, only if it has a value
      if (newField.value && newField.value.trim() !== '') {
        fieldsToInsert.push({
          user_id: userId,
          contact_id: contactId,
          template_id: newField.template_id,
          field_value: newField.value,
        });
      }
    }
  }

  // Perform operations
  if (fieldsToDeleteIds.size > 0) {
    const { error } = await supabase.from("custom_fields").delete().in("id", Array.from(fieldsToDeleteIds));
    if (error) throw error;
  }
  if (fieldsToUpdate.length > 0) {
    for (const field of fieldsToUpdate) {
      const { error } = await supabase
        .from("custom_fields")
        .update({ field_value: field.value })
        .eq("id", field.id)
        .eq("user_id", userId);
      if (error) throw error;
    }
  }
  if (fieldsToInsert.length > 0) {
    const { error } = await supabase.from("custom_fields").insert(fieldsToInsert);
    if (error) throw error;
  }
}