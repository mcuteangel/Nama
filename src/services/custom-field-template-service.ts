import { supabase } from '@/integrations/supabase/client';
import { CustomFieldTemplate, CreateCustomFieldTemplateInput, UpdateCustomFieldTemplateInput } from '@/domain/schemas/custom-field-template';
import { invalidateCache } from '@/utils/cache-helpers';
import { ErrorManager } from '@/lib/error-manager';

// Helper function to get authenticated user
const getAuthenticatedUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error('Authentication required');
  }
  return user;
};

// Helper function to handle cache invalidation
const invalidateUserCache = (userId: string) => {
  invalidateCache(`custom_field_templates_${userId}`);
};

export const CustomFieldTemplateService = {
  async getAllCustomFieldTemplates(): Promise<{ data: CustomFieldTemplate[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('custom_field_templates')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        ErrorManager.logError(error, { service: 'CustomFieldTemplateService', method: 'getAllCustomFieldTemplates' });
        return { data: null, error: error.message };
      }

      return { data: data as CustomFieldTemplate[], error: null };
    } catch (error) {
      ErrorManager.logError(error, { service: 'CustomFieldTemplateService', method: 'getAllCustomFieldTemplates' });
      return { data: null, error: ErrorManager.getErrorMessage(error) };
    }
  },

  async addCustomFieldTemplate(template: CreateCustomFieldTemplateInput): Promise<{ data: CustomFieldTemplate | null; error: string | null }> {
    try {
      const user = await getAuthenticatedUser();

      const { data, error } = await supabase
        .from('custom_field_templates')
        .insert({ ...template, user_id: user.id })
        .select()
        .single();

      if (error) {
        ErrorManager.logError(error, { service: 'CustomFieldTemplateService', method: 'addCustomFieldTemplate' });
        return { data: null, error: error.message };
      }

      invalidateUserCache(user.id);
      return { data: data as CustomFieldTemplate, error: null };
    } catch (error) {
      ErrorManager.logError(error, { service: 'CustomFieldTemplateService', method: 'addCustomFieldTemplate' });
      return { data: null, error: ErrorManager.getErrorMessage(error) };
    }
  },

  async updateCustomFieldTemplate(id: string, template: UpdateCustomFieldTemplateInput): Promise<{ data: CustomFieldTemplate | null; error: string | null }> {
    try {
      const user = await getAuthenticatedUser();

      const { data, error } = await supabase
        .from('custom_field_templates')
        .update(template)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        ErrorManager.logError(error, { service: 'CustomFieldTemplateService', method: 'updateCustomFieldTemplate' });
        return { data: null, error: error.message };
      }

      invalidateUserCache(user.id);
      return { data: data as CustomFieldTemplate, error: null };
    } catch (error) {
      ErrorManager.logError(error, { service: 'CustomFieldTemplateService', method: 'updateCustomFieldTemplate' });
      return { data: null, error: ErrorManager.getErrorMessage(error) };
    }
  },

  async deleteCustomFieldTemplate(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const user = await getAuthenticatedUser();

      const { error } = await supabase
        .from('custom_field_templates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        ErrorManager.logError(error, { service: 'CustomFieldTemplateService', method: 'deleteCustomFieldTemplate' });
        return { success: false, error: error.message };
      }

      invalidateUserCache(user.id);
      return { success: true, error: null };
    } catch (error) {
      ErrorManager.logError(error, { service: 'CustomFieldTemplateService', method: 'deleteCustomFieldTemplate' });
      return { success: false, error: ErrorManager.getErrorMessage(error) };
    }
  },
};