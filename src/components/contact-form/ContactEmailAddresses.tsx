import React, { useMemo } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { ModernButton } from '@/components/ui/modern-button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Plus, X } from 'lucide-react';
import { ContactFormValues } from '@/types/contact';
import { useTranslation } from 'react-i18next';

const ContactEmailAddresses: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const form = useFormContext<ContactFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "emailAddresses",
  });

  // Memoize email type options to prevent unnecessary re-renders
  const emailTypeOptions = useMemo(() => [
    { value: "personal", label: t('email_type.personal') },
    { value: "work", label: t('email_type.work') },
    { value: "other", label: t('email_type.other') },
  ], [t]);

  return (
    <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 heading-3">
          {t('section_titles.email_addresses')}
        </h3>
        <ModernButton
          type="button"
          variant="gradient-sunset"
          effect="lift"
          size="sm"
          onClick={() => append({ email_type: "personal", email_address: "" })}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg"
        >
          <Plus size={16} className="me-2" /> 
          {t('button_labels.add_email_address')}
        </ModernButton>
      </div>
      
      <div className="space-y-4 p-4 rounded-xl glass">
        {fields.map((item, index) => (
          <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-3 rounded-lg bg-white/20 dark:bg-gray-700/20 border border-white/30 dark:border-gray-600/30">
            <div className="md:col-span-4">
              <FormField
                control={form.control}
                name={`emailAddresses.${index}.email_type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-200 font-medium">
                      {t('form_labels.email_type')}
                    </FormLabel>
                    <ModernSelect onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <ModernSelectTrigger variant="glass" className="w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30">
                          <ModernSelectValue placeholder={t('form_placeholders.select_type')} />
                        </ModernSelectTrigger>
                      </FormControl>
                      <ModernSelectContent variant="glass" className="bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                        {emailTypeOptions.map(option => (
                          <ModernSelectItem key={option.value} value={option.value} className="hover:bg-white/20 dark:hover:bg-gray-700/50">
                            {option.label}
                          </ModernSelectItem>
                        ))}
                      </ModernSelectContent>
                    </ModernSelect>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:col-span-7">
              <FormField
                control={form.control}
                name={`emailAddresses.${index}.email_address`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-200 font-medium">
                      {t('form_labels.email_address')}
                    </FormLabel>
                    <FormControl>
                      <ModernInput 
                        type="email" 
                        placeholder={t('form_placeholders.email_example')} 
                        variant="glass" 
                        className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary/50" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:col-span-1 flex justify-center">
              <ModernButton 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => remove(index)} 
                className="text-red-500 hover:bg-red-100 dark:hover:bg-gray-700/50 h-10 w-10 rounded-full"
                aria-label={t('accessibility.remove_email_address', 'Remove email address')}
              >
                <X size={16} />
              </ModernButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo - prevent re-renders unless necessary
  return false;
});

ContactEmailAddresses.displayName = 'ContactEmailAddresses';

export default ContactEmailAddresses;