import React, { useMemo, useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { GlassButton } from "@/components/ui/glass-button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Plus, X, Mail, UserCheck, AlertCircle } from 'lucide-react';
import { ContactFormValues } from '@/types/contact';
import { useTranslation } from 'react-i18next';

const ContactEmailAddresses: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const form = useFormContext<ContactFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "emailAddresses",
  });
  const [focusedFields, setFocusedFields] = useState<{ [key: string]: string | false }>({});

  // Memoize email type options to prevent unnecessary re-renders
  const emailTypeOptions = useMemo(() => [
    { value: "personal", label: t('email_type.personal') },
    { value: "work", label: t('email_type.work') },
    { value: "other", label: t('email_type.other') },
  ], [t]);

  const handleFieldFocus = (fieldId: string, fieldName: string) => {
    setFocusedFields(prev => ({ ...prev, [fieldId]: fieldName }));
  };

  const handleFieldBlur = (fieldId: string) => {
    setFocusedFields(prev => ({ ...prev, [fieldId]: false }));
  };

  return (
    <div className="space-y-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/30 dark:border-green-800/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <Mail size={20} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {t('section_titles.email_addresses')}
          </h3>
        </div>
        <GlassButton
          type="button"
          variant="gradient-sunset"
          effect="lift"
          size="sm"
          onClick={() => append({ email_type: "personal", email_address: "" })}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <Plus size={18} className="me-2" />
          {t('button_labels.add_email_address')}
        </GlassButton>
      </div>
      
      {/* Enhanced Email Addresses Container */}
      <div className="space-y-4">
        {fields.map((item, index) => {
          const fieldId = item.id;
          const isEmailField = focusedFields[fieldId] === 'email_address';
          const isTypeField = focusedFields[fieldId] === 'email_type';
          
          return (
            <div key={item.id} className="group/email-item p-4 rounded-2xl bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-900/30 border-2 border-white/40 dark:border-gray-700/40 backdrop-blur-sm hover:border-green-300/50 dark:hover:border-green-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                {/* Email Type */}
                <div className="md:col-span-4">
                  <FormField
                    control={form.control}
                    name={`emailAddresses.${index}.email_type`}
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className={`
                              w-8 h-8 rounded-lg flex items-center justify-center
                              bg-gradient-to-br from-orange-500/20 to-amber-600/20
                              border border-orange-200/50 dark:border-orange-800/50
                              transition-all duration-300
                              ${isTypeField ? 'scale-110 shadow-lg shadow-orange-500/30' : ''}
                            `}>
                              <Mail size={16} className="text-orange-600 dark:text-orange-400" />
                            </div>
                            <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {t('form_labels.email_type')}
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
                                    focus:ring-3 focus:ring-orange-500/30 focus:border-orange-400
                                    hover:bg-white/70 dark:hover:bg-gray-600/70
                                    hover:shadow-md hover:shadow-orange-500/20
                                    ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : 'border-white/40 dark:border-gray-600/40'}
                                    ${isTypeField ? 'scale-[1.01] shadow-lg' : ''}
                                    ${field.value && !fieldState.error ? 'border-green-400' : ''}
                                  `}
                                  onFocus={() => handleFieldFocus(fieldId, 'email_type')}
                                  onBlur={() => handleFieldBlur(fieldId)}
                                >
                                  <ModernSelectValue placeholder={t('form_placeholders.select_type')} />
                                </ModernSelectTrigger>
                                <ModernSelectContent variant="glass" className="bg-white/90 dark:bg-gray-800/90 border border-white/30 dark:border-gray-600/30 rounded-xl mt-1">
                                  {emailTypeOptions.map(option => (
                                    <ModernSelectItem key={option.value} value={option.value} className="hover:bg-white/30 dark:hover:bg-gray-700/40 px-3 py-2 rounded-lg">
                                      {option.label}
                                    </ModernSelectItem>
                                  ))}
                                </ModernSelectContent>
                              </ModernSelect>
                            </FormControl>
                          </div>

                          {fieldState.error && (
                            <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1 mt-1">
                              <AlertCircle size={12} />
                              {fieldState.error.message}
                            </p>
                          )}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Email Address */}
                <div className="md:col-span-7">
                  <FormField
                    control={form.control}
                    name={`emailAddresses.${index}.email_address`}
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className={`
                              w-8 h-8 rounded-lg flex items-center justify-center
                              bg-gradient-to-br from-green-500/20 to-emerald-600/20
                              border border-green-200/50 dark:border-green-800/50
                              transition-all duration-300
                              ${isEmailField ? 'scale-110 shadow-lg shadow-green-500/30' : ''}
                            `}>
                              <Mail size={16} className="text-green-600 dark:text-green-400" />
                            </div>
                            <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {t('form_labels.email_address')}
                            </FormLabel>
                          </div>

                          <div className="relative">
                            <FormControl>
                              <ModernInput
                                type="email"
                                placeholder={t('form_placeholders.email_example')}
                                variant="glass"
                                className={`
                                  w-full px-4 py-3 text-sm rounded-xl
                                  border-2 bg-white/50 dark:bg-gray-700/50
                                  backdrop-blur-sm
                                  transition-all duration-300 ease-out
                                  focus:ring-3 focus:ring-green-500/30 focus:border-green-400
                                  hover:bg-white/70 dark:hover:bg-gray-600/70
                                  hover:shadow-md hover:shadow-green-500/20
                                  ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : 'border-white/40 dark:border-gray-600/40'}
                                  ${isEmailField ? 'scale-[1.01] shadow-lg' : ''}
                                  ${field.value && !fieldState.error ? 'border-green-400' : ''}
                                `}
                                {...field}
                                onFocus={() => handleFieldFocus(fieldId, 'email_address')}
                                onBlur={() => handleFieldBlur(fieldId)}
                              />
                            </FormControl>

                            {field.value && !fieldState.error && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <UserCheck size={16} className="text-green-500 animate-pulse" />
                              </div>
                            )}

                            {fieldState.error && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <AlertCircle size={16} className="text-red-500" />
                              </div>
                            )}
                          </div>

                          {fieldState.error && (
                            <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1 mt-1">
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
                    className="text-red-500 hover:bg-red-100/30 dark:hover:bg-red-900/20 h-10 w-10 rounded-full transition-all duration-300 hover:scale-110 group-hover/email-item:scale-110"
                    aria-label={t('accessibility.remove_email_address', 'Remove email address')}
                  >
                    <X size={16} className="transition-transform duration-200 group-hover/email-item:rotate-90" />
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

ContactEmailAddresses.displayName = 'ContactEmailAddresses';

export default ContactEmailAddresses;