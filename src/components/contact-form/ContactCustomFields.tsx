import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernPopover, ModernPopoverContent, ModernPopoverTrigger } from '@/components/ui/modern-popover';
import { GlassButton } from "@/components/ui/glass-button";
import { FormField, FormLabel, FormControl } from '@/components/ui/form';
import { FormSection } from '@/components/ui/FormSection';
import { FormCard } from '@/components/ui/FormCard';
import { CalendarIcon, Plus, Settings, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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
  useTranslation();
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
    <FormSection
      icon={Settings}
      title="فیلدهای سفارشی"
      description="فیلدهای اضافی برای اطلاعات مخاطب"
      className="space-y-4"
    >
      {loadingTemplates ? (
        <FormCard
          title="در حال بارگذاری..."
          description="فیلدهای سفارشی در حال بارگذاری هستند"
          icon={Settings}
          iconColor="#ec4899"
        >
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            <span className="mr-3 text-slate-600 dark:text-slate-400">در حال بارگذاری فیلدهای سفارشی...</span>
          </div>
        </FormCard>
      ) : availableTemplates.length === 0 ? (
        <FormCard
          title="هیچ فیلد سفارشی وجود ندارد"
          description="برای شروع، فیلد سفارشی جدیدی ایجاد کنید"
          icon={Settings}
          iconColor="#ec4899"
        >
          <div className="text-center py-8">
            <Settings size={48} className="mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 dark:text-slate-400 mb-4">هنوز هیچ فیلد سفارشی ایجاد نشده است</p>

            <Dialog>
              <DialogTrigger asChild>
                <GlassButton
                  variant="ghost"
                  size="sm"
                  className="bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 hover:text-pink-800 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <Plus size={16} className="ml-2" />
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
        </FormCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {customFields.map((fieldItem, index) => {
            const template = templateMap.get(fieldItem.template_id);
            if (!template) return null;

            const fieldName = `customFields.${index}.value` as const;

            return (
              <FormCard
                key={template.id}
                title={template.name}
                description={template.description || 'مقدار فیلد را وارد کنید'}
                icon={Settings}
                iconColor="#ec4899"
                className="group"
              >
                <FormField
                  control={control}
                  name={fieldName}
                  render={({ field, fieldState }) => (
                    <div className="space-y-3">
                      <div className="relative">
                        <FormControl>
                          {template.type === 'text' ? (
                            <ModernInput
                              placeholder={template.description || `مقدار ${template.name} را وارد کنید`}
                              variant="glass"
                              className={`
                                w-full px-4 py-3 text-base rounded-lg
                                bg-white/80 dark:bg-gray-700/80
                                border-2 border-slate-200 dark:border-slate-600
                                backdrop-blur-md
                                transition-all duration-300 ease-out
                                focus:ring-4 focus:ring-pink-500/30 focus:border-pink-400
                                hover:bg-white/95 dark:hover:bg-gray-600/95
                                hover:shadow-xl hover:shadow-pink-500/20
                                hover:scale-[1.005]
                                ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : ''}
                                ${field.value && !fieldState.error ? 'border-green-400 shadow-green-500/20' : ''}
                              `}
                              style={{
                                fontSize: '16px' // Prevents zoom on iOS
                              }}
                              {...field}
                              value={field.value || ''}
                            />
                          ) : template.type === 'number' ? (
                            <ModernInput
                              type="number"
                              placeholder={template.description || `مقدار ${template.name} را وارد کنید`}
                              variant="glass"
                              className={`
                                w-full px-4 py-3 text-base rounded-lg
                                bg-white/80 dark:bg-gray-700/80
                                border-2 border-slate-200 dark:border-slate-600
                                backdrop-blur-md
                                transition-all duration-300 ease-out
                                focus:ring-4 focus:ring-pink-500/30 focus:border-pink-400
                                hover:bg-white/95 dark:hover:bg-gray-600/95
                                hover:shadow-xl hover:shadow-pink-500/20
                                hover:scale-[1.005]
                                ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : ''}
                                ${field.value && !fieldState.error ? 'border-green-400 shadow-green-500/20' : ''}
                              `}
                              style={{
                                fontSize: '16px' // Prevents zoom on iOS
                              }}
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
                                    "w-full justify-start text-left font-normal px-4 py-3 text-base rounded-lg",
                                    "bg-white/80 dark:bg-gray-700/80",
                                    "border-2 border-slate-200 dark:border-slate-600",
                                    "backdrop-blur-md",
                                    "transition-all duration-300 ease-out",
                                    "focus:ring-4 focus:ring-pink-500/30 focus:border-pink-400",
                                    "hover:bg-white/95 dark:hover:bg-gray-600/95",
                                    "hover:shadow-xl hover:shadow-pink-500/20",
                                    "hover:scale-[1.005]",
                                    !field.value && "text-slate-500 dark:text-slate-400",
                                    fieldState.error ? 'border-red-400 focus:ring-red-500/30' : '',
                                    field.value && !fieldState.error ? 'border-green-400 shadow-green-500/20' : ''
                                  )}
                                >
                                  <span className="flex items-center">
                                    <CalendarIcon className="ml-2 h-5 w-5" />
                                    {field.value ? formatDate(new Date(field.value)) : <span>تاریخ را انتخاب کنید</span>}
                                  </span>
                                </GlassButton>
                              </ModernPopoverTrigger>
                              <ModernPopoverContent className="w-auto p-0">
                                <JalaliCalendar
                                  selected={field.value ? new Date(field.value) : undefined}
                                  onSelect={(date) => field.onChange(date ? date.toISOString() : "")}
                                  showToggle={false}
                                />
                              </ModernPopoverContent>
                            </ModernPopover>
                          ) : template.type === 'list' ? (
                            <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                              <p>انتخاب از لیست (در حال توسعه)</p>
                            </div>
                          ) : template.type === 'checklist' ? (
                            <div className="space-y-3 p-4 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50">
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
                                      className="w-5 h-5 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 transition-all duration-300 ease-out focus:ring-3 focus:ring-pink-500/30 focus:border-pink-400 hover:bg-slate-50 dark:hover:bg-slate-600"
                                    />
                                    <label
                                      htmlFor={field.name + '-' + option}
                                      className="mr-3 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
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
                              className="w-full px-4 py-3 text-base rounded-lg bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600"
                            />
                          )}
                        </FormControl>

                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                          {field.value && !fieldState.error && (
                            <CheckCircle size={16} className="text-green-500 animate-bounce" />
                          )}
                          {fieldState.error && (
                            <XCircle size={16} className="text-red-500 animate-pulse" />
                          )}
                        </div>

                        {fieldState.error && (
                          <div className="mt-3 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
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
            );
          })}

          {/* Add new field button */}
          <FormCard
            title="ایجاد فیلد جدید"
            description="فیلد سفارشی جدیدی اضافه کنید"
            icon={Plus}
            iconColor="#10b981"
          >
            <Dialog>
              <DialogTrigger asChild>
                <GlassButton
                  variant="ghost"
                  size="sm"
                  className="w-full bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 hover:text-green-800 px-4 py-3 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <Plus size={16} className="ml-2" />
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
          </FormCard>
        </div>
      )}
    </FormSection>
  );
});

ContactCustomFields.displayName = 'ContactCustomFields';

export default ContactCustomFields;