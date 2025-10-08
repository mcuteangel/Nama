import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import { contactFormSchema, ContactFormValues } from '@/types/contact';
import { CustomFieldTemplate } from '@/domain/schemas/custom-field-template';

export interface ContactFormValidation {
  formSchema: z.ZodSchema<ContactFormValues>;
}

export const useContactFormValidation = (availableTemplates: CustomFieldTemplate[] = []) => {
  const { t } = useTranslation();

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

  return {
    formSchema,
  };
};
