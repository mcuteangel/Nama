import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { UseFormReturn } from "react-hook-form";
import { Session } from "@supabase/supabase-js";
import { NavigateFunction } from "react-router-dom";
import { CustomFieldTemplate } from "@/domain/schemas/custom-field-template";
import { ContactFormValues, CustomFieldFormData, PhoneNumberFormData, EmailAddressFormData } from "../types/contact.ts"; // Changed import path

export const useContactFormLogic = (
  contactId: string | undefined,
  navigate: NavigateFunction,
  session: Session | null,
  form: UseFormReturn<ContactFormValues>,
  availableTemplates: CustomFieldTemplate[]
) => {
  const onSubmit = async (values: ContactFormValues) => {
    const toastId = showLoading(contactId ? "در حال به‌روزرسانی مخاطب..." : "در حال ذخیره مخاطب...");
    try {
      const user = session?.user;

      if (!user) {
        showError("برای افزودن/ویرایش مخاطب باید وارد شوید.");
        dismissToast(toastId);
        navigate("/login");
        return;
      }

      let currentContactId = contactId;

      if (contactId) {
        // Update existing contact
        const { error: contactError } = await supabase
          .from("contacts")
          .update({
            first_name: values.firstName,
            last_name: values.lastName,
            gender: values.gender,
            position: values.position,
            company: values.company,
            address: values.address,
            notes: values.notes,
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

        // Delete removed phone numbers
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

        // Update or insert phone numbers
        for (const phone of newPhoneNumbers) {
          if (phone.id) {
            // Update existing phone number
            const { error: updateError } = await supabase
              .from("phone_numbers")
              .update({
                phone_type: phone.phone_type,
                phone_number: phone.phone_number,
                extension: phone.extension === '' ? null : phone.extension,
              })
              .eq("id", phone.id)
              .eq("user_id", user.id);
            if (updateError) throw updateError;
          } else {
            // Insert new phone number
            const { error: insertError } = await supabase
              .from("phone_numbers")
              .insert({
                user_id: user.id,
                contact_id: contactId,
                phone_type: phone.phone_type,
                phone_number: phone.phone_number,
                extension: phone.extension === '' ? null : phone.extension,
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

        // Delete removed email addresses
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

        // Update or insert email addresses
        for (const email of newEmailAddresses) {
          if (email.id) {
            // Update existing email address
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
            // Insert new email address
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

        // Handle group assignment
        if (values.groupId) {
          const { data: existingContactGroup, error: fetchGroupError } = await supabase
            .from("contact_groups")
            .select("contact_id, group_id")
            .eq("contact_id", contactId)
            .eq("user_id", user.id)
            .single();

          if (fetchGroupError && fetchGroupError.code !== 'PGRST116') {
            throw fetchGroupError;
          }

          if (existingContactGroup) {
            const { error: updateGroupError } = await supabase
              .from("contact_groups")
              .update({ group_id: values.groupId })
              .eq("contact_id", contactId)
              .eq("user_id", user.id);
            if (updateGroupError) throw updateGroupError;
          } else {
            const { error: insertGroupError } = await supabase
              .from("contact_groups")
              .insert({
                user_id: user.id,
                contact_id: contactId,
                group_id: values.groupId,
              });
            if (insertGroupError) throw insertGroupError;
          }
        } else {
          await supabase
            .from("contact_groups")
            .delete()
            .eq("contact_id", contactId)
            .eq("user_id", user.id);
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

        showSuccess("مخاطب با موفقیت به‌روزرسانی شد!");
        navigate("/");
      } else {
        // Insert new contact
        const { data: contactData, error: contactError } = await supabase
          .from("contacts")
          .insert({
            user_id: user.id,
            first_name: values.firstName,
            last_name: values.lastName,
            gender: values.gender,
            position: values.position,
            company: values.company,
            address: values.address,
            notes: values.notes,
          })
          .select('id')
          .single();

        if (contactError) throw contactError;

        currentContactId = contactData.id;

        // Insert phone numbers
        if (values.phoneNumbers && values.phoneNumbers.length > 0) {
          const phonesToInsert = values.phoneNumbers.map(phone => ({
            user_id: user.id,
            contact_id: currentContactId,
            phone_type: phone.phone_type,
            phone_number: phone.phone_number,
            extension: phone.extension === '' ? null : phone.extension,
          }));
          const { error: phoneError } = await supabase
            .from("phone_numbers")
            .insert(phonesToInsert);
          if (phoneError) throw phoneError;
        }

        // Insert email addresses
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
          const customFieldsToInsert = values.customFields.map((field: CustomFieldFormData) => ({
            user_id: user.id,
            contact_id: currentContactId,
            template_id: field.template_id,
            field_value: field.value,
          }));
          const { error: customFieldsError } = await supabase
            .from("custom_fields")
            .insert(customFieldsToInsert);
          if (customFieldsError) throw customFieldsError;
        }

        showSuccess("مخاطب با موفقیت ذخیره شد!");
        form.reset();
      }
    } catch (error: any) {
      console.error("Error saving contact:", error);
      showError(`خطا در ذخیره مخاطب: ${error.message || "خطای ناشناخته"}`);
    } finally {
      dismissToast(toastId);
    }
  };

  return { onSubmit };
};