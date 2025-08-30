import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { ContactFormValues } from '@/types/contact';
import { useTranslation } from 'react-i18next';

const ContactBasicInfo: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const form = useFormContext<ContactFormValues>();

  // Memoize gender options to prevent unnecessary re-renders
  const genderOptions = useMemo(() => [
    { value: "male", label: t('gender.male') },
    { value: "female", label: t('gender.female') },
    { value: "not_specified", label: t('gender.not_specified') },
  ], [t]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-xl glass">
      <FormField
        control={form.control}
        name="firstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-700 dark:text-gray-200 font-medium">
              {t('form_labels.first_name')}
              <span className="text-red-500 ms-1">*</span>
            </FormLabel>
            <FormControl>
              <ModernInput 
                placeholder={t('form_placeholders.first_name')} 
                variant="glass" 
                className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary/50" 
                {...field} 
              />
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
            <FormLabel className="text-gray-700 dark:text-gray-200 font-medium">
              {t('form_labels.last_name')}
              <span className="text-red-500 ms-1">*</span>
            </FormLabel>
            <FormControl>
              <ModernInput 
                placeholder={t('form_placeholders.last_name')} 
                variant="glass" 
                className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary/50" 
                {...field} 
              />
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
            <FormLabel className="text-gray-700 dark:text-gray-200 font-medium">
              {t('form_labels.gender')}
            </FormLabel>
            <FormControl>
              <ModernSelect onValueChange={field.onChange} value={field.value}>
                <ModernSelectTrigger variant="glass" className="w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30">
                  <ModernSelectValue placeholder={t('form_placeholders.select_gender')} />
                </ModernSelectTrigger>
                <ModernSelectContent variant="glass" className="bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                  {genderOptions.map(option => (
                    <ModernSelectItem key={option.value} value={option.value} className="hover:bg-white/20 dark:hover:bg-gray-700/50">
                      {option.label}
                    </ModernSelectItem>
                  ))}
                </ModernSelectContent>
              </ModernSelect>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="position"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-700 dark:text-gray-200 font-medium">
              {t('form_labels.position')}
            </FormLabel>
            <FormControl>
              <ModernInput 
                placeholder={t('form_placeholders.position')} 
                variant="glass" 
                className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary/50" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="company"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-700 dark:text-gray-200 font-medium">
              {t('form_labels.company')}
            </FormLabel>
            <FormControl>
              <ModernInput 
                placeholder={t('form_placeholders.company')} 
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
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo - always return true to prevent re-renders
  return true;
});

ContactBasicInfo.displayName = 'ContactBasicInfo';

export default ContactBasicInfo;