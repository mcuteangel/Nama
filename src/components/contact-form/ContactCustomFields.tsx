import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernPopover, ModernPopoverContent, ModernPopoverTrigger } from '@/components/ui/modern-popover';
import { GlassButton } from "@/components/ui/glass-button";
import { FormField, FormLabel, FormControl } from '@/components/ui/form';
import { FormCard } from '@/components/ui/FormCard';
import { FormSection } from '@/components/ui/FormSection';
import { CalendarIcon, Plus, Settings, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { JalaliCalendar } from '@/components/JalaliCalendar';
import { cn } from '@/lib/utils';
import { CustomFieldForm } from '@/components/custom-fields';
import { CustomFieldTemplate } from '@/domain/schemas/custom-field-template';
import { ContactFormValues } from '@/types/contact';
import { useTranslation } from 'react-i18next';
import { useJalaliCalendar } from '@/hooks/use-jalali-calendar';
import { ControllerRenderProps } from 'react-hook-form';

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
  const { i18n } = useTranslation();
  const { control, watch } = useFormContext<ContactFormValues>();
  const { formatDate } = useJalaliCalendar();

  // Determine text direction based on language
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';

  // Memoize custom fields to prevent unnecessary re-renders
  const customFields = useMemo(() => {
    const fields = watch("customFields");
    return Array.isArray(fields) ? fields : [];
  }, [watch]);

  // Memoize template mapping to prevent unnecessary re-renders
  const templateMap = useMemo(() => {
    const map = new Map<string, CustomFieldTemplate>();
    const templates = Array.isArray(availableTemplates) ? availableTemplates : [];
    templates.forEach(template => {
      if (template.id) {
        map.set(template.id, template);
      }
    });
    return map;
  }, [availableTemplates]);

  // Handle checklist changes
  const handleChecklistChange = (field: ControllerRenderProps<ContactFormValues, `customFields.${number}.value`>, option: string, checked: boolean) => {
    const currentValue = field.value && typeof field.value === 'string' ? field.value.split(',').map((v: string) => v.trim()) : [];
    let newValue: string[];

    if (checked) {
      newValue = [...currentValue, option];
    } else {
      newValue = currentValue.filter((v: string) => v !== option);
    }

    field.onChange(newValue.join(', '));
  };

  return (
    <FormCard
      title="فیلدهای سفارشی"
      description="فیلدهای اضافی برای اطلاعات مخاطب"
      icon={Settings}
      iconColor="#ec4899"
    >
      <div className="space-y-3">
        {loadingTemplates ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Settings size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">در حال بارگذاری فیلدهای سفارشی...</p>
          </div>
        ) : availableTemplates.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Settings size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm mb-4">هنوز هیچ فیلد سفارشی ایجاد نشده است</p>

            <Dialog>
              <DialogTrigger asChild>
                <GlassButton
                  variant="ghost"
                  size="sm"
                  className="bg-primary-500/10 hover:bg-primary-500/20 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-xl border border-primary-200 dark:border-primary-800 transition-all duration-200"
                >
                  <Plus size={14} className="ml-2" />
                  ایجاد فیلد جدید
                </GlassButton>
              </DialogTrigger>
              <DialogContent className="w-full p-0 border-none bg-transparent shadow-none max-h-[80vh] overflow-y-auto">
                <DialogHeader className="sr-only">
                  <DialogTitle>ایجاد فیلد سفارشی جدید</DialogTitle>
                </DialogHeader>
                <CustomFieldForm onSuccess={fetchTemplates} onCancel={() => {}} />
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {customFields.map((fieldItem, index) => {
                // Ensure fieldItem is a valid object
                if (!fieldItem || typeof fieldItem !== 'object') return null;

                const template = templateMap.get(String(fieldItem.template_id));
                if (!template) return null;

                const fieldName = `customFields.${index}.value` as const;

                return (
                  <FormSection
                    key={template.id}
                    variant="card"
                    title=""
                    className="relative"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <Settings size={10} className="text-primary-600 dark:text-primary-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {template.name}
                      </span>
                    </div>

                    <FormField
                      control={control}
                      name={fieldName}
                      render={({ field, fieldState }) => (
                        <div className="space-y-2">
                          <FormControl>
                            {template.type === 'text' ? (
                              <ModernInput
                                placeholder={template.description || `مقدار ${template.name} را وارد کنید`}
                                variant="glass"
                                className={`w-full px-3 py-2 text-sm rounded-lg border-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-md transition-all duration-300 ease-out focus:ring-4 focus:ring-pink-500/30 focus:border-pink-400 hover:bg-white/95 dark:hover:bg-gray-600/95 hover:shadow-xl hover:shadow-pink-500/20 ${fieldState.error ? 'border-red-300 focus:border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
                                {...field}
                                value={typeof field.value === 'string' ? field.value : ''}
                              />
                            ) : template.type === 'number' ? (
                              <ModernInput
                                type="number"
                                placeholder={template.description || `مقدار ${template.name} را وارد کنید`}
                                variant="glass"
                                className={`w-full px-3 py-2 text-sm rounded-lg border-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-md transition-all duration-300 ease-out focus:ring-4 focus:ring-pink-500/30 focus:border-pink-400 hover:bg-white/95 dark:hover:bg-gray-600/95 hover:shadow-xl hover:shadow-pink-500/20 ${fieldState.error ? 'border-red-300 focus:border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
                                {...field}
                                value={typeof field.value === 'string' ? field.value : ''}
                                onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                              />
                            ) : template.type === 'date' ? (
                              <ModernPopover>
                                <ModernPopoverTrigger asChild>
                                  <GlassButton
                                    variant="glass"
                                    className={cn(
                                      "w-full justify-start text-left font-normal px-3 py-2 text-sm rounded-lg border-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-md transition-all duration-300 ease-out focus:ring-4 focus:ring-pink-500/30 focus:border-pink-400 hover:bg-white/95 dark:hover:bg-gray-600/95 hover:shadow-xl hover:shadow-pink-500/20",
                                      fieldState.error ? 'border-red-300 focus:border-red-500' : 'border-slate-200 dark:border-slate-600',
                                      !field.value && "text-slate-500 dark:text-slate-400"
                                    )}
                                  >
                                    <span className="flex items-center gap-2">
                                      <CalendarIcon className="h-4 w-4" />
                                      {field.value && typeof field.value === 'string' ? formatDate(new Date(field.value)) : <span>تاریخ را انتخاب کنید</span>}
                                    </span>
                                  </GlassButton>
                                </ModernPopoverTrigger>
                                <ModernPopoverContent className="w-auto p-0 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-xl">
                                  <JalaliCalendar
                                    selected={field.value && typeof field.value === 'string' ? new Date(field.value) : undefined}
                                    onSelect={(date) => field.onChange(date ? date.toISOString() : "")}
                                    showToggle={false}
                                  />
                                </ModernPopoverContent>
                              </ModernPopover>
                            ) : template.type === 'list' ? (
                              <div className="text-center py-4 text-slate-500 dark:text-slate-400 text-sm">
                                انتخاب از لیست (در حال توسعه)
                              </div>
                            ) : template.type === 'checklist' ? (
                              <div className="space-y-2 p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50">
                                {template.options && template.options.map((option) => {
                                  const currentValue = field.value && typeof field.value === 'string' ? field.value.split(',').map((v: string) => v.trim()) : [];
                                  const isChecked = currentValue.includes(option);

                                  return (
                                    <div key={option} className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        id={field.name + '-' + option}
                                        checked={isChecked}
                                        onChange={(e) => handleChecklistChange(field, option, e.target.checked)}
                                        className="w-4 h-4 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 transition-all duration-300 ease-out focus:ring-2 focus:ring-pink-500/30 focus:border-pink-400"
                                      />
                                      <label
                                        htmlFor={field.name + '-' + option}
                                        className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex-1"
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
                                placeholder="نوع فیلد نامشخص"
                                variant="glass"
                                className="w-full px-3 py-2 text-sm rounded-lg border-2 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-600"
                              />
                            )}
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
                );
              })}
            </div>

            {/* Add new field button */}
            <div className="flex justify-start pt-2">
              <Dialog>
                <DialogTrigger asChild>
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    className="bg-primary-500/10 hover:bg-primary-500/20 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-xl border border-primary-200 dark:border-primary-800 transition-all duration-200"
                  >
                    <Plus size={14} className="ml-2" />
                    ایجاد فیلد سفارشی جدید
                  </GlassButton>
                </DialogTrigger>
                <DialogContent className="w-full p-0 border-none bg-transparent shadow-none max-h-[80vh] overflow-y-auto">
                  <DialogHeader className="sr-only">
                    <DialogTitle>ایجاد فیلد سفارشی جدید</DialogTitle>
                  </DialogHeader>
                  <CustomFieldForm onSuccess={fetchTemplates} onCancel={() => {}} />
                </DialogContent>
              </Dialog>
            </div>
          </>
        )}
      </div>
    </FormCard>
  );
});

ContactCustomFields.displayName = 'ContactCustomFields';

export default ContactCustomFields;