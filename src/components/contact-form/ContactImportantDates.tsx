import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { ModernPopover, ModernPopoverContent, ModernPopoverTrigger } from '@/components/ui/modern-popover';
import { GlassButton } from "@/components/ui/glass-button";
import { FormField, FormLabel, FormControl } from '@/components/ui/form';
import { CalendarIcon, AlertCircle, Cake, CheckCircle, XCircle, Heart } from 'lucide-react';
import { JalaliCalendar } from '@/components/JalaliCalendar';
import { cn } from '@/lib/utils';
import { ContactFormValues } from '@/types/contact';
import { useTranslation } from 'react-i18next';
import { useAppSettings } from '@/hooks/use-app-settings';
import { useJalaliCalendar } from '@/hooks/use-jalali-calendar';
import { designTokens } from '@/lib/design-tokens';

const ContactImportantDates: React.FC = React.memo(() => {
  useTranslation();
  const form = useFormContext<ContactFormValues>();
  useAppSettings();
  const { formatDate } = useJalaliCalendar();
  const [focusedField, setFocusedField] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl"
           style={{
             background: designTokens.gradients.purple,
             boxShadow: designTokens.shadows.glass3d
           }}>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20"></div>
        <div className="relative p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
              <Cake size={32} className="text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2"
                  style={{ fontFamily: designTokens.typography.fonts.primary }}>
                تاریخ‌های مهم
              </h2>
              <p className="text-white/80 text-lg">
                تاریخ تولد و سایر مناسبت‌های مهم را وارد کنید
              </p>
            </div>
          </div>

          <FormField
            control={form.control}
            name="birthday"
            render={({ field, fieldState }) => (
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-300"></div>
                <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                        <Cake size={24} className="text-white" />
                      </div>
                      {focusedField === 'birthday' && (
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl animate-pulse"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <FormLabel className="text-xl font-bold text-gray-800 dark:text-white mb-1 block"
                                 style={{ fontFamily: designTokens.typography.fonts.primary }}>
                        تاریخ تولد
                      </FormLabel>
                      <p className="text-sm text-gray-600 dark:text-gray-300">تاریخ تولد مخاطب را انتخاب کنید</p>
                    </div>
                  </div>

                  <div className="relative">
                    <ModernPopover>
                      <ModernPopoverTrigger asChild>
                        <FormControl>
                          <GlassButton
                            variant="glass"
                            className={cn(
                              "w-full justify-start text-left font-normal py-4 px-6 text-lg rounded-xl border-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-md transition-all duration-500 ease-out focus:ring-4 focus:ring-purple-500/30 focus:border-purple-400 hover:bg-white/95 dark:hover:bg-gray-600/95 hover:shadow-xl hover:shadow-purple-500/20 hover:scale-[1.01]",
                              fieldState.error ? 'border-red-400 focus:ring-red-500/30' : 'border-white/30 dark:border-gray-600/30',
                              focusedField === 'birthday' ? 'scale-105 shadow-2xl ring-4 ring-purple-500/20' : '',
                              field.value && !fieldState.error ? 'border-green-400 shadow-green-500/20' : ''
                            )}
                            style={{
                              fontFamily: designTokens.typography.fonts.secondary,
                              fontSize: designTokens.typography.sizes.base
                            }}
                            onFocus={() => setFocusedField('birthday')}
                            onBlur={() => setFocusedField(null)}
                          >
                            <span className="flex items-center gap-3">
                              <CalendarIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                              {field.value ? (
                                <span className="text-gray-800 dark:text-white font-medium">
                                  {formatDate(new Date(field.value))}
                                </span>
                              ) : (
                                <span className="text-gray-500 dark:text-gray-400">تاریخ تولد را انتخاب کنید</span>
                              )}
                            </span>
                          </GlassButton>
                        </FormControl>
                      </ModernPopoverTrigger>
                      <ModernPopoverContent className="w-auto p-0 rounded-2xl border-2 border-white/30 dark:border-gray-600/30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl">
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
                      <div className="mt-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                          <AlertCircle size={16} />
                          {fieldState.error.message}
                        </p>
                      </div>
                    )}

                    {field.value && !fieldState.error && (
                      <div className="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30">
                        <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                          <CheckCircle size={16} />
                          تاریخ تولد با موفقیت ثبت شد
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          />

          <div className="mt-6 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 border-dashed">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Heart size={20} className="text-white/60" />
              </div>
              <div>
                <p className="text-lg font-bold text-white/80 mb-1">تاریخ‌های دیگر</p>
                <p className="text-white/60 text-sm">امکان افزودن تاریخ‌های مهم دیگر در آینده</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ContactImportantDates.displayName = 'ContactImportantDates';

export default ContactImportantDates;