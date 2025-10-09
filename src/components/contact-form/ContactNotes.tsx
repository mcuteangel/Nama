import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ModernTextarea } from '@/components/ui/modern-textarea';
import { FormField, FormLabel, FormControl } from '@/components/ui/form';
import { FormSection } from '@/components/ui/FormSection';
import { FormCard } from '@/components/ui/FormCard';
import { ContactFormValues } from '@/types/contact';
import { FileText, AlertCircle, CheckCircle, XCircle, PenTool } from 'lucide-react';

const ContactNotes: React.FC = React.memo(() => {
  const form = useFormContext<ContactFormValues>();
  useTranslation();
  const [focusedField, setFocusedField] = useState<string | null>(null);

  return (
    <FormSection
      icon={FileText}
      title="یادداشت‌ها"
      description="اطلاعات اضافی و یادداشت‌های مربوط به مخاطب را وارد کنید"
      className="space-y-4"
    >
      <FormCard
        title="یادداشت‌ها"
        description="هر اطلاعاتی که می‌خواهید درباره این مخاطب یادداشت کنید"
        icon={PenTool}
        iconColor="#22c55e"
        className="group"
      >
        <FormField
          control={form.control}
          name="notes"
          render={({ field, fieldState }) => (
            <div className="space-y-4">
              <div className="relative">
                <FormControl>
                  <ModernTextarea
                    placeholder="یادداشت‌های خود را درباره این مخاطب اینجا بنویسید..."
                    variant="glass"
                    className={`
                      w-full px-4 py-3 text-base rounded-lg
                      bg-white/80 dark:bg-gray-700/80
                      border-2 border-slate-200 dark:border-slate-600
                      backdrop-blur-md
                      transition-all duration-300 ease-out
                      focus:ring-4 focus:ring-green-500/30 focus:border-green-400
                      hover:bg-white/95 dark:hover:bg-gray-600/95
                      hover:shadow-xl hover:shadow-green-500/20
                      hover:scale-[1.005]
                      ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : ''}
                      ${focusedField === 'notes' ? 'scale-105 shadow-2xl ring-4 ring-green-500/20' : ''}
                      ${field.value && !fieldState.error ? 'border-green-400 shadow-green-500/20' : ''}
                      min-h-[160px] resize-none
                    `}
                    style={{
                      fontSize: '16px' // Prevents zoom on iOS
                    }}
                    {...field}
                    value={field.value || ''}
                    onFocus={() => setFocusedField('notes')}
                    onBlur={() => setFocusedField(null)}
                  />
                </FormControl>

                <div className="absolute right-3 top-3 flex items-center gap-2">
                  {field.value && !fieldState.error && (
                    <CheckCircle size={16} className="text-green-500 animate-bounce" />
                  )}
                  {fieldState.error && (
                    <XCircle size={16} className="text-red-500 animate-pulse" />
                  )}
                </div>

                {field.value && (
                  <div className="absolute left-3 bottom-3 text-sm text-slate-500 dark:text-slate-400">
                    {field.value.length} کاراکتر
                  </div>
                )}

                {fieldState.error && (
                  <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                      <AlertCircle size={14} />
                      {fieldState.error.message}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        />
      </FormCard>
    </FormSection>
  );
});

ContactNotes.displayName = 'ContactNotes';

export default ContactNotes;