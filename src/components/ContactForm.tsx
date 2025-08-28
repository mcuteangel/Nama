import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSession } from "@/integrations/supabase/auth";
import { useContactFormLogic } from "@/hooks/use-contact-form-logic";
import { CustomFieldTemplateService } from "@/services/custom-field-template-service";
import { CustomFieldTemplate } from "@/domain/schemas/custom-field-template";
import { ContactFormValues, contactFormSchema, CustomFieldFormData } from "../types/contact.ts";
import { fetchWithCache } from "@/utils/cache-helpers";
import { ModernButton } from "./ui/modern-button.tsx";
import { ModernProgress } from "./ui/modern-progress.tsx";
import { ModernCard, ModernCardContent } from "@/components/ui/modern-card";
import { useTranslation } from "react-i18next";
import { useAccessibility } from './accessibilityHooks';
import { useAnnouncement } from './accessibilityHooks';
import KeyboardNavigationHandler from './KeyboardNavigationHandler';

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

/**
 * Props for the ContactForm component
 * @interface ContactFormProps
 */
interface ContactFormProps {
  /** Initial form data for editing existing contacts */
  initialData?: ContactFormValues;
  /** ID of the contact being edited (undefined for new contacts) */
  contactId?: string;
}

/**
 * ContactForm component for creating and editing contacts
 * 
 * This component provides a comprehensive form for managing contact information including:
 * - Basic information (name, gender, position, company)
 * - Contact details (phone numbers, email addresses, social links)
 * - Address information
 * - Custom fields based on templates
 * - Important dates and notes
 * 
 * Features:
 * - Form validation using React Hook Form and Zod
 * - Accessibility support with ARIA labels and announcements
 * - Performance optimization with React.memo
 * - Keyboard navigation support
 * - Error handling and retry functionality
 * 
 * @param props - The component props
 * @param props.initialData - Initial form data for editing existing contacts
 * @param props.contactId - ID of the contact being edited (undefined for new contacts)
 * @returns JSX element representing the contact form
 */
