import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ModernInput } from '@/components/ui/modern-input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { ContactFormValues } from '@/types/contact';
import { MapPin, UserCheck, AlertCircle } from 'lucide-react';

const ContactAddress: React.FC = React.memo(() => {
  const form = useFormContext<ContactFormValues>();
  const { t } = useTranslation();

  return (
    <div className="space-y-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
      {/* Address Section */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-orange-50/50 to-amber-50/50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200/30 dark:border-orange-800/30">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
          <MapPin size={20} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          {t('section_titles.address')}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl glass">
        <div className="group/field p-4 rounded-2xl bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-900/30 border-2 border-white/40 dark:border-gray-700/40 backdrop-blur-sm hover:border-orange-300/50 dark:hover:border-orange-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
          <FormField
            control={form.control}
            name="street"
            render={({ field, fieldState }) => (
              <FormItem>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-600/20 border border-orange-200/50 dark:border-orange-800/50 flex items-center justify-center transition-all duration-300">
                      <MapPin size={16} className="text-orange-600 dark:text-orange-400" />
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
                          focus:ring-3 focus:ring-orange-500/30 focus:border-orange-400
                          hover:bg-white/70 dark:hover:bg-gray-600/70
                          hover:shadow-md hover:shadow-orange-500/20
                          ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : 'border-white/40 dark:border-gray-600/40'}
                          ${field.value && !fieldState.error ? 'border-green-400' : ''}
                        `}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>

                    {field.value && !fieldState.error && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <UserCheck size={16} className="text-green-500 animate-pulse" />
                      </div>
                    )}

                    {fieldState.error && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <AlertCircle size={16} className="text-red-500" />
                      </div>
                    )}
                  </div>

                  {fieldState.error && (
                    <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1 mt-1">
                      <AlertCircle size={12} />
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="group/field p-4 rounded-2xl bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-900/30 border-2 border-white/40 dark:border-gray-700/40 backdrop-blur-sm hover:border-orange-300/50 dark:hover:border-orange-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
          <FormField
            control={form.control}
            name="city"
            render={({ field, fieldState }) => (
              <FormItem>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-600/20 border border-orange-200/50 dark:border-orange-800/50 flex items-center justify-center transition-all duration-300">
                      <MapPin size={16} className="text-orange-600 dark:text-orange-400" />
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
                          focus:ring-3 focus:ring-orange-500/30 focus:border-orange-400
                          hover:bg-white/70 dark:hover:bg-gray-600/70
                          hover:shadow-md hover:shadow-orange-500/20
                          ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : 'border-white/40 dark:border-gray-600/40'}
                          ${field.value && !fieldState.error ? 'border-green-400' : ''}
                        `}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>

                    {field.value && !fieldState.error && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <UserCheck size={16} className="text-green-500 animate-pulse" />
                      </div>
                    )}

                    {fieldState.error && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <AlertCircle size={16} className="text-red-500" />
                      </div>
                    )}
                  </div>

                  {fieldState.error && (
                    <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1 mt-1">
                      <AlertCircle size={12} />
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="group/field p-4 rounded-2xl bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-900/30 border-2 border-white/40 dark:border-gray-700/40 backdrop-blur-sm hover:border-orange-300/50 dark:hover:border-orange-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
          <FormField
            control={form.control}
            name="state"
            render={({ field, fieldState }) => (
              <FormItem>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-600/20 border border-orange-200/50 dark:border-orange-800/50 flex items-center justify-center transition-all duration-300">
                      <MapPin size={16} className="text-orange-600 dark:text-orange-400" />
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
                          focus:ring-3 focus:ring-orange-500/30 focus:border-orange-400
                          hover:bg-white/70 dark:hover:bg-gray-600/70
                          hover:shadow-md hover:shadow-orange-500/20
                          ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : 'border-white/40 dark:border-gray-600/40'}
                          ${field.value && !fieldState.error ? 'border-green-400' : ''}
                        `}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>

                    {field.value && !fieldState.error && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <UserCheck size={16} className="text-green-500 animate-pulse" />
                      </div>
                    )}

                    {fieldState.error && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <AlertCircle size={16} className="text-red-500" />
                      </div>
                    )}
                  </div>

                  {fieldState.error && (
                    <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1 mt-1">
                      <AlertCircle size={12} />
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="group/field p-4 rounded-2xl bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-900/30 border-2 border-white/40 dark:border-gray-700/40 backdrop-blur-sm hover:border-orange-300/50 dark:hover:border-orange-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
          <FormField
            control={form.control}
            name="zipCode"
            render={({ field, fieldState }) => (
              <FormItem>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-600/20 border border-orange-200/50 dark:border-orange-800/50 flex items-center justify-center transition-all duration-300">
                      <MapPin size={16} className="text-orange-600 dark:text-orange-400" />
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
                          focus:ring-3 focus:ring-orange-500/30 focus:border-orange-400
                          hover:bg-white/70 dark:hover:bg-gray-600/70
                          hover:shadow-md hover:shadow-orange-500/20
                          ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : 'border-white/40 dark:border-gray-600/40'}
                          ${field.value && !fieldState.error ? 'border-green-400' : ''}
                        `}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>

                    {field.value && !fieldState.error && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <UserCheck size={16} className="text-green-500 animate-pulse" />
                      </div>
                    )}

                    {fieldState.error && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <AlertCircle size={16} className="text-red-500" />
                      </div>
                    )}
                  </div>

                  {fieldState.error && (
                    <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1 mt-1">
                      <AlertCircle size={12} />
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="group/field p-4 rounded-2xl bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-900/30 border-2 border-white/40 dark:border-gray-700/40 backdrop-blur-sm hover:border-orange-300/50 dark:hover:border-orange-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 md:col-span-2">
          <FormField
            control={form.control}
            name="country"
            render={({ field, fieldState }) => (
              <FormItem>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-600/20 border border-orange-200/50 dark:border-orange-800/50 flex items-center justify-center transition-all duration-300">
                      <MapPin size={16} className="text-orange-600 dark:text-orange-400" />
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
                          focus:ring-3 focus:ring-orange-500/30 focus:border-orange-400
                          hover:bg-white/70 dark:hover:bg-gray-600/70
                          hover:shadow-md hover:shadow-orange-500/20
                          ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : 'border-white/40 dark:border-gray-600/40'}
                          ${field.value && !fieldState.error ? 'border-green-400' : ''}
                        `}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>

                    {field.value && !fieldState.error && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <UserCheck size={16} className="text-green-500 animate-pulse" />
                      </div>
                    )}

                    {fieldState.error && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <AlertCircle size={16} className="text-red-500" />
                      </div>
                    )}
                  </div>

                  {fieldState.error && (
                    <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1 mt-1">
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