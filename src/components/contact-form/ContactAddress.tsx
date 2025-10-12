import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ModernInput } from '@/components/ui/modern-input';
import { FormField, FormLabel, FormControl } from '@/components/ui/form';
import { FormCard } from '@/components/ui/FormCard';
import { FormSection } from '@/components/ui/FormSection';
import { ContactFormValues } from '@/types/contact';
import { MapPin, AlertCircle, Home, Building, Globe } from 'lucide-react';

const ContactAddress: React.FC = React.memo(() => {
  const form = useFormContext<ContactFormValues>();

  return (
    <FormCard
      title="آدرس"
      description="اطلاعات آدرس مخاطب را وارد کنید"
      icon={MapPin}
      iconColor="#10b981"
    >
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Street Field */}
          <FormSection
            variant="card"
            title=""
            className="relative"
          >
            <FormField
              control={form.control}
              name="street"
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <Home size={10} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      خیابان
                    </FormLabel>
                  </div>
                  <FormControl>
                    <ModernInput
                      placeholder="مثال: خیابان ولیعصر، پلاک ۱۲۳"
                      variant="glass"
                      className={`w-full px-3 py-2 text-sm rounded-lg border-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-md transition-all duration-300 ease-out focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 hover:bg-white/95 dark:hover:bg-gray-600/95 hover:shadow-xl hover:shadow-emerald-500/20 ${fieldState.error ? 'border-red-300 focus:border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
                      {...field}
                      value={field.value || ''}
                    />
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

          {/* City Field */}
          <FormSection
            variant="card"
            title=""
            className="relative"
          >
            <FormField
              control={form.control}
              name="city"
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <Building size={10} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      شهر
                    </FormLabel>
                  </div>
                  <FormControl>
                    <ModernInput
                      placeholder="مثال: تهران"
                      variant="glass"
                      className={`w-full px-3 py-2 text-sm rounded-lg border-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-md transition-all duration-300 ease-out focus:ring-4 focus:ring-cyan-500/30 focus:border-cyan-400 hover:bg-white/95 dark:hover:bg-gray-600/95 hover:shadow-xl hover:shadow-cyan-500/20 ${fieldState.error ? 'border-red-300 focus:border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
                      {...field}
                      value={field.value || ''}
                    />
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

          {/* State Field */}
          <FormSection
            variant="card"
            title=""
            className="relative"
          >
            <FormField
              control={form.control}
              name="state"
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <MapPin size={10} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      استان
                    </FormLabel>
                  </div>
                  <FormControl>
                    <ModernInput
                      placeholder="مثال: تهران"
                      variant="glass"
                      className={`w-full px-3 py-2 text-sm rounded-lg border-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-md transition-all duration-300 ease-out focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-400 hover:bg-white/95 dark:hover:bg-gray-600/95 hover:shadow-xl hover:shadow-indigo-500/20 ${fieldState.error ? 'border-red-300 focus:border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
                      {...field}
                      value={field.value || ''}
                    />
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

          {/* Zip Code Field */}
          <FormSection
            variant="card"
            title=""
            className="relative"
          >
            <FormField
              control={form.control}
              name="zipCode"
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <MapPin size={10} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      کد پستی
                    </FormLabel>
                  </div>
                  <FormControl>
                    <ModernInput
                      placeholder="مثال: ۱۲۳۴۵۶۷۸۹۰"
                      variant="glass"
                      className={`w-full px-3 py-2 text-sm rounded-lg border-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-md transition-all duration-300 ease-out focus:ring-4 focus:ring-violet-500/30 focus:border-violet-400 hover:bg-white/95 dark:hover:bg-gray-600/95 hover:shadow-xl hover:shadow-violet-500/20 ${fieldState.error ? 'border-red-300 focus:border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
                      {...field}
                      value={field.value || ''}
                    />
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
        </div>

        {/* Country Field - Full Width */}
        <FormSection
          variant="card"
          title=""
          className="relative"
        >
          <FormField
            control={form.control}
            name="country"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Globe size={10} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    کشور
                  </FormLabel>
                </div>
                <FormControl>
                  <ModernInput
                    placeholder="مثال: ایران"
                    variant="glass"
                    className={`w-full px-3 py-2 text-sm rounded-lg border-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-md transition-all duration-300 ease-out focus:ring-4 focus:ring-slate-500/30 focus:border-slate-400 hover:bg-white/95 dark:hover:bg-gray-600/95 hover:shadow-xl hover:shadow-slate-500/20 ${fieldState.error ? 'border-red-300 focus:border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
                    {...field}
                    value={field.value || ''}
                  />
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
      </div>
    </FormCard>
  );
});

ContactAddress.displayName = 'ContactAddress';

export default ContactAddress;