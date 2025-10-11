import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ModernTextarea } from '@/components/ui/modern-textarea';
import { FormField, FormLabel, FormControl } from '@/components/ui/form';
import { FormCard } from '@/components/ui/FormCard';
import { FormSection } from '@/components/ui/FormSection';
import { ContactFormValues } from '@/types/contact';
import { FileText, AlertCircle, PenTool } from 'lucide-react';

const ContactNotes: React.FC = React.memo(() => {
  const { i18n } = useTranslation();
  const form = useFormContext<ContactFormValues>();

  // Determine text direction based on language
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';

  return (
    <FormCard
      title="یادداشت‌ها"
      description="اطلاعات اضافی و یادداشت‌های مربوط به مخاطب را وارد کنید"
      icon={FileText}
      iconColor="#22c55e"
    >
      <div className="space-y-3">
        <FormSection
          variant="card"
          title=""
          className="relative"
        >
          <FormField
            control={form.control}
            name="notes"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <PenTool size={10} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    یادداشت‌ها
                  </FormLabel>
                </div>
                <FormControl>
                  <ModernTextarea
                    placeholder="یادداشت‌های خود را درباره این مخاطب اینجا بنویسید..."
                    variant="glass"
                    className={`w-full px-3 py-2 text-sm rounded-lg border-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-md transition-all duration-300 ease-out focus:ring-4 focus:ring-green-500/30 focus:border-green-400 hover:bg-white/95 dark:hover:bg-gray-600/95 hover:shadow-xl hover:shadow-green-500/20 min-h-[120px] resize-none ${fieldState.error ? 'border-red-300 focus:border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                {field.value && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 text-left">
                    {field.value.length} کاراکتر
                  </div>
                )}
                {fieldState.error && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        </FormSection>
      </div>
    </FormCard>
  );
});

ContactNotes.displayName = 'ContactNotes';

export default ContactNotes;