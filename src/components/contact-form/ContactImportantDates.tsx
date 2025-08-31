import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ModernPopover, ModernPopoverContent, ModernPopoverTrigger } from '@/components/ui/modern-popover';
import { GlassButton } from "@/components/ui/glass-button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns-jalali';
import { JalaliCalendar } from '@/components/JalaliCalendar';
import { cn } from '@/lib/utils';
import { ContactFormValues } from '@/types/contact';
import { useTranslation } from 'react-i18next';

const ContactImportantDates: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const form = useFormContext<ContactFormValues>();

  return (
    <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 heading-3">
        {t('section_titles.important_dates')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl glass">
        <FormField
          control={form.control}
          name="birthday"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-gray-700 dark:text-gray-200 font-medium">
                {t('form_labels.birth_date')}
              </FormLabel>
              <ModernPopover>
                <ModernPopoverTrigger asChild>
                  <FormControl>
                    <GlassButton
                      variant={"glass"}
                      className={cn(
                        "w-full justify-start text-left font-normal py-3 bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 hover:bg-white/40 dark:hover:bg-gray-700/40",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <span className="flex items-center">
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {field.value ? format(new Date(field.value), "yyyy/MM/dd") : <span>{t('form_placeholders.select_birth_date')}</span>}
                      </span>
                    </GlassButton>
                  </FormControl>
                </ModernPopoverTrigger>
                <ModernPopoverContent className="w-auto p-0" glassEffect="strong">
                  <JalaliCalendar
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date ? date.toISOString() : "")}
                    showToggle={false}
                  />
                </ModernPopoverContent>
              </ModernPopover>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* You can add other date fields here, e.g., anniversary */}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo - prevent re-renders unless necessary
  return true;
});

ContactImportantDates.displayName = 'ContactImportantDates';

export default ContactImportantDates;