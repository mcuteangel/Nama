import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ModernInput } from '@/components/ui/modern-input';
import { FormField, FormLabel, FormControl } from '@/components/ui/form';
import { FormSection } from '@/components/ui/FormSection';
import { FormCard } from '@/components/ui/FormCard';
import { ContactFormValues } from '@/types/contact';
import { MapPin, AlertCircle, CheckCircle, XCircle, Home, Building, Globe } from 'lucide-react';

const ContactAddress: React.FC = React.memo(() => {
  const form = useFormContext<ContactFormValues>();
  useTranslation();
  const [focusedField, setFocusedField] = useState<string | null>(null);

  return (
    <FormSection
      icon={MapPin}
      title="آدرس"
      description="اطلاعات آدرس مخاطب را وارد کنید"
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Street Field */}
        <FormCard
          title="خیابان"
          description="آدرس خیابان را وارد کنید"
          icon={Home}
          iconColor="#10b981"
        >
          <FormField
            control={form.control}
            name="street"
            render={({ field, fieldState }) => (
              <div className="space-y-3">
                <div className="relative">
                  <FormControl>
                    <ModernInput
                      placeholder="مثال: خیابان ولیعصر، پلاک ۱۲۳"
                      variant="glass"
                      className={`
                        w-full px-4 py-3 text-base rounded-lg
                        bg-white/80 dark:bg-gray-700/80
                        border-2 border-slate-200 dark:border-slate-600
                        backdrop-blur-md
                        transition-all duration-300 ease-out
                        focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400
                        hover:bg-white/95 dark:hover:bg-gray-600/95
                        hover:shadow-xl hover:shadow-emerald-500/20
                        hover:scale-[1.005]
                        ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : ''}
                        ${focusedField === 'street' ? 'scale-105 shadow-2xl ring-4 ring-emerald-500/20' : ''}
                        ${field.value && !fieldState.error ? 'border-green-400 shadow-green-500/20' : ''}
                      `}
                      style={{
                        fontSize: '16px' // Prevents zoom on iOS
                      }}
                      {...field}
                      value={field.value || ''}
                      onFocus={() => setFocusedField('street')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </FormControl>

                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {field.value && !fieldState.error && (
                      <CheckCircle size={18} className="text-green-500 animate-bounce" />
                    )}
                    {fieldState.error && (
                      <XCircle size={18} className="text-red-500 animate-pulse" />
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

        {/* City Field */}
        <FormCard
          title="شهر"
          description="نام شهر را وارد کنید"
          icon={Building}
          iconColor="#06b6d4"
        >
          <FormField
            control={form.control}
            name="city"
            render={({ field, fieldState }) => (
              <div className="space-y-3">
                <div className="relative">
                  <FormControl>
                    <ModernInput
                      placeholder="مثال: تهران"
                      variant="glass"
                      className={`
                        w-full px-4 py-3 text-base rounded-lg
                        bg-white/80 dark:bg-gray-700/80
                        border-2 border-slate-200 dark:border-slate-600
                        backdrop-blur-md
                        transition-all duration-300 ease-out
                        focus:ring-4 focus:ring-cyan-500/30 focus:border-cyan-400
                        hover:bg-white/95 dark:hover:bg-gray-600/95
                        hover:shadow-xl hover:shadow-cyan-500/20
                        hover:scale-[1.005]
                        ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : ''}
                        ${focusedField === 'city' ? 'scale-105 shadow-2xl ring-4 ring-cyan-500/20' : ''}
                        ${field.value && !fieldState.error ? 'border-green-400 shadow-green-500/20' : ''}
                      `}
                      style={{
                        fontSize: '16px' // Prevents zoom on iOS
                      }}
                      {...field}
                      value={field.value || ''}
                      onFocus={() => setFocusedField('city')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </FormControl>

                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {field.value && !fieldState.error && (
                      <CheckCircle size={18} className="text-green-500 animate-bounce" />
                    )}
                    {fieldState.error && (
                      <XCircle size={18} className="text-red-500 animate-pulse" />
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

        {/* State Field */}
        <FormCard
          title="استان"
          description="نام استان را وارد کنید"
          icon={MapPin}
          iconColor="#8b5cf6"
        >
          <FormField
            control={form.control}
            name="state"
            render={({ field, fieldState }) => (
              <div className="space-y-3">
                <div className="relative">
                  <FormControl>
                    <ModernInput
                      placeholder="مثال: تهران"
                      variant="glass"
                      className={`
                        w-full px-4 py-3 text-base rounded-lg
                        bg-white/80 dark:bg-gray-700/80
                        border-2 border-slate-200 dark:border-slate-600
                        backdrop-blur-md
                        transition-all duration-300 ease-out
                        focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-400
                        hover:bg-white/95 dark:hover:bg-gray-600/95
                        hover:shadow-xl hover:shadow-indigo-500/20
                        hover:scale-[1.005]
                        ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : ''}
                        ${focusedField === 'state' ? 'scale-105 shadow-2xl ring-4 ring-indigo-500/20' : ''}
                        ${field.value && !fieldState.error ? 'border-green-400 shadow-green-500/20' : ''}
                      `}
                      style={{
                        fontSize: '16px' // Prevents zoom on iOS
                      }}
                      {...field}
                      value={field.value || ''}
                      onFocus={() => setFocusedField('state')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </FormControl>

                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {field.value && !fieldState.error && (
                      <CheckCircle size={18} className="text-green-500 animate-bounce" />
                    )}
                    {fieldState.error && (
                      <XCircle size={18} className="text-red-500 animate-pulse" />
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

        {/* Zip Code Field */}
        <FormCard
          title="کد پستی"
          description="کد پستی را وارد کنید"
          icon={MapPin}
          iconColor="#a855f7"
        >
          <FormField
            control={form.control}
            name="zipCode"
            render={({ field, fieldState }) => (
              <div className="space-y-3">
                <div className="relative">
                  <FormControl>
                    <ModernInput
                      placeholder="مثال: ۱۲۳۴۵۶۷۸۹۰"
                      variant="glass"
                      className={`
                        w-full px-4 py-3 text-base rounded-lg
                        bg-white/80 dark:bg-gray-700/80
                        border-2 border-slate-200 dark:border-slate-600
                        backdrop-blur-md
                        transition-all duration-300 ease-out
                        focus:ring-4 focus:ring-violet-500/30 focus:border-violet-400
                        hover:bg-white/95 dark:hover:bg-gray-600/95
                        hover:shadow-xl hover:shadow-violet-500/20
                        hover:scale-[1.005]
                        ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : ''}
                        ${focusedField === 'zipCode' ? 'scale-105 shadow-2xl ring-4 ring-violet-500/20' : ''}
                        ${field.value && !fieldState.error ? 'border-green-400 shadow-green-500/20' : ''}
                      `}
                      style={{
                        fontSize: '16px' // Prevents zoom on iOS
                      }}
                      {...field}
                      value={field.value || ''}
                      onFocus={() => setFocusedField('zipCode')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </FormControl>

                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {field.value && !fieldState.error && (
                      <CheckCircle size={18} className="text-green-500 animate-bounce" />
                    )}
                    {fieldState.error && (
                      <XCircle size={18} className="text-red-500 animate-pulse" />
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

        {/* Country Field - Full Width */}
        <div className="sm:col-span-2">
          <FormCard
            title="کشور"
            description="نام کشور را وارد کنید"
            icon={Globe}
            iconColor="#64748b"
          >
            <FormField
              control={form.control}
              name="country"
              render={({ field, fieldState }) => (
                <div className="space-y-3">
                  <div className="relative">
                    <FormControl>
                      <ModernInput
                        placeholder="مثال: ایران"
                        variant="glass"
                        className={`
                          w-full px-4 py-3 text-base rounded-lg
                          bg-white/80 dark:bg-gray-700/80
                          border-2 border-slate-200 dark:border-slate-600
                          backdrop-blur-md
                          transition-all duration-300 ease-out
                          focus:ring-4 focus:ring-slate-500/30 focus:border-slate-400
                          hover:bg-white/95 dark:hover:bg-gray-600/95
                          hover:shadow-xl hover:shadow-slate-500/20
                          hover:scale-[1.005]
                          ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : ''}
                          ${focusedField === 'country' ? 'scale-105 shadow-2xl ring-4 ring-slate-500/20' : ''}
                          ${field.value && !fieldState.error ? 'border-green-400 shadow-green-500/20' : ''}
                        `}
                        style={{
                          fontSize: '16px' // Prevents zoom on iOS
                        }}
                        {...field}
                        value={field.value || ''}
                        onFocus={() => setFocusedField('country')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </FormControl>

                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      {field.value && !fieldState.error && (
                        <CheckCircle size={18} className="text-green-500 animate-bounce" />
                      )}
                      {fieldState.error && (
                        <XCircle size={18} className="text-red-500 animate-pulse" />
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
        </div>
      </div>
    </FormSection>
  );
});

ContactAddress.displayName = 'ContactAddress';

export default ContactAddress;