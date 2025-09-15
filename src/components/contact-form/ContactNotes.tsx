import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ModernTextarea } from '@/components/ui/modern-textarea';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { ContactFormValues } from '@/types/contact';
import { FileText, UserCheck, AlertCircle } from 'lucide-react';

const ContactNotes: React.FC = React.memo(() => {
  const form = useFormContext<ContactFormValues>();
  const { t } = useTranslation();

  return (
    <div className="space-y-4 pt-4 border-t border-border/30">
      {/* Compact Notes Header */}
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 dark:bg-muted/10 border border-border/30">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/90 to-primary/70 flex items-center justify-center shadow-sm">
          <FileText size={16} className="text-white" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          {t('section_titles.notes')}
        </h3>
      </div>

      <div className="rounded-lg">
        <div className="group/field p-3 rounded-lg bg-muted/10 dark:bg-muted/10 border border-border/20 hover:border-primary/40 transition-colors duration-200">
          <FormField
            control={form.control}
            name="notes"
            render={({ field, fieldState }) => (
              <FormItem>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-info-100/80 to-info-50/80 dark:from-info-900/30 dark:to-info-800/20 border border-info-200/50 dark:border-info-800/50 flex items-center justify-center transition-all duration-300">
                      <FileText size={16} className="text-info-600 dark:text-info-400" />
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
                          focus:ring-3 focus:ring-info-500/30 focus:border-info-400
                          hover:bg-white/70 dark:hover:bg-gray-600/70
                          hover:shadow-md hover:shadow-info-500/20
                          ${fieldState.error ? 'border-error-400 focus:ring-error-500/30' : 'border-white/40 dark:border-gray-600/40'}
                          ${field.value && !fieldState.error ? 'border-success-400' : ''}
                          min-h-[120px] resize-none
                        `}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>

                    {field.value && !fieldState.error && (
                      <div className="absolute right-3 top-4">
                        <UserCheck size={16} className="text-success-500 animate-pulse" />
                      </div>
                    )}

                    {fieldState.error && (
                      <div className="absolute right-3 top-4">
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

ContactNotes.displayName = 'ContactNotes';

export default ContactNotes;