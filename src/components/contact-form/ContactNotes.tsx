import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ModernTextarea } from '@/components/ui/modern-textarea';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { ContactFormValues } from '@/types/contact';
import { FileText, UserCheck, AlertCircle } from 'lucide-react';

const ContactNotes: React.FC = React.memo(() => {
  const form = useFormContext<ContactFormValues>();
  const { t } = useTranslation();

  return (
    <div className="space-y-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
      {/* Notes Section */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200/30 dark:border-indigo-800/30">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
          <FileText size={20} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          {t('section_titles.notes')}
        </h3>
      </div>

      <div className="p-4 rounded-xl glass">
        <div className="group/field p-4 rounded-2xl bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-900/30 border-2 border-white/40 dark:border-gray-700/40 backdrop-blur-sm hover:border-indigo-300/50 dark:hover:border-indigo-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20">
          <FormField
            control={form.control}
            name="notes"
            render={({ field, fieldState }) => (
              <FormItem>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-center transition-all duration-300">
                      <FileText size={16} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('contact_form.notes')}
                    </FormLabel>
                  </div>

                  <div className="relative">
                    <FormControl>
                      <ModernTextarea
                        placeholder={t('contact_form.notes_placeholder')}
                        variant="glass"
                        className={`
                          w-full px-4 py-3 text-sm rounded-xl
                          border-2 bg-white/50 dark:bg-gray-700/50
                          backdrop-blur-sm
                          transition-all duration-300 ease-out
                          focus:ring-3 focus:ring-indigo-500/30 focus:border-indigo-400
                          hover:bg-white/70 dark:hover:bg-gray-600/70
                          hover:shadow-md hover:shadow-indigo-500/20
                          ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : 'border-white/40 dark:border-gray-600/40'}
                          ${field.value && !fieldState.error ? 'border-green-400' : ''}
                          min-h-[120px] resize-none
                        `}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>

                    {field.value && !fieldState.error && (
                      <div className="absolute right-3 top-4">
                        <UserCheck size={16} className="text-green-500 animate-pulse" />
                      </div>
                    )}

                    {fieldState.error && (
                      <div className="absolute right-3 top-4">
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

ContactNotes.displayName = 'ContactNotes';

export default ContactNotes;