import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ModernPopover, ModernPopoverContent, ModernPopoverTrigger } from '@/components/ui/modern-popover';
import { GlassButton } from "@/components/ui/glass-button";
import { FormField, FormLabel, FormControl } from '@/components/ui/form';
import { FormCard } from '@/components/ui/FormCard';
import { FormSection } from '@/components/ui/FormSection';
import { CalendarIcon, AlertCircle, Cake } from 'lucide-react';
import { JalaliCalendar } from '@/components/JalaliCalendar';
import { cn } from '@/lib/utils';
import { ContactFormValues } from '@/types/contact';
import { useTranslation } from 'react-i18next';
import { useJalaliCalendar } from '@/hooks/use-jalali-calendar';

const ContactImportantDates: React.FC = React.memo(() => {
  const { i18n } = useTranslation();
  const form = useFormContext<ContactFormValues>();
  const { formatDate } = useJalaliCalendar();

  // Determine text direction based on language
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';

  return (
    <FormCard
      title="تاریخ‌های مهم"
      description="تاریخ تولد و سایر مناسبت‌های مهم را وارد کنید"
      icon={Cake}
      iconColor="#ec4899"
    >
      <div className="space-y-3">
        <FormSection
          variant="card"
          title=""
          className="relative"
        >
          <FormField
            control={form.control}
            name="birthday"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  تاریخ تولد
                </FormLabel>
                <FormControl>
                  <ModernPopover>
                    <ModernPopoverTrigger asChild>
                      <GlassButton
                        variant="glass"
                        className={cn(
                          "w-full justify-start text-left font-normal py-3 px-4 text-sm rounded-lg border-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-md transition-all duration-300 ease-out focus:ring-4 focus:ring-pink-500/30 focus:border-pink-400 hover:bg-white/95 dark:hover:bg-gray-600/95 hover:shadow-xl hover:shadow-pink-500/20",
                          fieldState.error ? 'border-red-300 focus:border-red-500' : 'border-slate-200 dark:border-slate-600'
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <CalendarIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                          {field.value ? (
                            <span className="text-slate-800 dark:text-white font-medium">
                              {formatDate(new Date(field.value))}
                            </span>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400">تاریخ تولد را انتخاب کنید</span>
                          )}
                        </span>
                      </GlassButton>
                    </ModernPopoverTrigger>
                    <ModernPopoverContent className="w-auto p-0 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-xl">
                      <JalaliCalendar
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          field.onChange(date ? date.toISOString() : "");
                        }}
                        showToggle={false}
                      />
                    </ModernPopoverContent>
                  </ModernPopover>
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
        </FormSection>
      </div>
    </FormCard>
  );
});

ContactImportantDates.displayName = 'ContactImportantDates';

export default ContactImportantDates;