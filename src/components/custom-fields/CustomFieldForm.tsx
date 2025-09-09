import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Plus, X, Sparkles, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
import useAppSettings from '@/hooks/use-app-settings';

type TemplateType = 'text' | 'number' | 'date' | 'list';

interface CustomFieldFormProps {
  initialData?: CustomFieldTemplate;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CustomFieldForm: React.FC<CustomFieldFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const { t, i18n } = useTranslation();
  const { session } = useSession();
  const navigate = useNavigate();
  const { settings } = useAppSettings();

  // Determine if we're in RTL mode
  const isRTL = useMemo(() => settings.language === 'fa', [settings.language]);

  // Determine theme
  const isDarkMode = useMemo(() => {
    if (settings.theme === 'dark') return true;
    if (settings.theme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, [settings.theme]);

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
  const { errors, isValid, isDirty } = form.formState;

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

  const getFieldIcon = (type: TemplateType) => {
    switch (type) {
      case 'text': return '📝';
      case 'number': return '🔢';
      case 'date': return '📅';
      case 'list': return '📋';
      default: return '🎯';
    }
  };

  const getFieldColor = (type: TemplateType) => {
    switch (type) {
      case 'text': return 'text-blue-500';
      case 'number': return 'text-green-500';
      case 'date': return 'text-purple-500';
      case 'list': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto"
    >
      <ModernCard
        variant="glass"
        className={`w-full rounded-3xl overflow-hidden ${
          isDarkMode
            ? 'bg-gradient-to-br from-gray-900/95 via-slate-900/95 to-gray-900/95'
            : 'bg-gradient-to-br from-white/95 via-blue-50/50 to-purple-50/50'
        } backdrop-blur-2xl border border-white/30 dark:border-gray-700/30 shadow-2xl`}
      >
        <ModernCardHeader className="text-center p-6 sm:p-8 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            <ModernCardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {initialData
                ? t('custom_field_template.edit_title')
                : t('custom_field_template.add_title')}
            </ModernCardTitle>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
              {initialData
                ? 'ویرایش فیلد سفارشی موجود'
                : 'ایجاد فیلد سفارشی جدید برای مخاطبین'}
            </p>
          </motion.div>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                      {errorMessage}
                    </p>
                    {retryCount > 0 && (
                      <GlassButton
                        variant="ghost"
                        size="sm"
                        onClick={retryLastOperation}
                        disabled={isSubmitting}
                        className="mt-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        تلاش مجدد ({retryCount})
                      </GlassButton>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </ModernCardHeader>

        <ModernCardContent className="p-6 sm:p-8">
          <motion.form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Field Name */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Label htmlFor="field-name" className="text-gray-700 dark:text-gray-200 font-semibold flex items-center gap-2">
                <span className="text-lg">🏷️</span>
                {t('contact_form.field_name')}
              </Label>
              <div className="relative">
                <ModernInput
                  id="field-name"
                  {...form.register("name")}
                  placeholder={t('contact_form.field_name_placeholder')}
                  variant="glass"
                  className={`text-base rounded-xl border-2 transition-all duration-300 ${
                    errors.name
                      ? 'border-red-300 focus:border-red-500 bg-red-50/50 dark:bg-red-900/10'
                      : isDirty && form.getValues("name")
                      ? 'border-green-300 focus:border-green-500 bg-green-50/50 dark:bg-green-900/10'
                      : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'
                  } bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl`}
                  disabled={isSubmitting}
                />
                <AnimatePresence>
                  {form.getValues("name") && !errors.name && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <AnimatePresence>
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-red-500 font-medium flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.name.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Field Type */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Label htmlFor="field-type" className="text-gray-700 dark:text-gray-200 font-semibold flex items-center gap-2">
                <span className="text-lg">🎯</span>
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
                <ModernSelectTrigger
                  variant="glass"
                  className="w-full py-4 text-base rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getFieldIcon(values.type || "text")}</span>
                    <ModernSelectValue placeholder={t('contact_form.select_field_type')} />
                  </div>
                </ModernSelectTrigger>
                <ModernSelectContent
                  variant="glass"
                  className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl"
                >
                  {[
                    { value: 'text', label: t('contact_form.text'), icon: '📝', desc: 'متن ساده' },
                    { value: 'number', label: t('contact_form.number'), icon: '🔢', desc: 'عدد' },
                    { value: 'date', label: t('contact_form.date'), icon: '📅', desc: 'تاریخ' },
                    { value: 'list', label: t('contact_form.list'), icon: '📋', desc: 'لیست گزینه‌ها' }
                  ].map((option) => (
                    <ModernSelectItem
                      key={option.value}
                      value={option.value}
                      className="py-4 px-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{option.icon}</span>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{option.desc}</div>
                        </div>
                      </div>
                    </ModernSelectItem>
                  ))}
                </ModernSelectContent>
              </ModernSelect>
              <AnimatePresence>
                {errors.type && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-red-500 font-medium flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.type.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* List Options */}
            <AnimatePresence>
              {values.type === 'list' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 p-4 bg-gradient-to-r from-orange-50/50 to-yellow-50/50 dark:from-orange-900/10 dark:to-yellow-900/10 rounded-xl border border-orange-200 dark:border-orange-800"
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-orange-500" />
                    <Label className="text-gray-700 dark:text-gray-200 font-semibold">
                      {t('contact_form.list_options')}
                    </Label>
                  </div>

                  <div className="space-y-3">
                    <AnimatePresence>
                      {(values.options || []).map((option, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2, delay: index * 0.1 }}
                          className="flex gap-3"
                        >
                          <div className="flex-1">
                            <ModernInput
                              value={option}
                              onChange={(e) => setOptionAt(index, e.target.value)}
                              placeholder={`${t('contact_form.option_placeholder')} ${index + 1}`}
                              variant="glass"
                              className="bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg"
                              disabled={isSubmitting}
                            />
                          </div>
                          <GlassButton
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(index)}
                            className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 p-2"
                            disabled={isSubmitting}
                          >
                            <X size={18} />
                          </GlassButton>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <GlassButton
                      type="button"
                      variant="glass"
                      size="sm"
                      onClick={addOption}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={isSubmitting}
                    >
                      <Plus size={18} />
                      {t('contact_form.add_option')}
                    </GlassButton>
                  </motion.div>

                  <AnimatePresence>
                    {errors.options && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-red-500 font-medium flex items-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.options.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Description */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Label htmlFor="field-description" className="text-gray-700 dark:text-gray-200 font-semibold flex items-center gap-2">
                <span className="text-lg">📝</span>
                {t('contact_form.description_optional')}
              </Label>
              <ModernTextarea
                id="field-description"
                {...form.register("description")}
                placeholder={t('contact_form.description_placeholder')}
                variant="glass"
                className="text-base rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl resize-none"
                rows={3}
                disabled={isSubmitting}
              />
            </motion.div>

            {/* Required Field */}
            <motion.div
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800/50 dark:to-blue-900/20 rounded-xl border border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <input
                type="checkbox"
                id="field-required"
                {...form.register("required")}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                disabled={isSubmitting}
              />
              <Label htmlFor="field-required" className="text-gray-700 dark:text-gray-200 font-medium cursor-pointer flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                {t('contact_form.required_field')}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  (اختیاری)
                </span>
              </Label>
            </motion.div>
          </motion.form>
        </ModernCardContent>

        <ModernCardFooter className="flex justify-end gap-4 p-6 sm:p-8 bg-gradient-to-r from-gray-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-blue-900/20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <CancelButton onClick={onCancel} disabled={isSubmitting} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <GlassButton
              type="submit"
              variant="glass"
              onClick={form.handleSubmit(onSubmit)}
              className={`px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-500 ${
                isValid && isDirty
                  ? 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white hover:scale-105'
                  : 'bg-gradient-to-r from-gray-400 to-gray-500 text-gray-200 cursor-not-allowed'
              }`}
              disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <LoadingSpinner size={20} />
                  {isSubmitting
                    ? (initialData
                        ? t('contact_form.editing')
                        : t('contact_form.adding'))
                    : (initialData
                        ? t('common.save')
                        : t('common.create'))}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5" />
                  {initialData
                    ? t('common.save')
                    : t('common.create')}
                </div>
              )}
            </GlassButton>
          </motion.div>
        </ModernCardFooter>
      </ModernCard>
    </motion.div>
  );
};

export default CustomFieldForm;