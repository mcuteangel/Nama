import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { ModernPopover, ModernPopoverContent, ModernPopoverTrigger } from '@/components/ui/modern-popover';
import { GlassButton } from "@/components/ui/glass-button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns-jalali';
import { JalaliCalendar } from '@/components/JalaliCalendar';
import { cn } from '@/lib/utils';
import AddCustomFieldTemplateDialog from '@/components/AddCustomFieldTemplateDialog';
import { CustomFieldTemplate } from '@/domain/schemas/custom-field-template';
import { ContactFormValues } from '@/types/contact';
import { useTranslation } from 'react-i18next';

interface ContactCustomFieldsProps {
  availableTemplates: CustomFieldTemplate[];
  loadingTemplates: boolean;
  fetchTemplates: () => void;
}

const ContactCustomFields: React.FC<ContactCustomFieldsProps> = React.memo(({
  availableTemplates,
  loadingTemplates,
  fetchTemplates,
}) => {
  const { t } = useTranslation();
  const form = useFormContext<ContactFormValues>();

  // Memoize custom fields to prevent unnecessary re-renders
  const customFields = useMemo(() => form.watch("customFields") || [], [form]);

  // Memoize template mapping to prevent unnecessary re-renders
  const templateMap = useMemo(() => {
    const map = new Map<string, CustomFieldTemplate>();
    availableTemplates.forEach(template => {
      if (template.id) {
        map.set(template.id, template);
      }
    });
    return map;
  }, [availableTemplates]);

  return (
    <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 heading-3">
          {t('section_titles.custom_fields')}
        </h3>
        <AddCustomFieldTemplateDialog onTemplateAdded={fetchTemplates} />
      </div>
      
      {loadingTemplates ? (
        <p className="text-center text-gray-500 dark:text-gray-400 p-4 rounded-xl glass">
          {t('loading_messages.loading_custom_field_templates')}
        </p>
      ) : availableTemplates.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 p-4 rounded-xl glass">
          {t('empty_states.no_custom_field_templates')}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-xl glass">
          {customFields.map((fieldItem, index) => {
            const template = templateMap.get(fieldItem.template_id);
            if (!template) return null;

            const fieldName = `customFields.${index}.value` as const;
            
            return (
              <FormField
                key={template.id}
                control={form.control}
                name={fieldName}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-200 font-medium">
                      {template.name}
                      {template.required && <span className="text-red-500 ms-1">*</span>}
                    </FormLabel>
                    <FormControl>
                      {template.type === 'text' ? (
                        <ModernInput
                          placeholder={template.description || t('form_placeholders.field_value', { name: template.name })}
                          variant="glass"
                          className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary/50"
                          {...field}
                          value={field.value || ''}
                        />
                      ) : template.type === 'number' ? (
                        <ModernInput
                          type="number"
                          placeholder={template.description || t('form_placeholders.field_value', { name: template.name })}
                          variant="glass"
                          className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary/50"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      ) : template.type === 'date' ? (
                        <ModernPopover>
                          <ModernPopoverTrigger asChild>
                            <GlassButton
                              variant={"glass"}
                              className={cn(
                                "w-full justify-start text-left font-normal py-3 bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 hover:bg-white/40 dark:hover:bg-gray-700/40",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <span className="flex items-center">
                                <CalendarIcon className="ml-2 h-4 w-4" />
                                {field.value ? format(new Date(field.value), "yyyy/MM/dd") : <span>{t('form_placeholders.select_birth_date')}</span>}
                              </span>
                            </GlassButton>
                          </ModernPopoverTrigger>
                          <ModernPopoverContent className="w-auto p-0" glassEffect="strong">
                            <JalaliCalendar
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date ? date.toISOString() : "")}
                              showToggle={false}
                            />
                          </ModernPopoverContent>
                        </ModernPopover>
                      ) : template.type === 'list' ? (
                        <ModernSelect
                          onValueChange={field.onChange}
                          value={field.value || ''}
                          disabled={!template.options || template.options.length === 0}
                        >
                          <FormControl>
                            <ModernSelectTrigger variant="glass" className="w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30">
                              <ModernSelectValue placeholder={!template.options || template.options.length === 0 ? t('form_placeholders.no_options_found') : t('form_placeholders.select_field', { name: template.name })} />
                            </ModernSelectTrigger>
                          </FormControl>
                          <ModernSelectContent variant="glass" className="bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                            {template.options && template.options.map((option) => (
                              <ModernSelectItem key={option} value={option} className="hover:bg-white/20 dark:hover:bg-gray-700/50">
                                {option}
                              </ModernSelectItem>
                            ))}
                          </ModernSelectContent>
                        </ModernSelect>
                      ) : (
                        <ModernInput 
                          disabled 
                          placeholder={t('form_placeholders.unknown_field_type_placeholder')} 
                          variant="glass" 
                          className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" 
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.loadingTemplates === nextProps.loadingTemplates &&
    JSON.stringify(prevProps.availableTemplates) === JSON.stringify(nextProps.availableTemplates)
  );
});

ContactCustomFields.displayName = 'ContactCustomFields';

export default ContactCustomFields;