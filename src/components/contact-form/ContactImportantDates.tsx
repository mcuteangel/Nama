import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { ModernPopover, ModernPopoverContent, ModernPopoverTrigger } from '@/components/ui/modern-popover';
import { GlassButton } from "@/components/ui/glass-button";
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { CalendarIcon, UserCheck, AlertCircle, Cake } from 'lucide-react';
import { JalaliCalendar } from '@/components/JalaliCalendar';
import { cn } from '@/lib/utils';
import { ContactFormValues } from '@/types/contact';
import { useTranslation } from 'react-i18next';
import { useAppSettings } from '@/hooks/use-app-settings';
import { useJalaliCalendar } from '@/hooks/use-jalali-calendar';

const ContactImportantDates: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const form = useFormContext<ContactFormValues>();
  const {} = useAppSettings();
  const { formatDate } = useJalaliCalendar();
  const [isCalendarFocused, setIsCalendarFocused] = useState(false);

  return (
    <div className="space-y-4 pt-4 border-t border-border/30">
      {/* Compact Header */}
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 dark:bg-muted/10 border border-border/30">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-warning/90 to-warning/70 flex items-center justify-center shadow-sm">
          <Cake size={16} className="text-white" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          {t('section_titles.important_dates')}
        </h3>
      </div>

      {/* Enhanced Dates Container */}
      <div className="p-4 rounded-lg bg-muted/10 dark:bg-muted/10 border border-border/20 hover:border-warning/40 transition-colors duration-200">
        <FormField
          control={form.control}
          name="birthday"
          render={({ field, fieldState }) => (
            <FormItem className="flex flex-col space-y-3">
              <div className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center
                  bg-gradient-to-br from-primary-100/80 to-primary-50/80 dark:from-primary-900/30 dark:to-primary-800/20
                  border border-primary-200/50 dark:border-primary-800/50
                  transition-all duration-300
                  ${isCalendarFocused ? 'scale-110 shadow-lg shadow-primary-500/20' : ''}
                `}>
                  <CalendarIcon size={20} className="text-primary-600 dark:text-primary-400" />
                </div>
                <FormLabel className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {t('form_labels.birth_date')}
                </FormLabel>
              </div>

              <div className="relative group">
                <ModernPopover>
                  <ModernPopoverTrigger asChild>
                    <FormControl>
                      <GlassButton
                        variant="glass"
                        className={cn(
                          "w-full justify-start text-left font-normal py-4 px-6 text-lg rounded-2xl border-2 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm transition-all duration-300 ease-out focus:ring-4 focus:ring-primary-500/30 focus:border-primary-400 hover:bg-white/80 dark:hover:bg-gray-600/80 hover:shadow-lg hover:shadow-primary-500/20",
                          fieldState.error ? 'border-error-400 focus:ring-error-500/30' : 'border-white/50 dark:border-gray-600/50',
                          isCalendarFocused ? 'scale-[1.02] shadow-xl' : '',
                          field.value && !fieldState.error ? 'border-success-400' : ''
                        )}
                        onFocus={() => setIsCalendarFocused(true)}
                        onBlur={() => setIsCalendarFocused(false)}
                      >
                        <span className="flex items-center gap-3">
                          <CalendarIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          {field.value ? formatDate(new Date(field.value)) : <span className="text-gray-500 dark:text-gray-400">{t('form_placeholders.select_birth_date')}</span>}
                        </span>
                      </GlassButton>
                    </FormControl>
                  </ModernPopoverTrigger>
                  <ModernPopoverContent className="w-auto p-0 rounded-2xl border-2 border-white/30 dark:border-gray-600/30 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-2xl">
                    <JalaliCalendar
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        field.onChange(date ? date.toISOString() : "");
                        setIsCalendarFocused(false);
                      }}
                      showToggle={false}
                    />
                  </ModernPopoverContent>
                </ModernPopover>

                {field.value && !fieldState.error && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <UserCheck size={20} className="text-success-500 animate-pulse" />
                  </div>
                )}

                {fieldState.error && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <AlertCircle size={20} className="text-error-500" />
                  </div>
                )}
              </div>

              {fieldState.error && (
                <p className="text-xs text-error-500 dark:text-error-400 flex items-center gap-1 mt-2 animate-slide-in">
                  <AlertCircle size={16} />
                  {fieldState.error.message}
                </p>
              )}

              {field.value && !fieldState.error && (
                <p className="mt-4 text-sm text-green-600 dark:text-green-400 flex items-center gap-2 animate-slide-in">
                  <UserCheck size={16} />
                  <span>{t('common.birthday_registered')}</span>
              </p>
              )}
            </FormItem>
          )}
        />
        {/* You can add other date fields here, e.g., anniversary */}
      </div>
    </div>
  );
});

ContactImportantDates.displayName = 'ContactImportantDates';

export default ContactImportantDates;