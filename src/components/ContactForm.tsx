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
import { ModernCard, ModernCardContent } from "@/components/ui/modern-card";
import { useTranslation } from "react-i18next";
import { useAccessibility } from './accessibilityHooks';
import { useAnnouncement } from './accessibilityHooks';
import KeyboardNavigationHandler from './KeyboardNavigationHandler';
import { CollapsibleSection } from './ui/collapsible-section';
import { designTokens } from '@/lib/design-tokens';
import { ModernLoader } from '@/components/ui/modern-loader';

// Import new modular components with lazy loading
import { lazy, Suspense } from "react";
import ContactFormActions from "./contact-form/ContactFormActions.tsx";
import ContactAvatarUpload from "./ContactAvatarUpload.tsx";
import { AlertCircle, Users, Eye, History, Tag, Phone, Mail, Link, Calendar, Settings, MapPin } from 'lucide-react';

// Lazy load form sections to improve initial loading performance
const ContactBasicInfo = lazy(() => import("./contact-form/ContactBasicInfo.tsx"));
const ContactPhoneNumbers = lazy(() => import("./contact-form/ContactPhoneNumbers.tsx"));
const ContactEmailAddresses = lazy(() => import("./contact-form/ContactEmailAddresses.tsx"));
const ContactSocialLinks = lazy(() => import("./contact-form/ContactSocialLinks.tsx"));
const ContactImportantDates = lazy(() => import("./contact-form/ContactImportantDates.tsx"));
const ContactOtherDetails = lazy(() => import("./contact-form/ContactOtherDetails.tsx"));
const ContactCustomFields = lazy(() => import("./contact-form/ContactCustomFields.tsx"));
const ContactPreviewCard = lazy(() => import("./contact-form/ContactPreviewCard.tsx"));
const ContactHistory = lazy(() => import("./contact-form/ContactHistory.tsx"));
const ContactTags = lazy(() => import("./contact-form/ContactTags.tsx"));

// Loading components
const SectionLoader = () => (
  <div className="flex justify-center items-center p-4">
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
  </div>
);

const FormSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
        <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
            <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
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
    tags: [],
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

  const {
    onSubmit: handleSubmitContact,
    error,
    errorMessage,
    retrySave,
    retryCount
  } = useContactFormLogic(contactId, navigate, session, form, availableTemplates);

  const onSubmit = async (data: ContactFormValues) => {
    try {
      setIsSubmitting(true);
      setFormError(null);
      await handleSubmitContact(data);
    } catch (error) {
      console.error('Error submitting form:', error);
      setFormError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <CollapsibleSection
          title={t('contact_form.avatar_section', 'تصویر پروفایل')}
          icon={<Users size={18} />}
          defaultOpen={true}
        >
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
        </CollapsibleSection>
      )
    },
    {
      id: 'basic-info',
      title: t('accessibility.basic_info_section', 'Basic Information Section'),
      component: (
        <CollapsibleSection
          title={t('contact_form.basic_info_section', 'اطلاعات پایه')}
          icon={<Users size={18} />}
          defaultOpen={true}
        >
          <Suspense fallback={<SectionLoader />}>
            <ContactBasicInfo />
          </Suspense>
        </CollapsibleSection>
      )
    },
    {
      id: 'phone',
      title: t('accessibility.phone_section', 'Phone Numbers Section'),
      component: (
        <CollapsibleSection
          title={t('contact_form.phone_section', 'شماره‌های تلفن')}
          icon={<Phone size={18} />}
          defaultOpen={false}
        >
          <Suspense fallback={<SectionLoader />}>
            <ContactPhoneNumbers />
          </Suspense>
        </CollapsibleSection>
      )
    },
    {
      id: 'email',
      title: t('accessibility.email_section', 'Email Addresses Section'),
      component: (
        <CollapsibleSection
          title={t('contact_form.email_section', 'آدرس‌های ایمیل')}
          icon={<Mail size={18} />}
          defaultOpen={false}
        >
          <Suspense fallback={<SectionLoader />}>
            <ContactEmailAddresses />
          </Suspense>
        </CollapsibleSection>
      )
    },
    {
      id: 'social',
      title: t('accessibility.social_section', 'Social Links Section'),
      component: (
        <CollapsibleSection
          title={t('contact_form.social_section', 'لینک‌های اجتماعی')}
          icon={<Link size={18} />}
          defaultOpen={false}
        >
          <Suspense fallback={<SectionLoader />}>
            <ContactSocialLinks />
          </Suspense>
        </CollapsibleSection>
      )
    },
    {
      id: 'dates',
      title: t('accessibility.dates_section', 'Important Dates Section'),
      component: (
        <CollapsibleSection
          title={t('contact_form.dates_section', 'تاریخ‌های مهم')}
          icon={<Calendar size={18} />}
          defaultOpen={false}
        >
          <Suspense fallback={<SectionLoader />}>
            <ContactImportantDates />
          </Suspense>
        </CollapsibleSection>
      )
    },
    {
      id: 'other-details',
      title: t('accessibility.other_details_section', 'Other Details Section'),
      component: (
        <CollapsibleSection
          title={t('contact_form.other_details_section', 'جزئیات دیگر')}
          icon={<MapPin size={18} />}
          defaultOpen={false}
        >
          <Suspense fallback={<SectionLoader />}>
            <ContactOtherDetails />
          </Suspense>
        </CollapsibleSection>
      )
    },
    {
      id: 'custom-fields',
      title: t('accessibility.custom_fields_section', 'Custom Fields Section'),
      component: (
        <CollapsibleSection
          title={t('contact_form.custom_fields_section', 'فیلدهای سفارشی')}
          icon={<Settings size={18} />}
          defaultOpen={false}
        >
          <Suspense fallback={<SectionLoader />}>
            <ContactCustomFields
              availableTemplates={availableTemplates}
              loadingTemplates={loadingTemplates}
              fetchTemplates={fetchTemplates}
            />
          </Suspense>
        </CollapsibleSection>
      )
    },
    {
      id: 'tags',
      title: t('accessibility.tags_section', 'Tags Section'),
      component: (
        <CollapsibleSection
          title={t('contact_form.tags_section', 'تگ‌ها')}
          icon={<Tag size={18} />}
          defaultOpen={false}
        >
          <Suspense fallback={<SectionLoader />}>
            <ContactTags
              contactId={contactId}
              selectedTags={(form.watch('tags') || []).map(tag => ({
                id: tag.id,
                name: tag.name,
                color: tag.color,
                user_id: tag.user_id || 'temp-user',
                created_at: tag.created_at || new Date().toISOString(),
                updated_at: tag.updated_at || new Date().toISOString()
              }))}
              onTagsChange={(tags) => {
                form.setValue('tags', tags, { shouldValidate: true, shouldDirty: true });
              }}
            />
          </Suspense>
        </CollapsibleSection>
      )
    },
    {
      id: 'preview',
      title: t('accessibility.preview_section', 'Preview Section'),
      component: (
        <CollapsibleSection
          title={t('contact_form.preview_section', 'پیش‌نمایش مخاطب')}
          icon={<Eye size={18} />}
          defaultOpen={false}
        >
          <Suspense fallback={<SectionLoader />}>
            <ContactPreviewCard contact={form.getValues()} />
          </Suspense>
        </CollapsibleSection>
      )
    },
    {
      id: 'history',
      title: t('accessibility.history_section', 'History Section'),
      component: (
        <CollapsibleSection
          title={t('contact_form.history_section', 'تاریخچه تغییرات')}
          icon={<History size={18} />}
          defaultOpen={false}
        >
          <Suspense fallback={<SectionLoader />}>
            <ContactHistory contactId={contactId || 'new'} />
          </Suspense>
        </CollapsibleSection>
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

  if (loadingTemplates) {
    return (
      <ModernCard
        variant="glass"
        className="w-full rounded-3xl overflow-hidden"
      >
        <FormSkeleton />
      </ModernCard>
    );
  }

  return (
    <KeyboardNavigationHandler scope="forms">
      <div className="space-y-8">
        {/* Header Section with New Design */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
              style={{
                background: designTokens.gradients.sunset,
                boxShadow: designTokens.shadows.glass3d
              }}>
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-pink-500/20"></div>
          <div className="relative p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
                <Users size={24} className="sm:w-8 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2"
                    style={{ fontFamily: designTokens.typography.fonts.primary }}>
                  {contactId
                    ? 'ویرایش مخاطب'
                    : 'افزودن مخاطب جدید'
                  }
                </h1>
                <p className="text-white/80 text-sm sm:text-base lg:text-lg">
                  {contactId
                    ? 'اطلاعات مخاطب را ویرایش کنید'
                    : 'اطلاعات مخاطب جدید را وارد کنید'
                  }
                </p>
              </div>
            </div>

            {/* Enhanced Error Display */}
            {error && (
              <div className="bg-red-50/10 backdrop-blur-md border border-red-200/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-red-500/20 flex items-center justify-center">
                    <AlertCircle size={20} className="sm:w-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-red-400">خطا در ذخیره</h3>
                    <p className="text-red-300 text-sm sm:text-base">{errorMessage}</p>
                  </div>
                </div>
                {retryCount > 0 && (
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={retrySave}
                    disabled={isSubmitting}
                    className="text-red-400 hover:bg-red-500/20 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl border border-red-400/30 text-sm sm:text-base"
                    aria-describedby="form-error-message"
                    aria-label={t('accessibility.retry_save', 'تلاش مجدد برای ذخیره فرم')}
                  >
                    تلاش مجدد ({retryCount} از ۳)
                  </GlassButton>
                )}
              </div>
            )}

            {/* Enhanced Progress Indicator */}
            {isSubmitting && (
              <div className="bg-blue-50/10 backdrop-blur-md border border-blue-200/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <ModernLoader variant="spinner" size="md" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-blue-400">در حال ذخیره...</h3>
                    <p className="text-blue-300 text-sm sm:text-base">لطفاً صبر کنید</p>
                  </div>
                </div>
                <ModernProgress value={75} className="w-full" variant="gradient" />
              </div>
            )}
          </div>
        </div>

        <ModernCard
          variant="glass"
          className={`
            w-full rounded-2xl sm:rounded-3xl overflow-hidden
            border-2 border-white/20 dark:border-gray-700/20
            backdrop-blur-xl
            bg-white/80 dark:bg-gray-800/80
            transition-all duration-500 ease-out
            shadow-2xl hover:shadow-3xl
            hover:shadow-primary-500/10 dark:hover:shadow-primary-900/20
            ${error ? 'ring-4 ring-red-500/20 border-red-400/50' : ''}
            ${isSubmitting ? 'ring-4 ring-blue-500/20 border-blue-400/50 animate-pulse' : ''}
          `}
        >
          {isSubmitting && (
            <div className="absolute inset-0 bg-black/10 dark:bg-white/5 z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
                <p className="text-sm text-muted-foreground">در حال ذخیره تغییرات...</p>
              </div>
            </div>
          )}

          {formError && (
            <div className="bg-destructive/10 border-l-4 border-destructive text-destructive p-4 mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <p>{formError}</p>
              </div>
            </div>
          )}


          <ModernCardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
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

                  {/* Render sections with collapsible organization */}
                  {formSections.map((section) => (
                    <div key={section.id} role="group" aria-labelledby={`${section.id}-section-title`}>
                      <h3 id={`${section.id}-section-title`} className="sr-only">
                        {section.title}
                      </h3>
                      {section.component}
                    </div>
                  ))}
                </fieldset>
              </form>
            </Form>
          </ModernCardContent>
        </ModernCard>
      </div>
    </KeyboardNavigationHandler>
  );
});

ContactForm.displayName = 'ContactForm';

export default ContactForm;
