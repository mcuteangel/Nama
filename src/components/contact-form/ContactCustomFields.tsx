import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernPopover, ModernPopoverContent, ModernPopoverTrigger } from '@/components/ui/modern-popover';
import { GlassButton } from "@/components/ui/glass-button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { CalendarIcon, Plus, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { JalaliCalendar } from '@/components/JalaliCalendar';
import { cn } from '@/lib/utils';
import { CustomFieldForm } from '@/components/custom-fields';
import { CustomFieldTemplate } from '@/domain/schemas/custom-field-template';
import { ContactFormValues } from '@/types/contact';
import { useTranslation } from 'react-i18next';
import { useJalaliCalendar } from '@/hooks/use-jalali-calendar';
import { ControllerRenderProps } from 'react-hook-form';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import { SmartSearchSelect } from '@/components/ui/smart-search-select';

// Common glass styling classes
const GLASS_INPUT_CLASSES = "bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/50";
const GLASS_SELECT_TRIGGER_CLASSES = "w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30";
const GLASS_SELECT_CONTENT_CLASSES = "bg-popover/80 dark:bg-popover/80 border border-border/30";
const GLASS_SELECT_ITEM_CLASSES = "hover:bg-accent hover:text-accent-foreground";

interface ContactCustomFieldsProps {
  availableTemplates: CustomFieldTemplate[];
  loadingTemplates: boolean;
  fetchTemplates: () => void;
  onAddField?: () => void;
}

