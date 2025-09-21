import React, { useEffect, useMemo, useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { GlassButton } from "@/components/ui/glass-button";
import { FormField, FormLabel, FormControl } from '@/components/ui/form';
import { Plus, X, Phone, AlertCircle, Smartphone, Home, Briefcase, MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { ContactFormValues } from '@/types/contact';
import { useTranslation } from 'react-i18next';
import { designTokens } from '@/lib/design-tokens';

const ContactPhoneNumbers: React.FC = React.memo(() => {
  const { i18n } = useTranslation();
  const form = useFormContext<ContactFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "phoneNumbers",
  });
  const [focusedFields, setFocusedFields] = useState<{ [key: string]: string | false }>({});

  // Determine text direction based on language
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';

  // Ensure at least one phone number field exists by default
  useEffect(() => {
    if (fields.length === 0) {
      append({ phone_type: "mobile", phone_number: "", extension: null });
    }
  }, [fields.length, append]);

  // Memoize phone type options to prevent unnecessary re-renders
  const phoneTypeOptions = useMemo(() => [
    { value: "mobile", label: "موبایل", icon: Smartphone },
    { value: "home", label: "خانه", icon: Home },
    { value: "work", label: "کار", icon: Briefcase },
    { value: "other", label: "سایر", icon: MoreHorizontal },
  ], []);

  const handleFieldFocus = (fieldId: string, fieldName: string) => {
    setFocusedFields(prev => ({ ...prev, [fieldId]: fieldName }));
  };

  const handleFieldBlur = (fieldId: string) => {
    setFocusedFields(prev => ({ ...prev, [fieldId]: false }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section with New Design */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
           style={{
             background: designTokens.gradients.sunset,
             boxShadow: designTokens.shadows.glass3d
           }}>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-pink-500/20"></div>
        <div className="relative p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
                <Phone size={24} className="sm:w-8 text-white animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2"
                    style={{ fontFamily: designTokens.typography.fonts.primary }}>
                  شماره تلفن‌ها
                </h2>
                <p className="text-white/80 text-sm sm:text-base lg:text-lg">
                  شماره تلفن‌های مخاطب را اضافه کنید
                </p>
              </div>
            </div>

            <GlassButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => append({ phone_type: "mobile", phone_number: "", extension: null })}
              className="bg-white/20 hover:bg-white/30 border border-white/30 text-white hover:text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base"
            >
              <Plus size={18} className="sm:w-5 ml-2" />
              افزودن شماره تلفن
            </GlassButton>
          </div>

          {/* Phone Numbers Container */}
          <div className="space-y-4">
            {fields.map((item, index) => {
              const fieldId = item.id;
              const isPhoneNumberField = focusedFields[fieldId] === 'phone_number';
              const isTypeField = focusedFields[fieldId] === 'phone_type';
              const isExtensionField = focusedFields[fieldId] === 'extension';

              return (
                <div key={item.id} className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-pink-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-300"></div>
                  <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.005] sm:hover:scale-[1.01]">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-end">
                      {/* Phone Type */}
                      <div className="sm:col-span-4">
                        <FormField
                          control={form.control}
                          name={`phoneNumbers.${index}.phone_type`}
                          render={({ field, fieldState }) => (
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="relative">
                                  <div className={`
                                    w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg
                                    bg-gradient-to-br from-orange-500 to-pink-500
                                    transition-all duration-300
                                    ${isTypeField ? 'scale-110 shadow-2xl' : ''}
                                  `}>
                                    {React.createElement(phoneTypeOptions.find(opt => opt.value === field.value)?.icon || Phone, {
                                      size: 16,
                                      className: "sm:w-5 text-white"
                                    })}
                                  </div>
                                  {isTypeField && (
                                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-pink-600 rounded-lg sm:rounded-xl animate-pulse"></div>
                                  )}
                                </div>
                                <FormLabel className="text-base sm:text-lg font-bold text-gray-800 dark:text-white"
                                           style={{ fontFamily: designTokens.typography.fonts.primary }}>
                                  نوع تلفن
                                </FormLabel>
                              </div>

                              <div className="relative">
                                <FormControl>
                                  <ModernSelect onValueChange={field.onChange} value={field.value} dir={isRTL ? 'rtl' : 'ltr'}>
                                    <ModernSelectTrigger
                                      variant="glass"
                                      className={`
                                        w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl
                                        bg-white/80 dark:bg-gray-700/80
                                        border-2 border-white/30 dark:border-gray-600/30
                                        backdrop-blur-md
                                        transition-all duration-300 ease-out
                                        focus:ring-4 focus:ring-orange-500/30 focus:border-orange-400
                                        hover:bg-white/95 dark:hover:bg-gray-600/95
                                        hover:shadow-xl hover:shadow-orange-500/20
                                        hover:scale-[1.005] sm:hover:scale-[1.01]
                                        ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : ''}
                                        ${isTypeField ? 'scale-105 shadow-2xl ring-4 ring-orange-500/20' : ''}
                                        ${field.value && !fieldState.error ? 'border-green-400 shadow-green-500/20' : ''}
                                      `}
                                      style={{
                                        fontFamily: designTokens.typography.fonts.secondary,
                                        fontSize: '16px', // Prevents zoom on iOS
                                        direction: isRTL ? 'rtl' : 'ltr'
                                      }}
                                      onFocus={() => handleFieldFocus(fieldId, 'phone_type')}
                                      onBlur={() => handleFieldBlur(fieldId)}
                                    >
                                      <ModernSelectValue placeholder="نوع تلفن را انتخاب کنید" />
                                    </ModernSelectTrigger>
                                    <ModernSelectContent variant="glass" className="bg-white/95 dark:bg-gray-800/95 border border-white/30 dark:border-gray-600/30 rounded-xl sm:rounded-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
                                      {phoneTypeOptions.map(option => (
                                        <ModernSelectItem key={option.value} value={option.value} className="hover:bg-orange-50 dark:hover:bg-orange-900/20 px-3 sm:px-4 py-2 sm:py-3 rounded-lg" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                                          <div className="flex items-center gap-2 sm:gap-3">
                                            <option.icon size={16} className="sm:w-4" />
                                            {option.label}
                                          </div>
                                        </ModernSelectItem>
                                      ))}
                                    </ModernSelectContent>
                                  </ModernSelect>
                                </FormControl>

                                {/* Error Message */}
                                {fieldState.error && (
                                  <div className="mt-2 sm:mt-3 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
                                    <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                      <AlertCircle size={12} className="sm:w-4" />
                                      {fieldState.error.message}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        />
                      </div>

                      {/* Phone Number */}
                      <div className="sm:col-span-5">
                        <FormField
                          control={form.control}
                          name={`phoneNumbers.${index}.phone_number`}
                          render={({ field, fieldState }) => (
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="relative">
                                  <div className={`
                                    w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg
                                    bg-gradient-to-br from-pink-500 to-rose-500
                                    transition-all duration-300
                                    ${isPhoneNumberField ? 'scale-110 shadow-2xl' : ''}
                                  `}>
                                    <Phone size={16} className="sm:w-5 text-white" />
                                  </div>
                                  {isPhoneNumberField && (
                                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-rose-600 rounded-lg sm:rounded-xl animate-pulse"></div>
                                  )}
                                </div>
                                <FormLabel className="text-base sm:text-lg font-bold text-gray-800 dark:text-white"
                                           style={{ fontFamily: designTokens.typography.fonts.primary }}>
                                  شماره تلفن
                                </FormLabel>
                              </div>

                              <div className="relative">
                                <FormControl>
                                  <ModernInput
                                    placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
                                    variant="glass"
                                    className={`
                                      w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl
                                      bg-white/80 dark:bg-gray-700/80
                                      border-2 border-white/30 dark:border-gray-600/30
                                      backdrop-blur-md
                                      transition-all duration-300 ease-out
                                      focus:ring-4 focus:ring-pink-500/30 focus:border-pink-400
                                      hover:bg-white/95 dark:hover:bg-gray-600/95
                                      hover:shadow-xl hover:shadow-pink-500/20
                                      hover:scale-[1.005] sm:hover:scale-[1.01]
                                      ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : ''}
                                      ${isPhoneNumberField ? 'scale-105 shadow-2xl ring-4 ring-pink-500/20' : ''}
                                      ${field.value && !fieldState.error ? 'border-green-400 shadow-green-500/20' : ''}
                                    `}
                                    style={{
                                      fontFamily: designTokens.typography.fonts.secondary,
                                      fontSize: '16px' // Prevents zoom on iOS
                                    }}
                                    {...field}
                                    onFocus={() => handleFieldFocus(fieldId, 'phone_number')}
                                    onBlur={() => handleFieldBlur(fieldId)}
                                  />
                                </FormControl>

                                {/* Status Icons */}
                                <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                                  {field.value && !fieldState.error && (
                                    <CheckCircle size={16} className="sm:w-4 text-green-500 animate-bounce" />
                                  )}
                                  {fieldState.error && (
                                    <XCircle size={16} className="sm:w-4 text-red-500 animate-pulse" />
                                  )}
                                </div>

                                {/* Error Message */}
                                {fieldState.error && (
                                  <div className="mt-2 sm:mt-3 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
                                    <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                      <AlertCircle size={12} className="sm:w-4" />
                                      {fieldState.error.message}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        />
                      </div>

                      {/* Extension */}
                      <div className="sm:col-span-2">
                        <FormField
                          control={form.control}
                          name={`phoneNumbers.${index}.extension`}
                          render={({ field, fieldState }) => (
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="relative">
                                  <div className={`
                                    w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg
                                    bg-gradient-to-br from-purple-500 to-indigo-500
                                    transition-all duration-300
                                    ${isExtensionField ? 'scale-110 shadow-2xl' : ''}
                                  `}>
                                    <Phone size={16} className="sm:w-5 text-white" />
                                  </div>
                                  {isExtensionField && (
                                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg sm:rounded-xl animate-pulse"></div>
                                  )}
                                </div>
                                <FormLabel className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white"
                                           style={{ fontFamily: designTokens.typography.fonts.primary }}>
                                  داخلی
                                </FormLabel>
                              </div>

                              <div className="relative">
                                <FormControl>
                                  <ModernInput
                                    placeholder="۱۲۳"
                                    variant="glass"
                                    className={`
                                      w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl
                                      bg-white/80 dark:bg-gray-700/80
                                      border-2 border-white/30 dark:border-gray-600/30
                                      backdrop-blur-md
                                      transition-all duration-300 ease-out
                                      focus:ring-4 focus:ring-purple-500/30 focus:border-purple-400
                                      hover:bg-white/95 dark:hover:bg-gray-600/95
                                      hover:shadow-xl hover:shadow-purple-500/20
                                      hover:scale-[1.005] sm:hover:scale-[1.01]
                                      ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : ''}
                                      ${isExtensionField ? 'scale-105 shadow-2xl ring-4 ring-purple-500/20' : ''}
                                      ${field.value && !fieldState.error ? 'border-green-400 shadow-green-500/20' : ''}
                                    `}
                                    style={{
                                      fontFamily: designTokens.typography.fonts.secondary,
                                      fontSize: '16px' // Prevents zoom on iOS
                                    }}
                                    {...field}
                                    value={field.value || ''}
                                    onFocus={() => handleFieldFocus(fieldId, 'extension')}
                                    onBlur={() => handleFieldBlur(fieldId)}
                                  />
                                </FormControl>

                                {/* Status Icons */}
                                <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                                  {field.value && !fieldState.error && (
                                    <CheckCircle size={16} className="sm:w-4 text-green-500 animate-bounce" />
                                  )}
                                  {fieldState.error && (
                                    <XCircle size={16} className="sm:w-4 text-red-500 animate-pulse" />
                                  )}
                                </div>

                                {/* Error Message */}
                                {fieldState.error && (
                                  <div className="mt-2 sm:mt-3 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
                                    <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                      <AlertCircle size={12} className="sm:w-4" />
                                      {fieldState.error.message}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        />
                      </div>

                      {/* Remove Button */}
                      <div className="sm:col-span-1 flex justify-center items-end">
                        <GlassButton
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="text-red-500 hover:bg-red-100/30 dark:hover:bg-red-900/20 h-10 w-10 sm:h-12 sm:w-12 rounded-full transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
                          aria-label="حذف شماره تلفن"
                        >
                          <X size={18} className="sm:w-5 transition-transform duration-200 hover:rotate-90" />
                        </GlassButton>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

ContactPhoneNumbers.displayName = 'ContactPhoneNumbers';

export default ContactPhoneNumbers;