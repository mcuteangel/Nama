import React, { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/integrations/supabase/auth";
import { useTranslation } from "react-i18next";

// Import new modular hooks
import { useContactFormState } from "@/hooks/use-contact-form-state";
import { useContactFormAccessibility } from "@/hooks/use-contact-form-accessibility";
import { useContactFormValidation } from "@/hooks/use-contact-form-validation";
import { useContactFormCustomFieldsSync } from "@/hooks/use-contact-form-custom-fields-sync";
import { useContactFormLogic } from "@/hooks/use-contact-form-logic";
import { useContactFormSections } from "@/config/contact-form-sections-config";
import { getContactFormDefaultValues } from "@/constants/contact-form-constants";

// Import new modular components
import { FormSkeleton, FormSubmissionLoader } from "./contact-form/loading-components";
import { FormErrorDisplay, ProgressIndicator, SimpleError } from "./contact-form/error-components";
import PageHeader from "@/components/ui/PageHeader";
import { ModernCard, ModernCardContent } from "./ui";
import { ContactFormValues } from "@/types/contact";

interface ContactFormProps {
  initialData?: ContactFormValues;
  contactId?: string;
}

const ContactForm: React.FC<ContactFormProps> = React.memo(({ initialData, contactId }) => {
  const navigate = useNavigate();
  const { session } = useSession();
  const { t } = useTranslation();

  // Use new modular hooks
  const formState = useContactFormState(session);
  const accessibility = useContactFormAccessibility(contactId);
  const validation = useContactFormValidation(formState.availableTemplates);
  const defaultValues = getContactFormDefaultValues();

  // Initialize form with validation schema
  const form = useForm({
    resolver: zodResolver(validation.formSchema),
    defaultValues,
    context: { availableTemplates: formState.availableTemplates },
  });

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  // Sync custom fields with templates
  useContactFormCustomFieldsSync(
    form,
    formState.availableTemplates,
    initialData,
    formState.loadingTemplates,
    session
  );

  // Handle form submission
  const formLogic = useContactFormLogic(
    contactId,
    navigate,
    session,
    form,
    formState.availableTemplates
  );

  // Handle form submission wrapper
  const onSubmit = async (data: ContactFormValues) => {
    try {
      formState.setFormError(null);
      await formLogic.onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
      formState.setFormError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  // Handle cancel action
  const handleCancel = useCallback(() => {
    accessibility.announce(t('accessibility.form_cancelled', 'Form cancelled'), 'polite');
    navigate(-1);
  }, [navigate, accessibility, t]);

  // Get form sections configuration
  const sectionsConfig = useContactFormSections();

  const formSections = sectionsConfig.getFormSections(
    form,
    formLogic.isSubmitting,
    formState.availableTemplates,
    formState.loadingTemplates,
    formState.fetchTemplates,
    handleCancel,
    contactId
  );

  // Show loading skeleton while templates are loading
  if (formState.loadingTemplates) {
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
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title={contactId ? 'ویرایش مخاطب' : 'افزودن مخاطب جدید'}
        description={contactId ? 'اطلاعات مخاطب را ویرایش کنید' : 'اطلاعات مخاطب جدید را وارد کنید'}
        showBackButton={true}
      >
        {/* Additional header content can be added here if needed */}
      </PageHeader>

      {/* Error Display */}
      <FormErrorDisplay
        error={!!formLogic.error}
        errorMessage={formLogic.errorMessage}
        retryCount={formLogic.retryCount}
        onRetry={formLogic.retrySave}
        isSubmitting={formLogic.isSubmitting}
      />

      {/* Progress Indicator */}
      <ProgressIndicator isSubmitting={formLogic.isSubmitting} />

      {/* Main Form Card */}
      <ModernCard className="w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-lg">
        {/* Loading Overlay */}
        {formLogic.isSubmitting && <FormSubmissionLoader />}

        {/* Form Error */}
        <SimpleError error={formState.formError} />

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
                  {accessibility.getAriaLabel('contact-form', contactId ? 'Edit Contact' : 'Add Contact')}
                </h2>
                <p id="contact-form-description">
                  {accessibility.getAriaLabel('contact-form-description', 'Fill out the form to manage contact information')}
                </p>
              </div>

              {/* Form progress indicator for screen readers */}
              <div
                className="sr-only"
                aria-live="polite"
                aria-atomic="true"
              >
                {formLogic.isSubmitting && (
                  <span>
                    {contactId
                      ? t('accessibility.updating_contact', 'Updating contact...')
                      : t('accessibility.creating_contact', 'Creating contact...')
                    }
                  </span>
                )}
              </div>

              <fieldset disabled={formLogic.isSubmitting} className="space-y-4">
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
  );
});

ContactForm.displayName = 'ContactForm';

export default ContactForm;
