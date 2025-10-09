import React, { useMemo, useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { GlassButton } from "@/components/ui/glass-button";
import { FormField, FormLabel, FormControl } from '@/components/ui/form';
import { FormSection } from '@/components/ui/FormSection';
import { FormCard } from '@/components/ui/FormCard';
import { Plus, X, Link, CheckCircle, XCircle, AlertCircle, Facebook, Twitter, Instagram, MessageCircle, Globe, Youtube, Github } from 'lucide-react';
import { ContactFormValues } from '@/types/contact';
import { useTranslation } from 'react-i18next';

const ContactSocialLinks: React.FC = React.memo(() => {
  const { i18n } = useTranslation();
  const form = useFormContext<ContactFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "socialLinks",
  });
  const [focusedFields, setFocusedFields] = useState<{ [key: string]: string | false }>({});

  // Determine text direction based on language
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';

  // Memoize social link type options to prevent unnecessary re-renders
  const socialLinkTypeOptions = useMemo(() => [
    { value: "linkedin", label: "لینکدین", icon: Globe, color: "from-blue-500 to-blue-600" },
    { value: "twitter", label: "توییتر", icon: Twitter, color: "from-blue-400 to-blue-500" },
    { value: "instagram", label: "اینستاگرام", icon: Instagram, color: "from-pink-500 to-purple-500" },
    { value: "telegram", label: "تلگرام", icon: MessageCircle, color: "from-blue-500 to-cyan-500" },
    { value: "website", label: "وب‌سایت", icon: Globe, color: "from-gray-500 to-gray-600" },
    { value: "facebook", label: "فیسبوک", icon: Facebook, color: "from-blue-600 to-blue-700" },
    { value: "youtube", label: "یوتیوب", icon: Youtube, color: "from-red-500 to-red-600" },
    { value: "github", label: "گیت‌هاب", icon: Github, color: "from-gray-700 to-gray-800" },
    { value: "other", label: "سایر", icon: Link, color: "from-purple-500 to-indigo-500" },
  ], []);

  const handleFieldFocus = (fieldId: string, fieldName: string) => {
    setFocusedFields(prev => ({ ...prev, [fieldId]: fieldName }));
  };

  const handleFieldBlur = (fieldId: string) => {
    setFocusedFields(prev => ({ ...prev, [fieldId]: false }));
  };

  return (
    <FormSection
      icon={Link}
      title="شبکه‌های اجتماعی"
      description="لینک‌های شبکه‌های اجتماعی مخاطب را اضافه کنید"
      className="space-y-4"
    >
      {/* Add Social Link Button */}
      <div className="flex justify-end mb-4">
        <GlassButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => append({ type: "other", url: "" })}
          className="bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-700 hover:text-cyan-800 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
        >
          <Plus size={16} className="ml-2" />
          افزودن شبکه اجتماعی
        </GlassButton>
      </div>

      {/* Social Links Container */}
      <div className="space-y-4">
        {fields.map((item, index) => {
          const fieldId = item.id;
          const isUrlField = focusedFields[fieldId] === 'url';
          const isTypeField = focusedFields[fieldId] === 'type';
          const selectedOption = socialLinkTypeOptions.find(opt => opt.value === form.watch(`socialLinks.${index}.type`));

          return (
            <FormCard
              key={item.id}
              title={`شبکه اجتماعی ${index + 1}`}
              icon={selectedOption?.icon || Link}
              iconColor="#06b6d4"
              className="group"
            >
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-end">
                {/* Social Type */}
                <div className="sm:col-span-4">
                  <FormField
                    control={form.control}
                    name={`socialLinks.${index}.type`}
                    render={({ field, fieldState }) => (
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="relative">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br ${selectedOption?.color || 'from-purple-500 to-indigo-500'} transition-all duration-300 ${isTypeField ? 'scale-110 shadow-2xl' : ''}`}>
                              {React.createElement(selectedOption?.icon || Link, {
                                size: 16,
                                className: "sm:w-5 text-white"
                              })}
                            </div>
                            {isTypeField && (
                              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg sm:rounded-xl animate-pulse"></div>
                            )}
                          </div>
                          <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            نوع شبکه
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
                                  border-2 border-slate-200 dark:border-slate-600
                                  backdrop-blur-md
                                  transition-all duration-300 ease-out
                                  focus:ring-4 focus:ring-cyan-500/30 focus:border-cyan-400
                                  hover:bg-white/95 dark:hover:bg-gray-600/95
                                  hover:shadow-xl hover:shadow-cyan-500/20
                                  hover:scale-[1.005] sm:hover:scale-[1.01]
                                  ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : ''}
                                  ${isTypeField ? 'scale-105 shadow-2xl ring-4 ring-cyan-500/20' : ''}
                                  ${field.value && !fieldState.error ? 'border-green-400 shadow-green-500/20' : ''}
                                `}
                                style={{
                                  fontSize: '16px', // Prevents zoom on iOS
                                  direction: isRTL ? 'rtl' : 'ltr'
                                }}
                                onFocus={() => handleFieldFocus(fieldId, 'type')}
                                onBlur={() => handleFieldBlur(fieldId)}
                              >
                                <ModernSelectValue placeholder="نوع شبکه اجتماعی را انتخاب کنید" />
                              </ModernSelectTrigger>
                              <ModernSelectContent variant="glass" className="bg-white/95 dark:bg-gray-800/95 border border-slate-200 dark:border-slate-600 rounded-xl sm:rounded-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
                                {socialLinkTypeOptions.map(option => (
                                  <ModernSelectItem key={option.value} value={option.value} className="hover:bg-cyan-50 dark:hover:bg-cyan-900/20 px-3 sm:px-4 py-2 sm:py-3 rounded-lg" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                                    <div className="flex items-center gap-2 sm:gap-3">
                                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-br ${option.color} flex items-center justify-center`}>
                                        <option.icon size={12} className="sm:w-4 text-white" />
                                      </div>
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

                {/* URL */}
                <div className="sm:col-span-7">
                  <FormField
                    control={form.control}
                    name={`socialLinks.${index}.url`}
                    render={({ field, fieldState }) => (
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="relative">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br ${selectedOption?.color || 'from-purple-500 to-indigo-500'} transition-all duration-300 ${isUrlField ? 'scale-110 shadow-2xl' : ''}`}>
                              <Link size={16} className="sm:w-5 text-white" />
                            </div>
                            {isUrlField && (
                              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg sm:rounded-xl animate-pulse"></div>
                            )}
                          </div>
                          <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            آدرس لینک
                          </FormLabel>
                        </div>

                        <div className="relative">
                          <FormControl>
                            <ModernInput
                              type="url"
                              placeholder="https://example.com"
                              variant="glass"
                              className={`
                                w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl
                                bg-white/80 dark:bg-gray-700/80
                                border-2 border-slate-200 dark:border-slate-600
                                backdrop-blur-md
                                transition-all duration-300 ease-out
                                focus:ring-4 focus:ring-cyan-500/30 focus:border-cyan-400
                                hover:bg-white/95 dark:hover:bg-gray-600/95
                                hover:shadow-xl hover:shadow-cyan-500/20
                                hover:scale-[1.005] sm:hover:scale-[1.01]
                                ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : ''}
                                ${isUrlField ? 'scale-105 shadow-2xl ring-4 ring-cyan-500/20' : ''}
                                ${field.value && !fieldState.error ? 'border-green-400 shadow-green-500/20' : ''}
                              `}
                              style={{
                                fontSize: '16px' // Prevents zoom on iOS
                              }}
                              {...field}
                              onFocus={() => handleFieldFocus(fieldId, 'url')}
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
                    aria-label="حذف شبکه اجتماعی"
                  >
                    <X size={18} className="sm:w-5 transition-transform duration-200 hover:rotate-90" />
                  </GlassButton>
                </div>
              </div>
            </FormCard>
          );
        })}
      </div>
    </FormSection>
  );
});

ContactSocialLinks.displayName = 'ContactSocialLinks';

export default ContactSocialLinks;