import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Suspense } from 'react';
import { CustomFieldTemplate } from '@/domain/schemas/custom-field-template';
import { UseFormReturn } from 'react-hook-form';
import { ContactFormValues } from '@/types/contact';

// Lazy load form sections to improve initial loading performance
import { lazy } from 'react';
const ContactBasicInfo = lazy(() => import('@/components/contact-form/ContactBasicInfo.tsx'));
const ContactPhoneNumbers = lazy(() => import('@/components/contact-form/ContactPhoneNumbers.tsx'));
const ContactEmailAddresses = lazy(() => import('@/components/contact-form/ContactEmailAddresses.tsx'));
const ContactSocialLinks = lazy(() => import('@/components/contact-form/ContactSocialLinks.tsx'));
const ContactImportantDates = lazy(() => import('@/components/contact-form/ContactImportantDates.tsx'));
const ContactAddress = lazy(() => import('@/components/contact-form/ContactAddress.tsx'));
const ContactNotes = lazy(() => import('@/components/contact-form/ContactNotes.tsx'));
const ContactCustomFields = lazy(() => import('@/components/contact-form/ContactCustomFields.tsx'));
const ContactPreviewCard = lazy(() => import('@/components/contact-form/ContactPreviewCard.tsx'));
const ContactHistory = lazy(() => import('@/components/contact-form/ContactHistory.tsx'));
const ContactTags = lazy(() => import('@/components/contact-form/ContactTags.tsx'));
const ContactAvatarUpload = lazy(() => import('@/components/ContactAvatarUpload.tsx'));
const ContactFormActions = lazy(() => import('@/components/contact-form/ContactFormActions.tsx'));

// Loading component for sections
const SectionLoader = () => (
  <div className="flex justify-center items-center p-4">
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
  </div>
);

export interface FormSection {
  id: string;
  title: string;
  component: ReactElement;
}

export interface ContactFormSectionsConfig {
  getFormSections: (
    form: UseFormReturn<ContactFormValues>,
    isSubmitting: boolean,
    announce: (message: string, priority?: 'polite' | 'assertive') => void,
    availableTemplates: CustomFieldTemplate[],
    loadingTemplates: boolean,
    fetchTemplates: () => Promise<void>,
    handleCancel: () => void,
    contactId?: string
  ) => FormSection[];
}

export const useContactFormSections = (): ContactFormSectionsConfig => {
  const { t } = useTranslation();

  const getFormSections = (
    form: UseFormReturn<ContactFormValues>,
    isSubmitting: boolean,
    announce: (message: string, priority?: 'polite' | 'assertive') => void,
    availableTemplates: CustomFieldTemplate[],
    loadingTemplates: boolean,
    fetchTemplates: () => Promise<void>,
    handleCancel: () => void,
    contactId?: string
  ): FormSection[] => [
    {
      id: 'avatar',
      title: t('accessibility.avatar_section', 'Avatar Section'),
      component: (
        <Suspense fallback={<SectionLoader />}>
          <ContactAvatarUpload
            initialAvatarUrl={form.watch('avatarUrl') || null}
            onAvatarChange={(url) => {
              form.setValue('avatarUrl', url, { shouldValidate: true, shouldDirty: true });
            }}
            disabled={isSubmitting}
          />
        </Suspense>
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
      id: 'address',
      title: t('accessibility.address_section', 'Address Section'),
      component: (
        <Suspense fallback={<SectionLoader />}>
          <ContactAddress />
        </Suspense>
      )
    },
    {
      id: 'notes',
      title: t('accessibility.notes_section', 'Notes Section'),
      component: (
        <Suspense fallback={<SectionLoader />}>
          <ContactNotes />
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
      id: 'tags',
      title: t('accessibility.tags_section', 'Tags Section'),
      component: (
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
      )
    },
    {
      id: 'preview',
      title: t('accessibility.preview_section', 'Preview Section'),
      component: (
        <Suspense fallback={<SectionLoader />}>
          <ContactPreviewCard contact={form.getValues()} />
        </Suspense>
      )
    },
    {
      id: 'history',
      title: t('accessibility.history_section', 'History Section'),
      component: (
        <Suspense fallback={<SectionLoader />}>
          <ContactHistory contactId={contactId || 'new'} />
        </Suspense>
      )
    },
    {
      id: 'actions',
      title: t('accessibility.form_actions_section', 'Form Actions Section'),
      component: (
        <Suspense fallback={<SectionLoader />}>
          <ContactFormActions
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
            contactId={contactId}
          />
        </Suspense>
      )
    }
  ];

  return {
    getFormSections,
  };
};
