import { supabase } from "@/integrations/supabase/client";
import { UseFormReturn } from "react-hook-form";
import { Session } from "@supabase/supabase-js";
import { NavigateFunction } from "react-router-dom";
import { CustomFieldTemplate } from "@/domain/schemas/custom-field-template";
import { ContactFormValues, CustomFieldFormData } from "../types/contact.ts";
import { invalidateCache } from "@/utils/cache-helpers";
import { useErrorHandler } from "./use-error-handler"; // Import useErrorHandler
import { ErrorManager } from "@/lib/error-manager"; // Import ErrorManager
import { useCallback } from "react"; // Import useCallback

export const useContactFormLogic = (
  contactId: string | undefined,
  navigate: NavigateFunction,
  session: Session | null,
  form: UseFormReturn<ContactFormValues>,
  availableTemplates: CustomFieldTemplate[]
) => {
  const onSuccessCallback = useCallback(() => {
    ErrorManager.notifyUser(contactId ? "مخاطب با موفقیت به‌روزرسانی شد!" : "مخاطب با موفقیت ذخیره شد!", 'success');
    if (!contactId) { // Only reset form for new contacts
      form.reset();
    }
    invalidateCache(`contacts_list_${session?.user?.id}_`); // Invalidate all contact lists for this user
    invalidateCache(`statistics_dashboard_${session?.user?.id}`); // Invalidate statistics cache
    if (contactId) {
      invalidateCache(`contact_detail_${contactId}`); // Invalidate single contact cache
    }
    navigate("/"); // Navigate back to contacts list after success
  }, [contactId, form, session, navigate]);

  const onErrorCallback = useCallback((err: Error) => {
    ErrorManager.logError(err, { component: "useContactFormLogic", action: contactId ? "updateContact" : "createContact" });
  }, [contactId]);

  const {
    isLoading: isSubmitting,
    error,
    errorMessage,
    retry: retrySave,
    executeAsync: executeSave,
    retryCount,
  } = useErrorHandler(null, {
    maxRetries: 3,
    retryDelay: 1000,
    showToast: true,
    customErrorMessage: contactId ? "خطایی در به‌روزرسانی مخاطب رخ داد" : "خطایی در ذخیره مخاطب رخ داد",
    onSuccess: onSuccessCallback,
    onError: onErrorCallback,
  });

  const onSubmit = async (values: ContactFormValues) => {
    const user = session?.user;

    if (!user) {
      ErrorManager.notifyUser("برای افزودن/ویرایش مخاطب باید وارد شوید.", 'error');
      navigate("/login");
      return;
    }

    await executeSave(async () => {
      let currentContactId = contactId;

      if (contactId) {
        // Update existing contact
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
        // First, delete all existing group assignments for this contact to ensure single assignment
        const { error: deleteExistingGroupsError } = await supabase
          .from("contact_groups")
          .delete()
          .eq("contact_id", currentContactId) // Use currentContactId which is set for both new and existing contacts
          .eq("user_id", user.id);

        if (deleteExistingGroupsError) throw deleteExistingGroupsError;

        // If a group is selected in the form, insert the new assignment
        if (values.groupId) {
          const { error: insertGroupError } = await supabase
            .from("contact_groups")
            .insert({
              user_id: user.id,
              contact_id: currentContactId,
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
                  contact_id: currentContactId,
                  template_id: field.template_id,
                  field_value: field.value,
                });
              if (insertError) throw insertError;
            }
          }
        }
      } else {
        // Insert new contact
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

        currentContactId = contactData.id;

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

        // --- Handle group assignment for new contact ---
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
            .map((field: CustomFieldFormData) => ({
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
      }
    });
  };

  return { onSubmit, isSubmitting, error, errorMessage, retrySave, retryCount };
};