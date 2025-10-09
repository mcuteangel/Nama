import React, { useEffect, useMemo } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { GlassButton } from "@/components/ui/glass-button";
import { FormField, FormLabel, FormControl } from '@/components/ui/form';
import { FormCard } from '@/components/ui/FormCard';
import { FormSection } from '@/components/ui/FormSection';
import { Plus, X, Phone, AlertCircle, Smartphone, Home, Briefcase, MoreHorizontal } from 'lucide-react';
import { ContactFormValues } from '@/types/contact';
import { useTranslation } from 'react-i18next';

const ContactPhoneNumbers: React.FC = React.memo(() => {
  const { i18n } = useTranslation();
  const form = useFormContext<ContactFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "phoneNumbers",
  });

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

  const handleAddPhoneNumber = () => {
    append({ phone_type: "mobile", phone_number: "", extension: null });
  };

  const handleRemovePhoneNumber = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <FormCard
      title="شماره تلفن‌ها"
      description="شماره تلفن‌های مخاطب را اضافه کنید"
      icon={Phone}
      iconColor="#f97316"
    >
      <div className="space-y-3">
        {/* Phone Numbers List */}
        <div className="space-y-3">
          {fields.map((item, index) => (
            <FormSection
              key={item.id}
              variant="card"
              className="relative group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Phone size={10} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    شماره تلفن {index + 1}
                  </span>
                </div>

                {/* Remove Button */}
                {fields.length > 1 && (
                  <GlassButton
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePhoneNumber(index)}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                    aria-label="حذف شماره تلفن"
                  >
                    <X size={12} />
                  </GlassButton>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Phone Type */}
                <div className="sm:col-span-4">
                  <FormField
                    control={form.control}
                    name={`phoneNumbers.${index}.phone_type`}
                    render={({ field, fieldState }) => (
                      <div className="space-y-1">
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          نوع تلفن
                        </FormLabel>
                        <FormControl>
                          <ModernSelect onValueChange={field.onChange} value={field.value} dir={isRTL ? 'rtl' : 'ltr'}>
                            <ModernSelectTrigger
                              className={`w-full ${fieldState.error ? 'border-red-300 focus:border-red-500' : ''}`}
                              dir={isRTL ? 'rtl' : 'ltr'}
                              variant="glass"
                            >
                              <ModernSelectValue placeholder="نوع تلفن را انتخاب کنید" />
                            </ModernSelectTrigger>
                            <ModernSelectContent dir={isRTL ? 'rtl' : 'ltr'} variant="glass">
                              {phoneTypeOptions.map(option => (
                                <ModernSelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    <option.icon size={14} />
                                    {option.label}
                                  </div>
                                </ModernSelectItem>
                              ))}
                            </ModernSelectContent>
                          </ModernSelect>
                        </FormControl>
                        {fieldState.error && (
                          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle size={12} />
                            {fieldState.error.message}
                          </p>
                        )}
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
                      <div className="space-y-1">
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          شماره تلفن
                        </FormLabel>
                        <FormControl>
                          <ModernInput
                            placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
                            className={`w-full ${fieldState.error ? 'border-red-300 focus:border-red-500' : ''}`}
                            variant="glass"
                            {...field}
                          />
                        </FormControl>
                        {fieldState.error && (
                          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle size={12} />
                            {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Extension */}
                <div className="sm:col-span-3">
                  <FormField
                    control={form.control}
                    name={`phoneNumbers.${index}.extension`}
                    render={({ field, fieldState }) => (
                      <div className="space-y-1">
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          داخلی (اختیاری)
                        </FormLabel>
                        <FormControl>
                          <ModernInput
                            placeholder="۱۲۳"
                            className={`w-full ${fieldState.error ? 'border-red-300 focus:border-red-500' : ''}`}
                            variant="glass"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        {fieldState.error && (
                          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle size={12} />
                            {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>
            </FormSection>
          ))}
        </div>

        {/* Add Phone Button */}
        <div className="flex justify-start pt-2">
          <GlassButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddPhoneNumber}
            className="bg-primary-500/10 hover:bg-primary-500/20 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-xl border border-primary-200 dark:border-primary-800 transition-all duration-200"
          >
            <Plus size={14} className="ml-2" />
            افزودن شماره تلفن
          </GlassButton>
        </div>

        {fields.length === 0 && (
          <div className="text-center py-4 text-slate-500 dark:text-slate-400">
            <Phone size={32} className="mx-auto mb-4 opacity-50" />
            <p>هنوز شماره تلفنی اضافه نشده است</p>
            <p className="text-sm mt-1">برای اضافه کردن شماره تلفن جدید، دکمه پایین را کلیک کنید</p>
          </div>
        )}
      </div>
    </FormCard>
  );
});

ContactPhoneNumbers.displayName = 'ContactPhoneNumbers';

export default ContactPhoneNumbers;