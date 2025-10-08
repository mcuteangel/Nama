import { useState, useCallback, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { CustomFieldTemplate } from '@/domain/schemas/custom-field-template';
import { CustomFieldTemplateService } from '@/services/custom-field-template-service';
import { fetchWithCache } from '@/utils/cache-helpers';

export interface ContactFormState {
  availableTemplates: CustomFieldTemplate[];
  loadingTemplates: boolean;
  formError: string | null;
}

export interface ContactFormStateActions {
  setAvailableTemplates: (templates: CustomFieldTemplate[]) => void;
  setLoadingTemplates: (loading: boolean) => void;
  setFormError: (error: string | null) => void;
  fetchTemplates: () => Promise<void>;
  clearError: () => void;
}

export const useContactFormState = (session: Session | null): ContactFormState & ContactFormStateActions => {
  const [availableTemplates, setAvailableTemplates] = useState<CustomFieldTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setFormError(null);
  }, []);

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

  return {
    availableTemplates,
    loadingTemplates,
    formError,
    setAvailableTemplates,
    setLoadingTemplates,
    setFormError,
    fetchTemplates,
    clearError,
  };
};
