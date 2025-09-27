import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, Sparkles, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppSettings from '@/hooks/use-app-settings';
import { ModernCard, ModernCardContent, ModernCardFooter, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { Label } from '@/components/ui/label';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernTextarea } from '@/components/ui/modern-textarea';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { GlassButton } from '@/components/ui/glass-button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import CancelButton from '@/components/common/CancelButton';

// Types
type TemplateType = 'text' | 'number' | 'date' | 'list';

interface CustomFieldFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: {
    name: string;
    type: TemplateType;
    description?: string;
    options?: string[];
  };
}

interface FormData {
  name: string;
  type: TemplateType;
  description: string;
  options?: string[];
  required?: boolean;
}

const CustomFieldForm: React.FC<CustomFieldFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const { settings } = useAppSettings();
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || '',
    type: initialData?.type || 'text',
    description: initialData?.description || '',
    options: initialData?.options || [],
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // UI state
  const isDarkMode = useMemo(() => {
    if (settings.theme === 'dark') return true;
    if (settings.theme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, [settings.theme]);

  // Helper functions
  const getFieldIcon = (type: TemplateType) => {
    switch (type) {
      case 'text': return '📝';
      case 'number': return '🔢';
      case 'date': return '📅';
      case 'list': return '📋';
      default: return '🎯';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (!isDirty) setIsDirty(true);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    // Basic validation
    if (!formData.name.trim()) {
      setError('name_required');
      return false;
    }

    if (formData.type === 'list' && formData.options?.some(opt => !opt.trim())) {
      setError('option_required');
      return false;
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
      // Prepare the data to be sent to the API
      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim() || undefined,
        options: formData.type === 'list' ? formData.options?.map(opt => opt.trim()) : undefined
      };
      
      console.log('Submitting form:', payload);
      
      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call the success callback if provided
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
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
                <span className="text-lg">🏷️</span>
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
                <span className="text-lg">🎯</span>
                {t('contact_form.field_type')}
              </Label>
              <ModernSelect
                value={formData.type || "text"}
                onValueChange={(value) => {
                  const newType = value as TemplateType;
                  setFormData(prev => ({
                    ...prev,
                    type: newType,
                    options: newType === 'list' ? (prev.options || ['']) : undefined
                  }));
                }}
                disabled={isSubmitting}
              >
                <ModernSelectTrigger
                  variant="glass"
                  className="w-full py-4 text-base rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getFieldIcon(formData.type || "text")}</span>
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

            {/* List Options */}
            <AnimatePresence>
              {formData.type === 'list' && (
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
                      {t('custom_field_management.list_options')}
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
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
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
                <span className="text-lg">📝</span>
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