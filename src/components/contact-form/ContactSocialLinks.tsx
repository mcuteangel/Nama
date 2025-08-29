import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { ModernButton } from '@/components/ui/modern-button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Plus, X, Link as LinkIcon } from 'lucide-react'; // Renamed Link to LinkIcon to avoid conflict
import { ContactFormValues } from '@/types/contact';
import { useTranslation } from 'react-i18next';

const socialLinkTypeOptions = [
  { value: "linkedin", label: "social_type.linkedin" },
  { value: "twitter", label: "social_type.twitter" },
  { value: "instagram", label: "social_type.instagram" },
  { value: "telegram", label: "social_type.telegram" },
  { value: "website", label: "social_type.website" },
  { value: "other", label: "social_type.other" },
];

const ContactSocialLinks: React.FC = () => {
  const { t } = useTranslation();
  const form = useFormContext<ContactFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "socialLinks",
  });

  const translatedSocialLinkTypeOptions = socialLinkTypeOptions.map(option => ({
    ...option,
    label: t(option.label)
  }));

  return (
    <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{t('section_titles.social_links')}</h3>
      {fields.map((item, index) => (
        <div key={item.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <FormField
            control={form.control}
            name={`socialLinks.${index}.type`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-200">{t('form_labels.social_network_type')}</FormLabel>
                <ModernSelect onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <ModernSelectTrigger variant="glass" className="w-full">
                      <ModernSelectValue placeholder={t('form_placeholders.select_type')} />
                    </ModernSelectTrigger>
                  </FormControl>
                  <ModernSelectContent variant="glass">
                    {translatedSocialLinkTypeOptions.map(option => (
                      <ModernSelectItem key={option.value} value={option.value}>{option.label}</ModernSelectItem>
                    ))}
                  </ModernSelectContent>
                </ModernSelect>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-end gap-2 md:col-span-2">
            <FormField
              control={form.control}
              name={`socialLinks.${index}.url`}
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormLabel className="text-gray-700 dark:text-gray-200">{t('form_labels.url_address')}</FormLabel>
                  <FormControl>
                    <ModernInput type="url" placeholder={t('form_placeholders.url_example')} variant="glass" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} />
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
      <div className="flex justify-start mt-2">
        <ModernButton
          type="button"
          variant="glass"
          size="sm"
          onClick={() => append({ type: "other", url: "" })}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium"
        >
          <Plus size={16} className="me-2" /> {t('button_labels.add_social_link')}
        </ModernButton>
      </div>
    </div>
  );
};

export default ContactSocialLinks;