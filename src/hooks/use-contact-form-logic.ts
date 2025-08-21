import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { UseFormReturn } from "react-hook-form";
import { Session } from "@supabase/supabase-js";
import { NavigateFunction } from "react-router-dom";
import * as z from "zod";

// Define CustomField interface
interface CustomField {
  id?: string; // Optional for new fields
  field_name: string;
  field_value: string;
}

const formSchema = z.object({
  firstName: z.string().min(1, { message: "نام الزامی است." }),
  lastName: z.string().min(1, { message: "نام خانوادگی الزامی است." }),
  phoneNumber: z.string().regex(/^09\d{9}$/, { message: "شماره تلفن معتبر نیست (مثال: 09123456789)." }).optional().or(z.literal('')),
  emailAddress: z.string().email({ message: "آدرس ایمیل معتبر نیست." }).optional().or(z.literal('')),
  gender: z.enum(["male", "female", "not_specified"], { message: "جنسیت معتبر نیست." }).default("not_specified"),
  position: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  groupId: z.string().optional(),
  customFields: z.array(z.object({
    id: z.string().optional(), // For existing custom fields
    field_name: z.string().min(1, { message: "نام فیلد سفارشی نمی‌تواند خالی باشد." }),
    field_value: z.string().min(1, { message: "مقدار فیلد سفارشی نمی‌تواند خالی باشد." }),
  })).optional(),
});

type ContactFormValues = z.infer<typeof formSchema>;

export const useContactFormLogic = (
  contactId: string | undefined,
  navigate: NavigateFunction,
  session: Session | null,
  form: UseFormReturn<ContactFormValues>
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

        // Handle phone number update/insert/delete
        if (values.phoneNumber) {
          const { data: existingPhone, error: fetchPhoneError } = await supabase
            .from("phone_numbers")
            .select("id")
            .eq("contact_id", contactId)
            .eq("user_id", user.id)
            .single();

          if (fetchPhoneError && fetchPhoneError.code !== 'PGRST116') { // PGRST116 means no rows found
            throw fetchPhoneError;
          }

          if (existingPhone) {
            const { error: updatePhoneError } = await supabase
              .from("phone_numbers")
              .update({ phone_number: values.phoneNumber })
              .eq("id", existingPhone.id);
            if (updatePhoneError) throw updatePhoneError;
          } else {
            const { error: insertPhoneError } = await supabase
              .from("phone_numbers")
              .insert({
                user_id: user.id,
                contact_id: contactId,
                phone_type: "mobile",
                phone_number: values.phoneNumber,
              });
            if (insertPhoneError) throw insertPhoneError;
          }
        } else {
          await supabase
            .from("phone_numbers")
            .delete()
            .eq("contact_id", contactId)
            .eq("user_id", user.id);
        }

        // Handle email address update/insert/delete
        if (values.emailAddress) {
          const { data: existingEmail, error: fetchEmailError } = await supabase
            .from("email_addresses")
            .select("id")
            .eq("contact_id", contactId)
            .eq("user_id", user.id)
            .single();

          if (fetchEmailError && fetchEmailError.code !== 'PGRST116') {
            throw fetchEmailError;
          }

          if (existingEmail) {
            const { error: updateEmailError } = await supabase
              .from("email_addresses")
              .update({ email_address: values.emailAddress })
              .eq("id", existingEmail.id);
            if (updateEmailError) throw updateEmailError;
          } else {
            const { error: insertEmailError } = await supabase
              .from("email_addresses")
              .insert({
                user_id: user.id,
                contact_id: contactId,
                email_type: "personal",
                email_address: values.emailAddress,
              });
            if (insertEmailError) throw insertEmailError;
          }
        } else {
          await supabase
            .from("email_addresses")
            .delete()
            .eq("contact_id", contactId)
            .eq("user_id", user.id);
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
          .select("id, field_name, field_value")
          .eq("contact_id", contactId)
          .eq("user_id", user.id)).data || [];

        const newCustomFields = values.customFields || [];

        // Fields to delete
        const fieldsToDelete = existingCustomFields.filter(
          (existingField) => !newCustomFields.some((newField) => newField.id === existingField.id)
        );
        if (fieldsToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from("custom_fields")
            .delete()
            .in("id", fieldsToDelete.map((f) => f.id));
          if (deleteError) throw deleteError;
        }

        // Fields to update and insert
        for (const field of newCustomFields) {
          if (field.id) {
            // Update existing field
            const { error: updateError } = await supabase
              .from("custom_fields")
              .update({ field_name: field.field_name, field_value: field.field_value })
              .eq("id", field.id)
              .eq("user_id", user.id);
            if (updateError) throw updateError;
          } else {
            // Insert new field
            const { error: insertError } = await supabase
              .from("custom_fields")
              .insert({
                user_id: user.id,
                contact_id: contactId,
                field_name: field.field_name,
                field_value: field.field_value,
              });
            if (insertError) throw insertError;
          }
        }

        showSuccess("مخاطب با موفقیت به‌روزرسانی شد!");
        navigate("/"); // Redirect to contacts list after successful update
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
          .select()
          .single();

        if (contactError) throw contactError;

        currentContactId = contactData.id;

        if (values.phoneNumber) {
          const { error: phoneError } = await supabase
            .from("phone_numbers")
            .insert({
              user_id: user.id,
              contact_id: currentContactId,
              phone_type: "mobile",
              phone_number: values.phoneNumber,
            });
          if (phoneError) throw phoneError;
        }

        if (values.emailAddress) {
          const { error: emailError } = await supabase
            .from("email_addresses")
            .insert({
              user_id: user.id,
              contact_id: currentContactId,
              email_type: "personal",
              email_address: values.emailAddress,
            });
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

        // Insert custom fields for new contact
        if (values.customFields && values.customFields.length > 0) {
          const customFieldsToInsert = values.customFields.map(field => ({
            user_id: user.id,
            contact_id: currentContactId,
            field_name: field.field_name,
            field_value: field.field_value,
          }));
          const { error: customFieldsError } = await supabase
            .from("custom_fields")
            .insert(customFieldsToInsert);
          if (customFieldsError) throw customFieldsError;
        }

        showSuccess("مخاطب با موفقیت ذخیره شد!");
        form.reset(); // Reset form after successful submission for new contact
        // Stay on the form for adding more contacts
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