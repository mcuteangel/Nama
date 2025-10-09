import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { ModernPopover, ModernPopoverContent, ModernPopoverTrigger } from '@/components/ui/modern-popover';
import { GlassButton } from "@/components/ui/glass-button";
import { FormField, FormLabel, FormControl } from '@/components/ui/form';
import { FormSection } from '@/components/ui/FormSection';
import { FormCard } from '@/components/ui/FormCard';
import { CalendarIcon, AlertCircle, Cake, CheckCircle, XCircle, Heart } from 'lucide-react';
import { JalaliCalendar } from '@/components/JalaliCalendar';
import { cn } from '@/lib/utils';
import { ContactFormValues } from '@/types/contact';
import { useTranslation } from 'react-i18next';
import { useAppSettings } from '@/hooks/use-app-settings';
import { useJalaliCalendar } from '@/hooks/use-jalali-calendar';

const ContactImportantDates: React.FC = React.memo(() => {
  useTranslation();
  const form = useFormContext<ContactFormValues>();
  useAppSettings();
  const { formatDate } = useJalaliCalendar();
  const [focusedField, setFocusedField] = useState<string | null>(null);

  return (
    <FormSection
      icon={Cake}
      title="تاریخ‌های مهم"
      description="تاریخ تولد و سایر مناسبت‌های مهم را وارد کنید"
      className="space-y-4"
    >
      <FormCard
        title="تاریخ تولد"
        description="تاریخ تولد مخاطب را انتخاب کنید"
        icon={Cake}
        iconColor="#ec4899"
        className="group"
      >
        <FormField
          control={form.control}
          name="birthday"
          render={({ field, fieldState }) => (
            <div className="space-y-4">
              <div className="relative">
                <ModernPopover>
                  <ModernPopoverTrigger asChild>
                    <FormControl>
                      <GlassButton
                        variant="glass"
                        className={cn(
                          "w-full justify-start text-left font-normal py-4 px-6 text-base rounded-xl border-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-md transition-all duration-300 ease-out focus:ring-4 focus:ring-pink-500/30 focus:border-pink-400 hover:bg-white/95 dark:hover:bg-gray-600/95 hover:shadow-xl hover:shadow-pink-500/20 hover:scale-[1.01]",
                          fieldState.error ? 'border-red-400 focus:ring-red-500/30' : 'border-slate-200 dark:border-slate-600',
                          focusedField === 'birthday' ? 'scale-105 shadow-2xl ring-4 ring-pink-500/20' : '',
                          field.value && !fieldState.error ? 'border-green-400 shadow-green-500/20' : ''
                        )}
                        onFocus={() => setFocusedField('birthday')}
                        onBlur={() => setFocusedField(null)}
                      >
                        <span className="flex items-center gap-3">
                          <CalendarIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                          {field.value ? (
                            <span className="text-slate-800 dark:text-white font-medium">
                              {formatDate(new Date(field.value))}
                            </span>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400">تاریخ تولد را انتخاب کنید</span>
                          )}
                        </span>
                      </GlassButton>
                    </FormControl>
                  </ModernPopoverTrigger>
                  <ModernPopoverContent className="w-auto p-0 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl">
                    <JalaliCalendar
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        field.onChange(date ? date.toISOString() : "");
                        setFocusedField(null);
                      }}
                      showToggle={false}
                    />
                  </ModernPopoverContent>
                </ModernPopover>

                <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  {field.value && !fieldState.error && (
                    <CheckCircle size={20} className="text-green-500 animate-bounce" />
                  )}
                  {fieldState.error && (
                    <XCircle size={20} className="text-red-500 animate-pulse" />
                  )}
                </div>

                {fieldState.error && (
                  <div className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                      <AlertCircle size={16} />
                      {fieldState.error.message}
                    </p>
                  </div>
                )}

                {field.value && !fieldState.error && (
                  <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30">
                    <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                      <CheckCircle size={16} />
                      تاریخ تولد با موفقیت ثبت شد
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        />
      </FormCard>

      {/* Future dates section */}
      <FormCard
        title="تاریخ‌های دیگر"
        description="امکان افزودن تاریخ‌های مهم دیگر در آینده"
        icon={Heart}
        iconColor="#f97316"
      >
        <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 border-dashed">
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
            <Heart size={20} className="text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              قابلیت‌های آینده
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              سالگرد ازدواج، تاریخ استخدام و سایر مناسبت‌های مهم
            </p>
          </div>
        </div>
      </FormCard>
    </FormSection>
  );
});

ContactImportantDates.displayName = 'ContactImportantDates';

export default ContactImportantDates;