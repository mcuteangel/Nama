import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ModernInput } from '@/components/ui/modern-input';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { ContactFormValues } from '@/types/contact';
import { MapPin, UserCheck, AlertCircle } from 'lucide-react';

const ContactAddress: React.FC = React.memo(() => {
  const form = useFormContext<ContactFormValues>();
  const { t } = useTranslation();

  return (
    <div className="space-y-4 pt-4 border-t border-border/30">
      {/* Compact Header */}
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 dark:bg-muted/10 border border-border/30">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/90 to-primary/70 flex items-center justify-center shadow-sm">
          <MapPin size={16} className="text-white" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          {t('section_titles.address')}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="group/field p-3 rounded-lg bg-muted/10 dark:bg-muted/10 border border-border/20 hover:border-primary/40 transition-colors duration-200">
          <FormField
            control={form.control}
            name="street"
            render={({ field, fieldState }) => (
              <FormItem>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-warning-100/80 to-warning-50/80 dark:from-warning-900/30 dark:to-warning-800/20 border border-warning-200/50 dark:border-warning-800/50 flex items-center justify-center transition-all duration-300">
                      <MapPin size={16} className="text-warning-600 dark:text-warning-400" />
                    </div>
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('contact_form.street')}
                    </FormLabel>
                  </div>

                  <div className="relative">
                    <FormControl>
                      <ModernInput
                        placeholder={t('contact_form.street_placeholder')}
                        variant="glass"
                        className={`
                          w-full px-4 py-3 text-sm rounded-xl
                          border-2 bg-white/50 dark:bg-gray-700/50
                          backdrop-blur-sm
                          transition-all duration-300 ease-out
                          focus:ring-3 focus:ring-warning-500/30 focus:border-warning-400
                          hover:bg-white/70 dark:hover:bg-gray-600/70
                          hover:shadow-md hover:shadow-warning-500/20
                          ${fieldState.error ? 'border-error-400 focus:ring-error-500/30' : 'border-white/40 dark:border-gray-600/40'}
                          ${field.value && !fieldState.error ? 'border-success-400' : ''}
                        `}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>

                    {field.value && !fieldState.error && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <UserCheck size={16} className="text-success-500 animate-pulse" />
                      </div>
                    )}

                    {fieldState.error && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <AlertCircle size={16} className="text-error-500" />
                      </div>
                    )}
                  </div>

                  {fieldState.error && (
                    <p className="text-xs text-error-500 dark:text-error-400 flex items-center gap-1 mt-1">
                      <AlertCircle size={12} />
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="group/field p-3 rounded-lg bg-muted/10 dark:bg-muted/10 border border-border/20 hover:border-primary/40 transition-colors duration-200">
          <FormField
            control={form.control}
            name="city"
            render={({ field, fieldState }) => (
              <FormItem>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-warning-100/80 to-warning-50/80 dark:from-warning-900/30 dark:to-warning-800/20 border border-warning-200/50 dark:border-warning-800/50 flex items-center justify-center transition-all duration-300">
                      <MapPin size={16} className="text-warning-600 dark:text-warning-400" />
                    </div>
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('contact_form.city')}
                    </FormLabel>
                  </div>

                  <div className="relative">
                    <FormControl>
                      <ModernInput
                        placeholder={t('contact_form.city_placeholder')}
                        variant="glass"
                        className={`
                          w-full px-4 py-3 text-sm rounded-xl
                          border-2 bg-white/50 dark:bg-gray-700/50
                          backdrop-blur-sm
                          transition-all duration-300 ease-out
                          focus:ring-3 focus:ring-warning-500/30 focus:border-warning-400
                          hover:bg-white/70 dark:hover:bg-gray-600/70
                          hover:shadow-md hover:shadow-warning-500/20
                          ${fieldState.error ? 'border-error-400 focus:ring-error-500/30' : 'border-white/40 dark:border-gray-600/40'}
                          ${field.value && !fieldState.error ? 'border-success-400' : ''}
                        `}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>

                    {field.value && !fieldState.error && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <UserCheck size={16} className="text-success-500 animate-pulse" />
                      </div>
                    )}

                    {fieldState.error && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <AlertCircle size={16} className="text-error-500" />
                      </div>
                    )}
                  </div>

                  {fieldState.error && (
                    <p className="text-xs text-error-500 dark:text-error-400 flex items-center gap-1 mt-1">
                      <AlertCircle size={12} />
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="group/field p-3 rounded-lg bg-muted/10 dark:bg-muted/10 border border-border/20 hover:border-primary/40 transition-colors duration-200">
          <FormField
            control={form.control}
            name="state"
            render={({ field, fieldState }) => (
              <FormItem>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-warning-100/80 to-warning-50/80 dark:from-warning-900/30 dark:to-warning-800/20 border border-warning-200/50 dark:border-warning-800/50 flex items-center justify-center transition-all duration-300">
                      <MapPin size={16} className="text-warning-600 dark:text-warning-400" />
                    </div>
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('contact_form.state')}
                    </FormLabel>
                  </div>

                  <div className="relative">
                    <FormControl>
                      <ModernInput
                        placeholder={t('contact_form.state_placeholder')}
                        variant="glass"
                        className={`
                          w-full px-4 py-3 text-sm rounded-xl
                          border-2 bg-white/50 dark:bg-gray-700/50
                          backdrop-blur-sm
                          transition-all duration-300 ease-out
                          focus:ring-3 focus:ring-warning-500/30 focus:border-warning-400
                          hover:bg-white/70 dark:hover:bg-gray-600/70
                          hover:shadow-md hover:shadow-warning-500/20
                          ${fieldState.error ? 'border-error-400 focus:ring-error-500/30' : 'border-white/40 dark:border-gray-600/40'}
                          ${field.value && !fieldState.error ? 'border-success-400' : ''}
                        `}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>

                    {field.value && !fieldState.error && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <UserCheck size={16} className="text-success-500 animate-pulse" />
                      </div>
                    )}

                    {fieldState.error && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <AlertCircle size={16} className="text-error-500" />
                      </div>
                    )}
                  </div>

                  {fieldState.error && (
                    <p className="text-xs text-error-500 dark:text-error-400 flex items-center gap-1 mt-1">
                      <AlertCircle size={12} />
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="group/field p-3 rounded-lg bg-muted/10 dark:bg-muted/10 border border-border/20 hover:border-primary/40 transition-colors duration-200">
          <FormField
            control={form.control}
            name="zipCode"
            render={({ field, fieldState }) => (
              <FormItem>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-warning-100/80 to-warning-50/80 dark:from-warning-900/30 dark:to-warning-800/20 border border-warning-200/50 dark:border-warning-800/50 flex items-center justify-center transition-all duration-300">
                      <MapPin size={16} className="text-warning-600 dark:text-warning-400" />
                    </div>
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('contact_form.zip_code')}
                    </FormLabel>
                  </div>

                  <div className="relative">
                    <FormControl>
                      <ModernInput
                        placeholder={t('contact_form.zip_code_placeholder')}
                        variant="glass"
                        className={`
                          w-full px-4 py-3 text-sm rounded-xl
                          border-2 bg-white/50 dark:bg-gray-700/50
                          backdrop-blur-sm
                          transition-all duration-300 ease-out
                          focus:ring-3 focus:ring-warning-500/30 focus:border-warning-400
                          hover:bg-white/70 dark:hover:bg-gray-600/70
                          hover:shadow-md hover:shadow-warning-500/20
                          ${fieldState.error ? 'border-error-400 focus:ring-error-500/30' : 'border-white/40 dark:border-gray-600/40'}
                          ${field.value && !fieldState.error ? 'border-success-400' : ''}
                        `}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>

                    {field.value && !fieldState.error && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <UserCheck size={16} className="text-success-500 animate-pulse" />
                      </div>
                    )}

                    {fieldState.error && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <AlertCircle size={16} className="text-error-500" />
                      </div>
                    )}
                  </div>

                  {fieldState.error && (
                    <p className="text-xs text-error-500 dark:text-error-400 flex items-center gap-1 mt-1">
                      <AlertCircle size={12} />
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="group/field p-3 rounded-lg bg-muted/10 dark:bg-muted/10 border border-border/20 hover:border-primary/40 transition-colors duration-200 md:col-span-2">
          <FormField
            control={form.control}
            name="country"
            render={({ field, fieldState }) => (
              <FormItem>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-warning-100/80 to-warning-50/80 dark:from-warning-900/30 dark:to-warning-800/20 border border-warning-200/50 dark:border-warning-800/50 flex items-center justify-center transition-all duration-300">
                      <MapPin size={16} className="text-warning-600 dark:text-warning-400" />
                    </div>
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('contact_form.country')}
                    </FormLabel>
                  </div>

                  <div className="relative">
                    <FormControl>
                      <ModernInput
                        placeholder={t('contact_form.country_placeholder')}
                        variant="glass"
                        className={`
                          w-full px-4 py-3 text-sm rounded-xl
                          border-2 bg-white/50 dark:bg-gray-700/50
                          backdrop-blur-sm
                          transition-all duration-300 ease-out
                          focus:ring-3 focus:ring-warning-500/30 focus:border-warning-400
                          hover:bg-white/70 dark:hover:bg-gray-600/70
                          hover:shadow-md hover:shadow-warning-500/20
                          ${fieldState.error ? 'border-error-400 focus:ring-error-500/30' : 'border-white/40 dark:border-gray-600/40'}
                          ${field.value && !fieldState.error ? 'border-success-400' : ''}
                        `}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>

                    {field.value && !fieldState.error && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <UserCheck size={16} className="text-success-500 animate-pulse" />
                      </div>
                    )}

                    {fieldState.error && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <AlertCircle size={16} className="text-error-500" />
                      </div>
                    )}
                  </div>

                  {fieldState.error && (
                    <p className="text-xs text-error-500 dark:text-error-400 flex items-center gap-1 mt-1">
                      <AlertCircle size={12} />
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
});

ContactAddress.displayName = 'ContactAddress';

export default ContactAddress;