import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react';
import { CustomFieldTemplateService } from '@/services/custom-field-template-service';
import { useSession } from '@/integrations/supabase/auth';
import { useNavigate } from 'react-router-dom';
import {
  customFieldTemplateSchema,
  type CreateCustomFieldTemplateInput,
  type CustomFieldTemplate,
} from '@/domain/schemas/custom-field-template';
import { ModernCard, ModernCardContent, ModernCardFooter, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { Label } from '@/components/ui/label';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernTextarea } from '@/components/ui/modern-textarea';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { GlassButton } from '@/components/ui/glass-button';
import CancelButton from '@/components/common/CancelButton';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { ErrorManager } from '@/lib/error-manager';

type TemplateType = 'text' | 'number' | 'date' | 'list';

interface CustomFieldFormProps {
  initialData?: CustomFieldTemplate;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CustomFieldForm: React.FC<CustomFieldFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const { session } = useSession();
  const navigate = useNavigate();

  const {
    isLoading: isSubmitting,
    error,
    errorMessage,
    retryCount,
    retry: retryLastOperation,
    executeAsync,
  } = useErrorHandler(null, {
    maxRetries: 3,
    retryDelay: 1000,
    showToast: true,
    customErrorMessage: initialData 
      ? t('errors.edit_custom_field_template_error') 
      : t('errors.create_custom_field_template_error'),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (err) => {
      ErrorManager.logError(err, {
        component: "CustomFieldForm",
        action: initialData ? "updateTemplate" : "addTemplate",
      });
    },
  });

  const form = useForm<CreateCustomFieldTemplateInput>({
    resolver: zodResolver(customFieldTemplateSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "text",
      options: initialData?.type === 'list' ? (initialData.options || []) : [],
      description: initialData?.description || "",
      required: initialData?.required || false,
    },
    mode: "onChange",
  });

