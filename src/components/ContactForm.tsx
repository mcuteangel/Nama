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
import { GlassButton } from "./ui/glass-button";
import { ModernProgress } from "./ui/modern-progress.tsx";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { useTranslation } from "react-i18next";
import { useAccessibility } from './accessibilityHooks';
import { useAnnouncement } from './accessibilityHooks';
import KeyboardNavigationHandler from './KeyboardNavigationHandler';

// Import new modular components with lazy loading
import { lazy, Suspense } from "react";
import ContactFormActions from "./contact-form/ContactFormActions.tsx";
import ContactAvatarUpload from "./ContactAvatarUpload.tsx";
import { AlertCircle, Users } from 'lucide-react';

// Lazy load form sections to improve initial loading performance
const ContactBasicInfo = lazy(() => import("./contact-form/ContactBasicInfo.tsx"));
const ContactPhoneNumbers = lazy(() => import("./contact-form/ContactPhoneNumbers.tsx"));
const ContactEmailAddresses = lazy(() => import("./contact-form/ContactEmailAddresses.tsx"));
const ContactSocialLinks = lazy(() => import("./contact-form/ContactSocialLinks.tsx"));
const ContactImportantDates = lazy(() => import("./contact-form/ContactImportantDates.tsx"));
const ContactOtherDetails = lazy(() => import("./contact-form/ContactOtherDetails.tsx"));
const ContactCustomFields = lazy(() => import("./contact-form/ContactCustomFields.tsx"));

// Loading component for lazy-loaded sections
const SectionLoader = () => (
  <div className="flex justify-center items-center p-4">
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
  </div>
);

