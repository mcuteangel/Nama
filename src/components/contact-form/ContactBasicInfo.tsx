import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { ContactFormValues } from '@/types/contact';
import { useTranslation } from 'react-i18next';

const ContactBasicInfo: React.FC = () => {
  const { t } = useTranslation();
  const form = useFormContext<ContactFormValues>();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <FormField
        control={form.control}
        name="firstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-700 dark:text-gray-200">{t('form_labels.first_name')}<span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <ModernInput placeholder={t('form_labels.first_name')} variant="glass" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="lastName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-700 dark:text-gray-200">{t('form_labels.last_name')}<span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <ModernInput placeholder={t('form_labels.last_name')} variant="glass" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="gender"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-700 dark:text-gray-200">{t('form_labels.gender')}</FormLabel>
            <FormControl>
              <ModernSelect onValueChange={field.onChange} value={field.value}>
                <ModernSelectTrigger variant="glass" className="w-full">
                  <ModernSelectValue placeholder={t('form_placeholders.select_gender')} />
                </ModernSelectTrigger>
                <ModernSelectContent variant="glass">
                  <ModernSelectItem value="male">{t('gender.male')}</ModernSelectItem>
                  <ModernSelectItem value="female">{t('gender.female')}</ModernSelectItem>
                  <ModernSelectItem value="not_specified">{t('gender.not_specified')}</ModernSelectItem>
                </ModernSelectContent>
              </ModernSelect>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ContactBasicInfo;