const ContactCustomFields: React.FC<ContactCustomFieldsProps> = React.memo(({
  availableTemplates = [],
  loadingTemplates = false,
  fetchTemplates,
}) => {
  const { t } = useTranslation();
  const { control, watch } = useFormContext<ContactFormValues>();
  const { formatDate } = useJalaliCalendar();

  // Memoize custom fields to prevent unnecessary re-renders
  const customFields = useMemo(() => watch("customFields") || [], [watch]);

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

  // Handle checklist changes
  const handleChecklistChange = (field: ControllerRenderProps<ContactFormValues, `customFields.${number}.value`>, option: string, checked: boolean) => {
    const currentValue = field.value ? field.value.split(',').map((v: string) => v.trim()) : [];
    let newValue: string[];

    if (checked) {
      newValue = [...currentValue, option];
    } else {
      newValue = currentValue.filter((v: string) => v !== option);
    }

    field.onChange(newValue.join(', '));
  };

  return (
    <CollapsibleSection 
      title={t('section_titles.custom_fields')} 
      icon={<Settings size={16} className="text-white" />}
      defaultOpen={false}
    >
      {loadingTemplates ? (
        <div className="p-8 rounded-2xl bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-900/30 border-2 border-white/40 dark:border-gray-700/40 backdrop-blur-sm text-center">
          <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            {t('loading_messages.loading_custom_field_templates')}
          </p>
        </div>
      ) : availableTemplates.length === 0 ? (
        <div className="p-8 rounded-2xl bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-900/30 border-2 border-white/40 dark:border-gray-700/40 backdrop-blur-sm text-center">
          <Settings size={48} className="text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 font-medium mb-4">
            {t('empty_states.no_custom_field_templates')}
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <GlassButton
                variant="gradient-primary"
                effect="lift"
                size="sm"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <Plus size={18} className="me-2" />
                {t('actions.create_first_field')}
              </GlassButton>
            </DialogTrigger>
            <DialogContent className="w-full p-0 border-none bg-transparent shadow-none max-h-[80vh] overflow-y-auto">
              <DialogHeader className="sr-only">
                <DialogTitle>{t('custom_field_template.add_title')}</DialogTitle>
              </DialogHeader>
              <CustomFieldForm onSuccess={fetchTemplates} onCancel={() => {}} />
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-xl glass">
          {customFields.map((fieldItem, index) => {
            const template = templateMap.get(fieldItem.template_id);
            if (!template) return null;

            const fieldName = `customFields.${index}.value` as const;

            return (
              <div key={template.id} className="group/field p-4 rounded-2xl bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-900/30 border-2 border-white/40 dark:border-gray-700/40 backdrop-blur-sm hover:border-cyan-300/50 dark:hover:border-cyan-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
                <FormField
                  control={control}
                  name={fieldName}
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-info-100/80 to-info-50/80 dark:from-info-900/30 dark:to-info-800/20 border border-info-200/50 dark:border-info-800/50 flex items-center justify-center transition-all duration-300">
                            <Settings size={16} className="text-info-600 dark:text-info-400" />
                          </div>
                          <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {template.name}
                            {template.required && <span className="text-red-500 ms-1">*</span>}
                          </FormLabel>
                        </div>

                        <FormControl>
                          {template.type === 'text' ? (
                            <ModernInput
                              placeholder={template.description || t('form_placeholders.field_value', { name: template.name })}
                              variant="glass"
                              className={GLASS_INPUT_CLASSES}
                              {...field}
                              value={field.value || ''}
                            />
                          ) : template.type === 'number' ? (
                            <ModernInput
                              type="number"
                              placeholder={template.description || t('form_placeholders.field_value', { name: template.name })}
                              variant="glass"
                              className={GLASS_INPUT_CLASSES}
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                            />
                          ) : template.type === 'date' ? (
                            <ModernPopover>
                              <ModernPopoverTrigger asChild>
                                <GlassButton
                                  variant="glass"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    GLASS_INPUT_CLASSES,
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <span className="flex items-center">
                                    <CalendarIcon className="ml-2 h-4 w-4" />
                                    {field.value ? formatDate(new Date(field.value)) : <span>{t('form_placeholders.select_birth_date')}</span>}
                                  </span>
                                </GlassButton>
                              </ModernPopoverTrigger>
                              <ModernPopoverContent className="w-auto p-0" glassEffect="card">
                                <JalaliCalendar
                                  selected={field.value ? new Date(field.value) : undefined}
                                  onSelect={(date) => field.onChange(date ? date.toISOString() : "")}
                                  showToggle={false}
                                />
                              </ModernPopoverContent>
                            </ModernPopover>
                          ) : template.type === 'list' ? (
                            <SmartSearchSelect
                              onValueChange={field.onChange}
                              value={field.value || ''}
                              options={template.options?.map(option => ({ value: option, label: option })) || []}
                              placeholder={!template.options || template.options.length === 0 ? t('form_placeholders.no_options_found') : t('form_placeholders.select_field', { name: template.name })}
                              searchPlaceholder={t('form_placeholders.search_options')}
                              noResultsText={t('form_placeholders.no_options_found')}
                              disabled={!template.options || template.options.length === 0}
                              triggerClassName={GLASS_SELECT_TRIGGER_CLASSES}
                              contentClassName={GLASS_SELECT_CONTENT_CLASSES}
                              itemClassName={GLASS_SELECT_ITEM_CLASSES}
                            />
                          ) : template.type === 'checklist' ? (
                            <div className="space-y-2 p-3 rounded-lg border border-white/30 dark:border-gray-600/30 bg-white/20 dark:bg-gray-700/20">
                              {template.options && template.options.map((option) => {
                                const currentValue = field.value ? field.value.split(',').map((v: string) => v.trim()) : [];
                                const isChecked = currentValue.includes(option);
                                
                                return (
                                  <div key={option} className="flex items-center">
                                    <input
                                      type="checkbox"
                                      id={field.name + '-' + option}
                                      checked={isChecked}
                                      onChange={(e) => handleChecklistChange(field, option, e.target.checked)}
                                      className={`w-full px-4 py-2 text-sm rounded-lg border-2 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm transition-all duration-300 ease-out focus:ring-3 focus:ring-info-500/30 focus:border-info-400 hover:bg-white/70 dark:hover:bg-gray-600/70 hover:shadow-md hover:shadow-info-500/20 ${
                          fieldState.error ? 'border-error-400 focus:ring-error-500/30' : 'border-white/40 dark:border-gray-600/40'
                        } ${field.value && !fieldState.error ? 'border-success-400' : ''}`}
                                    />
                                    <label
                                      htmlFor={field.name + '-' + option}
                                      className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                                    >
                                      {option}
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <ModernInput
                              disabled
                              placeholder={t('form_placeholders.unknown_field_type_placeholder')}
                              variant="glass"
                              className={GLASS_INPUT_CLASSES}
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            );
          })}
        </div>
      )}
    </CollapsibleSection>
  );
});

ContactCustomFields.displayName = 'ContactCustomFields';

export default ContactCustomFields;