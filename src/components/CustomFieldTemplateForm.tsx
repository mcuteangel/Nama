import React, { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/label';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernTextarea } from '@/components/ui/modern-textarea';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { Plus, X } from 'lucide-react';
import { CustomFieldTemplateService } from '@/services/custom-field-template-service'; // Updated import
import { useErrorHandler } from '@/hooks/use-error-handler';
import { ErrorManager } from '@/lib/error-manager';
import {
  customFieldTemplateSchema,
  type CreateCustomFieldTemplateInput,
  type CustomFieldTemplate,
} from '@/domain/schemas/custom-field-template';
import { useSession } from '@/integrations/supabase/auth';
import { useNavigate } from 'react-router-dom';
import CancelButton from './common/CancelButton';
import LoadingSpinner from './common/LoadingSpinner';
import { t } from 'i18next';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent, ModernCardFooter } from '@/components/ui/modern-card';
import { ModernButton } from '@/components/ui/modern-button';

type TemplateType = 'text' | 'number' | 'date' | 'list';

interface CustomFieldTemplateFormProps {
  initialData?: CustomFieldTemplate;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CustomFieldTemplateForm: React.FC<CustomFieldTemplateFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const { session } = useSession();
  const navigate = useNavigate();

  const onSuccessCallback = useCallback(() => {
    console.log("CustomFieldTemplateForm: useErrorHandler onSuccess triggered.");
    ErrorManager.notifyUser(initialData ? t('system_messages.template_edit_success') : t('system_messages.template_create_success'), 'success');
    onSuccess?.();
  }, [initialData, onSuccess]);

