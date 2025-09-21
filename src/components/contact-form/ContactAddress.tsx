import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ModernInput } from '@/components/ui/modern-input';
import { FormField, FormLabel, FormControl } from '@/components/ui/form';
import { ContactFormValues } from '@/types/contact';
import { MapPin, AlertCircle, CheckCircle, XCircle, Home, Building, Globe } from 'lucide-react';
import { designTokens } from '@/lib/design-tokens';
import { ModernTooltip, ModernTooltipContent, ModernTooltipTrigger } from '@/components/ui/modern-tooltip';

const ContactAddress: React.FC = React.memo(() => {
  const form = useFormContext<ContactFormValues>();
  useTranslation();
  const [focusedField, setFocusedField] = useState<string | null>(null);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section with New Design */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
           style={{
             background: designTokens.gradients.forest,
             boxShadow: designTokens.shadows.glass3d
           }}>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20"></div>
        <div className="relative p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
              <MapPin size={24} className="sm:w-8 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2"
                  style={{ fontFamily: designTokens.typography.fonts.primary }}>
                آدرس
              </h2>
              <p className="text-white/80 text-sm sm:text-base lg:text-lg">
                اطلاعات آدرس مخاطب را وارد کنید
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Street Field */}
            <FormField
              control={form.control}
              name="street"
              render={({ field, fieldState }) => (
                <div className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl sm:rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] sm:hover:scale-[1.02]">
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="relative">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                          <Home size={20} className="sm:w-6 text-white" />
                        </div>
                        {focusedField === 'street' && (
                          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg sm:rounded-xl animate-pulse"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <ModernTooltip>
                          <ModernTooltipTrigger asChild>
                            <FormLabel className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-1 block"
                                       style={{ fontFamily: designTokens.typography.fonts.primary }}>
                              خیابان
                            </FormLabel>
                          </ModernTooltipTrigger>
                          <ModernTooltipContent>
                            <p>آدرس خیابان را وارد کنید</p>
                          </ModernTooltipContent>
                        </ModernTooltip>
                      </div>
                    </div>

                    <div className="relative">
                      <FormControl>
                        <ModernInput
                          placeholder="مثال: خیابان ولیعصر، پلاک ۱۲۳"
                          variant="glass"
                          className={`
                            w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg rounded-lg sm:rounded-xl
                            bg-white/80 dark:bg-gray-700/80
                            border-2 border-white/30 dark:border-gray-600/30
                            backdrop-blur-md
                            transition-all duration-500 ease-out
                            focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400
                            hover:bg-white/95 dark:hover:bg-gray-600/95
                            hover:shadow-xl hover:shadow-emerald-500/20
                            hover:scale-[1.005] sm:hover:scale-[1.01]
                            ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : ''}
                            ${focusedField === 'street' ? 'scale-105 shadow-2xl ring-4 ring-emerald-500/20' : ''}
                            ${field.value && !fieldState.error ? 'border-green-400 shadow-green-500/20' : ''}
                          `}
                          style={{
                            fontFamily: designTokens.typography.fonts.secondary,
                            fontSize: '16px' // Prevents zoom on iOS
                          }}
                          {...field}
                          value={field.value || ''}
                          onFocus={() => setFocusedField('street')}
                          onBlur={() => setFocusedField(null)}
                        />
                      </FormControl>

                      {/* Status Icons */}
                      <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                        {field.value && !fieldState.error && (
                          <CheckCircle size={18} className="sm:w-5 text-green-500 animate-bounce" />
                        )}
                        {fieldState.error && (
                          <XCircle size={18} className="sm:w-5 text-red-500 animate-pulse" />
                        )}
                      </div>

                      {/* Error Message */}
                      {fieldState.error && (
                        <div className="mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
                          <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertCircle size={14} className="sm:w-4" />
                            {fieldState.error.message}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            />

            {/* City Field */}
            <FormField
              control={form.control}
              name="city"
              render={({ field, fieldState }) => (
                <div className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl sm:rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] sm:hover:scale-[1.02]">
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="relative">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                          <Building size={20} className="sm:w-6 text-white" />
                        </div>
                        {focusedField === 'city' && (
                          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg sm:rounded-xl animate-pulse"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <ModernTooltip>
                          <ModernTooltipTrigger asChild>
                            <FormLabel className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-1 block"
                                       style={{ fontFamily: designTokens.typography.fonts.primary }}>
                              شهر
                            </FormLabel>
                          </ModernTooltipTrigger>
                          <ModernTooltipContent>
                            <p>نام شهر را وارد کنید</p>
                          </ModernTooltipContent>
                        </ModernTooltip>
                      </div>
                    </div>

                    <div className="relative">
                      <FormControl>
                        <ModernInput
                          placeholder="مثال: تهران"
                          variant="glass"
                          className={`
                            w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg rounded-lg sm:rounded-xl
                            bg-white/80 dark:bg-gray-700/80
                            border-2 border-white/30 dark:border-gray-600/30
                            backdrop-blur-md
                            transition-all duration-500 ease-out
                            focus:ring-4 focus:ring-cyan-500/30 focus:border-cyan-400
                            hover:bg-white/95 dark:hover:bg-gray-600/95
                            hover:shadow-xl hover:shadow-cyan-500/20
                            hover:scale-[1.005] sm:hover:scale-[1.01]
                            ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : ''}
                            ${focusedField === 'city' ? 'scale-105 shadow-2xl ring-4 ring-cyan-500/20' : ''}
                            ${field.value && !fieldState.error ? 'border-green-400 shadow-green-500/20' : ''}
                          `}
                          style={{
                            fontFamily: designTokens.typography.fonts.secondary,
                            fontSize: '16px' // Prevents zoom on iOS
                          }}
                          {...field}
                          value={field.value || ''}
                          onFocus={() => setFocusedField('city')}
                          onBlur={() => setFocusedField(null)}
                        />
                      </FormControl>

                      {/* Status Icons */}
                      <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                        {field.value && !fieldState.error && (
                          <CheckCircle size={18} className="sm:w-5 text-green-500 animate-bounce" />
                        )}
                        {fieldState.error && (
                          <XCircle size={18} className="sm:w-5 text-red-500 animate-pulse" />
                        )}
                      </div>

                      {/* Error Message */}
                      {fieldState.error && (
                        <div className="mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
                          <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertCircle size={14} className="sm:w-4" />
                            {fieldState.error.message}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            />

            {/* State Field */}
            <FormField
              control={form.control}
              name="state"
              render={({ field, fieldState }) => (
                <div className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] sm:hover:scale-[1.02]">
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="relative">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                          <MapPin size={20} className="sm:w-6 text-white" />
                        </div>
                        {focusedField === 'state' && (
                          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg sm:rounded-xl animate-pulse"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <ModernTooltip>
                          <ModernTooltipTrigger asChild>
                            <FormLabel className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-1 block"
                                       style={{ fontFamily: designTokens.typography.fonts.primary }}>
                              استان
                            </FormLabel>
                          </ModernTooltipTrigger>
                          <ModernTooltipContent>
                            <p>نام استان را وارد کنید</p>
                          </ModernTooltipContent>
                        </ModernTooltip>
                      </div>
                    </div>

                    <div className="relative">
                      <FormControl>
                        <ModernInput
                          placeholder="مثال: تهران"
                          variant="glass"
                          className={`
                            w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg rounded-lg sm:rounded-xl
                            bg-white/80 dark:bg-gray-700/80
                            border-2 border-white/30 dark:border-gray-600/30
                            backdrop-blur-md
                            transition-all duration-500 ease-out
                            focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-400
                            hover:bg-white/95 dark:hover:bg-gray-600/95
                            hover:shadow-xl hover:shadow-indigo-500/20
                            hover:scale-[1.005] sm:hover:scale-[1.01]
                            ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : ''}
                            ${focusedField === 'state' ? 'scale-105 shadow-2xl ring-4 ring-indigo-500/20' : ''}
                            ${field.value && !fieldState.error ? 'border-green-400 shadow-green-500/20' : ''}
                          `}
                          style={{
                            fontFamily: designTokens.typography.fonts.secondary,
                            fontSize: '16px' // Prevents zoom on iOS
                          }}
                          {...field}
                          value={field.value || ''}
                          onFocus={() => setFocusedField('state')}
                          onBlur={() => setFocusedField(null)}
                        />
                      </FormControl>

                      {/* Status Icons */}
                      <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                        {field.value && !fieldState.error && (
                          <CheckCircle size={18} className="sm:w-5 text-green-500 animate-bounce" />
                        )}
                        {fieldState.error && (
                          <XCircle size={18} className="sm:w-5 text-red-500 animate-pulse" />
                        )}
                      </div>

                      {/* Error Message */}
                      {fieldState.error && (
                        <div className="mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
                          <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertCircle size={14} className="sm:w-4" />
                            {fieldState.error.message}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            />

            {/* Zip Code Field */}
            <FormField
              control={form.control}
              name="zipCode"
              render={({ field, fieldState }) => (
                <div className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl sm:rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] sm:hover:scale-[1.02]">
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="relative">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg">
                          <MapPin size={20} className="sm:w-6 text-white" />
                        </div>
                        {focusedField === 'zipCode' && (
                          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg sm:rounded-xl animate-pulse"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <ModernTooltip>
                          <ModernTooltipTrigger asChild>
                            <FormLabel className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-1 block"
                                       style={{ fontFamily: designTokens.typography.fonts.primary }}>
                              کد پستی
                            </FormLabel>
                          </ModernTooltipTrigger>
                          <ModernTooltipContent>
                            <p>کد پستی را وارد کنید</p>
                          </ModernTooltipContent>
                        </ModernTooltip>
                      </div>
                    </div>

                    <div className="relative">
                      <FormControl>
                        <ModernInput
                          placeholder="مثال: ۱۲۳۴۵۶۷۸۹۰"
                          variant="glass"
                          className={`
                            w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg rounded-lg sm:rounded-xl
                            bg-white/80 dark:bg-gray-700/80
                            border-2 border-white/30 dark:border-gray-600/30
                            backdrop-blur-md
                            transition-all duration-500 ease-out
                            focus:ring-4 focus:ring-violet-500/30 focus:border-violet-400
                            hover:bg-white/95 dark:hover:bg-gray-600/95
                            hover:shadow-xl hover:shadow-violet-500/20
                            hover:scale-[1.005] sm:hover:scale-[1.01]
                            ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : ''}
                            ${focusedField === 'zipCode' ? 'scale-105 shadow-2xl ring-4 ring-violet-500/20' : ''}
                            ${field.value && !fieldState.error ? 'border-green-400 shadow-green-500/20' : ''}
                          `}
                          style={{
                            fontFamily: designTokens.typography.fonts.secondary,
                            fontSize: '16px' // Prevents zoom on iOS
                          }}
                          {...field}
                          value={field.value || ''}
                          onFocus={() => setFocusedField('zipCode')}
                          onBlur={() => setFocusedField(null)}
                        />
                      </FormControl>

                      {/* Status Icons */}
                      <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                        {field.value && !fieldState.error && (
                          <CheckCircle size={18} className="sm:w-5 text-green-500 animate-bounce" />
                        )}
                        {fieldState.error && (
                          <XCircle size={18} className="sm:w-5 text-red-500 animate-pulse" />
                        )}
                      </div>

                      {/* Error Message */}
                      {fieldState.error && (
                        <div className="mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
                          <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertCircle size={14} className="sm:w-4" />
                            {fieldState.error.message}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            />

            {/* Country Field - Full Width */}
            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="country"
                render={({ field, fieldState }) => (
                  <div className="group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-slate-600 to-gray-600 rounded-xl sm:rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] sm:hover:scale-[1.02]">
                      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="relative">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-slate-500 to-gray-500 flex items-center justify-center shadow-lg">
                            <Globe size={20} className="sm:w-6 text-white" />
                          </div>
                          {focusedField === 'country' && (
                            <div className="absolute -inset-1 bg-gradient-to-r from-slate-600 to-gray-600 rounded-lg sm:rounded-xl animate-pulse"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <ModernTooltip>
                            <ModernTooltipTrigger asChild>
                              <FormLabel className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-1 block"
                                         style={{ fontFamily: designTokens.typography.fonts.primary }}>
                                کشور
                              </FormLabel>
                            </ModernTooltipTrigger>
                            <ModernTooltipContent>
                              <p>نام کشور را وارد کنید</p>
                            </ModernTooltipContent>
                          </ModernTooltip>
                        </div>
                      </div>

                      <div className="relative">
                        <FormControl>
                          <ModernInput
                            placeholder="مثال: ایران"
                            variant="glass"
                            className={`
                              w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg rounded-lg sm:rounded-xl
                              bg-white/80 dark:bg-gray-700/80
                              border-2 border-white/30 dark:border-gray-600/30
                              backdrop-blur-md
                              transition-all duration-500 ease-out
                              focus:ring-4 focus:ring-slate-500/30 focus:border-slate-400
                              hover:bg-white/95 dark:hover:bg-gray-600/95
                              hover:shadow-xl hover:shadow-slate-500/20
                              hover:scale-[1.005] sm:hover:scale-[1.01]
                              ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : ''}
                              ${focusedField === 'country' ? 'scale-105 shadow-2xl ring-4 ring-slate-500/20' : ''}
                              ${field.value && !fieldState.error ? 'border-green-400 shadow-green-500/20' : ''}
                            `}
                            style={{
                              fontFamily: designTokens.typography.fonts.secondary,
                              fontSize: '16px' // Prevents zoom on iOS
                            }}
                            {...field}
                            value={field.value || ''}
                            onFocus={() => setFocusedField('country')}
                            onBlur={() => setFocusedField(null)}
                          />
                        </FormControl>

                        {/* Status Icons */}
                        <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                          {field.value && !fieldState.error && (
                            <CheckCircle size={18} className="sm:w-5 text-green-500 animate-bounce" />
                          )}
                          {fieldState.error && (
                            <XCircle size={18} className="sm:w-5 text-red-500 animate-pulse" />
                          )}
                        </div>

                        {/* Error Message */}
                        {fieldState.error && (
                          <div className="mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
                            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                              <AlertCircle size={14} className="sm:w-4" />
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
      </div>
    </div>
  );
});

ContactAddress.displayName = 'ContactAddress';

export default ContactAddress;