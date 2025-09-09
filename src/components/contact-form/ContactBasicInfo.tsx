import React, { useMemo, useState, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { ContactFormValues } from '@/types/contact';
import { useTranslation } from 'react-i18next';
import { useGroups } from '@/hooks/use-groups';
import { useGroupColorManagement } from '@/hooks/use-group-color-management';
import { User, User2, UserCheck, Users, AlertCircle, Briefcase, Building2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { PlusCircle } from 'lucide-react';
import GroupForm from '@/components/groups/GroupForm';
import FormDialogWrapper from '@/components/common/FormDialogWrapper';
import { Dialog } from '@/components/ui/dialog';
import LoadingMessage from '@/components/common/LoadingMessage';
import { GlassButton } from "@/components/ui/glass-button";
import { ModernCard } from '@/components/ui/modern-card';

const ContactBasicInfo: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const form = useFormContext<ContactFormValues>();
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { groups, fetchGroups } = useGroups();
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);

  // Use the custom hook for color management
  const {
    memoizedInitialColor,
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

  return (
    <>
      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-white/40 to-white/20 dark:from-gray-700/40 dark:to-gray-800/20 border-2 border-white/30 dark:border-gray-600/30 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center
                        bg-gradient-to-br from-blue-500/20 to-indigo-600/20
                        border border-blue-200/50 dark:border-blue-800/50
                        transition-all duration-300
                        ${focusedField === 'firstName' ? 'scale-110 shadow-lg shadow-blue-500/30' : ''}
                      `}>
                        <User size={20} className="text-blue-600 dark:text-blue-400" />
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
                            border-2 bg-white/60 dark:bg-gray-700/60
                            backdrop-blur-sm
                            transition-all duration-300 ease-out
                            focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400
                            hover:bg-white/80 dark:hover:bg-gray-600/80
                            hover:shadow-lg hover:shadow-blue-500/20
                            ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : 'border-white/50 dark:border-gray-600/50'}
                            ${focusedField === 'firstName' ? 'scale-[1.02] shadow-xl' : ''}
                            ${field.value && !fieldState.error ? 'border-green-400' : ''}
                          `}
                          {...field}
                          onFocus={() => setFocusedField('firstName')}
                          onBlur={() => setFocusedField(null)}
                        />
                      </FormControl>

                      {field.value && !fieldState.error && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <UserCheck size={20} className="text-green-500 animate-pulse" />
                        </div>
                      )}

                      {fieldState.error && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <AlertCircle size={20} className="text-red-500" />
                        </div>
                      )}

                      {fieldState.error && (
                        <p className="mt-3 text-sm text-red-500 dark:text-red-400 flex items-center gap-2 animate-slide-in">
                          <AlertCircle size={16} />
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center
                        bg-gradient-to-br from-purple-500/20 to-pink-600/20
                        border border-purple-200/50 dark:border-purple-800/50
                        transition-all duration-300
                        ${focusedField === 'lastName' ? 'scale-110 shadow-lg shadow-purple-500/30' : ''}
                      `}>
                        <User2 size={20} className="text-purple-600 dark:text-purple-400" />
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
                            focus:ring-4 focus:ring-purple-500/30 focus:border-purple-400
                            hover:bg-white/80 dark:hover:bg-gray-600/80
                            hover:shadow-lg hover:shadow-purple-500/20
                            ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : 'border-white/50 dark:border-gray-600/50'}
                            ${focusedField === 'lastName' ? 'scale-[1.02] shadow-xl' : ''}
                            ${field.value && !fieldState.error ? 'border-green-400' : ''}
                          `}
                          {...field}
                          onFocus={() => setFocusedField('lastName')}
                          onBlur={() => setFocusedField(null)}
                        />
                      </FormControl>

                      {field.value && !fieldState.error && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <UserCheck size={20} className="text-green-500 animate-pulse" />
                        </div>
                      )}

                      {fieldState.error && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <AlertCircle size={20} className="text-red-500" />
                        </div>
                      )}

                      {fieldState.error && (
                        <p className="mt-3 text-sm text-red-500 dark:text-red-400 flex items-center gap-2 animate-slide-in">
                          <AlertCircle size={16} />
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center
                        bg-gradient-to-br from-orange-500/20 to-amber-600/20
                        border border-orange-200/50 dark:border-orange-800/50
                        transition-all duration-300
                        ${focusedField === 'position' ? 'scale-110 shadow-lg shadow-orange-500/30' : ''}
                      `}>
                        <Briefcase size={20} className="text-orange-600 dark:text-orange-400" />
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
                            focus:ring-4 focus:ring-orange-500/30 focus:border-orange-400
                            hover:bg-white/80 dark:hover:bg-gray-600/80
                            hover:shadow-lg hover:shadow-orange-500/20
                            ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : 'border-white/50 dark:border-gray-600/50'}
                            ${focusedField === 'position' ? 'scale-[1.02] shadow-xl' : ''}
                            ${field.value && !fieldState.error ? 'border-green-400' : ''}
                          `}
                          {...field}
                          value={field.value || ''}
                          onFocus={() => setFocusedField('position')}
                          onBlur={() => setFocusedField(null)}
                        />
                      </FormControl>

                      {field.value && !fieldState.error && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <UserCheck size={20} className="text-green-500 animate-pulse" />
                        </div>
                      )}

                      {fieldState.error && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <AlertCircle size={20} className="text-red-500" />
                        </div>
                      )}

                      {fieldState.error && (
                        <p className="mt-3 text-sm text-red-500 dark:text-red-400 flex items-center gap-2 animate-slide-in">
                          <AlertCircle size={16} />
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center
                        bg-gradient-to-br from-teal-500/20 to-cyan-600/20
                        border border-teal-200/50 dark:border-teal-800/50
                        transition-all duration-300
                        ${focusedField === 'company' ? 'scale-110 shadow-lg shadow-teal-500/30' : ''}
                      `}>
                        <Building2 size={20} className="text-teal-600 dark:text-teal-400" />
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
                            focus:ring-4 focus:ring-teal-500/30 focus:border-teal-400
                            hover:bg-white/80 dark:hover:bg-gray-600/80
                            hover:shadow-lg hover:shadow-teal-500/20
                            ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : 'border-white/50 dark:border-gray-600/50'}
                            ${focusedField === 'company' ? 'scale-[1.02] shadow-xl' : ''}
                            ${field.value && !fieldState.error ? 'border-green-400' : ''}
                          `}
                          {...field}
                          value={field.value || ''}
                          onFocus={() => setFocusedField('company')}
                          onBlur={() => setFocusedField(null)}
                        />
                      </FormControl>

                      {field.value && !fieldState.error && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <UserCheck size={20} className="text-green-500 animate-pulse" />
                        </div>
                      )}

                      {fieldState.error && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <AlertCircle size={20} className="text-red-500" />
                        </div>
                      )}

                      {fieldState.error && (
                        <p className="mt-3 text-sm text-red-500 dark:text-red-400 flex items-center gap-2 animate-slide-in">
                          <AlertCircle size={16} />
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center
                        bg-gradient-to-br from-indigo-500/20 to-purple-600/20
                        border border-indigo-200/50 dark:border-indigo-800/50
                        transition-all duration-300
                        ${focusedField === 'gender' ? 'scale-110 shadow-lg shadow-indigo-500/30' : ''}
                      `}>
                        <UserCheck size={20} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <FormLabel className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                        {t('form_labels.gender')}
                      </FormLabel>
                    </div>

                    <div className="relative group">
                      <FormControl>
                        <ModernSelect onValueChange={field.onChange} value={field.value}>
                          <ModernSelectTrigger
                            variant="glass"
                            className={`
                              w-full px-6 py-4 text-lg rounded-2xl
                              border-2 bg-white/60 dark:bg-gray-700/60
                              backdrop-blur-sm
                              transition-all duration-300 ease-out
                              focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-400
                              hover:bg-white/80 dark:hover:bg-gray-600/80
                              hover:shadow-lg hover:shadow-indigo-500/20
                              ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : 'border-white/50 dark:border-gray-600/50'}
                              ${focusedField === 'gender' ? 'scale-[1.02] shadow-xl' : ''}
                              ${field.value && !fieldState.error ? 'border-green-400' : ''}
                            `}
                            onFocus={() => setFocusedField('gender')}
                            onBlur={() => setFocusedField(null)}
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

                      {fieldState.error && (
                        <p className="mt-3 text-sm text-red-500 dark:text-red-400 flex items-center gap-2 animate-slide-in">
                          <AlertCircle size={16} />
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="groupId"
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center
                        bg-gradient-to-br from-green-500/20 to-emerald-600/20
                        border border-green-200/50 dark:border-green-800/50
                        transition-all duration-300
                        ${focusedField === 'groupId' ? 'scale-110 shadow-lg shadow-green-500/30' : ''}
                      `}>
                        <Users size={20} className="text-green-600 dark:text-green-400" />
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
                              focus:ring-4 focus:ring-green-500/30 focus:border-green-400
                              hover:bg-white/80 dark:hover:bg-gray-600/80
                              hover:shadow-lg hover:shadow-green-500/20
                              ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : 'border-white/50 dark:border-gray-600/50'}
                              ${focusedField === 'groupId' ? 'scale-[1.02] shadow-xl' : ''}
                              ${field.value && !fieldState.error ? 'border-green-400' : ''}
                            `}
                            onFocus={() => setFocusedField('groupId')}
                            onBlur={() => setFocusedField(null)}
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
                            <ModernSelectItem value="__ADD_NEW_GROUP__" className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-4 py-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                <PlusCircle size={16} />
                                {t('contact_form.add_new_group')}
                              </div>
                            </ModernSelectItem>
                          </ModernSelectContent>
                        </ModernSelect>
                      </FormControl>

                      {field.value && !fieldState.error && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <UserCheck size={20} className="text-green-500 animate-pulse" />
                        </div>
                      )}

                      {fieldState.error && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <AlertCircle size={20} className="text-red-500" />
                        </div>
                      )}

                      {fieldState.error && (
                        <p className="mt-3 text-sm text-red-500 dark:text-red-400 flex items-center gap-2 animate-slide-in">
                          <AlertCircle size={16} />
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  </div>
                </FormItem>
              )}
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