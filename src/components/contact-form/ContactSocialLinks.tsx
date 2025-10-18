import React, { useMemo } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { GlassButton } from "@/components/ui/glass-button";
import { FormField, FormLabel, FormControl } from '@/components/ui/form';
import { FormCard } from '@/components/ui/FormCard';
import { FormSection } from '@/components/ui/FormSection';
import { Plus, X, Link, AlertCircle, Facebook, Twitter, Instagram, MessageCircle, Globe, Youtube, Github } from 'lucide-react';
import { ContactFormValues } from '@/types/contact';
import { useTranslation } from 'react-i18next';

const ContactSocialLinks: React.FC = React.memo(() => {
  const { i18n } = useTranslation();
  const form = useFormContext<ContactFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "socialLinks",
  });

  // Determine text direction based on language
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';

  const { t } = useTranslation();

  // Memoize social link type options to prevent unnecessary re-renders
  const socialLinkTypeOptions = useMemo(() => [
    { value: "linkedin", label: t('social_link_types.linkedin'), icon: Globe, color: "from-blue-500 to-blue-600" },
    { value: "twitter", label: t('social_link_types.twitter'), icon: Twitter, color: "from-blue-400 to-blue-500" },
    { value: "instagram", label: t('social_link_types.instagram'), icon: Instagram, color: "from-pink-500 to-purple-500" },
    { value: "telegram", label: t('social_link_types.telegram'), icon: MessageCircle, color: "from-blue-500 to-cyan-500" },
    { value: "website", label: t('social_link_types.website'), icon: Globe, color: "from-gray-500 to-gray-600" },
    { value: "facebook", label: t('social_link_types.facebook'), icon: Facebook, color: "from-blue-600 to-blue-700" },
    { value: "youtube", label: t('social_link_types.youtube'), icon: Youtube, color: "from-red-500 to-red-600" },
    { value: "github", label: t('social_link_types.github'), icon: Github, color: "from-gray-700 to-gray-800" },
    { value: "other", label: t('social_link_types.other'), icon: Link, color: "from-purple-500 to-indigo-500" },
  ], [t]);

  const handleAddSocialLink = () => {
    append({ type: "other", url: "" });
  };

  return (
    <FormCard
      title={t('contact_form.social_links.title')}
      description={t('contact_form.social_links.description')}
      icon={Link}
      iconColor="#06b6d4"
    >
      <div className="space-y-2">
        {/* Social Links List */}
        <div className="space-y-3">
          {fields.map((item, index) => {
            return (
              <FormSection
                key={item.id}
                variant="card"
                title=""
                className="relative group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <Link size={10} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('contact_form.social_links.item_label')} {index + 1}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <GlassButton
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                    aria-label={t('contact_form.social_links.delete_button_aria_label')}
                  >
                    <X size={12} />
                  </GlassButton>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* Social Type */}
                  <div className="sm:col-span-5">
                    <FormField
                      control={form.control}
                      name={`socialLinks.${index}.type`}
                      render={({ field, fieldState }) => (
                        <div className="space-y-1">
                          <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {t('contact_form.social_links.type_label')}
                          </FormLabel>
                          <FormControl>
                            <ModernSelect onValueChange={field.onChange} value={field.value} dir={isRTL ? 'rtl' : 'ltr'}>
                              <ModernSelectTrigger
                                className={`w-full ${fieldState.error ? 'border-red-300 focus:border-red-500' : ''}`}
                                dir={isRTL ? 'rtl' : 'ltr'}
                                variant="glass"
                              >
                                <ModernSelectValue placeholder={t('contact_form.social_links.type_placeholder')} />
                              </ModernSelectTrigger>
                              <ModernSelectContent dir={isRTL ? 'rtl' : 'ltr'} variant="glass">
                                {socialLinkTypeOptions.map(option => (
                                  <ModernSelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center gap-2">
                                      <option.icon size={14} />
                                      {option.label}
                                    </div>
                                  </ModernSelectItem>
                                ))}
                              </ModernSelectContent>
                            </ModernSelect>
                          </FormControl>
                          {fieldState.error && (
                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                              <AlertCircle size={12} />
                              {fieldState.error.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  {/* URL */}
                  <div className="sm:col-span-7">
                    <FormField
                      control={form.control}
                      name={`socialLinks.${index}.url`}
                      render={({ field, fieldState }) => (
                        <div className="space-y-1">
                          <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {t('contact_form.social_links.url_label')}
                          </FormLabel>
                          <FormControl>
                            <ModernInput
                              type="url"
                              placeholder={t('contact_form.social_links.url_placeholder')}
                              className={`w-full ${fieldState.error ? 'border-red-300 focus:border-red-500' : ''}`}
                              variant="glass"
                              {...field}
                            />
                          </FormControl>
                          {fieldState.error && (
                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                              <AlertCircle size={12} />
                              {fieldState.error.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>
              </FormSection>
            );
          })}
        </div>

        {/* Empty State */}
        {fields.length === 0 && (
          <div className="text-center py-2 text-slate-500 dark:text-slate-400">
            <Link size={18} className="mx-auto mb-1 opacity-50" />
            <p className="text-xs">{t('contact_form.social_links.empty_state_message')}</p>
          </div>
        )}

        {/* Add Social Link Button */}
        <div className="flex justify-start">
          <GlassButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddSocialLink}
            className="bg-primary-500/10 hover:bg-primary-500/20 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-xl border border-primary-200 dark:border-primary-800 transition-all duration-200"
          >
            <Plus size={14} />
            {t('contact_form.social_links.add_button')}
          </GlassButton>
        </div>
      </div>
    </FormCard>
  );
});

ContactSocialLinks.displayName = 'ContactSocialLinks';

export default ContactSocialLinks;