import React, { useMemo, useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { GlassButton } from "@/components/ui/glass-button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Plus, X, Link, UserCheck, AlertCircle } from 'lucide-react';
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
    <div className="space-y-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-cyan-50/50 to-blue-50/50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200/30 dark:border-cyan-800/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Link size={20} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {t('section_titles.social_links')}
          </h3>
        </div>
        <GlassButton
          type="button"
          variant="gradient-ocean"
          effect="lift"
          size="sm"
          onClick={() => append({ type: "other", url: "" })}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <Plus size={18} className="me-2" />
          {t('button_labels.add_social_link')}
        </GlassButton>
      </div>

      {/* Enhanced Social Links Container */}
      <div className="space-y-4">
        {fields.map((item, index) => (
          <div key={item.id} className="group/social-item p-4 rounded-2xl bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-900/30 border-2 border-white/40 dark:border-gray-700/40 backdrop-blur-sm hover:border-cyan-300/50 dark:hover:border-cyan-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4">
                <FormField
                  control={form.control}
                  name={`socialLinks.${index}.type`}
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-200/50 dark:border-cyan-800/50 flex items-center justify-center transition-all duration-300">
                            <Link size={16} className="text-cyan-600 dark:text-cyan-400" />
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
                                className="w-full px-4 py-3 text-sm rounded-xl border-2 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm transition-all duration-300 ease-out focus:ring-3 focus:ring-cyan-500/30 focus:border-cyan-400 hover:bg-white/70 dark:hover:bg-gray-600/70 hover:shadow-md hover:shadow-cyan-500/20"
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
                        <FormMessage />
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
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-200/50 dark:border-cyan-800/50 flex items-center justify-center transition-all duration-300">
                            <Link size={16} className="text-cyan-600 dark:text-cyan-400" />
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
                              className="w-full px-4 py-3 text-sm rounded-xl border-2 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm transition-all duration-300 ease-out focus:ring-3 focus:ring-cyan-500/30 focus:border-cyan-400 hover:bg-white/70 dark:hover:bg-gray-600/70 hover:shadow-md hover:shadow-cyan-500/20"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
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
                  className="text-red-500 hover:bg-red-100/30 dark:hover:bg-red-900/20 h-10 w-10 rounded-full transition-all duration-300 hover:scale-110 group-hover/social-item:scale-110"
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