import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "@/integrations/supabase/auth";
import { CustomFieldTemplateService } from "@/services/custom-field-template-service";
import { type CustomFieldTemplate } from "@/domain/schemas/custom-field-template";
import { useToast } from "@/hooks/use-toast";
import { ErrorManager } from "@/lib/error-manager";
import { fetchWithCache, invalidateCache } from "@/utils/cache-helpers";

export const useCustomFields = () => {
  const { t } = useTranslation();
  const { session, isLoading: isSessionLoading } = useSession();
  const { toast } = useToast();

  const [customFields, setCustomFields] = useState<CustomFieldTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load custom fields
  const loadCustomFields = useCallback(async () => {
    if (isSessionLoading || !session?.user) {
      setCustomFields([]);
      return;
    }

    try {
      setIsLoading(true);
      const cacheKey = `custom_field_templates_${session.user.id}`;
      const { data, error } = await fetchWithCache<CustomFieldTemplate[]>(
        cacheKey,
        async () => {
          const res = await CustomFieldTemplateService.getAllCustomFieldTemplates();
          if (res.error) {
            throw new Error(res.error);
          }
          return { data: res.data, error: null };
        }
      );

      if (error) {
        throw new Error(error);
      }

      setCustomFields(data || []);
    } catch (error) {
      console.error("Error loading custom fields:", error);
      toast({
        title: t('errors.load_custom_fields_failed'),
        description: ErrorManager.getErrorMessage(error),
        variant: "error"
      });
      setCustomFields([]);
    } finally {
      setIsLoading(false);
    }
  }, [session, isSessionLoading, toast, t]);

  // Delete custom field
  const deleteCustomField = useCallback(async (id: string) => {
    if (!session?.user) return;

    try {
      setIsDeleting(true);
      const res = await CustomFieldTemplateService.deleteCustomFieldTemplate(id);

      if (res.error) {
        throw new Error(res.error);
      }

      invalidateCache(`custom_field_templates_${session.user.id}`);
      await loadCustomFields();

      toast({
        title: t('custom_field_template.delete_success'),
        description: t('custom_field_template.delete_success_description')
      });
    } catch (error) {
      console.error("Error deleting custom field:", error);
      toast({
        title: t('errors.delete_custom_field_failed'),
        description: ErrorManager.getErrorMessage(error),
        variant: "error"
      });
    } finally {
      setIsDeleting(false);
    }
  }, [session, loadCustomFields, toast, t]);

  // Handle success callbacks
  const handleSuccess = useCallback(async () => {
    if (session?.user) {
      invalidateCache(`custom_field_templates_${session.user.id}`);
    }
    await loadCustomFields();
  }, [session, loadCustomFields]);

  // Initial load
  useEffect(() => {
    loadCustomFields();
  }, [loadCustomFields]);

  return {
    customFields,
    isLoading,
    isDeleting,
    loadCustomFields,
    deleteCustomField,
    handleSuccess
  };
};