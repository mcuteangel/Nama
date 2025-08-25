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
import { ContactFormValues, contactFormSchema } from "../types/contact.ts"; // Import contactFormSchema
import { fetchWithCache } from "@/utils/cache-helpers";
import { Button } from "./ui/button.tsx"; // Import Button for retry
import { Textarea } from "./ui/textarea.tsx"; // Import Textarea
import { Sparkles } from "lucide-react"; // Import Sparkles icon
import { useContactExtractor } from "@/hooks/use-contact-extractor"; // Import the new hook
import { useTranslation } from "react-i18next"; // Import useTranslation

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
import { ErrorManager } from "@/lib/error-manager.ts"; // Import ErrorManager for error display
import LoadingMessage from "./LoadingMessage.tsx"; // Import LoadingMessage

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
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      gender: initialData?.gender || "not_specified",
      position: initialData?.position || "",
      company: initialData?.company || "",
      street: initialData?.street ?? null,
      city: initialData?.city ?? null,
      state: initialData?.state ?? null,
      zipCode: initialData?.zipCode ?? null,
      country: initialData?.country ?? null,
      notes: initialData?.notes ?? null,
      groupId: initialData?.groupId ?? null,
      birthday: initialData?.birthday ?? null,
      avatarUrl: initialData?.avatarUrl ?? null,
      preferredContactMethod: initialData?.preferredContactMethod ?? null,
      phoneNumbers: initialData?.phoneNumbers || [],
      emailAddresses: initialData?.emailAddresses || [],
      socialLinks: initialData?.socialLinks || [],
      customFields: initialData?.customFields || [],
    },
    context: { availableTemplates },
  });

  // Add this useEffect to reset the form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
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

  useEffect(() => {
    if (loadingTemplates) return;

    const newCustomFieldsFormState: { template_id: string; value: string }[] = [];
    const initialCustomFieldValuesMap = new Map<string, string>();

    initialData?.customFields?.forEach(cf => {
      initialCustomFieldValuesMap.set(cf.template_id, cf.value);
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