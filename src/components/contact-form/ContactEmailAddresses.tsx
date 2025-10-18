import React, { useMemo } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { GlassButton } from "@/components/ui/glass-button";
import { FormField, FormLabel, FormControl } from '@/components/ui/form';
import { FormCard } from '@/components/ui/FormCard';
import { FormSection } from '@/components/ui/FormSection';
import { Plus, X, Mail, AlertCircle, User, Briefcase, MoreHorizontal } from 'lucide-react';
import { ContactFormValues } from '@/types/contact';
import { useTranslation } from 'react-i18next';

const ContactEmailAddresses: React.FC = React.memo(() => {
  const { i18n } = useTranslation();
  const form = useFormContext<ContactFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "emailAddresses",
  });

  // Determine text direction based on language
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';

  // Memoize email type options to prevent unnecessary re-renders
  const { t } = useTranslation();
  
  const emailTypeOptions = useMemo(() => [
    { value: "personal", label: t('email_types.personal'), icon: User },
    { value: "work", label: t('email_types.work'), icon: Briefcase },
    { value: "other", label: t('email_types.other'), icon: MoreHorizontal },
  ], [t]);

  const handleAddEmail = () => {
    append({ email_type: "personal", email_address: "" });
  };

  return (
    <FormCard
      title={t('contact_form.email_addresses.title')}
      description={t('contact_form.email_addresses.description')}
      icon={Mail}
      iconColor="#8b5cf6"
    >
      <div className="space-y-2">
        {/* Email Addresses List */}
        <div className="space-y-3">
          {fields.map((item, index) => (
            <FormSection
              key={item.id}
              variant="card"
              title=""
              className="relative group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Mail size={10} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('email_label')} {index + 1}
                  </span>
                </div>

                {/* Remove Button */}
                <GlassButton
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                  aria-label={t('accessibility.delete_email')}
                >
                  <X size={12} />
                </GlassButton>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Email Type */}
                <div className="sm:col-span-5">
                  <FormField
                    control={form.control}
                    name={`emailAddresses.${index}.email_type`}
                    render={({ field, fieldState }) => (
                      <div className="space-y-1">
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {t('form_labels.email_type')}
                        </FormLabel>
                        <FormControl>
                          <ModernSelect onValueChange={field.onChange} value={field.value} dir={isRTL ? 'rtl' : 'ltr'}>
                            <ModernSelectTrigger
                              className={`w-full ${fieldState.error ? 'border-red-300 focus:border-red-500' : ''}`}
                              dir={isRTL ? 'rtl' : 'ltr'}
                              variant="glass"
                            >
                              <ModernSelectValue placeholder={t('form_labels.select_email_type_placeholder')} />
                            </ModernSelectTrigger>
                            <ModernSelectContent dir={isRTL ? 'rtl' : 'ltr'} variant="glass">
                              {emailTypeOptions.map(option => (
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

                {/* Email Address */}
                <div className="sm:col-span-7">
                  <FormField
                    control={form.control}
                    name={`emailAddresses.${index}.email_address`}
                    render={({ field, fieldState }) => (
                      <div className="space-y-1">
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {t('form_labels.email_address')}
                        </FormLabel>
                        <FormControl>
                          <ModernInput
                            type="email"
                            placeholder={t('form_labels.email_placeholder')}
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
              </div>
            </FormSection>
          ))}
        </div>

        {/* Empty State */}
        {fields.length === 0 && (
          <div className="text-center py-2 text-slate-500 dark:text-slate-400">
            <Mail size={18} className="mx-auto mb-1 opacity-50" />
            <p className="text-xs">{t('contact_form.email_addresses.no_emails_added')}</p>
          </div>
        )}

        {/* Add Email Button */}
        <div className="flex justify-start">
          <GlassButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddEmail}
            className="bg-primary-500/10 hover:bg-primary-500/20 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-xl border border-primary-200 dark:border-primary-800 transition-all duration-200"
          >
            <Plus size={14} className="ml-2" />
            {t('contact_form.email_addresses.add_email_button')}
          </GlassButton>
        </div>
      </div>
    </FormCard>
  );
});

ContactEmailAddresses.displayName = 'ContactEmailAddresses';

export default ContactEmailAddresses;