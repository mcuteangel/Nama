import { CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react"; // Import useRef
import { useSession } from "@/integrations/supabase/auth";
import { useContactFormLogic } from "@/hooks/use-contact-form-logic";
import { ContactService } from "@/services/contact-service";
import { CustomFieldTemplate } from "@/domain/schemas/custom-field-template";
import { ContactFormValues, contactFormSchema, CustomFieldFormData } from "../types/contact.ts";
import { fetchWithCache } from "@/utils/cache-helpers";
import { Button } from "./ui/button.tsx";
import { Textarea } from "./ui/textarea.tsx";
import { Sparkles } from "lucide-react";
import { useContactExtractor } from "@/hooks/use-contact-extractor";
import { useTranslation } from "react-i18next";

// Import new modular components
import ContactBasicInfo from "./contact-form/ContactBasicInfo.tsx";
import ContactPhoneNumbers from "./contact-form/ContactPhoneNumbers.tsx";
import ContactEmailAddresses from "./contact-form/ContactEmailAddresses.tsx";
import ContactSocialLinks from "./contact-form/ContactSocialLinks.tsx";
import ContactOtherDetails from "./contact-form/ContactOtherDetails.tsx";
import ContactImportantDates from "./contact-form/ContactImportantDates.tsx";
import ContactCustomFields from "./contact-form/ContactCustomFields.tsx";
import ContactFormActions from "./contact-form/ContactFormActions.tsx";
import ContactAvatarUpload from "./ContactAvatarUpload.tsx";
import { ErrorManager } from "@/lib/error-manager.ts";
import LoadingMessage from "./LoadingMessage.tsx";

interface ContactFormProps {
  initialData?: ContactFormValues;
  contactId?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ initialData, contactId }) => {
  const navigate = useNavigate();
  const { session } = useSession();
  const [availableTemplates, setAvailableTemplates] = useState<CustomFieldTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const { t } = useTranslation();

  const formSchema = useMemo(() => {
    return contactFormSchema.superRefine((data, ctx) => {
      if (data.customFields) {
        data.customFields.forEach((field, index) => {
          const template = availableTemplates.find((t: CustomFieldTemplate) => t.id === field.template_id);
          if (template && template.required && (!field.value || field.value.trim() === '')) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `${template.name} الزامی است.`,
              path: [`customFields`, index, `value`],
            });
          }
        });
      }
    });
  }, [availableTemplates]);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    // Initialize with empty defaults, initialData will be handled by useEffect
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: "not_specified",
      position: "",
      company: "",
      street: null,
      city: null,
      state: null,
      zipCode: null,
      country: null,
      notes: null,
      groupId: null,
      birthday: null,
      avatarUrl: null,
      preferredContactMethod: null,
      phoneNumbers: [],
      emailAddresses: [],
      socialLinks: [],
      customFields: [],
    },
    context: { availableTemplates },
  });

  const lastInitialDataRef = useRef<ContactFormValues | undefined>(undefined);

  // Add this useEffect to reset the form when initialData changes, but only if content is different
  useEffect(() => {
    if (initialData && JSON.stringify(initialData) !== JSON.stringify(lastInitialDataRef.current)) {
      console.log("ContactForm: initialData changed, resetting form.");
      form.reset(initialData);
      lastInitialDataRef.current = initialData;
    } else if (!initialData && lastInitialDataRef.current) {
      // If initialData becomes undefined (e.g., navigating from edit to add), reset to default
      console.log("ContactForm: initialData became undefined, resetting form to defaults.");
      form.reset({
        firstName: "", lastName: "", gender: "not_specified", position: "", company: "",
        street: null, city: null, state: null, zipCode: null, country: null, notes: null,
        groupId: null, birthday: null, avatarUrl: null, preferredContactMethod: null,
        phoneNumbers: [], emailAddresses: [], socialLinks: [], customFields: [],
      });
      lastInitialDataRef.current = undefined;
    }
  }, [initialData, form]);

  const { onSubmit, isSubmitting, error, errorMessage, retrySave, retryCount } = useContactFormLogic(contactId, navigate, session, form, availableTemplates);

  const fetchTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    const cacheKey = `custom_field_templates_${session?.user?.id}`;
    const { data, error } = await fetchWithCache<CustomFieldTemplate[]>(
      cacheKey,
      async () => {
        const result = await ContactService.getAllCustomFieldTemplates();
        return { data: result.data, error: result.error };
      }
    );
    if (error) {
      console.error("Error fetching custom field templates:", error);
      setAvailableTemplates([]);
    } else {
      setAvailableTemplates(data || []);
    }
    setLoadingTemplates(false);
  }, [session]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Ref to store the JSON string of the last customFields value that was successfully set to the form by this effect
  const lastSetCustomFieldsRef = useRef<string>(''); 

  useEffect(() => {
    console.log("ContactForm: Custom fields useEffect triggered.");
    if (loadingTemplates || !session?.user) {
      console.log("ContactForm: Custom fields useEffect skipped due to loadingTemplates or no session user.");
      return;
    }

    // 1. Calculate the desired state for customFields based on templates and initialData
    const desiredCustomFields: CustomFieldFormData[] = availableTemplates.map(template => {
      const initialValue = initialData?.customFields?.find(cf => cf.template_id === template.id)?.value;
      return {
        template_id: template.id!,
        value: initialValue !== undefined ? initialValue : "",
      };
    });

    // Sort for stable comparison
    const sortFn = (a: CustomFieldFormData, b: CustomFieldFormData) => {
      if (a.template_id < b.template_id) return -1;
      if (a.template_id > b.template_id) return 1;
      if (a.value < b.value) return -1;
      if (a.value > b.value) return 1;
      return 0;
    };

    const sortedDesired = [...desiredCustomFields].sort(sortFn);
    const desiredJson = JSON.stringify(sortedDesired);

    // 2. Get the current state of customFields from the form
    const currentFormCustomFields = form.getValues("customFields") || [];
    const sortedCurrentFormCustomFields = [...currentFormCustomFields].sort(sortFn);
    const currentFormJson = JSON.stringify(sortedCurrentFormCustomFields);

    console.log("ContactForm: Desired custom fields JSON:", desiredJson);
    console.log("ContactForm: Current form custom fields JSON:", currentFormJson);
    console.log("ContactForm: Last set custom fields JSON (ref):", lastSetCustomFieldsRef.current);

    // 3. Compare desired state with the current form state AND with what was last set by this effect
    // Only update if the desired state is different from the current form state
    // AND if the desired state is different from what this effect last set (to prevent redundant setValue calls if form state is already correct)
    if (desiredJson !== currentFormJson) {
      console.log("ContactForm: Current form custom fields are different from desired. Updating form values.");
      form.setValue("customFields", sortedDesired, { shouldValidate: true, shouldDirty: true });
      lastSetCustomFieldsRef.current = desiredJson; // Update ref to reflect what was just set
    } else if (desiredJson !== lastSetCustomFieldsRef.current) {
      // This case handles when the form's state *already matches* the desired state,
      // but our ref hasn't been updated yet (e.g., if initialData directly set it).
      // We still update the ref to prevent future redundant checks.
      console.log("ContactForm: Current form custom fields already match desired. Updating ref only.");
      lastSetCustomFieldsRef.current = desiredJson;
    } else {
      console.log("ContactForm: Custom fields are the same as last set, no update needed.");
    }

  }, [availableTemplates, initialData, loadingTemplates, form, session?.user?.id]); // Dependencies

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <CardContent className="space-y-4">
      {error && (
        <div className="text-sm text-destructive flex items-center justify-center gap-2 mt-2">
          <span>{errorMessage}</span>
          {retryCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={retrySave}
              disabled={isSubmitting}
              className="text-destructive hover:bg-destructive/10"
            >
              {t('common.retry')} ({retryCount} {t('common.of')} ۳)
            </Button>
          )}
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <ContactAvatarUpload
            initialAvatarUrl={form.watch('avatarUrl')}
            onAvatarChange={(url) => form.setValue('avatarUrl', url)}
            disabled={isSubmitting}
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
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
            contactId={contactId}
          />
        </form>
      </Form>
    </CardContent>
  );
};

export default ContactForm;