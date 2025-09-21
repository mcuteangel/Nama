import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ModernTextarea } from '@/components/ui/modern-textarea';
import { FormField, FormLabel, FormControl } from '@/components/ui/form';
import { ContactFormValues } from '@/types/contact';
import { FileText, AlertCircle, CheckCircle, XCircle, PenTool } from 'lucide-react';
import { designTokens } from '@/lib/design-tokens';
import { ModernTooltip, ModernTooltipContent, ModernTooltipTrigger } from '@/components/ui/modern-tooltip';

const ContactNotes: React.FC = React.memo(() => {
  const form = useFormContext<ContactFormValues>();
  useTranslation();
  const [focusedField, setFocusedField] = useState<string | null>(null);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
           style={{
             background: designTokens.gradients.success,
             boxShadow: designTokens.shadows.glass3d
           }}>
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20"></div>
        <div className="relative p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
              <FileText size={24} className="sm:w-8 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2"
                  style={{ fontFamily: designTokens.typography.fonts.primary }}>
                یادداشت‌ها
              </h2>
              <p className="text-white/80 text-sm sm:text-base lg:text-lg">
                اطلاعات اضافی و یادداشت‌های مربوط به مخاطب را وارد کنید
              </p>
            </div>
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field, fieldState }) => (
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl sm:rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-300"></div>
                <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.005] sm:hover:scale-[1.01]">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="relative">
                      <div className={`
                        w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg
                        bg-gradient-to-br from-green-500 to-emerald-500
                        transition-all duration-300
                        ${focusedField === 'notes' ? 'scale-110 shadow-2xl' : ''}
                      `}>
                        <PenTool size={20} className="sm:w-6 text-white" />
                      </div>
                      {focusedField === 'notes' && (
                        <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg sm:rounded-xl animate-pulse"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <ModernTooltip>
                        <ModernTooltipTrigger asChild>
                          <FormLabel className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-1 block"
                                     style={{ fontFamily: designTokens.typography.fonts.primary }}>
                            یادداشت‌ها
                          </FormLabel>
                        </ModernTooltipTrigger>
                        <ModernTooltipContent>
                          <p>هر اطلاعاتی که می‌خواهید درباره این مخاطب یادداشت کنید</p>
                        </ModernTooltipContent>
                      </ModernTooltip>
                    </div>
                  </div>

                  <div className="relative">
                    <FormControl>
                      <ModernTextarea
                        placeholder="یادداشت‌های خود را درباره این مخاطب اینجا بنویسید..."
                        variant="glass"
                        className={`
                          w-full px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base lg:text-lg rounded-lg sm:rounded-xl
                          bg-white/80 dark:bg-gray-700/80
                          border-2 border-white/30 dark:border-gray-600/30
                          backdrop-blur-md
                          transition-all duration-500 ease-out
                          focus:ring-4 focus:ring-green-500/30 focus:border-green-400
                          hover:bg-white/95 dark:hover:bg-gray-600/95
                          hover:shadow-xl hover:shadow-green-500/20
                          hover:scale-[1.005] sm:hover:scale-[1.01]
                          ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : ''}
                          ${focusedField === 'notes' ? 'scale-105 shadow-2xl ring-4 ring-green-500/20' : ''}
                          ${field.value && !fieldState.error ? 'border-green-400 shadow-green-500/20' : ''}
                          min-h-[120px] sm:min-h-[160px] resize-none
                        `}
                        style={{
                          fontFamily: designTokens.typography.fonts.secondary,
                          fontSize: '16px' // Prevents zoom on iOS
                        }}
                        {...field}
                        value={field.value || ''}
                        onFocus={() => setFocusedField('notes')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </FormControl>

                    <div className="absolute right-3 sm:right-4 lg:right-6 top-3 sm:top-4 lg:top-6 flex items-center gap-2">
                      {field.value && !fieldState.error && (
                        <CheckCircle size={16} className="sm:w-5 text-green-500 animate-bounce" />
                      )}
                      {fieldState.error && (
                        <XCircle size={16} className="sm:w-5 text-red-500 animate-pulse" />
                      )}
                    </div>

                    {field.value && (
                      <div className="absolute left-3 sm:left-4 lg:left-6 bottom-3 sm:bottom-4 lg:bottom-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {field.value.length} کاراکتر
                      </div>
                    )}

                    {fieldState.error && (
                      <div className="mt-4 sm:mt-6 p-2 sm:p-3 lg:p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
                        <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                          <AlertCircle size={12} className="sm:w-4" />
                          {fieldState.error.message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
});

ContactNotes.displayName = 'ContactNotes';

export default ContactNotes;