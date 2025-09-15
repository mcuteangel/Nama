import React, { useEffect, useMemo, useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { GlassButton } from "@/components/ui/glass-button";
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Plus, X, Phone, UserCheck, AlertCircle } from 'lucide-react';
import { ContactFormValues } from '@/types/contact';
import { useTranslation } from 'react-i18next';

const ContactPhoneNumbers: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const form = useFormContext<ContactFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "phoneNumbers",
  });
  const [focusedFields, setFocusedFields] = useState<{ [key: string]: string | false }>({});

  // Ensure at least one phone number field exists by default
  useEffect(() => {
    if (fields.length === 0) {
      append({ phone_type: "mobile", phone_number: "", extension: null });
    }
  }, [fields.length, append]);

  // Memoize phone type options to prevent unnecessary re-renders
  const phoneTypeOptions = useMemo(() => [
    { value: "mobile", label: t('phone_type.mobile') },
    { value: "home", label: t('phone_type.home') },
    { value: "work", label: t('phone_type.work') },
    { value: "fax", label: t('phone_type.fax') },
    { value: "other", label: t('phone_type.other') },
  ], [t]);

  const handleFieldFocus = (fieldId: string, fieldName: string) => {
    setFocusedFields(prev => ({ ...prev, [fieldId]: fieldName }));
  };

  const handleFieldBlur = (fieldId: string) => {
    setFocusedFields(prev => ({ ...prev, [fieldId]: false }));
  };

  return (
    <div className="space-y-4 pt-4 border-t border-border/30">
      {/* Compact Header */}
      <div className="flex flex-row justify-between items-center gap-2 p-2.5 rounded-lg bg-muted/30 dark:bg-muted/10 border border-border/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/90 to-primary/70 flex items-center justify-center shadow-sm">
            <Phone size={16} className="text-white" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            {t('section_titles.phone_numbers')}
          </h3>
        </div>
        <GlassButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => append({ phone_type: "mobile", phone_number: "", extension: null })}
          className="h-8 px-3 text-xs font-medium rounded-md hover:bg-accent/50 transition-colors"
        >
          <Plus size={16} className="me-1.5" />
          {t('button_labels.add_phone_number')}
        </GlassButton>
      </div>
      
      {/* Phone Numbers Container */}
      <div className="space-y-3">
        {fields.map((item, index) => {
          const fieldId = item.id;
          const isPhoneNumberField = focusedFields[fieldId] === 'phone_number';
          const isTypeField = focusedFields[fieldId] === 'phone_type';
          const isExtensionField = focusedFields[fieldId] === 'extension';
          
          return (
            <div key={item.id} className="group/phone-item p-3 rounded-lg bg-muted/10 dark:bg-muted/10 border border-border/20 hover:border-primary/40 transition-colors duration-200">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                {/* Phone Type */}
                <div className="md:col-span-4">
                  <FormField
                    control={form.control}
                    name={`phoneNumbers.${index}.phone_type`}
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className={`
                              w-8 h-8 rounded-lg flex items-center justify-center
                              bg-gradient-to-br from-secondary-100/80 to-secondary-50/80 dark:from-secondary-900/30 dark:to-secondary-800/20
                              border border-secondary-200/50 dark:border-secondary-800/50
                              transition-all duration-300
                              ${isTypeField ? 'scale-105 shadow-lg shadow-secondary-500/20' : ''}
                            `}>
                              <Phone size={16} className="text-secondary-600 dark:text-secondary-400" />
                            </div>
                            <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {t('form_labels.phone_type')}
                            </FormLabel>
                          </div>

                          <div className="relative">
                            <FormControl>
                              <ModernSelect onValueChange={field.onChange} value={field.value}>
                                <ModernSelectTrigger
                                  variant="glass"
                                  className={`
                                    w-full px-4 py-3 text-sm rounded-xl
                                    border-2 bg-white/50 dark:bg-gray-700/50
                                    backdrop-blur-sm
                                    transition-all duration-300 ease-out
                                    focus:ring-3 focus:ring-secondary-500/30 focus:border-secondary-400
                                    hover:bg-white/70 dark:hover:bg-gray-600/70
                                    hover:shadow-md hover:shadow-secondary-500/20
                                    ${fieldState.error ? 'border-error-400 focus:ring-error-500/30' : 'border-white/40 dark:border-gray-600/40'}
                                    ${isTypeField ? 'scale-[1.01] shadow-lg' : ''}
                                    ${field.value && !fieldState.error ? 'border-success-400' : ''}
                                  `}
                                  onFocus={() => handleFieldFocus(fieldId, 'phone_type')}
                                  onBlur={() => handleFieldBlur(fieldId)}
                                >
                                  <ModernSelectValue placeholder={t('form_placeholders.select_type')} />
                                </ModernSelectTrigger>
                                <ModernSelectContent variant="glass" className="bg-white/90 dark:bg-gray-800/90 border border-white/30 dark:border-gray-600/30 rounded-xl mt-1">
                                  {phoneTypeOptions.map(option => (
                                    <ModernSelectItem key={option.value} value={option.value} className="hover:bg-white/30 dark:hover:bg-gray-700/40 px-3 py-2 rounded-lg">
                                      {option.label}
                                    </ModernSelectItem>
                                  ))}
                                </ModernSelectContent>
                              </ModernSelect>
                            </FormControl>
                          </div>

                          {fieldState.error && (
                            <p className="text-xs text-error-500 dark:text-error-400 flex items-center gap-1 mt-1">
                              <AlertCircle size={12} />
                              {fieldState.error.message}
                            </p>
                          )}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Phone Number */}
                <div className="md:col-span-5">
                  <FormField
                    control={form.control}
                    name={`phoneNumbers.${index}.phone_number`}
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className={`
                              w-8 h-8 rounded-lg flex items-center justify-center
                              bg-gradient-to-br from-primary-100/80 to-primary-50/80 dark:from-primary-900/30 dark:to-primary-800/20
                              border border-primary-200/50 dark:border-primary-800/50
                              transition-all duration-300
                              ${isPhoneNumberField ? 'scale-105 shadow-lg shadow-primary-500/20' : ''}
                            `}>
                              <Phone size={16} className="text-primary-600 dark:text-primary-400" />
                            </div>
                            <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {t('form_labels.phone_number')}
                            </FormLabel>
                          </div>

                          <div className="relative">
                            <FormControl>
                              <ModernInput
                                placeholder={t('form_placeholders.phone_example')}
                                variant="glass"
                                className={`
                                  w-full px-4 py-3 text-sm rounded-xl
                                  border-2 bg-white/50 dark:bg-gray-700/50
                                  backdrop-blur-sm
                                  transition-all duration-300 ease-out
                                  focus:ring-3 focus:ring-primary-500/30 focus:border-primary-400
                                  hover:bg-white/70 dark:hover:bg-gray-600/70
                                  hover:shadow-md hover:shadow-primary-500/20
                                  ${fieldState.error ? 'border-error-400 focus:ring-error-500/30' : 'border-white/40 dark:border-gray-600/40'}
                                  ${isPhoneNumberField ? 'scale-[1.01] shadow-lg' : ''}
                                  ${field.value && !fieldState.error ? 'border-success-400' : ''}
                                `}
                                {...field}
                                onFocus={() => handleFieldFocus(fieldId, 'phone_number')}
                                onBlur={() => handleFieldBlur(fieldId)}
                              />
                            </FormControl>

                            {field.value && !fieldState.error && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <UserCheck size={16} className="text-success-500 animate-pulse" />
                              </div>
                            )}

                            {fieldState.error && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <AlertCircle size={16} className="text-error-500" />
                              </div>
                            )}
                          </div>

                          {fieldState.error && (
                            <p className="text-xs text-error-500 dark:text-error-400 flex items-center gap-1 mt-1">
                              <AlertCircle size={12} />
                              {fieldState.error.message}
                            </p>
                          )}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Extension */}
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name={`phoneNumbers.${index}.extension`}
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className={`
                              w-8 h-8 rounded-lg flex items-center justify-center
                              bg-gradient-to-br from-info-100/80 to-info-50/80 dark:from-info-900/30 dark:to-info-800/20
                              border border-info-200/50 dark:border-info-800/50
                              transition-all duration-300
                              ${isExtensionField ? 'scale-105 shadow-lg shadow-info-500/20' : ''}
                            `}>
                              <Phone size={16} className="text-info-600 dark:text-info-400" />
                            </div>
                            <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                              {t('form_labels.extension_optional')}
                            </FormLabel>
                          </div>

                          <div className="relative">
                            <FormControl>
                              <ModernInput
                                placeholder={t('form_placeholders.extension_example')}
                                variant="glass"
                                className={`
                                  w-full px-4 py-3 text-sm rounded-xl
                                  border-2 bg-white/50 dark:bg-gray-700/50
                                  backdrop-blur-sm
                                  transition-all duration-300 ease-out
                                  focus:ring-3 focus:ring-green-500/30 focus:border-green-400
                                  hover:bg-white/70 dark:hover:bg-gray-600/70
                                  hover:shadow-md hover:shadow-green-500/20
                                  ${fieldState.error ? 'border-error-400 focus:ring-error-500/30' : 'border-white/40 dark:border-gray-600/40'}
                                  ${isExtensionField ? 'scale-[1.01] shadow-lg' : ''}
                                  ${field.value && !fieldState.error ? 'border-success-400' : ''}
                                `}
                                {...field}
                                value={field.value || ''}
                                onFocus={() => handleFieldFocus(fieldId, 'extension')}
                                onBlur={() => handleFieldBlur(fieldId)}
                              />
                            </FormControl>

                            {field.value && !fieldState.error && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <UserCheck size={16} className="text-success-500 animate-pulse" />
                              </div>
                            )}

                            {fieldState.error && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <AlertCircle size={16} className="text-error-500" />
                              </div>
                            )}
                          </div>

                          {fieldState.error && (
                            <p className="text-xs text-error-500 dark:text-error-400 flex items-center gap-1 mt-1">
                              <AlertCircle size={12} />
                              {fieldState.error.message}
                            </p>
                          )}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Remove Button */}
                <div className="md:col-span-1 flex justify-center items-end">
                  <GlassButton
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="text-error-500 hover:bg-error-100/30 dark:hover:bg-error-900/20 h-10 w-10 rounded-full transition-all duration-300 hover:scale-110 group-hover/phone-item:scale-110"
                    aria-label={t('accessibility.remove_phone_number', 'Remove phone number')}
                  >
                    <X size={16} className="transition-transform duration-200 group-hover/phone-item:rotate-90" />
                  </GlassButton>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

ContactPhoneNumbers.displayName = 'ContactPhoneNumbers';

export default ContactPhoneNumbers;