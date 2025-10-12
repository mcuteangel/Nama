import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Suspense } from 'react';
import { CustomFieldTemplate } from '@/domain/schemas/custom-field-template';
import { UseFormReturn } from 'react-hook-form';
import { ContactFormValues } from '@/types/contact';
import SectionLoader from '@/components/contact-form/SectionLoader';

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

export interface FormSection {
  id: string;
  title: string;
  component: ReactElement;
}

export interface ContactFormSectionsConfig {
  getFormSections: (
    form: UseFormReturn<ContactFormValues>,
    isSubmitting: boolean,
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
      id: 'contact-info',
      title: t('accessibility.contact_info_section', 'Contact Information Section'),
      component: (
        <Suspense fallback={<SectionLoader />}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ContactPhoneNumbers />
            <ContactEmailAddresses />
          </div>
        </Suspense>
      )
    },
    {
      id: 'social-dates',
      title: t('accessibility.social_dates_section', 'Social Links and Important Dates Section'),
      component: (
        <Suspense fallback={<SectionLoader />}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ContactSocialLinks />
            <ContactImportantDates />
          </div>
        </Suspense>
      )
    },
    {
      id: 'address-notes',
      title: t('accessibility.address_notes_section', 'Address and Notes Section'),
      component: (
        <Suspense fallback={<SectionLoader />}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ContactAddress />
            <ContactNotes />
          </div>
        </Suspense>
      )
    },
    {
      id: 'fields-tags',
      title: t('accessibility.fields_tags_section', 'Custom Fields and Tags Section'),
      component: (
        <Suspense fallback={<SectionLoader />}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ContactCustomFields
              availableTemplates={availableTemplates}
              loadingTemplates={loadingTemplates}
              fetchTemplates={fetchTemplates}
            />
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
          </div>
        </Suspense>
      )
    },
    {
      id: 'preview-history',
      title: t('accessibility.preview_history_section', 'Preview and History Section'),
      component: (
        <Suspense fallback={<SectionLoader />}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ContactPreviewCard contact={form.getValues()} />
            {contactId && <ContactHistory contactId={contactId} />}
          </div>
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
