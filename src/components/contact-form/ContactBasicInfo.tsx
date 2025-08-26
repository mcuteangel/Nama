import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
              <Input placeholder={t('form_labels.first_name')} className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} />
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
              <Input placeholder={t('form_labels.last_name')} className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} />
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
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100">
                  <SelectValue placeholder={t('form_placeholders.select_gender')} />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                  <SelectItem value="male">{t('gender.male')}</SelectItem>
                  <SelectItem value="female">{t('gender.female')}</SelectItem>
                  <SelectItem value="not_specified">{t('gender.not_specified')}</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ContactBasicInfo;