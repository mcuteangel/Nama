import React, { useMemo } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { GlassButton } from "@/components/ui/glass-button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Plus, X } from 'lucide-react';
import { ContactFormValues } from '@/types/contact';
import { useTranslation } from 'react-i18next';

const ContactSocialLinks: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const form = useFormContext<ContactFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "socialLinks",
  });

  // Memoize social link type options to prevent unnecessary re-renders
  const socialLinkTypeOptions = useMemo(() => [
    { value: "linkedin", label: t('social_type.linkedin') },
    { value: "twitter", label: t('social_type.twitter') },
    { value: "instagram", label: t('social_type.instagram') },
    { value: "telegram", label: t('social_type.telegram') },
    { value: "website", label: t('social_type.website') },
    { value: "other", label: t('social_type.other') },
  ], [t]);

  return (
    <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 heading-3">
          {t('section_titles.social_links')}
        </h3>
        <GlassButton
          type="button"
          variant="gradient-forest"
          effect="lift"
          size="sm"
          onClick={() => append({ type: "other", url: "" })}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg"
        >
          <Plus size={16} className="me-2" /> 
          {t('button_labels.add_social_link')}
        </GlassButton>
      </div>
      
      <div className="space-y-4 p-4 rounded-xl glass">
        {fields.map((item, index) => (
          <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-3 rounded-lg bg-white/20 dark:bg-gray-700/20 border border-white/30 dark:border-gray-600/30">
            <div className="md:col-span-4">
              <FormField
                control={form.control}
                name={`socialLinks.${index}.type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-200 font-medium">
                      {t('form_labels.social_network_type')}
                    </FormLabel>
                    <ModernSelect onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <ModernSelectTrigger variant="glass" className="w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30">
                          <ModernSelectValue placeholder={t('form_placeholders.select_type')} />
                        </ModernSelectTrigger>
                      </FormControl>
                      <ModernSelectContent variant="glass" className="bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                        {socialLinkTypeOptions.map(option => (
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
                name={`socialLinks.${index}.url`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-200 font-medium">
                      {t('form_labels.url_address')}
                    </FormLabel>
                    <FormControl>
                      <ModernInput 
                        type="url" 
                        placeholder={t('form_placeholders.url_example')} 
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
              <GlassButton 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => remove(index)} 
                className="text-red-500 hover:bg-red-100 dark:hover:bg-gray-700/50 h-10 w-10 rounded-full"
                aria-label={t('accessibility.remove_social_link', 'Remove social link')}
              >
                <X size={16} />
              </GlassButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

ContactSocialLinks.displayName = 'ContactSocialLinks';

export default ContactSocialLinks;