  const values = form.watch();

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        type: initialData.type as TemplateType,
        options: initialData.type === 'list' ? (initialData.options || []) : [],
        description: initialData.description || "",
        required: initialData.required,
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: CreateCustomFieldTemplateInput) => {
    if (!session?.user) {
      ErrorManager.notifyUser(t('errors.auth_required'), 'error');
      navigate('/login');
      return;
    }

    await executeAsync(async () => {
      let res;
      if (initialData) {
        res = await CustomFieldTemplateService.updateCustomFieldTemplate(initialData.id, {
          name: data.name.trim(),
          type: data.type,
          options: data.type === 'list' ? (data.options || []).filter(Boolean) : undefined,
          description: data.description?.trim() || "",
          required: !!data.required,
        });
      } else {
        res = await CustomFieldTemplateService.addCustomFieldTemplate({
          name: data.name.trim(),
          type: data.type,
          options: data.type === 'list' ? (data.options || []).filter(Boolean) : undefined,
          description: data.description?.trim() || "",
          required: !!data.required,
        });
      }

      if (res.error) {
        throw new Error(res.error);
      }
      
      return res.data;
    });
  };

  const addOption = () => {
    const current = form.getValues("options") || [];
    form.setValue("options", [...current, ""], { 
      shouldDirty: true, 
      shouldTouch: true, 
      shouldValidate: true 
    });
  };

  const removeOption = (index: number) => {
    const current = (form.getValues("options") || []).filter((_, i) => i !== index);
    form.setValue("options", current, { 
      shouldDirty: true, 
      shouldTouch: true, 
      shouldValidate: true 
    });
  };

  const setOptionAt = (index: number, value: string) => {
    const current = [...(form.getValues("options") || [])];
    current[index] = value;
    form.setValue("options", current, { 
      shouldDirty: true, 
      shouldTouch: true, 
      shouldValidate: true 
    });
  };

  return (
    <ModernCard variant="glass" className="w-full rounded-xl p-6">
      <ModernCardHeader className="text-center">
        <ModernCardTitle className="text-2xl font-bold">
          {initialData 
            ? t('custom_field_template.edit_title') 
            : t('custom_field_template.add_title')}
        </ModernCardTitle>
        {error && (
          <div className="text-sm text-destructive flex items-center justify-center gap-2 mt-2">
            <span>{errorMessage}</span>
            {retryCount > 0 && (
              <GlassButton
                variant="glass"
                size="sm"
                onClick={retryLastOperation}
                disabled={isSubmitting}
                className="text-destructive hover:bg-destructive/10"
              >
                {t('actions.retry_count', { count: retryCount })}
              </GlassButton>
            )}
          </div>
        )}
      </ModernCardHeader>
      
      <ModernCardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Field Name */}
          <div>
            <Label htmlFor="field-name" className="text-gray-700 dark:text-gray-200">
              {t('contact_form.field_name')}
            </Label>
            <ModernInput
              id="field-name"
              {...form.register("name")}
              placeholder={t('contact_form.field_name_placeholder')}
              variant="glass"
              className="mt-1 block w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              disabled={isSubmitting}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500 font-medium mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Field Type */}
          <div>
            <Label htmlFor="field-type" className="text-gray-700 dark:text-gray-200">
              {t('contact_form.field_type')}
            </Label>
            <ModernSelect
              value={values.type || "text"}
              onValueChange={(value) => {
                form.setValue("type", value as TemplateType, { shouldValidate: true });
                if (value !== "list") {
                  form.setValue("options", undefined, { shouldValidate: true });
                } else {
                  form.setValue("options", form.getValues("options") || [""], { shouldValidate: true });
                }
              }}
              disabled={isSubmitting}
            >
              <ModernSelectTrigger variant="glass" className="w-full">
                <ModernSelectValue placeholder={t('contact_form.select_field_type')} />
              </ModernSelectTrigger>
              <ModernSelectContent variant="glass">
                <ModernSelectItem value="text">{t('contact_form.text')}</ModernSelectItem>
                <ModernSelectItem value="number">{t('contact_form.number')}</ModernSelectItem>
                <ModernSelectItem value="date">{t('contact_form.date')}</ModernSelectItem>
                <ModernSelectItem value="list">{t('contact_form.list')}</ModernSelectItem>
              </ModernSelectContent>
            </ModernSelect>
            {form.formState.errors.type && (
              <p className="text-sm text-red-500 font-medium mt-1">
                {form.formState.errors.type.message}
              </p>
            )}
          </div>

          {/* List Options (only for list type) */}
          {values.type === 'list' && (
            <div className="flex flex-col gap-2">
              <Label className="text-gray-700 dark:text-gray-200">
                {t('contact_form.list_options')}
              </Label>
              {(values.options || []).map((option, index) => (
                <div key={index} className="flex gap-2">
                  <ModernInput
                    value={option}
                    onChange={(e) => setOptionAt(index, e.target.value)}
                    placeholder={t('contact_form.option_placeholder')}
                    variant="glass"
                    className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    disabled={isSubmitting}
                  />
                  <GlassButton
                    type="button"
                    variant="glass"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="text-red-500 hover:bg-red-100 dark:hover:bg-gray-700/50"
                    disabled={isSubmitting}
                  >
                    <X size={16} />
                  </GlassButton>
                </div>
              ))}
              <GlassButton 
                type="button" 
                variant="glass" 
                size="sm" 
                onClick={addOption}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-medium"
                disabled={isSubmitting}
              >
                <Plus size={16} className="me-2" /> 
                {t('contact_form.add_option')}
              </GlassButton>
              {form.formState.errors.options && (
                <p className="text-sm text-red-500 font-medium mt-1">
                  {(form.formState.errors.options as { message?: string })?.message}
                </p>
              )}
            </div>
          )}

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="field-description" className="text-gray-700 dark:text-gray-200">
              {t('contact_form.description_optional')}
            </Label>
            <ModernTextarea
              id="field-description"
              {...form.register("description")}
              placeholder={t('contact_form.description_placeholder')}
              variant="glass"
              className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              disabled={isSubmitting}
            />
          </div>

          {/* Required Field */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="field-required"
              {...form.register("required")}
              className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              disabled={isSubmitting}
            />
            <Label htmlFor="field-required" className="text-gray-700 dark:text-gray-200">
              {t('contact_form.required_field')}
            </Label>
          </div>

          {/* Form Actions */}
          <ModernCardFooter className="flex justify-end gap-4 p-0 pt-4">
            <CancelButton onClick={onCancel} disabled={isSubmitting} />
            <GlassButton
              type="submit"
              variant="glass"
              className="px-4 py-2 rounded-lg font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting && <LoadingSpinner size={16} className="me-2" />}
              {isSubmitting 
                ? (initialData 
                    ? t('contact_form.editing') 
                    : t('contact_form.adding'))
                : (initialData 
                    ? t('common.save') 
                    : t('common.create'))}
            </GlassButton>
          </ModernCardFooter>
        </form>
      </ModernCardContent>
    </ModernCard>
  );
};

export default CustomFieldForm;