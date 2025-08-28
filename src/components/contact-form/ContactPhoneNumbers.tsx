import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { ModernButton } from '@/components/ui/modern-button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Plus, X } from 'lucide-react';
import { ContactFormValues } from '@/types/contact';
import { useTranslation } from 'react-i18next';

const phoneTypeOptions = [
  { value: "mobile", label: "phone_type.mobile" },
  { value: "home", label: "phone_type.home" },
  { value: "work", label: "phone_type.work" },
  { value: "fax", label: "phone_type.fax" },
  { value: "other", label: "phone_type.other" },
];

const ContactPhoneNumbers: React.FC = () => {
  const { t } = useTranslation();
  const form = useFormContext<ContactFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "phoneNumbers",
  });

  const translatedPhoneTypeOptions = phoneTypeOptions.map(option => ({
    ...option,
    label: t(option.label)
  }));

  return (
    <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{t('section_titles.phone_numbers')}</h3>
      {fields.map((item, index) => (
        <div key={item.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <FormField
            control={form.control}
            name={`phoneNumbers.${index}.phone_type`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-200">{t('form_labels.phone_type')}</FormLabel>
                <ModernSelect onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <ModernSelectTrigger variant="glass" className="w-full">
                      <ModernSelectValue placeholder={t('form_placeholders.select_type')} />
                    </ModernSelectTrigger>
                  </FormControl>
                  <ModernSelectContent variant="glass">
                    {translatedPhoneTypeOptions.map(option => (
                      <ModernSelectItem key={option.value} value={option.value}>{option.label}</ModernSelectItem>
                    ))}
                  </ModernSelectContent>
                </ModernSelect>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`phoneNumbers.${index}.phone_number`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-200">{t('form_labels.phone_number')}</FormLabel>
                <FormControl>
                  <ModernInput placeholder={t('form_placeholders.phone_example')} variant="glass" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-end gap-2">
            <FormField
              control={form.control}
              name={`phoneNumbers.${index}.extension`}
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormLabel className="text-gray-700 dark:text-gray-200">{t('form_labels.extension_optional')}</FormLabel>
                  <FormControl>
                    <ModernInput placeholder={t('form_placeholders.extension_example')} variant="glass" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ModernButton type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-red-500 hover:bg-red-100 dark:hover:bg-gray-700/50">
              <X size={16} />
            </ModernButton>
          </div>
        </div>
      ))}
      <ModernButton
        type="button"
        variant="outline"
        onClick={() => append({ phone_type: "mobile", phone_number: "", extension: null })}
        className="w-full flex items-center gap-2 px-6 py-2 rounded-lg font-semibold"
      >
        <Plus size={16} className="me-2" /> {t('button_labels.add_phone_number')}
      </ModernButton>
    </div>
  );
};

export default ContactPhoneNumbers;