interface ContactFormProps {
  initialData?: ContactFormValues;
  contactId?: string;
}

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
      form.reset(initialData);
      lastInitialDataRef.current = initialData;
    } else if (!initialData && lastInitialDataRef.current) {
      // If initialData becomes undefined (e.g., navigating from edit to add), reset to default
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

  // Optimize template fetching with useCallback
  const fetchTemplates = useCallback(async () => {
    if (!session?.user) return;
    
    setLoadingTemplates(true);
    const cacheKey = `custom_field_templates_${session.user.id}`;
    
    try {
      const { data, error } = await fetchWithCache<CustomFieldTemplate[]>(
        cacheKey,
        async () => {
          const result = await CustomFieldTemplateService.getAllCustomFieldTemplates();
          return { data: result.data, error: result.error };
        }
      );
      
      if (error) {
        console.error("Error fetching custom field templates:", error);
        setAvailableTemplates([]);
      } else {
        setAvailableTemplates(data || []);
      }
    } catch (err) {
      console.error("Error in fetchTemplates:", err);
      setAvailableTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  }, [session]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Ref to store the JSON string of the last customFields value that was successfully set to the form by this effect
  const lastSetCustomFieldsRef = useRef<string>(''); 

  useEffect(() => {
    if (loadingTemplates || !session?.user) {
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

    // 3. Compare desired state with the current form state AND with what was last set by this effect
    // Only update if the desired state is different from the current form state
    // AND if the desired state is different from what this effect last set (to prevent redundant setValue calls if form state is already correct)
    if (desiredJson !== currentFormJson) {
      form.setValue("customFields", sortedDesired, { shouldValidate: true, shouldDirty: true });
      lastSetCustomFieldsRef.current = desiredJson; // Update ref to reflect what was just set
    } else if (desiredJson !== lastSetCustomFieldsRef.current) {
      // This case handles when the form's state *already matches* the desired state,
      // but our ref hasn't been updated yet (e.g., if initialData directly set it).
      // We still update the ref to prevent future redundant checks.
      lastSetCustomFieldsRef.current = desiredJson;
    }

  }, [availableTemplates, initialData, loadingTemplates, form, session?.user]); // Dependencies

  const handleCancel = useCallback(() => {
    announce(t('accessibility.form_cancelled', 'Form cancelled'), 'polite');
    navigate(-1);
  }, [navigate, announce, t]);

  // Memoize form sections to prevent unnecessary re-renders
  const formSections = useMemo(() => [
    {
      id: 'avatar',
      title: t('accessibility.avatar_section', 'Avatar Section'),
      component: (
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
      )
    },
    {
      id: 'basic-info',
      title: t('accessibility.basic_info_section', 'Basic Information Section'),
      component: (
        <Suspense fallback={<SectionLoader />}>
          <ContactBasicInfo />
        </Suspense>
      )
    },
    {
      id: 'phone',
      title: t('accessibility.phone_section', 'Phone Numbers Section'),
      component: (
        <Suspense fallback={<SectionLoader />}>
          <ContactPhoneNumbers />
        </Suspense>
      )
    },
    {
      id: 'email',
      title: t('accessibility.email_section', 'Email Addresses Section'),
      component: (
        <Suspense fallback={<SectionLoader />}>
          <ContactEmailAddresses />
        </Suspense>
      )
    },
    {
      id: 'social',
      title: t('accessibility.social_section', 'Social Links Section'),
      component: (
        <Suspense fallback={<SectionLoader />}>
          <ContactSocialLinks />
        </Suspense>
      )
    },
    {
      id: 'dates',
      title: t('accessibility.dates_section', 'Important Dates Section'),
      component: (
        <Suspense fallback={<SectionLoader />}>
          <ContactImportantDates />
        </Suspense>
      )
    },
    {
      id: 'other-details',
      title: t('accessibility.other_details_section', 'Other Details Section'),
      component: (
        <Suspense fallback={<SectionLoader />}>
          <ContactOtherDetails />
        </Suspense>
      )
    },
    {
      id: 'custom-fields',
      title: t('accessibility.custom_fields_section', 'Custom Fields Section'),
      component: (
        <Suspense fallback={<SectionLoader />}>
          <ContactCustomFields
            availableTemplates={availableTemplates}
            loadingTemplates={loadingTemplates}
            fetchTemplates={fetchTemplates}
          />
        </Suspense>
      )
    },
    {
      id: 'actions',
      title: t('accessibility.form_actions_section', 'Form Actions Section'),
      component: (
        <ContactFormActions
          isSubmitting={isSubmitting}
          onCancel={handleCancel}
          contactId={contactId}
        />
      )
    }
  ], [
    t, form, isSubmitting, announce, availableTemplates, loadingTemplates, 
    fetchTemplates, handleCancel, contactId
  ]);

  return (
    <KeyboardNavigationHandler scope="forms">
      <ModernCard
        variant="glass"
        className={`
          w-full rounded-3xl shadow-2xl overflow-hidden
          border-2 border-white/40 dark:border-gray-600/40
          backdrop-blur-xl
          bg-gradient-to-br from-white/60 via-white/40 to-white/30
          dark:from-gray-800/60 dark:via-gray-800/40 dark:to-gray-800/30
          transition-all duration-500 ease-out
          hover:shadow-3xl hover:shadow-purple-500/20 dark:hover:shadow-purple-900/30
          hover:border-purple-300/50 dark:hover:border-purple-600/50
          ${error ? 'ring-4 ring-red-400/50' : ''}
          ${isSubmitting ? 'ring-4 ring-blue-400/50 animate-pulse' : ''}
        `}
      >
        {/* Enhanced Header */}
        <ModernCardHeader className="pb-6 border-b border-white/30 dark:border-gray-700/50 relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className={`
              w-12 h-12 rounded-2xl flex items-center justify-center
              bg-gradient-to-br from-purple-500 to-blue-600
              shadow-lg transform transition-all duration-300 hover:scale-110
            `}>
              <Users size={24} className="text-white" />
            </div>
            <ModernCardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {contactId
                ? t('contact_form.edit_title', 'ویرایش مخاطب')
                : t('contact_form.add_title', 'افزودن مخاطب')
              }
            </ModernCardTitle>
          </div>

          {/* Enhanced Error Display */}
          {error && (
            <div className="flex items-center justify-center gap-2 text-red-500 dark:text-red-400 mb-4 animate-bounce">
              <AlertCircle size={20} />
              <span className="font-medium">{errorMessage}</span>
              {retryCount > 0 && (
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={retrySave}
                  disabled={isSubmitting}
                  className="text-red-500 hover:bg-red-100/30 dark:hover:bg-red-900/20 px-3 py-1 rounded-lg text-sm ml-2"
                  aria-describedby="form-error-message"
                  aria-label={t('accessibility.retry_save', 'تلاش مجدد برای ذخیره فرم')}
                >
                  {t('common.retry')} ({retryCount} {t('common.of')} ۳)
                </GlassButton>
              )}
            </div>
          )}

          {/* Enhanced Progress Indicator */}
          {isSubmitting && (
            <div className="space-y-3 mb-4">
              <ModernProgress value={75} className="w-full" variant="gradient" />
              <p className="text-sm text-blue-600 dark:text-blue-400 text-center animate-pulse font-medium">
                {contactId
                  ? t('accessibility.updating_contact', 'در حال به‌روزرسانی مخاطب...')
                  : t('accessibility.creating_contact', 'در حال ایجاد مخاطب...')
                }
              </p>
            </div>
          )}
        </ModernCardHeader>

        <ModernCardContent className="p-8 space-y-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
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
              
              <fieldset disabled={isSubmitting} className="space-y-8">
                <legend className="sr-only">
                  {t('accessibility.contact_information', 'Contact Information')}
                </legend>
                
                {/* Render sections without individual borders, use subtle dividers */}
                {formSections.slice(0, -1).map((section, index) => (
                  <div key={section.id} role="group" aria-labelledby={`${section.id}-section-title`}>
                    <h3 id={`${section.id}-section-title`} className="sr-only">
                      {section.title}
                    </h3>
                    {section.component}
                    {index < formSections.length - 2 && (
                      <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/20 dark:via-gray-700/50 to-transparent"></div>
                    )}
                  </div>
                ))}
                
                {/* Actions as last section without divider */}
                <div role="group" aria-labelledby="actions-section-title">
                  <h3 id="actions-section-title" className="sr-only">
                    {formSections[formSections.length - 1].title}
                  </h3>
                  {formSections[formSections.length - 1].component}
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