const ContactForm: React.FC<ContactFormProps> = React.memo(({ initialData, contactId }) => {
  const navigate = useNavigate();
  const { session } = useSession();
  const [availableTemplates, setAvailableTemplates] = useState<CustomFieldTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const { t } = useTranslation();
  const { getAriaLabel, setAriaLabel } = useAccessibility();
  const announce = useAnnouncement();
  
  // Set up ARIA labels for form
  useEffect(() => {
    const formTitle = contactId 
      ? t('accessibility.edit_contact_form', 'Edit Contact Form')
      : t('accessibility.add_contact_form', 'Add Contact Form');
    
    setAriaLabel('contact-form', formTitle);
    setAriaLabel('contact-form-description', 
      contactId 
        ? t('accessibility.edit_contact_description', 'Edit contact information and details')
        : t('accessibility.add_contact_description', 'Add new contact information and details')
    );
  }, [contactId, t, setAriaLabel]);

  const formSchema = useMemo(() => {
    return contactFormSchema.superRefine((data, ctx) => {
      if (data.customFields) {
        data.customFields.forEach((field, index) => {
          const template = availableTemplates.find((t: CustomFieldTemplate) => t.id === field.template_id);
          if (template && template.required && (!field.value || field.value.trim() === '')) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t('errors.field_required', { field: template.name }),
              path: [`customFields`, index, `value`],
            });
          }
        });
      }
    });
  }, [availableTemplates, t]);

  const defaultValues = useMemo(() => ({
    firstName: "",
    lastName: "",
    gender: "not_specified" as const,
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
  }), []);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    // Initialize with memoized defaults, initialData will be handled by useEffect
    defaultValues,
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
      form.reset(defaultValues);
      lastInitialDataRef.current = undefined;
    }
  }, [initialData, form, defaultValues]);

  const { onSubmit, isSubmitting, error, errorMessage, retrySave, retryCount } = useContactFormLogic(contactId, navigate, session, form, availableTemplates);

  // Announce form state changes
  useEffect(() => {
    if (isSubmitting) {
      announce(contactId 
        ? t('accessibility.updating_contact', 'Updating contact...')
        : t('accessibility.creating_contact', 'Creating contact...'), 'polite'
      );
    }
  }, [isSubmitting, contactId, announce, t]);

  useEffect(() => {
    if (error && errorMessage) {
      announce(t('accessibility.form_error', 'Form error: {{message}}', { message: errorMessage }), 'assertive');
    }
  }, [error, errorMessage, announce, t]);

  const fetchTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    const cacheKey = `custom_field_templates_${session?.user?.id}`;
    const { data, error } = await fetchWithCache<CustomFieldTemplate[]>(
      cacheKey,
      async () => {
        const result = await CustomFieldTemplateService.getAllCustomFieldTemplates(); // Updated service call
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

  }, [availableTemplates, initialData, loadingTemplates, form, session?.user]); // Dependencies

  const handleCancel = useCallback(() => {
    announce(t('accessibility.form_cancelled', 'Form cancelled'), 'polite');
    navigate(-1);
  }, [navigate, announce, t]);

  return (
    <KeyboardNavigationHandler scope="forms">
      <ModernCard variant="glass" className="rounded-xl p-6">
        <ModernCardContent className="space-y-4">
          {error && (
            <div 
              role="alert"
              aria-live="assertive"
              className="text-sm text-destructive flex items-center justify-center gap-2 mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <span id="form-error-message">{errorMessage}</span>
              {retryCount > 0 && (
                <ModernButton
                  variant="ghost"
                  size="sm"
                  onClick={retrySave}
                  disabled={isSubmitting}
                  className="text-destructive hover:bg-destructive/10"
                  aria-describedby="form-error-message"
                  aria-label={t('accessibility.retry_save', 'Retry saving form')}
                >
                  {t('common.retry')} ({retryCount} {t('common.of')} ۳)
                </ModernButton>
              )}
            </div>
          )}
          
          {/* Progress indicator for form submission */}
          {isSubmitting && (
            <div className="space-y-2">
              <ModernProgress value={75} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                {contactId 
                  ? t('accessibility.updating_contact', 'در حال به‌روزرسانی مخاطب...') 
                  : t('accessibility.creating_contact', 'در حال ایجاد مخاطب...')
                }
              </p>
            </div>
          )}
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(onSubmit)} 
              className="space-y-4"
              role="form"
              aria-labelledby="contact-form-title"
              aria-describedby="contact-form-description"
              noValidate
            >
              {/* Hidden form title and description for screen readers */}
              <div className="sr-only">
                <h2 id="contact-form-title">
                  {getAriaLabel('contact-form', contactId ? 'Edit Contact' : 'Add Contact')}
                </h2>
                <p id="contact-form-description">
                  {getAriaLabel('contact-form-description', 'Fill out the form to manage contact information')}
                </p>
              </div>
              
              {/* Form progress indicator for screen readers */}
              <div 
                className="sr-only" 
                aria-live="polite" 
                aria-atomic="true"
              >
                {isSubmitting && (
                  <span>
                    {contactId 
                      ? t('accessibility.updating_contact', 'Updating contact...')
                      : t('accessibility.creating_contact', 'Creating contact...')
                    }
                  </span>
                )}
              </div>
              
              <fieldset disabled={isSubmitting} className="space-y-4">
                <legend className="sr-only">
                  {t('accessibility.contact_information', 'Contact Information')}
                </legend>
                
                <div role="group" aria-labelledby="avatar-section-title">
                  <h3 id="avatar-section-title" className="sr-only">
                    {t('accessibility.avatar_section', 'Avatar Section')}
                  </h3>
                  <ContactAvatarUpload
                    initialAvatarUrl={form.watch('avatarUrl')}
                    onAvatarChange={(url) => {
                      form.setValue('avatarUrl', url);
                      announce(url 
                        ? t('accessibility.avatar_updated', 'Avatar updated')
                        : t('accessibility.avatar_removed', 'Avatar removed'), 'polite'
                      );
                    }}
                    disabled={isSubmitting}
                  />
                </div>
                
                <div role="group" aria-labelledby="basic-info-section-title">
                  <h3 id="basic-info-section-title" className="sr-only">
                    {t('accessibility.basic_info_section', 'Basic Information Section')}
                  </h3>
                  <ContactBasicInfo />
                </div>
                
                <div role="group" aria-labelledby="phone-section-title">
                  <h3 id="phone-section-title" className="sr-only">
                    {t('accessibility.phone_section', 'Phone Numbers Section')}
                  </h3>
                  <ContactPhoneNumbers />
                </div>
                
                <div role="group" aria-labelledby="email-section-title">
                  <h3 id="email-section-title" className="sr-only">
                    {t('accessibility.email_section', 'Email Addresses Section')}
                  </h3>
                  <ContactEmailAddresses />
                </div>
                
                <div role="group" aria-labelledby="social-section-title">
                  <h3 id="social-section-title" className="sr-only">
                    {t('accessibility.social_section', 'Social Links Section')}
                  </h3>
                  <ContactSocialLinks />
                </div>
                
                <div role="group" aria-labelledby="dates-section-title">
                  <h3 id="dates-section-title" className="sr-only">
                    {t('accessibility.dates_section', 'Important Dates Section')}
                  </h3>
                  <ContactImportantDates />
                </div>
                
                <div role="group" aria-labelledby="other-details-section-title">
                  <h3 id="other-details-section-title" className="sr-only">
                    {t('accessibility.other_details_section', 'Other Details Section')}
                  </h3>
                  <ContactOtherDetails />
                </div>
                
                <div role="group" aria-labelledby="custom-fields-section-title">
                  <h3 id="custom-fields-section-title" className="sr-only">
                    {t('accessibility.custom_fields_section', 'Custom Fields Section')}
                  </h3>
                  <ContactCustomFields
                    availableTemplates={availableTemplates}
                    loadingTemplates={loadingTemplates}
                    fetchTemplates={fetchTemplates}
                  />
                </div>
                
                <div role="group" aria-labelledby="form-actions-section-title">
                  <h3 id="form-actions-section-title" className="sr-only">
                    {t('accessibility.form_actions_section', 'Form Actions Section')}
                  </h3>
                  <ContactFormActions
                    isSubmitting={isSubmitting}
                    onCancel={handleCancel}
                    contactId={contactId}
                  />
                </div>
              </fieldset>
            </form>
          </Form>
        </ModernCardContent>
      </ModernCard>
    </KeyboardNavigationHandler>
  );
});

ContactForm.displayName = 'ContactForm';

export default ContactForm;