  const onErrorCallback = useCallback((err: Error) => {
    console.error("CustomFieldTemplateForm: useErrorHandler onError triggered.", err);
    ErrorManager.logError(err, {
      component: "CustomFieldTemplateForm",
      action: initialData ? "updateTemplate" : "addTemplate",
    });
  }, [initialData]);

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
    customErrorMessage: initialData ? t('errors.edit_template_error') : t('errors.create_template_error'),
    onSuccess: onSuccessCallback,
    onError: onErrorCallback,
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
        options: initialData.type === 'list' ? (initialData.options || []) : undefined,
        description: initialData.description || "",
        required: initialData.required,
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: CreateCustomFieldTemplateInput) => {
    console.log("CustomFieldTemplateForm: onSubmit triggered. Data:", data);
    if (!session?.user) {
      ErrorManager.notifyUser('برای افزودن/ویرایش قالب فیلد سفارشی باید وارد شوید.', 'error');
      navigate('/login');
      return;
    }

    await executeAsync(async () => {
      console.log("CustomFieldTemplateForm: Executing async Supabase operation.");
      let res;
      if (initialData) {
        res = await CustomFieldTemplateService.updateCustomFieldTemplate(initialData.id, { // Updated service call
          name: data.name.trim(),
          type: data.type,
          options: data.type === 'list' ? (data.options || []).filter(Boolean) : undefined,
          description: data.description?.trim() || "",
          required: !!data.required,
        });
      } else {
        res = await CustomFieldTemplateService.addCustomFieldTemplate({ // Updated service call
          name: data.name.trim(),
          type: data.type,
          options: data.type === 'list' ? (data.options || []).filter(Boolean) : undefined,
          description: data.description?.trim() || "",
          required: !!data.required,
        });
      }

      if (res.error) {
        console.error("CustomFieldTemplateForm: Supabase service call returned error:", res.error);
        throw new Error(res.error);
      }
      console.log("CustomFieldTemplateForm: Supabase service call successful. Result:", res.data);
      return res.data;
    });
  };

  const addOption = () => {
    const current = form.getValues("options") || [];
    form.setValue("options", [...current, ""], { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  };

  const removeOption = (index: number) => {
    const current = (form.getValues("options") || []).filter((_, i) => i !== index);
    form.setValue("options", current, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  };

  const setOptionAt = (index: number, value: string) => {
    const current = [...(form.getValues("options") || [])];
    current[index] = value;
    form.setValue("options", current, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  };

  return (
    <ModernCard variant="glass" className="w-full max-w-md rounded-xl p-6">
      <ModernCardHeader className="text-center">
        <ModernCardTitle className="text-2xl font-bold">
          {initialData ? "ویرایش قالب فیلد سفارشی" : "افزودن قالب فیلد سفارشی جدید"}
        </ModernCardTitle>
        {error && (
          <div className="text-sm text-destructive flex items-center justify-center gap-2 mt-2">
            <span>{errorMessage}</span>
            {retryCount > 0 && (
              <ModernButton
                variant="glass"
                size="sm"
                onClick={retryLastOperation}
                disabled={isSubmitting}
                className="text-destructive hover:bg-destructive/10"
              >
                تلاش مجدد ({retryCount} از ۳)
              </ModernButton>
            )}
          </div>
        )}
      </ModernCardHeader>
      <ModernCardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="field-name" className="text-gray-700 dark:text-gray-200">نام فیلد</Label>
            <ModernInput
              id="field-name"
              {...form.register("name")}
              placeholder="مثال: تاریخ تولد"
              variant="glass"
              className="mt-1 block w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              disabled={isSubmitting}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500 font-medium mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="field-type" className="text-gray-700 dark:text-gray-200">نوع فیلد</Label>
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
                <ModernSelectValue placeholder="انتخاب نوع" />
              </ModernSelectTrigger>
              <ModernSelectContent variant="glass">
                <ModernSelectItem value="text">متن</ModernSelectItem>
                <ModernSelectItem value="number">عدد</ModernSelectItem>
                <ModernSelectItem value="date">تاریخ</ModernSelectItem>
                <ModernSelectItem value="list">لیست</ModernSelectItem>
              </ModernSelectContent>
            </ModernSelect>
            {form.formState.errors.type && (
              <p className="text-sm text-red-500 font-medium mt-1">{form.formState.errors.type.message}</p>
            )}
          </div>

          {(values.type === 'list') && (
            <div className="flex flex-col gap-2">
              <Label className="text-gray-700 dark:text-gray-200">گزینه‌های لیست</Label>
              {(values.options || []).map((option, index) => (
                <div key={index} className="flex gap-2">
                  <ModernInput
                    value={option}
                    onChange={(e) => setOptionAt(index, e.target.value)}
                    placeholder="گزینه"
                    variant="glass"
                    className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    disabled={isSubmitting}
                  />
                  <ModernButton
                    type="button"
                    variant="glass"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="text-red-500 hover:bg-red-100 dark:hover:bg-gray-700/50"
                    disabled={isSubmitting}
                  >
                    <X size={16} />
                  </ModernButton>
                </div>
              ))}
              <ModernButton type="button" variant="glass" size="sm" onClick={addOption}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-medium"
                disabled={isSubmitting}
              >
                <Plus size={16} className="me-2" /> افزودن گزینه
              </ModernButton>
              {form.formState.errors.options && (
                <p className="text-sm text-red-500 font-medium mt-1">{(form.formState.errors.options as { message?: string })?.message}</p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="field-description" className="text-gray-700 dark:text-gray-200">توضیحات (اختیاری)</Label>
            <ModernTextarea
              id="field-description"
              {...form.register("description")}
              placeholder="توضیحات درباره این فیلد"
              variant="glass"
              className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="field-required"
              {...form.register("required")}
              className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              disabled={isSubmitting}
            />
            <Label htmlFor="field-required" className="text-gray-700 dark:text-gray-200">فیلد الزامی</Label>
          </div>

          <ModernCardFooter className="flex justify-end gap-4 p-0 pt-4">
            <CancelButton onClick={onCancel} disabled={isSubmitting} />
            <ModernButton
              type="submit"
              variant="glass"
              className="px-4 py-2 rounded-lg font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting && <LoadingSpinner size={16} className="me-2" />}
              {isSubmitting ? (initialData ? "در حال ویرایش..." : "در حال افزودن...") : (initialData ? "ویرایش" : "افزودن")}
            </ModernButton>
          </ModernCardFooter>
        </form>
      </ModernCardContent>
    </ModernCard>
  );
};

export default CustomFieldTemplateForm;