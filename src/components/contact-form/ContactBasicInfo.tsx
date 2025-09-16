import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { ContactFormValues } from '@/types/contact';
import { useTranslation } from 'react-i18next';
import { useGroups } from '@/hooks/use-groups';
import { useGroupColorManagement } from '@/hooks/use-group-color-management';
import { User, User2, UserCheck, Users, AlertCircle, Briefcase, Building2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { PlusCircle } from 'lucide-react';
import GroupForm from '@/components/groups/GroupForm';
import FormDialogWrapper from '@/components/common/FormDialogWrapper';
import { Dialog } from '@/components/ui/dialog';
import LoadingMessage from '@/components/common/LoadingMessage';
import { GlassButton } from "@/components/ui/glass-button";
import { ModernCard } from '@/components/ui/modern-card';
import { useRealTimeValidation } from '@/hooks/use-real-time-validation';
import { FieldPath } from 'react-hook-form';

const ContactBasicInfo: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const form = useFormContext<ContactFormValues>();
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { groups, fetchGroups } = useGroups();
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);

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
      form.setValue('groupId', value === "no-group-selected" ? null : value);
    }
  }, [form, fetchColorsWhenNeeded]);

  // Handle field change with real-time validation
  const handleFieldChange = useCallback((fieldName: FieldPath<ContactFormValues>, value: unknown) => {
    form.setValue(fieldName, value, { shouldDirty: true });
    validateField(fieldName, value);
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
      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-white/50 to-white/30 dark:from-neutral-800/50 dark:to-neutral-900/30 border-2 border-white/40 dark:border-neutral-700/40 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field, fieldState }) => {
                const validationStatus = getFieldValidationStatus('firstName');
                return (
                  <FormItem>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-10 h-10 rounded-xl flex items-center justify-center
                          bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-800/20
                          border border-primary-200/50 dark:border-primary-800/50
                          transition-all duration-300
                          ${focusedField === 'firstName' ? 'scale-105 shadow-lg shadow-primary-500/20' : ''}
                        `}>
                          <User size={20} className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <FormLabel className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                          {t('form_labels.first_name')}
                          <span className="text-red-500 ms-1">*</span>
                        </FormLabel>
                      </div>

                      <div className="relative group">
                        <FormControl>
                          <ModernInput
                            placeholder={t('form_placeholders.first_name')}
                            variant="glass"
                            className={`
                              w-full px-6 py-4 text-lg rounded-2xl
                              border-2 bg-white/70 dark:bg-neutral-800/70
                              backdrop-blur-sm
                              transition-all duration-300 ease-out
                              focus:ring-4 focus:ring-primary-500/20 focus:border-primary-400
                              hover:bg-white/90 dark:hover:bg-neutral-800/90
                              hover:shadow-lg hover:shadow-primary-500/10
                              ${fieldState.error ? 'border-error-400 focus:ring-error-500/20' : 'border-white/50 dark:border-neutral-600/50'}
                              ${focusedField === 'firstName' ? 'scale-[1.02] shadow-xl' : ''}
                              ${validationStatus.isValid ? 'border-success-400' : ''}
                              ${validationStatus.isValidating ? 'border-warning-400' : ''}
                            `}
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => handleFieldChange('firstName', e.target.value)}
                            onFocus={() => setFocusedField('firstName')}
                            onBlur={() => handleFieldBlur('firstName')}
                          />
                        </FormControl>

                        {validationStatus.isValidating && (
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <Loader2 size={20} className="text-warning-500 animate-spin" />
                          </div>
                        )}

                        {validationStatus.isValid && !validationStatus.isValidating && (
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <CheckCircle size={20} className="text-success-500 animate-pulse" />
                          </div>
                        )}

                        {validationStatus.hasError && !validationStatus.isValidating && (
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <XCircle size={20} className="text-red-500" />
                          </div>
                        )}

                        {validationStatus.hasError && (
                          <p className="mt-3 text-sm text-red-500 dark:text-red-400 flex items-center gap-2 animate-slide-in">
                            <AlertCircle size={16} />
                            {validationStatus.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field, fieldState }) => {
                const validationStatus = getFieldValidationStatus('lastName');
                return (
                  <FormItem>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-10 h-10 rounded-xl flex items-center justify-center
                          bg-gradient-to-br from-secondary-100 to-secondary-50 dark:from-secondary-900/30 dark:to-secondary-800/20
                          border border-secondary-200/50 dark:border-secondary-800/50
                          transition-all duration-300
                          ${focusedField === 'lastName' ? 'scale-105 shadow-lg shadow-secondary-500/20' : ''}
                        `}>
                          <User2 size={20} className="text-secondary-600 dark:text-secondary-400" />
                        </div>
                        <FormLabel className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                          {t('form_labels.last_name')}
                          <span className="text-red-500 ms-1">*</span>
                        </FormLabel>
                      </div>

                      <div className="relative group">
                        <FormControl>
                          <ModernInput
                            placeholder={t('form_placeholders.last_name')}
                            variant="glass"
                            className={`
                              w-full px-6 py-4 text-lg rounded-2xl
                              border-2 bg-white/60 dark:bg-gray-700/60
                              backdrop-blur-sm
                              transition-all duration-300 ease-out
                              focus:ring-4 focus:ring-secondary-500/20 focus:border-secondary-400
                              hover:bg-white/90 dark:hover:bg-neutral-800/90
                              hover:shadow-lg hover:shadow-secondary-500/10
                              ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : 'border-white/50 dark:border-gray-600/50'}
                              ${focusedField === 'lastName' ? 'scale-[1.02] shadow-xl' : ''}
                              ${validationStatus.isValid ? 'border-success-400' : ''}
                              ${validationStatus.isValidating ? 'border-warning-400' : ''}
                            `}
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => handleFieldChange('lastName', e.target.value)}
                            onFocus={() => setFocusedField('lastName')}
                            onBlur={() => handleFieldBlur('lastName')}
                          />
                        </FormControl>

                        {validationStatus.isValidating && (
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <Loader2 size={20} className="text-warning-500 animate-spin" />
                          </div>
                        )}

                        {validationStatus.isValid && !validationStatus.isValidating && (
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <CheckCircle size={20} className="text-success-500 animate-pulse" />
                          </div>
                        )}

                        {validationStatus.hasError && !validationStatus.isValidating && (
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <XCircle size={20} className="text-red-500" />
                          </div>
                        )}

                        {validationStatus.hasError && (
                          <p className="mt-3 text-sm text-red-500 dark:text-red-400 flex items-center gap-2 animate-slide-in">
                            <AlertCircle size={16} />
                            {validationStatus.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field, fieldState }) => {
                const validationStatus = getFieldValidationStatus('position');
                return (
                  <FormItem>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-10 h-10 rounded-xl flex items-center justify-center
                          bg-gradient-to-br from-warning-100 to-warning-50 dark:from-warning-900/30 dark:to-warning-800/20
                          border border-warning-200/50 dark:border-warning-800/50
                          transition-all duration-300
                          ${focusedField === 'position' ? 'scale-105 shadow-lg shadow-warning-500/20' : ''}
                        `}>
                          <Briefcase size={20} className="text-warning-600 dark:text-warning-400" />
                        </div>
                        <FormLabel className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                          {t('form_labels.position')}
                        </FormLabel>
                      </div>

                      <div className="relative group">
                        <FormControl>
                          <ModernInput
                            placeholder={t('form_placeholders.position')}
                            variant="glass"
                            className={`
                              w-full px-6 py-4 text-lg rounded-2xl
                              border-2 bg-white/60 dark:bg-gray-700/60
                              backdrop-blur-sm
                              transition-all duration-300 ease-out
                              focus:ring-4 focus:ring-warning-500/20 focus:border-warning-400
                              hover:bg-white/90 dark:hover:bg-neutral-800/90
                              hover:shadow-lg hover:shadow-warning-500/10
                              ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : 'border-white/50 dark:border-gray-600/50'}
                              ${focusedField === 'position' ? 'scale-[1.02] shadow-xl' : ''}
                              ${validationStatus.isValid ? 'border-success-400' : ''}
                              ${validationStatus.isValidating ? 'border-warning-400' : ''}
                            `}
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => handleFieldChange('position', e.target.value)}
                            onFocus={() => setFocusedField('position')}
                            onBlur={() => handleFieldBlur('position')}
                          />
                        </FormControl>

                        {validationStatus.isValidating && (
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <Loader2 size={20} className="text-warning-500 animate-spin" />
                          </div>
                        )}

                        {validationStatus.isValid && !validationStatus.isValidating && (
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <CheckCircle size={20} className="text-success-500 animate-pulse" />
                          </div>
                        )}

                        {validationStatus.hasError && !validationStatus.isValidating && (
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <XCircle size={20} className="text-red-500" />
                          </div>
                        )}

                        {validationStatus.hasError && (
                          <p className="mt-3 text-sm text-red-500 dark:text-red-400 flex items-center gap-2 animate-slide-in">
                            <AlertCircle size={16} />
                            {validationStatus.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field, fieldState }) => {
                const validationStatus = getFieldValidationStatus('company');
                return (
                  <FormItem>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-10 h-10 rounded-xl flex items-center justify-center
                          bg-gradient-to-br from-success-100 to-success-50 dark:from-success-900/30 dark:to-success-800/20
                          border border-success-200/50 dark:border-success-800/50
                          transition-all duration-300
                          ${focusedField === 'company' ? 'scale-105 shadow-lg shadow-success-500/20' : ''}
                        `}>
                          <Building2 size={20} className="text-success-600 dark:text-success-400" />
                        </div>
                        <FormLabel className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                          {t('form_labels.company')}
                        </FormLabel>
                      </div>

                      <div className="relative group">
                        <FormControl>
                          <ModernInput
                            placeholder={t('form_placeholders.company')}
                            variant="glass"
                            className={`
                              w-full px-6 py-4 text-lg rounded-2xl
                              border-2 bg-white/60 dark:bg-gray-700/60
                              backdrop-blur-sm
                              transition-all duration-300 ease-out
                              focus:ring-4 focus:ring-success-500/20 focus:border-success-400
                              hover:bg-white/90 dark:hover:bg-neutral-800/90
                              hover:shadow-lg hover:shadow-success-500/10
                              ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : 'border-white/50 dark:border-gray-600/50'}
                              ${focusedField === 'company' ? 'scale-[1.02] shadow-xl' : ''}
                              ${validationStatus.isValid ? 'border-success-400' : ''}
                              ${validationStatus.isValidating ? 'border-warning-400' : ''}
                            `}
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => handleFieldChange('company', e.target.value)}
                            onFocus={() => setFocusedField('company')}
                            onBlur={() => handleFieldBlur('company')}
                          />
                        </FormControl>

                        {validationStatus.isValidating && (
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <Loader2 size={20} className="text-warning-500 animate-spin" />
                          </div>
                        )}

                        {validationStatus.isValid && !validationStatus.isValidating && (
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <CheckCircle size={20} className="text-success-500 animate-pulse" />
                          </div>
                        )}

                        {validationStatus.hasError && !validationStatus.isValidating && (
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <XCircle size={20} className="text-red-500" />
                          </div>
                        )}

                        {validationStatus.hasError && (
                          <p className="mt-3 text-sm text-red-500 dark:text-red-400 flex items-center gap-2 animate-slide-in">
                            <AlertCircle size={16} />
                            {validationStatus.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field, fieldState }) => {
                const validationStatus = getFieldValidationStatus('gender');
                return (
                  <FormItem>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-10 h-10 rounded-xl flex items-center justify-center
                          bg-gradient-to-br from-secondary-100/80 to-secondary-50/80 dark:from-secondary-900/30 dark:to-secondary-800/20
                          border border-secondary-200/50 dark:border-secondary-800/50
                          transition-all duration-300
                          ${focusedField === 'gender' ? 'scale-105 shadow-lg shadow-secondary-500/20' : ''}
                        `}>
                          <UserCheck size={20} className="text-secondary-600 dark:text-secondary-400" />
                        </div>
                        <FormLabel className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                          {t('form_labels.gender')}
                        </FormLabel>
                      </div>

                      <div className="relative group">
                        <FormControl>
                          <ModernSelect onValueChange={(value) => handleFieldChange('gender', value)} value={field.value}>
                            <ModernSelectTrigger
                              variant="glass"
                              className={`
                                w-full px-6 py-4 text-lg rounded-2xl
                                border-2 bg-white/60 dark:bg-gray-700/60
                                backdrop-blur-sm
                                transition-all duration-300 ease-out
                                focus:ring-4 focus:ring-secondary-500/20 focus:border-secondary-400
                                hover:bg-white/90 dark:hover:bg-neutral-800/90
                                hover:shadow-lg hover:shadow-secondary-500/10
                                ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : 'border-white/50 dark:border-gray-600/50'}
                                ${focusedField === 'gender' ? 'scale-[1.02] shadow-xl' : ''}
                                ${validationStatus.isValid ? 'border-success-400' : ''}
                                ${validationStatus.isValidating ? 'border-warning-400' : ''}
                              `}
                              onFocus={() => setFocusedField('gender')}
                              onBlur={() => handleFieldBlur('gender')}
                            >
                              <ModernSelectValue placeholder={t('form_placeholders.select_gender')} />
                            </ModernSelectTrigger>
                            <ModernSelectContent variant="glass" className="bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30 rounded-2xl">
                              {genderOptions.map(option => (
                                <ModernSelectItem key={option.value} value={option.value} className="hover:bg-white/20 dark:hover:bg-gray-700/50 px-4 py-3 rounded-lg">
                                  {option.label}
                                </ModernSelectItem>
                              ))}
                            </ModernSelectContent>
                          </ModernSelect>
                        </FormControl>

                        {validationStatus.hasError && (
                          <p className="mt-3 text-sm text-red-500 dark:text-red-400 flex items-center gap-2 animate-slide-in">
                            <AlertCircle size={16} />
                            {validationStatus.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="groupId"
              render={({ field, fieldState }) => {
                const validationStatus = getFieldValidationStatus('groupId');
                return (
                  <FormItem>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-10 h-10 rounded-xl flex items-center justify-center
                          bg-gradient-to-br from-success-100/80 to-success-50/80 dark:from-success-900/30 dark:to-success-800/20
                          border border-success-200/50 dark:border-success-800/50
                          transition-all duration-300
                          ${focusedField === 'groupId' ? 'scale-105 shadow-lg shadow-success-500/20' : ''}
                        `}>
                          <Users size={20} className="text-success-600 dark:text-success-400" />
                        </div>
                        <FormLabel className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                          {t('contact_form.group')}
                        </FormLabel>
                      </div>

                      <div className="relative group">
                        <FormControl>
                          <ModernSelect
                            onValueChange={handleGroupSelection}
                            value={field.value === null ? "no-group-selected" : field.value}
                          >
                            <ModernSelectTrigger
                              variant="glass"
                              className={`
                                w-full px-6 py-4 text-lg rounded-2xl
                                border-2 bg-white/60 dark:bg-gray-700/60
                                backdrop-blur-sm
                                transition-all duration-300 ease-out
                                focus:ring-4 focus:ring-success-500/20 focus:border-success-400
                                hover:bg-white/90 dark:hover:bg-neutral-800/90
                                hover:shadow-lg hover:shadow-success-500/10
                                ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : 'border-white/50 dark:border-gray-600/50'}
                                ${focusedField === 'groupId' ? 'scale-[1.02] shadow-xl' : ''}
                                ${validationStatus.isValid ? 'border-success-400' : ''}
                                ${validationStatus.isValidating ? 'border-warning-400' : ''}
                              `}
                              onFocus={() => setFocusedField('groupId')}
                              onBlur={() => handleFieldBlur('groupId')}
                            >
                              <ModernSelectValue placeholder={t('contact_form.select_group')} />
                            </ModernSelectTrigger>
                            <ModernSelectContent variant="glass" className="bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30 rounded-2xl">
                              <ModernSelectItem value="no-group-selected">{t('contact_form.no_group')}</ModernSelectItem>
                              {groups.map((group) => (
                                <ModernSelectItem key={group.id} value={group.id} className="hover:bg-white/20 dark:hover:bg-gray-700/50 px-4 py-3 rounded-lg">
                                  {group.name}
                                </ModernSelectItem>
                              ))}
                              <Separator className="my-1" />
                              <ModernSelectItem value="__ADD_NEW_GROUP__" className="text-primary-600 dark:text-primary-400 hover:bg-primary-100/50 dark:hover:bg-primary-900/30 px-4 py-3 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <PlusCircle size={16} />
                                  {t('contact_form.add_new_group')}
                                </div>
                              </ModernSelectItem>
                            </ModernSelectContent>
                          </ModernSelect>
                        </FormControl>

                        {validationStatus.isValid && !validationStatus.isValidating && (
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <CheckCircle size={20} className="text-success-500 animate-pulse" />
                          </div>
                        )}

                        {validationStatus.hasError && !validationStatus.isValidating && (
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <XCircle size={20} className="text-red-500" />
                          </div>
                        )}

                        {validationStatus.hasError && (
                          <p className="mt-3 text-sm text-red-500 dark:text-red-400 flex items-center gap-2 animate-slide-in">
                            <AlertCircle size={16} />
                            {validationStatus.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </FormItem>
                );
              }}
            />
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