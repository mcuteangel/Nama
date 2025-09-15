import React, { useMemo } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { GlassButton } from "@/components/ui/glass-button";
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Plus, X, Link } from 'lucide-react';
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
    <div className="space-y-4 pt-4 border-t border-border/30">
      {/* Compact Header */}
      <div className="flex flex-row justify-between items-center gap-2 p-2.5 rounded-lg bg-muted/30 dark:bg-muted/10 border border-border/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/90 to-primary/70 flex items-center justify-center shadow-sm">
            <Link size={16} className="text-white" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            {t('section_titles.social_links')}
          </h3>
        </div>
        <GlassButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => append({ type: "other", url: "" })}
          className="h-8 px-3 text-xs font-medium rounded-md hover:bg-accent/50 transition-colors"
        >
          <Plus size={16} className="me-1.5" />
          {t('button_labels.add_social_link')}
        </GlassButton>
      </div>

      {/* Social Links Container */}
      <div className="space-y-3">
        {fields.map((item, index) => (
          <div key={item.id} className="group/social-item p-3 rounded-lg bg-muted/10 dark:bg-muted/10 border border-border/20 hover:border-primary/40 transition-colors duration-200">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4">
                <FormField
                  control={form.control}
                  name={`socialLinks.${index}.type`}
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-info-100/80 to-info-50/80 dark:from-info-900/30 dark:to-info-800/20 border border-info-200/50 dark:border-info-800/50 flex items-center justify-center transition-all duration-300">
                            <Link size={16} className="text-info-600 dark:text-info-400" />
                          </div>
                          <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {t('form_labels.social_network_type')}
                          </FormLabel>
                        </div>
                        <div className="relative">
                          <FormControl>
                            <ModernSelect onValueChange={field.onChange} defaultValue={field.value}>
                              <ModernSelectTrigger
                                variant="glass"
                                className="w-full px-4 py-3 text-sm rounded-xl border-2 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm transition-all duration-300 ease-out focus:ring-3 focus:ring-primary-500/30 focus:border-primary-400 hover:bg-white/70 dark:hover:bg-gray-600/70 hover:shadow-md hover:shadow-primary-500/20"
                              >
                                <ModernSelectValue placeholder={t('form_placeholders.select_type')} />
                              </ModernSelectTrigger>
                              <ModernSelectContent variant="glass" className="bg-white/90 dark:bg-gray-800/90 border border-white/30 dark:border-gray-600/30 rounded-xl mt-1">
                                {socialLinkTypeOptions.map(option => (
                                  <ModernSelectItem key={option.value} value={option.value} className="hover:bg-white/30 dark:hover:bg-gray-700/40 px-3 py-2 rounded-lg">
                                    {option.label}
                                  </ModernSelectItem>
                                ))}
                              </ModernSelectContent>
                            </ModernSelect>
                          </FormControl>
                        </div>
                      </div>
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
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-info-100/80 to-info-50/80 dark:from-info-900/30 dark:to-info-800/20 border border-info-200/50 dark:border-info-800/50 flex items-center justify-center transition-all duration-300">
                            <Link size={16} className="text-info-600 dark:text-info-400" />
                          </div>
                          <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {t('form_labels.url_address')}
                          </FormLabel>
                        </div>
                        <div className="relative">
                          <FormControl>
                            <ModernInput
                              type="url"
                              placeholder={t('form_placeholders.url_example')}
                              variant="glass"
                              className="w-full px-4 py-3 text-sm rounded-xl border-2 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm transition-all duration-300 ease-out focus:ring-3 focus:ring-primary-500/30 focus:border-primary-400 hover:bg-white/70 dark:hover:bg-gray-600/70 hover:shadow-md hover:shadow-primary-500/20"
                              {...field}
                            />
                          </FormControl>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-1 flex justify-center items-end">
                <GlassButton
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="text-error-500 hover:bg-error-100/30 dark:hover:bg-error-900/20 h-10 w-10 rounded-full transition-all duration-300 hover:scale-110 group-hover/social-item:scale-110"
                  aria-label={t('accessibility.remove_social_link', 'Remove social link')}
                >
                  <X size={16} className="transition-transform duration-200 group-hover/social-item:rotate-90" />
                </GlassButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

ContactSocialLinks.displayName = 'ContactSocialLinks';

export default ContactSocialLinks;