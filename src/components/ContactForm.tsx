import { CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "@/integrations/supabase/auth";
import { useContactFormLogic } from "@/hooks/use-contact-form-logic";
import { ContactService } from "@/services/contact-service";
import { CustomFieldTemplate } from "@/domain/schemas/custom-field-template";
import { ContactFormValues, contactFormSchema } from "../types/contact.ts";

// Import new modular components
import ContactBasicInfo from "./contact-form/ContactBasicInfo.tsx";
import ContactPhoneNumbers from "./contact-form/ContactPhoneNumbers.tsx";
import ContactEmailAddresses from "./contact-form/ContactEmailAddresses.tsx";
import ContactSocialLinks from "./contact-form/ContactSocialLinks.tsx";
import ContactOtherDetails from "./contact-form/ContactOtherDetails.tsx";
import ContactImportantDates from "./contact-form/ContactImportantDates.tsx";
import ContactCustomFields from "./contact-form/ContactCustomFields.tsx";
import ContactFormActions from "./contact-form/ContactFormActions.tsx";
import ContactAvatarUpload from "./ContactAvatarUpload.tsx"; // New import

interface ContactFormProps {
  initialData?: {
    id: string;
    first_name: string;
    last_name: string;
    gender: "male" | "female" | "not_specified";
    position?: string;
    company?: string;
    street?: string; // New: Detailed address field
    city?: string;    // New: Detailed address field
    state?: string;   // New: Detailed address field
    zip_code?: string; // New: Detailed address field
    country?: string; // New: Detailed address field
    notes?: string;
    phone_numbers?: { id?: string; phone_type: string; phone_number: string; extension?: string | null }[];
    email_addresses?: { id?: string; email_type: string; email_address: string }[];
    social_links?: { id?: string; type: string; url: string }[];
    groupId?: string;
    birthday?: string | null;
    avatar_url?: string | null; // New: Avatar URL
    preferred_contact_method?: 'email' | 'phone' | 'sms' | 'any' | null; // New: Preferred contact method
    custom_fields?: {
      id: string;
      template_id: string;
      field_value: string;
      custom_field_templates: Array<{
        name: string;
        type: string;
        options?: string[];
      }>;
    }[];
  };
  contactId?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ initialData, contactId }) => {
  const navigate = useNavigate();
  const { session } = useSession();
  const [availableTemplates, setAvailableTemplates] = useState<CustomFieldTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // Define formSchema inside the component using useMemo
  const formSchema = useMemo(() => {
    return contactFormSchema.superRefine((data, ctx) => {
      if (data.customFields) {
        data.customFields.forEach((field, index) => {
          const template = availableTemplates.find((t: CustomFieldTemplate) => t.id === field.template_id);
          if (template && template.required && !field.value.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `${template.name} الزامی است.`,
              path: [`customFields`, index, `value`],
            });
          }
        });
      }
    });
  }, [availableTemplates]); // Re-create schema only if availableTemplates changes

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: initialData?.first_name || "",
      lastName: initialData?.last_name || "",
      gender: initialData?.gender || "not_specified",
      position: initialData?.position || "",
      company: initialData?.company || "",
      street: initialData?.street || "", // New: Detailed address field
      city: initialData?.city || "",      // New: Detailed address field
      state: initialData?.state || "",    // New: Detailed address field
      zipCode: initialData?.zip_code || "", // New: Detailed address field
      country: initialData?.country || "", // New: Detailed address field
      notes: initialData?.notes || "",
      groupId: initialData?.groupId || "",
      birthday: initialData?.birthday || null,
      avatarUrl: initialData?.avatar_url || null, // New: Avatar URL
      preferredContactMethod: initialData?.preferred_contact_method || null, // New: Preferred contact method
      phoneNumbers: initialData?.phone_numbers || [],
      emailAddresses: initialData?.email_addresses || [],
      socialLinks: initialData?.social_links || [],
      customFields: initialData?.custom_fields?.map(cf => ({
        template_id: cf.template_id,
        value: cf.field_value,
      })) || [],
    },
    context: { availableTemplates }, // Pass availableTemplates to Zod context for superRefine
  });

  const { onSubmit } = useContactFormLogic(contactId, navigate, session, form, availableTemplates);

  const fetchTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    const { data, error } = await ContactService.getAllCustomFieldTemplates();
    if (error) {
      console.error("Error fetching custom field templates:", error);
      setAvailableTemplates([]);
    } else {
      setAvailableTemplates(data || []);
    }
    setLoadingTemplates(false);
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    if (initialData) {
      form.reset({
        firstName: initialData.first_name,
        lastName: initialData.last_name,
        gender: initialData.gender,
        position: initialData.position,
        company: initialData.company,
        street: initialData.street || "", // New: Detailed address field
        city: initialData.city || "",      // New: Detailed address field
        state: initialData.state || "",    // New: Detailed address field
        zipCode: initialData.zip_code || "", // New: Detailed address field
        country: initialData.country || "", // New: Detailed address field
        notes: initialData.notes,
        groupId: initialData.groupId || "",
        birthday: initialData.birthday || null,
        avatarUrl: initialData.avatar_url || null, // New: Avatar URL
        preferredContactMethod: initialData.preferred_contact_method || null, // New: Preferred contact method
        phoneNumbers: initialData.phone_numbers || [],
        emailAddresses: initialData.email_addresses || [],
        socialLinks: initialData.social_links || [],
        customFields: initialData.custom_fields?.map(cf => ({
          template_id: cf.template_id,
          value: cf.field_value,
        })) || [],
      });
    }
  }, [initialData, form]);

  useEffect(() => {
    if (loadingTemplates) return;

    const newCustomFieldsFormState: { template_id: string; value: string }[] = [];
    const initialCustomFieldValuesMap = new Map<string, string>();

    initialData?.custom_fields?.forEach(cf => {
      initialCustomFieldValuesMap.set(cf.template_id, cf.field_value);
    });

    availableTemplates.forEach(template => {
      const existingValue = initialCustomFieldValuesMap.get(template.id!);
      newCustomFieldsFormState.push({
        template_id: template.id!,
        value: existingValue !== undefined ? existingValue : "",
      });
    });

    newCustomFieldsFormState.sort((a, b) => {
      const templateA = availableTemplates.find(t => t.id === a.template_id)?.name || '';
      const templateB = availableTemplates.find(t => t.id === b.template_id)?.name || '';
      return templateA.localeCompare(templateB);
    });

    const currentFormValues = form.getValues("customFields");
    const isDifferent = currentFormValues.length !== newCustomFieldsFormState.length ||
                        currentFormValues.some((field, index) =>
                          field.template_id !== newCustomFieldsFormState[index].template_id ||
                          field.value !== newCustomFieldsFormState[index].value
                        );

    if (isDifferent) {
      form.setValue("customFields", newCustomFieldsFormState, { shouldValidate: true, shouldDirty: true });
    }

  }, [availableTemplates, initialData, loadingTemplates, form]);

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <CardContent className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <ContactAvatarUpload
            initialAvatarUrl={form.watch('avatarUrl')}
            onAvatarChange={(url) => form.setValue('avatarUrl', url)}
            disabled={form.formState.isSubmitting}
          />
          <ContactBasicInfo />
          <ContactPhoneNumbers />
          <ContactEmailAddresses />
          <ContactSocialLinks />
          <ContactImportantDates />
          <ContactOtherDetails />
          <ContactCustomFields
            availableTemplates={availableTemplates}
            loadingTemplates={loadingTemplates}
            fetchTemplates={fetchTemplates}
          />
          <ContactFormActions
            isSubmitting={form.formState.isSubmitting}
            onCancel={handleCancel}
            contactId={contactId}
          />
        </form>
      </Form>
    </CardContent>
  );
};

export default ContactForm;