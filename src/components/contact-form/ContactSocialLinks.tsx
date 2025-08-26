import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100">
                      <SelectValue placeholder={t('form_placeholders.select_type')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                    {translatedSocialLinkTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    <Input type="url" placeholder={t('form_placeholders.url_example')} className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-red-500 hover:bg-red-100 dark:hover:bg-gray-700/50">
              <X size={16} />
            </Button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => append({ type: "other", url: "" })}
        className="w-full flex items-center gap-2 px-6 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold shadow-sm transition-all duration-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
      >
        <Plus size={16} className="me-2" /> {t('button_labels.add_social_link')}
      </Button>
    </div>
  );
};

export default ContactSocialLinks;