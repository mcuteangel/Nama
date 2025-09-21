import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernPopover, ModernPopoverContent, ModernPopoverTrigger } from '@/components/ui/modern-popover';
import { GlassButton } from "@/components/ui/glass-button";
import { FormField, FormLabel, FormControl } from '@/components/ui/form';
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
import { designTokens } from '@/lib/design-tokens';

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
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section with New Design */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
           style={{
             background: designTokens.gradients.pink,
             boxShadow: designTokens.shadows.glass3d
           }}>
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20"></div>
        <div className="relative p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
                <Settings size={24} className="sm:w-8 text-white animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2"
                    style={{ fontFamily: designTokens.typography.fonts.primary }}>
                  فیلدهای سفارشی
                </h2>
                <p className="text-white/80 text-sm sm:text-base lg:text-lg">
                  فیلدهای اضافی برای اطلاعات مخاطب
                </p>
              </div>
            </div>

            {availableTemplates.length === 0 && !loadingTemplates && (
              <Dialog>
                <DialogTrigger asChild>
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 border border-white/30 text-white hover:text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                  >
                    <Plus size={18} className="sm:w-5 ml-2" />
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
            )}
          </div>

          {loadingTemplates ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <Settings size={24} className="sm:w-8 text-white animate-spin" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl sm:rounded-2xl animate-pulse"></div>
              </div>
              <div className="mr-4 sm:mr-6">
                <p className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">در حال بارگذاری...</p>
                <p className="text-white/80 text-sm sm:text-base">فیلدهای سفارشی در حال بارگذاری هستند</p>
              </div>
            </div>
          ) : availableTemplates.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg mx-auto mb-4 sm:mb-6">
                <Settings size={32} className="sm:w-10 text-white/60" />
              </div>
              <p className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">هیچ فیلد سفارشی وجود ندارد</p>
              <p className="text-white/80 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6">برای شروع، فیلد سفارشی جدیدی ایجاد کنید</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {customFields.map((fieldItem, index) => {
                const template = templateMap.get(fieldItem.template_id);
                if (!template) return null;

                const fieldName = `customFields.${index}.value` as const;

                return (
                  <FormField
                    key={template.id}
                    control={control}
                    name={fieldName}
                    render={({ field, fieldState }) => (
                      <div className="group relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-300"></div>
                        <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-lg">
                                <Settings size={24} className="text-white" />
                              </div>
                              {field.value && !fieldState.error && (
                                <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl animate-pulse"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <FormLabel className="text-xl font-bold text-gray-800 dark:text-white mb-1 block"
                                         style={{ fontFamily: designTokens.typography.fonts.primary }}>
                                {template.name}
                                {template.required && <span className="text-red-500 ml-2">*</span>}
                              </FormLabel>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{template.description || 'مقدار فیلد را وارد کنید'}</p>
                            </div>
                          </div>

                          <div className="relative">
                            <FormControl>
                              {template.type === 'text' ? (
                                <ModernInput
                                  placeholder={template.description || `مقدار ${template.name} را وارد کنید`}
                                  variant="glass"
                                  className={`
                                    w-full px-6 py-4 text-lg rounded-xl
                                    bg-white/80 dark:bg-gray-700/80
                                    border-2 border-white/30 dark:border-gray-600/30
                                    backdrop-blur-md
                                    transition-all duration-500 ease-out
                                    focus:ring-4 focus:ring-pink-500/30 focus:border-pink-400
                                    hover:bg-white/95 dark:hover:bg-gray-600/95
                                    hover:shadow-xl hover:shadow-pink-500/20
                                    hover:scale-[1.01]
                                    ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : ''}
                                    ${field.value && !fieldState.error ? 'border-green-400 shadow-green-500/20' : ''}
                                  `}
                                  style={{
                                    fontFamily: designTokens.typography.fonts.secondary,
                                    fontSize: designTokens.typography.sizes.base
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
                                    w-full px-6 py-4 text-lg rounded-xl
                                    bg-white/80 dark:bg-gray-700/80
                                    border-2 border-white/30 dark:border-gray-600/30
                                    backdrop-blur-md
                                    transition-all duration-500 ease-out
                                    focus:ring-4 focus:ring-pink-500/30 focus:border-pink-400
                                    hover:bg-white/95 dark:hover:bg-gray-600/95
                                    hover:shadow-xl hover:shadow-pink-500/20
                                    hover:scale-[1.01]
                                    ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : ''}
                                    ${field.value && !fieldState.error ? 'border-green-400 shadow-green-500/20' : ''}
                                  `}
                                  style={{
                                    fontFamily: designTokens.typography.fonts.secondary,
                                    fontSize: designTokens.typography.sizes.base
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
                                        "w-full justify-start text-left font-normal px-6 py-4 text-lg rounded-xl",
                                        "bg-white/80 dark:bg-gray-700/80",
                                        "border-2 border-white/30 dark:border-gray-600/30",
                                        "backdrop-blur-md",
                                        "transition-all duration-500 ease-out",
                                        "focus:ring-4 focus:ring-pink-500/30 focus:border-pink-400",
                                        "hover:bg-white/95 dark:hover:bg-gray-600/95",
                                        "hover:shadow-xl hover:shadow-pink-500/20",
                                        "hover:scale-[1.01]",
                                        !field.value && "text-gray-500 dark:text-gray-400",
                                        fieldState.error ? 'border-red-400 focus:ring-red-500/30' : '',
                                        field.value && !fieldState.error ? 'border-green-400 shadow-green-500/20' : ''
                                      )}
                                      style={{
                                        fontFamily: designTokens.typography.fonts.secondary,
                                        fontSize: designTokens.typography.sizes.base
                                      }}
                                    >
                                      <span className="flex items-center">
                                        <CalendarIcon className="ml-2 h-5 w-5" />
                                        {field.value ? formatDate(new Date(field.value)) : <span>تاریخ را انتخاب کنید</span>}
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
                                <div className="text-center py-8">
                                  <p className="text-gray-600 dark:text-gray-300">انتخاب از لیست (در حال توسعه)</p>
                                </div>
                              ) : template.type === 'checklist' ? (
                                <div className="space-y-3 p-4 rounded-lg border border-white/30 dark:border-gray-600/30 bg-white/20 dark:bg-gray-700/20">
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
                                          className="w-5 h-5 rounded-lg border-2 border-white/30 dark:border-gray-600/30 bg-white/80 dark:bg-gray-700/80 backdrop-blur-md transition-all duration-300 ease-out focus:ring-3 focus:ring-pink-500/30 focus:border-pink-400 hover:bg-white/95 dark:hover:bg-gray-600/95 hover:shadow-md hover:shadow-pink-500/20"
                                        />
                                        <label
                                          htmlFor={field.name + '-' + option}
                                          className="mr-3 text-base font-medium text-gray-900 dark:text-gray-300 cursor-pointer"
                                          style={{ fontFamily: designTokens.typography.fonts.secondary }}
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
                                  className="w-full px-6 py-4 text-lg rounded-xl bg-white/80 dark:bg-gray-700/80 border-2 border-white/30 dark:border-gray-600/30 backdrop-blur-md"
                                  style={{
                                    fontFamily: designTokens.typography.fonts.secondary,
                                    fontSize: designTokens.typography.sizes.base
                                  }}
                                />
                              )}
                            </FormControl>

                            {/* Status Icons */}
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                              {field.value && !fieldState.error && (
                                <CheckCircle size={20} className="text-green-500 animate-bounce" />
                              )}
                              {fieldState.error && (
                                <XCircle size={20} className="text-red-500 animate-pulse" />
                              )}
                            </div>

                            {/* Error Message */}
                            {fieldState.error && (
                              <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
                                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                  <AlertCircle size={16} />
                                  {fieldState.error.message}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ContactCustomFields.displayName = 'ContactCustomFields';

export default ContactCustomFields;