import { useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Session } from '@supabase/supabase-js';
import { CustomFieldTemplate } from '@/domain/schemas/custom-field-template';
import { ContactFormValues, CustomFieldFormData } from '@/types/contact';

export interface ContactFormCustomFieldsSync {
  syncCustomFieldsWithTemplates: () => void;
}

export const useContactFormCustomFieldsSync = (
  form: UseFormReturn<ContactFormValues>,
  availableTemplates: CustomFieldTemplate[],
  initialData?: ContactFormValues,
  loadingTemplates?: boolean,
  session?: Session | null
) => {
  // Ref to store the JSON string of the last customFields value that was successfully set to the form by this effect
  const lastSetCustomFieldsRef = useRef<string>('');

  const syncCustomFieldsWithTemplates = useEffect(() => {
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
  }, [availableTemplates, initialData, loadingTemplates, form, session?.user]);

  return {
    syncCustomFieldsWithTemplates,
  };
};
