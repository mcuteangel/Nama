import { supabase } from '@/integrations/supabase/client';
import { CustomFieldTemplate, CreateCustomFieldTemplateInput, UpdateCustomFieldTemplateInput } from '@/domain/schemas/custom-field-template';
import { invalidateCache } from '@/utils/cache-helpers';

export const CustomFieldTemplateService = {
  async getAllCustomFieldTemplates(): Promise<{ data: CustomFieldTemplate[] | null; error: string | null }> {
    const { data, error } = await supabase
      .from('custom_field_templates')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data as CustomFieldTemplate[], error: null };
  },

  async addCustomFieldTemplate(template: CreateCustomFieldTemplateInput): Promise<{ data: CustomFieldTemplate | null; error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'کاربر احراز هویت نشده است.' };
    }

    const { data, error } = await supabase
      .from('custom_field_templates')
      .insert({ ...template, user_id: user.id })
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }
    invalidateCache(`custom_field_templates_${user.id}`);
    return { data: data as CustomFieldTemplate, error: null };
  },

  async updateCustomFieldTemplate(id: string, template: UpdateCustomFieldTemplateInput): Promise<{ data: CustomFieldTemplate | null; error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'کاربر احراز هویت نشده است.' };
    }

    const { data, error } = await supabase
      .from('custom_field_templates')
      .update(template)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }
    invalidateCache(`custom_field_templates_${user.id}`);
    return { data: data as CustomFieldTemplate, error: null };
  },

  async deleteCustomFieldTemplate(id: string): Promise<{ success: boolean; error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'کاربر احراز هویت نشده است.' };
    }

    const { error } = await supabase
      .from('custom_field_templates')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }
    invalidateCache(`custom_field_templates_${user.id}`);
    return { success: true, error: null };
  },
};