import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ModernPopover, ModernPopoverContent, ModernPopoverTrigger } from '@/components/ui/modern-popover';
import { ModernButton } from '@/components/ui/modern-button';
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
    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        {t('section_titles.important_dates')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="birthday"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-gray-700 dark:text-gray-200">
                {t('form_labels.birth_date')}
              </FormLabel>
              <ModernPopover>
                <ModernPopoverTrigger asChild>
                  <FormControl>
                    <ModernButton
                      variant={"glass"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <span className="flex items-center">
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {field.value ? format(new Date(field.value), "yyyy/MM/dd") : <span>{t('form_placeholders.select_birth_date')}</span>}
                      </span>
                    </ModernButton>
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
});

ContactImportantDates.displayName = 'ContactImportantDates';

export default ContactImportantDates;