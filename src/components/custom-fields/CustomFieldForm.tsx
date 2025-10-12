import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Tag,
  Type,
  Calendar,
  Eye,
  AlertTriangle,
  TextCursorInput,
  ListChecks,
  CheckSquare,
  Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppSettings from '@/hooks/use-app-settings';
import { ModernCard, ModernCardContent, ModernCardFooter, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { useSession } from '@/integrations/supabase/auth';
import { Label } from '@/components/ui/label';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernTextarea } from '@/components/ui/modern-textarea';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { GlassButton } from '@/components/ui/glass-button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import CancelButton from '@/components/common/CancelButton';
import { Card, CardContent } from '@/components/ui/card';
import { CustomFieldTemplateService } from '@/services/custom-field-template-service';

// Types
type TemplateType = 'text' | 'number' | 'date' | 'list' | 'checklist';

interface CustomFieldFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: {
    id?: string;
    name: string;
    type: TemplateType;
    description?: string;
    options?: string[];
    required?: boolean;
  };
}

interface FormData {
  name: string;
  type: TemplateType;
  description: string;
  options?: string[];
  required?: boolean;
}

// کلید ذخیره پیش‌نویس در localStorage
const DRAFT_KEY = 'custom_field_draft';

const CustomFieldForm: React.FC<CustomFieldFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const { settings } = useAppSettings();
  const { session } = useSession();
  
  // Form state
  const [formData, setFormData] = useState<FormData>(() => {
    // بازیابی پیش‌نویس ذخیره شده یا استفاده از داده‌های اولیه
    if (initialData) return {
      name: initialData.name,
      type: initialData.type,
      description: initialData.description || '',
      options: initialData.options || [],
      required: false
    };
    
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      return savedDraft ? JSON.parse(savedDraft) : {
        name: '',
        type: 'text',
        description: '',
        options: [],
        required: false
      };
    } catch (e) {
      return {
        name: '',
        type: 'text',
        description: '',
        options: [],
        required: false
      };
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  
  // ذخیره خودکار تغییرات فرم
  React.useEffect(() => {
    if (initialData) return; // اگر در حال ویرایش هستیم، پیش‌نویس ذخیره نمی‌شود
    
    const timer = setTimeout(() => {
      if (isDirty) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      }
    }, 1000); // تاخیر برای جلوگیری از ذخیره‌های مکرر
    
    return () => clearTimeout(timer);
  }, [formData, isDirty, initialData]);
  
  // پاک کردن پیش‌نویس پس از ارسال موفق فرم
  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
  };

  // UI state
  const isDarkMode = useMemo(() => {
    if (settings.theme === 'dark') return true;
    if (settings.theme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, [settings.theme]);

  // Helper functions
  const getFieldIcon = (type: TemplateType) => {
    switch (type) {
      case 'text': return <Type className="w-5 h-5" />;
      case 'number': return <Hash className="w-5 h-5" />;
      case 'date': return <Calendar className="w-5 h-5" />;
      case 'list': return <ListChecks className="w-5 h-5" />;
      case 'checklist': return <CheckSquare className="w-5 h-5" />;
      default: return <TextCursorInput className="w-5 h-5" />;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log(`handleInputChange: ${name} changed to:`, value);
    if (!isDirty) setIsDirty(true);
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [name]: value
      };
      console.log('Updated formData:', newFormData);
      return newFormData;
    });
  };


  const handleOptionChange = (index: number, value: string) => {
    if (!formData.options) return;
    if (!isDirty) setIsDirty(true);
    
    const newOptions = [...formData.options];
    newOptions[index] = value;
    
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addOption = () => {
    if (!isDirty) setIsDirty(true);
    setFormData(prev => ({
      ...prev,
      options: [...(prev.options || []), '']
    }));
  };

  const removeOption = (index: number) => {
    if (!formData.options || formData.options.length <= 1) return;
    if (!isDirty) setIsDirty(true);
    
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const validateForm = (): boolean => {
    // اعتبارسنجی نام
    if (!formData.name.trim()) {
      setError('name_required');
      return false;
    }

    // اعتبارسنجی فرمت نام (فقط حروف، اعداد و آندرلاین)
    const nameRegex = /^[a-zA-Z0-9_\u0600-\u06FF\s]+$/;
    if (!nameRegex.test(formData.name)) {
      setError('name_invalid_format');
      return false;
    }

    // اعتبارسنجی گزینه‌های لیست و چک‌لیست
    if (formData.type === 'list' || formData.type === 'checklist') {
      if (!formData.options || formData.options.length === 0) {
        setError('at_least_one_option');
        return false;
      }
      
      if (formData.options.some(opt => !opt.trim())) {
        setError('option_required');
        return false;
      }

      // بررسی تکراری نبودن گزینه‌ها
      const uniqueOptions = new Set(formData.options.map(opt => opt.trim().toLowerCase()));
      if (uniqueOptions.size !== formData.options.length) {
        setError('duplicate_options');
        return false;
      }
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Check if user is authenticated
      if (!session?.user) {
        console.error('User not authenticated');
        setError('auth_required');
        return;
      }

      // Prepare the data to be sent to the API
      console.log('FormData before payload creation:', formData);
      console.log('formData.description:', formData.description);
      console.log('formData.description.trim():', formData.description?.trim());

      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description?.trim() || undefined,
        options: (formData.type === 'list' || formData.type === 'checklist') ? formData.options?.filter(opt => opt.trim()).map(opt => opt.trim()) : undefined,
        required: formData.required || false,
      };

      console.log('Final payload:', payload);
      console.log('Submitting form:', payload);

      // Call the actual service
      let res;
      if (initialData && initialData.id) {
        console.log('Updating existing template');
        res = await CustomFieldTemplateService.updateCustomFieldTemplate(initialData.id, payload);
      } else {
        console.log('Creating new template');
        res = await CustomFieldTemplateService.addCustomFieldTemplate(payload);
      }

      if (res.error) {
        console.error('Service call returned error:', res.error);
        setError('submission_error');
        return;
      }

      console.log('Service call successful:', res.data);

      // پاک کردن پیش‌نویس و فراخوانی کالبک موفقیت
      clearDraft();
      if (onSuccess) onSuccess();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('common.errors.generic');
      setError('submission_error');
      console.error('Error saving custom field:', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel button click
  
  // These functions are used in the form but marked as unused by the linter
  
  // Prevent unused variable warnings in development
  // eslint-disable-next-line no-empty
  if (process.env.NODE_ENV !== 'production') {
  }

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
                      {error}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </ModernCardHeader>

        <ModernCardContent className="p-6 sm:p-8">
          <motion.form
            onSubmit={handleSubmit}
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
                <Tag className="w-5 h-5 text-blue-500" />
                {t('custom_field_management.field_name')}
              </Label>
              <div className="relative">
                  <ModernInput
                    id="field-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t('custom_field_management.field_name_placeholder')}
                    variant="glass"
                    className={`text-base rounded-xl border-2 transition-all duration-300 ${
                      error && error.includes('name_required')
                        ? 'border-red-300 focus:border-red-500 bg-red-50/50 dark:bg-red-900/10'
                        : isDirty && formData.name
                        ? 'border-green-300 focus:border-green-500 bg-green-50/50 dark:bg-green-900/10'
                        : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'
                    } bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl`}
                    disabled={isSubmitting}
                  />
                <AnimatePresence>
                  {formData.name && !error && (
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
                {error === 'name_required' && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-red-500 font-medium flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {t('custom_field_management.errors.name_required')}
                  </motion.p>
                )}
                {error === 'submission_error' && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-red-500 font-medium flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {t('common.errors.generic')}
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
                <ListChecks className="w-5 h-5 text-purple-500" />
                {t('contact_form.field_type')}
              </Label>
              <ModernSelect
                value={formData.type || "text"}
                onValueChange={(value) => {
                  const newType = value as TemplateType;
                  setFormData(prev => ({
                    ...prev,
                    type: newType,
                    options: (newType === 'list' || newType === 'checklist') ? (prev.options || ['']) : undefined
                  }));
                }}
                disabled={isSubmitting}
              >
                <ModernSelectTrigger
                  variant="glass"
                  className="w-full py-2.5 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow hover:shadow-md"
                >
                  <div className="w-full px-3 text-right">
                    <span className="truncate block">
                      {formData.type ? t(`contact_form.${formData.type}`) : t('contact_form.select_field_type')}
                    </span>
                  </div>
                </ModernSelectTrigger>
                <ModernSelectContent
                  variant="glass"
                  className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl"
                >
                  {[
                    { value: 'text', label: t('contact_form.text'), icon: getFieldIcon('text'), desc: 'متن ساده' },
                    { value: 'number', label: t('contact_form.number'), icon: getFieldIcon('number'), desc: 'عدد' },
                    { value: 'date', label: t('contact_form.date'), icon: getFieldIcon('date'), desc: 'تاریخ' },
                    { value: 'list', label: t('contact_form.list'), icon: getFieldIcon('list'), desc: 'لیست گزینه‌ها (تک انتخابی)' },
                    { value: 'checklist', label: t('contact_form.checklist'), icon: getFieldIcon('checklist'), desc: 'لیست گزینه‌ها (چند انتخابی)' }
                  ].map((option) => (
                    <ModernSelectItem
                      key={option.value}
                      value={option.value}
                      className="py-4 px-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {option.icon}
                        </div>
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
                {error && error.includes('type_required') && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-red-500 font-medium flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* List/Checklist Options */}
            <AnimatePresence>
              {(formData.type === 'list' || formData.type === 'checklist') && (
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
                      {formData.type === 'list' 
                        ? t('custom_field_management.list_options')
                        : t('custom_field_management.checklist_options')}
                    </Label>
                  </div>

                  <div className="space-y-3">
                    <AnimatePresence>
                      {(formData.options || []).map((option, index) => (
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
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              placeholder={`${t('custom_field_management.option_placeholder')} ${index + 1}`}
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
                            disabled={isSubmitting || (formData.options?.length || 0) <= 1}
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
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-gray-900 shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={isSubmitting}
                    >
                      <Plus size={18} />
                      {t('custom_field_management.add_option')}
                    </GlassButton>
                  </motion.div>

                  <AnimatePresence>
                    {error && error.includes('option_required') && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-red-500 font-medium flex items-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {error}
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
                <Info className="w-5 h-5 text-gray-500" />
                {t('contact_form.description_optional')}
              </Label>
              <ModernTextarea
                id="field-description"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
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
                name="required"
                checked={formData.required || false}
                onChange={(e) => {
                  if (!isDirty) setIsDirty(true);
                  setFormData(prev => ({
                    ...prev,
                    required: e.target.checked
                  }));
                }}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                disabled={isSubmitting}
              />
              <Label htmlFor="field-required" className="text-gray-700 dark:text-gray-200 font-medium cursor-pointer flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                {t('contact_form.required_field')}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  (اختیاری)
                </span>
              </Label>
            </motion.div>

            {/* پیش‌نمایش فیلد */}
            <motion.div
              className="mt-8 space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-semibold">
                <Eye className="w-5 h-5" />
                پیش‌نمایش فیلد
              </div>
              <Card className="bg-white/50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-600">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {formData.name || 'نام فیلد'}
                        {formData.required && <span className="text-red-500 mr-1">*</span>}
                      </Label>
                      
                      {formData.type === 'text' && (
                        <ModernInput
                          placeholder="مقدار را وارد کنید..."
                          variant="glass"
                          className="w-full"
                          disabled
                        />
                      )}
                      
                      {formData.type === 'number' && (
                        <ModernInput
                          type="number"
                          placeholder="عدد وارد کنید..."
                          variant="glass"
                          className="w-full"
                          disabled
                        />
                      )}
                      
                      {formData.type === 'date' && (
                        <ModernInput
                          type="date"
                          variant="glass"
                          className="w-full"
                          disabled
                        />
                      )}
                      
                      {formData.type === 'list' && (
                        <ModernSelect>
                          <ModernSelectTrigger className="w-full">
                            <ModernSelectValue placeholder="انتخاب کنید..." />
                          </ModernSelectTrigger>
                          <ModernSelectContent>
                            {formData.options?.map((option, index) => (
                              <ModernSelectItem key={index} value={option}>
                                {option}
                              </ModernSelectItem>
                            ))}
                          </ModernSelectContent>
                        </ModernSelect>
                      )}
                      
                      {formData.description && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {formData.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.form>
        </ModernCardContent>

        <ModernCardFooter className="flex justify-end gap-4 p-6 sm:p-8 bg-gradient-to-r from-gray-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-blue-900/20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="flex gap-2"
          >
            <GlassButton
              type="button"
              variant="ghost"
              onClick={() => {
                if (confirm('آیا از حذف پیش‌نویس فعلی اطمینان دارید؟')) {
                  clearDraft();
                  setFormData({
                    name: '',
                    type: 'text',
                    description: '',
                    options: [],
                    required: false
                  });
                  setIsDirty(false);
                }
              }}
              disabled={!isDirty || isSubmitting}
              className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
            >
              حذف پیش‌نویس
            </GlassButton>
            <CancelButton 
              onClick={onCancel} 
              disabled={isSubmitting} 
              className="border border-gray-300 dark:border-gray-600"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <GlassButton
              type="submit"
              variant="glass"
              onClick={handleSubmit}
              className={`px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-500 ${
                isDirty && !error
                  ? 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white hover:scale-105'
                  : 'bg-gradient-to-r from-gray-400 to-gray-500 text-gray-200 cursor-not-allowed'
              }`}
              disabled={isSubmitting || !!error}
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

// Animation variants for form items

export default CustomFieldForm;