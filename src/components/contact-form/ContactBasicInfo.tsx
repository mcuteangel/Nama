import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { FormField, FormLabel, FormControl } from '@/components/ui/form';
import { ContactFormValues } from '@/types/contact';
import { useTranslation } from 'react-i18next';
import { useGroups } from '@/hooks/use-groups';
import { useGroupColorManagement } from '@/hooks/use-group-color-management';
import { User, User2, UserCheck, Users, AlertCircle, Briefcase, Building2, CheckCircle, XCircle, Loader2, Sparkles } from 'lucide-react';
import GroupForm from '@/components/groups/GroupForm';
import FormDialogWrapper from '@/components/common/FormDialogWrapper';
import { Dialog } from '@/components/ui/dialog';
import LoadingMessage from '@/components/common/LoadingMessage';
import { GlassButton } from "@/components/ui/glass-button";
import { ModernCard } from '@/components/ui/modern-card';
import { useRealTimeValidation } from '@/hooks/use-real-time-validation';
import { FieldPath } from 'react-hook-form';
import { designTokens } from '@/lib/design-tokens';

const ContactBasicInfo: React.FC = React.memo(() => {
  const { t, i18n } = useTranslation();
  const form = useFormContext<ContactFormValues>();
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { groups, fetchGroups } = useGroups();
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);

  // Determine text direction based on language
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';

  // Debug: Log when component mounts and when groups change
  useEffect(() => {
    console.log('ContactBasicInfo mounted, fetching groups...');
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    console.log('Groups updated:', groups);
  }, [groups]);

  // Use the real-time validation hook
  const {
    validateField,
    getFieldValidationStatus,
    markFieldAsTouched
  } = useRealTimeValidation({ form, debounceMs: 300 });

  // Use the custom hook for color management
  const {
    isLoading: isFetchingColors,
    error: fetchColorsError,
    fetchColorsWhenNeeded,
  } = useGroupColorManagement();

  // Memoize gender options to prevent unnecessary re-renders
  const genderOptions = useMemo(() => [
    { value: "male", label: t('gender.male') },
    { value: "female", label: t('gender.female') },
    { value: "not_specified", label: t('gender.not_specified') },
  ], [t]);

  // Memoize group options for search select
  const groupOptions = useMemo(() => {
    // Ensure groups is an array before mapping
    const safeGroups = Array.isArray(groups) ? groups : [];

    const options: { value: string; label: string }[] = [
      { value: "no-group-selected", label: t('contact_form.no_group') },
      ...safeGroups.map((group) => ({
        value: group.id,
        label: group.name,
      })),
      { value: "__ADD_NEW_GROUP__", label: t('contact_form.add_new_group') },
    ];

    return options;
  }, [groups, t]);

  const handleGroupAdded = useCallback(async (newGroupId?: string) => {
    await fetchGroups();
    if (newGroupId) {
      form.setValue('groupId', newGroupId, { shouldDirty: true, shouldValidate: true });
    }
    setIsAddGroupDialogOpen(false);
  }, [fetchGroups, form]);

  const handleGroupSelection = useCallback(async (value: string) => {
    if (value === "__ADD_NEW_GROUP__") {
      await fetchColorsWhenNeeded();
      setIsAddGroupDialogOpen(true);
    } else {
      form.setValue('groupId', value === "no-group-selected" ? null : value, { shouldDirty: true, shouldValidate: true });
    }
  }, [form, fetchColorsWhenNeeded]);

  // Specialized handler for gender field to ensure proper typing
  const handleGenderChange = useCallback((value: "male" | "female" | "not_specified") => {
    form.setValue('gender', value, { shouldDirty: true });
    validateField('gender');
  }, [form, validateField]);

  // Specialized handlers for other fields to avoid typing issues
  const handleFirstNameChange = useCallback((value: string) => {
    form.setValue('firstName', value, { shouldDirty: true });
    validateField('firstName');
  }, [form, validateField]);

  const handleLastNameChange = useCallback((value: string) => {
    form.setValue('lastName', value, { shouldDirty: true });
    validateField('lastName');
  }, [form, validateField]);

  const handlePositionChange = useCallback((value: string) => {
    form.setValue('position', value, { shouldDirty: true });
    validateField('position');
  }, [form, validateField]);

  const handleCompanyChange = useCallback((value: string) => {
    form.setValue('company', value, { shouldDirty: true });
    validateField('company');
  }, [form, validateField]);

  // Handle field blur with validation
  const handleFieldBlur = useCallback((fieldName: FieldPath<ContactFormValues>) => {
    setFocusedField(null);
    markFieldAsTouched(fieldName);
    // Trigger immediate validation on blur
    form.trigger(fieldName);
  }, [markFieldAsTouched, form]);

  return (
    <>
      <div className="space-y-8">
        {/* Header Section with New Design */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
             style={{
               background: designTokens.gradients.ocean,
               boxShadow: designTokens.shadows.glass3d
             }}>
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
          <div className="relative p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
                <Sparkles size={24} className="sm:w-8 lg:w-8 text-white animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2"
                    style={{ fontFamily: designTokens.typography.fonts.primary }}>
                  اطلاعات پایه
                </h2>
                <p className="text-white/80 text-sm sm:text-base lg:text-lg">
                  اطلاعات اصلی مخاطب را وارد کنید
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* First Name Field */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field, fieldState }) => {
                  const validationStatus = getFieldValidationStatus('firstName');
                  return (
                    <div className="group relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] sm:hover:scale-[1.02]">
                        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                          <div className="relative">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                              <User size={20} className="sm:w-6 text-white" />
                            </div>
                            {focusedField === 'firstName' && (
                              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg sm:rounded-xl animate-pulse"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <FormLabel className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-1 block"
                                       style={{ fontFamily: designTokens.typography.fonts.primary }}>
                              نام
                              <span className="text-red-500 ml-1 sm:ml-2">*</span>
                            </FormLabel>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">نام کوچک مخاطب را وارد کنید</p>
                          </div>
                        </div>

                        <div className="relative">
                          <FormControl>
                            <ModernInput
                              placeholder="مثال: محمد"
                              variant="glass"
                              className={`
                                w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg rounded-lg sm:rounded-xl
                                bg-white/80 dark:bg-gray-700/80
                                border-2 border-white/30 dark:border-gray-600/30
                                backdrop-blur-md
                                transition-all duration-500 ease-out
                                focus:ring-4 focus:ring-purple-500/30 focus:border-purple-400
                                hover:bg-white/95 dark:hover:bg-gray-600/95
                                hover:shadow-xl hover:shadow-purple-500/20
                                hover:scale-[1.005] sm:hover:scale-[1.01]
                                ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : ''}
                                ${focusedField === 'firstName' ? 'scale-105 shadow-2xl ring-4 ring-purple-500/20' : ''}
                                ${validationStatus.isValid ? 'border-green-400 shadow-green-500/20' : ''}
                                ${validationStatus.isValidating ? 'border-yellow-400 shadow-yellow-500/20' : ''}
                              `}
                              style={{
                                fontFamily: designTokens.typography.fonts.secondary,
                                fontSize: '16px' // Prevents zoom on iOS
                              }}
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => handleFirstNameChange(e.target.value)}
                              onFocus={() => setFocusedField('firstName')}
                              onBlur={() => handleFieldBlur('firstName')}
                            />
                          </FormControl>

                          {/* Status Icons */}
                          <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                            {validationStatus.isValidating && (
                              <Loader2 size={18} className="sm:w-5 text-yellow-500 animate-spin" />
                            )}
                            {validationStatus.isValid && !validationStatus.isValidating && (
                              <CheckCircle size={18} className="sm:w-5 text-green-500 animate-bounce" />
                            )}
                            {validationStatus.hasError && !validationStatus.isValidating && (
                              <XCircle size={18} className="sm:w-5 text-red-500 animate-pulse" />
                            )}
                          </div>

                          {/* Error Message */}
                          {validationStatus.hasError && (
                            <div className="mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
                              <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                <AlertCircle size={14} className="sm:w-4" />
                                {validationStatus.errorMessage}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }}
              />

              {/* Last Name Field */}
              <FormField
                control={form.control}
                name="lastName"
                render={({ field, fieldState }) => {
                  const validationStatus = getFieldValidationStatus('lastName');
                  return (
                    <div className="group relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl sm:rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] sm:hover:scale-[1.02]">
                        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                          <div className="relative">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                              <User2 size={20} className="sm:w-6 text-white" />
                            </div>
                            {focusedField === 'lastName' && (
                              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg sm:rounded-xl animate-pulse"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <FormLabel className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-1 block"
                                       style={{ fontFamily: designTokens.typography.fonts.primary }}>
                              نام خانوادگی
                              <span className="text-red-500 ml-1 sm:ml-2">*</span>
                            </FormLabel>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">نام خانوادگی مخاطب را وارد کنید</p>
                          </div>
                        </div>

                        <div className="relative">
                          <FormControl>
                            <ModernInput
                              placeholder="مثال: احمدی"
                              variant="glass"
                              className={`
                                w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg rounded-lg sm:rounded-xl
                                bg-white/80 dark:bg-gray-700/80
                                border-2 border-white/30 dark:border-gray-600/30
                                backdrop-blur-md
                                transition-all duration-500 ease-out
                                focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400
                                hover:bg-white/95 dark:hover:bg-gray-600/95
                                hover:shadow-xl hover:shadow-blue-500/20
                                hover:scale-[1.005] sm:hover:scale-[1.01]
                                ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : ''}
                                ${focusedField === 'lastName' ? 'scale-105 shadow-2xl ring-4 ring-blue-500/20' : ''}
                                ${validationStatus.isValid ? 'border-green-400 shadow-green-500/20' : ''}
                                ${validationStatus.isValidating ? 'border-yellow-400 shadow-yellow-500/20' : ''}
                              `}
                              style={{
                                fontFamily: designTokens.typography.fonts.secondary,
                                fontSize: '16px' // Prevents zoom on iOS
                              }}
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => handleLastNameChange(e.target.value)}
                              onFocus={() => setFocusedField('lastName')}
                              onBlur={() => handleFieldBlur('lastName')}
                            />
                          </FormControl>

                          {/* Status Icons */}
                          <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                            {validationStatus.isValidating && (
                              <Loader2 size={18} className="sm:w-5 text-blue-500 animate-spin" />
                            )}
                            {validationStatus.isValid && !validationStatus.isValidating && (
                              <CheckCircle size={18} className="sm:w-5 text-green-500 animate-bounce" />
                            )}
                            {validationStatus.hasError && !validationStatus.isValidating && (
                              <XCircle size={18} className="sm:w-5 text-red-500 animate-pulse" />
                            )}
                          </div>

                          {/* Error Message */}
                          {validationStatus.hasError && (
                            <div className="mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
                              <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                <AlertCircle size={14} className="sm:w-4" />
                                {validationStatus.errorMessage}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }}
              />

              {/* Position Field */}
              <FormField
                control={form.control}
                name="position"
                render={({ field, fieldState }) => {
                  const validationStatus = getFieldValidationStatus('position');
                  return (
                    <div className="group relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl sm:rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] sm:hover:scale-[1.02]">
                        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                          <div className="relative">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                              <Briefcase size={20} className="sm:w-6 text-white" />
                            </div>
                            {focusedField === 'position' && (
                              <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg sm:rounded-xl animate-pulse"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <FormLabel className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-1 block"
                                       style={{ fontFamily: designTokens.typography.fonts.primary }}>
                              سمت
                            </FormLabel>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">سمت شغلی مخاطب را وارد کنید</p>
                          </div>
                        </div>

                        <div className="relative">
                          <FormControl>
                            <ModernInput
                              placeholder="مثال: مدیر فروش"
                              variant="glass"
                              className={`
                                w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg rounded-lg sm:rounded-xl
                                bg-white/80 dark:bg-gray-700/80
                                border-2 border-white/30 dark:border-gray-600/30
                                backdrop-blur-md
                                transition-all duration-500 ease-out
                                focus:ring-4 focus:ring-amber-500/30 focus:border-amber-400
                                hover:bg-white/95 dark:hover:bg-gray-600/95
                                hover:shadow-xl hover:shadow-amber-500/20
                                hover:scale-[1.005] sm:hover:scale-[1.01]
                                ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : ''}
                                ${focusedField === 'position' ? 'scale-105 shadow-2xl ring-4 ring-amber-500/20' : ''}
                                ${validationStatus.isValid ? 'border-green-400 shadow-green-500/20' : ''}
                                ${validationStatus.isValidating ? 'border-yellow-400 shadow-yellow-500/20' : ''}
                              `}
                              style={{
                                fontFamily: designTokens.typography.fonts.secondary,
                                fontSize: '16px' // Prevents zoom on iOS
                              }}
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => handlePositionChange(e.target.value)}
                              onFocus={() => setFocusedField('position')}
                              onBlur={() => handleFieldBlur('position')}
                            />
                          </FormControl>

                          {/* Status Icons */}
                          <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                            {validationStatus.isValidating && (
                              <Loader2 size={18} className="sm:w-5 text-amber-500 animate-spin" />
                            )}
                            {validationStatus.isValid && !validationStatus.isValidating && (
                              <CheckCircle size={18} className="sm:w-5 text-green-500 animate-bounce" />
                            )}
                            {validationStatus.hasError && !validationStatus.isValidating && (
                              <XCircle size={18} className="sm:w-5 text-red-500 animate-pulse" />
                            )}
                          </div>

                          {/* Error Message */}
                          {validationStatus.hasError && (
                            <div className="mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
                              <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                <AlertCircle size={14} className="sm:w-4" />
                                {validationStatus.errorMessage}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }}
              />

              {/* Company Field */}
              <FormField
                control={form.control}
                name="company"
                render={({ field, fieldState }) => {
                  const validationStatus = getFieldValidationStatus('company');
                  return (
                    <div className="group relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl sm:rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] sm:hover:scale-[1.02]">
                        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                          <div className="relative">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                              <Building2 size={20} className="sm:w-6 text-white" />
                            </div>
                            {focusedField === 'company' && (
                              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg sm:rounded-xl animate-pulse"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <FormLabel className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-1 block"
                                       style={{ fontFamily: designTokens.typography.fonts.primary }}>
                              شرکت
                            </FormLabel>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">نام شرکت مخاطب را وارد کنید</p>
                          </div>
                        </div>

                        <div className="relative">
                          <FormControl>
                            <ModernInput
                              placeholder="مثال: شرکت فناوری اطلاعات"
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
                                ${focusedField === 'company' ? 'scale-105 shadow-2xl ring-4 ring-emerald-500/20' : ''}
                                ${validationStatus.isValid ? 'border-green-400 shadow-green-500/20' : ''}
                                ${validationStatus.isValidating ? 'border-yellow-400 shadow-yellow-500/20' : ''}
                              `}
                              style={{
                                fontFamily: designTokens.typography.fonts.secondary,
                                fontSize: '16px' // Prevents zoom on iOS
                              }}
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => handleCompanyChange(e.target.value)}
                              onFocus={() => setFocusedField('company')}
                              onBlur={() => handleFieldBlur('company')}
                            />
                          </FormControl>

                          {/* Status Icons */}
                          <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                            {validationStatus.isValidating && (
                              <Loader2 size={18} className="sm:w-5 text-emerald-500 animate-spin" />
                            )}
                            {validationStatus.isValid && !validationStatus.isValidating && (
                              <CheckCircle size={18} className="sm:w-5 text-green-500 animate-bounce" />
                            )}
                            {validationStatus.hasError && !validationStatus.isValidating && (
                              <XCircle size={18} className="sm:w-5 text-red-500 animate-pulse" />
                            )}
                          </div>

                          {/* Error Message */}
                          {validationStatus.hasError && (
                            <div className="mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
                              <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                <AlertCircle size={14} className="sm:w-4" />
                                {validationStatus.errorMessage}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }}
              />

              {/* Gender Field */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field, fieldState }) => {
                  const validationStatus = getFieldValidationStatus('gender');
                  return (
                    <div className="group relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-rose-600 to-pink-600 rounded-xl sm:rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] sm:hover:scale-[1.02]">
                        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                          <div className="relative">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg">
                              <UserCheck size={20} className="sm:w-6 text-white" />
                            </div>
                            {focusedField === 'gender' && (
                              <div className="absolute -inset-1 bg-gradient-to-r from-rose-600 to-pink-600 rounded-lg sm:rounded-xl animate-pulse"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <FormLabel className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-1 block"
                                       style={{ fontFamily: designTokens.typography.fonts.primary }}>
                              جنسیت
                            </FormLabel>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">جنسیت مخاطب را انتخاب کنید</p>
                          </div>
                        </div>

                        <div className="relative">
                          <FormControl>
                            <ModernSelect onValueChange={handleGenderChange} value={field.value} dir={isRTL ? 'rtl' : 'ltr'}>
                              <ModernSelectTrigger
                                variant="glass"
                                className={`
                                  w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg rounded-lg sm:rounded-xl
                                  bg-white/80 dark:bg-gray-700/80
                                  border-2 border-white/30 dark:border-gray-600/30
                                  backdrop-blur-md
                                  transition-all duration-500 ease-out
                                  focus:ring-4 focus:ring-rose-500/30 focus:border-rose-400
                                  hover:bg-white/95 dark:hover:bg-gray-600/95
                                  hover:shadow-xl hover:shadow-rose-500/20
                                  hover:scale-[1.005] sm:hover:scale-[1.01]
                                  ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : ''}
                                  ${focusedField === 'gender' ? 'scale-105 shadow-2xl ring-4 ring-rose-500/20' : ''}
                                  ${validationStatus.isValid ? 'border-green-400 shadow-green-500/20' : ''}
                                  ${validationStatus.isValidating ? 'border-yellow-400 shadow-yellow-500/20' : ''}
                                `}
                                style={{
                                  fontFamily: designTokens.typography.fonts.secondary,
                                  fontSize: '16px', // Prevents zoom on iOS
                                  direction: isRTL ? 'rtl' : 'ltr'
                                }}
                                onFocus={() => setFocusedField('gender')}
                                onBlur={() => handleFieldBlur('gender')}
                              >
                                <ModernSelectValue placeholder="جنسیت را انتخاب کنید" />
                              </ModernSelectTrigger>
                              <ModernSelectContent variant="glass" className="bg-white/90 dark:bg-gray-800/90 border border-white/30 dark:border-gray-600/30 rounded-xl sm:rounded-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
                                {genderOptions.map(option => (
                                  <ModernSelectItem key={option.value} value={option.value} className="hover:bg-white/30 dark:hover:bg-gray-700/40 px-3 sm:px-4 py-2 sm:py-3 rounded-lg" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                                    {option.label}
                                  </ModernSelectItem>
                                ))}
                              </ModernSelectContent>
                            </ModernSelect>
                          </FormControl>

                          {/* Status Icons */}
                          <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                            {validationStatus.isValidating && (
                              <Loader2 size={18} className="sm:w-5 text-rose-500 animate-spin" />
                            )}
                            {validationStatus.isValid && !validationStatus.isValidating && (
                              <CheckCircle size={18} className="sm:w-5 text-green-500 animate-bounce" />
                            )}
                            {validationStatus.hasError && !validationStatus.isValidating && (
                              <XCircle size={18} className="sm:w-5 text-red-500 animate-pulse" />
                            )}
                          </div>

                          {/* Error Message */}
                          {validationStatus.hasError && (
                            <div className="mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
                              <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                <AlertCircle size={14} className="sm:w-4" />
                                {validationStatus.errorMessage}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }}
              />

              {/* Group Field */}
              <FormField
                control={form.control}
                name="groupId"
                render={({ field, fieldState }) => {
                  const validationStatus = getFieldValidationStatus('groupId');
                  return (
                    <div className="group relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] sm:hover:scale-[1.02]">
                        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                          <div className="relative">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                              <Users size={20} className="sm:w-6 text-white" />
                            </div>
                            {focusedField === 'groupId' && (
                              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg sm:rounded-xl animate-pulse"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <FormLabel className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-1 block"
                                       style={{ fontFamily: designTokens.typography.fonts.primary }}>
                              گروه
                            </FormLabel>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">گروه مخاطب را انتخاب کنید</p>
                          </div>
                        </div>

                        <div className="relative">
                          <FormControl>
                            <ModernSelect onValueChange={handleGroupSelection} value={field.value === null ? "no-group-selected" : field.value} dir={isRTL ? 'rtl' : 'ltr'}>
                              <ModernSelectTrigger
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
                                  ${focusedField === 'groupId' ? 'scale-105 shadow-2xl ring-4 ring-indigo-500/20' : ''}
                                  ${validationStatus.isValid ? 'border-green-400 shadow-green-500/20' : ''}
                                  ${validationStatus.isValidating ? 'border-yellow-400 shadow-yellow-500/20' : ''}
                                `}
                                style={{
                                  fontFamily: designTokens.typography.fonts.secondary,
                                  fontSize: '16px', // Prevents zoom on iOS
                                  direction: isRTL ? 'rtl' : 'ltr'
                                }}
                                onFocus={() => setFocusedField('groupId')}
                                onBlur={() => handleFieldBlur('groupId')}
                              >
                                <ModernSelectValue placeholder="گروه را انتخاب کنید" />
                              </ModernSelectTrigger>
                              <ModernSelectContent variant="glass" className="bg-white/90 dark:bg-gray-800/90 border border-white/30 dark:border-gray-600/30 rounded-xl sm:rounded-2xl max-h-60 overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
                                {groupOptions.map(option => (
                                  <ModernSelectItem key={option.value} value={option.value} className="hover:bg-white/30 dark:hover:bg-gray-700/40 px-3 sm:px-4 py-2 sm:py-3 rounded-lg" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                                    {option.label}
                                  </ModernSelectItem>
                                ))}
                              </ModernSelectContent>
                            </ModernSelect>
                          </FormControl>

                          {/* Status Icons */}
                          <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                            {validationStatus.isValidating && (
                              <Loader2 size={18} className="sm:w-5 text-indigo-500 animate-spin" />
                            )}
                            {validationStatus.isValid && !validationStatus.isValidating && (
                              <CheckCircle size={18} className="sm:w-5 text-green-500 animate-bounce" />
                            )}
                            {validationStatus.hasError && !validationStatus.isValidating && (
                              <XCircle size={18} className="sm:w-5 text-red-500 animate-pulse" />
                            )}
                          </div>

                          {/* Error Message */}
                          {validationStatus.hasError && (
                            <div className="mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
                              <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                <AlertCircle size={14} className="sm:w-4" />
                                {validationStatus.errorMessage}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Clean Dialog Implementation */}
      <Dialog open={isAddGroupDialogOpen} onOpenChange={setIsAddGroupDialogOpen}>
        <FormDialogWrapper
          title={t('contact_form.add_group_title', 'Add Group')}
          description={t('contact_form.add_group_description', 'Form for adding a new contact group')}
        >
          {isFetchingColors ? (
            <ModernCard variant="glass" className="w-full max-w-md rounded-xl p-6">
              <LoadingMessage message={t('contact_form.preparing_group_form')} />
            </ModernCard>
          ) : fetchColorsError ? (
            <ModernCard variant="glass" className="w-full max-w-md rounded-xl p-6 text-center text-red-500 dark:text-red-400">
              <p>{fetchColorsError.message}</p>
              <GlassButton onClick={() => setIsAddGroupDialogOpen(false)} className="mt-4">{t('common.close')}</GlassButton>
            </ModernCard>
          ) : (
            <GroupForm
              onSuccess={handleGroupAdded}
              onCancel={() => setIsAddGroupDialogOpen(false)}
            />
          )}
        </FormDialogWrapper>
      </Dialog>
    </>
  );
});

ContactBasicInfo.displayName = 'ContactBasicInfo';

export default ContactBasicInfo;