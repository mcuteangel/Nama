import React, { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useGroups } from '@/hooks/use-groups';
import { useGroupColorManagement } from '@/hooks/use-group-color-management';
import { ContactFormValues } from '@/types/contact';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Building2, UserCheck, AlertCircle } from 'lucide-react';
import GroupForm from '@/components/groups/GroupForm';
import FormDialogWrapper from '@/components/common/FormDialogWrapper';
import { Dialog } from '@/components/ui/dialog';
import LoadingMessage from '@/components/common/LoadingMessage';
import { GlassButton } from "@/components/ui/glass-button";
import { ModernCard, ModernCardContent } from '@/components/ui/modern-card';

const ContactProfessionalInfo: React.FC = React.memo(() => {
  const form = useFormContext<ContactFormValues>();
  const { t } = useTranslation();
  const { groups, fetchGroups } = useGroups();

  // Use the custom hook for color management
  const {
    memoizedInitialColor,
    isLoading: isFetchingColors,
    error: fetchColorsError,
    fetchColorsWhenNeeded,
  } = useGroupColorManagement();

  const handleGroupAdded = useCallback(async (newGroupId?: string) => {
    await fetchGroups();
    if (newGroupId) {
      form.setValue('groupId', newGroupId, { shouldDirty: true, shouldValidate: true });
    }
  }, [fetchGroups, form]);

  const handleGroupSelection = useCallback(async (value: string) => {
    if (value === "__ADD_NEW_GROUP__") {
      await fetchColorsWhenNeeded();
    } else {
      form.setValue('groupId', value === "no-group-selected" ? null : value);
    }
  }, [form, fetchColorsWhenNeeded]);

  return (
    <>
      {/* Professional Information Section */}
      <div className="space-y-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/30 dark:border-emerald-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <Building2 size={20} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {t('section_titles.professional_info')}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-xl glass">
          <div className="group/field p-4 rounded-2xl bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-900/30 border-2 border-white/40 dark:border-gray-700/40 backdrop-blur-sm hover:border-emerald-300/50 dark:hover:border-emerald-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
            <FormField
              control={form.control}
              name="groupId"
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-200/50 dark:border-emerald-800/50 flex items-center justify-center transition-all duration-300">
                        <Building2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {t('contact_form.group')}
                      </FormLabel>
                    </div>

                    <div className="relative">
                      <FormControl>
                        <ModernSelect
                          onValueChange={handleGroupSelection}
                          value={field.value === null ? "no-group-selected" : field.value}
                        >
                          <ModernSelectTrigger
                            variant="glass"
                            className={`
                              w-full px-4 py-3 text-sm rounded-xl
                              border-2 bg-white/50 dark:bg-gray-700/50
                              backdrop-blur-sm
                              transition-all duration-300 ease-out
                              focus:ring-3 focus:ring-emerald-500/30 focus:border-emerald-400
                              hover:bg-white/70 dark:hover:bg-gray-600/70
                              hover:shadow-md hover:shadow-emerald-500/20
                              ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : 'border-white/40 dark:border-gray-600/40'}
                              ${field.value && !fieldState.error ? 'border-green-400' : ''}
                            `}
                          >
                            <ModernSelectValue placeholder={t('contact_form.select_group')} />
                          </ModernSelectTrigger>
                          <ModernSelectContent variant="glass" className="bg-white/90 dark:bg-gray-800/90 border border-white/30 dark:border-gray-600/30 rounded-xl mt-1">
                            <ModernSelectItem value="no-group-selected">{t('contact_form.no_group')}</ModernSelectItem>
                            {groups.map((group) => (
                              <ModernSelectItem key={group.id} value={group.id} className="hover:bg-white/30 dark:hover:bg-gray-700/40 px-3 py-2 rounded-lg">
                                {group.name}
                              </ModernSelectItem>
                            ))}
                            <Separator className="my-1" />
                            <ModernSelectItem value="__ADD_NEW_GROUP__" className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-2 rounded-lg">
                              <div className="flex items-center gap-2">
                                <PlusCircle size={16} />
                                {t('contact_form.add_new_group')}
                              </div>
                            </ModernSelectItem>
                          </ModernSelectContent>
                        </ModernSelect>
                      </FormControl>

                      {field.value && !fieldState.error && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <UserCheck size={16} className="text-green-500 animate-pulse" />
                        </div>
                      )}

                      {fieldState.error && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <AlertCircle size={16} className="text-red-500" />
                        </div>
                      )}
                    </div>

                    {fieldState.error && (
                      <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1 mt-1">
                        <AlertCircle size={12} />
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="group/field p-4 rounded-2xl bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-900/30 border-2 border-white/40 dark:border-gray-700/40 backdrop-blur-sm hover:border-emerald-300/50 dark:hover:border-emerald-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
            <FormField
              control={form.control}
              name="company"
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-200/50 dark:border-emerald-800/50 flex items-center justify-center transition-all duration-300">
                        <Building2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {t('contact_form.company')}
                      </FormLabel>
                    </div>

                    <div className="relative">
                      <FormControl>
                        <ModernInput
                          placeholder={t('contact_form.company_placeholder')}
                          variant="glass"
                          className={`
                            w-full px-4 py-3 text-sm rounded-xl
                            border-2 bg-white/50 dark:bg-gray-700/50
                            backdrop-blur-sm
                            transition-all duration-300 ease-out
                            focus:ring-3 focus:ring-emerald-500/30 focus:border-emerald-400
                            hover:bg-white/70 dark:hover:bg-gray-600/70
                            hover:shadow-md hover:shadow-emerald-500/20
                            ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : 'border-white/40 dark:border-gray-600/40'}
                            ${field.value && !fieldState.error ? 'border-green-400' : ''}
                          `}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>

                      {field.value && !fieldState.error && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <UserCheck size={16} className="text-green-500 animate-pulse" />
                        </div>
                      )}

                      {fieldState.error && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <AlertCircle size={16} className="text-red-500" />
                        </div>
                      )}
                    </div>

                    {fieldState.error && (
                      <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1 mt-1">
                        <AlertCircle size={12} />
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="group/field p-4 rounded-2xl bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-900/30 border-2 border-white/40 dark:border-gray-700/40 backdrop-blur-sm hover:border-emerald-300/50 dark:hover:border-emerald-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
            <FormField
              control={form.control}
              name="position"
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-200/50 dark:border-emerald-800/50 flex items-center justify-center transition-all duration-300">
                        <Building2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {t('contact_form.position')}
                      </FormLabel>
                    </div>

                    <div className="relative">
                      <FormControl>
                        <ModernInput
                          placeholder={t('contact_form.position_placeholder')}
                          variant="glass"
                          className={`
                            w-full px-4 py-3 text-sm rounded-xl
                            border-2 bg-white/50 dark:bg-gray-700/50
                            backdrop-blur-sm
                            transition-all duration-300 ease-out
                            focus:ring-3 focus:ring-emerald-500/30 focus:border-emerald-400
                            hover:bg-white/70 dark:hover:bg-gray-600/70
                            hover:shadow-md hover:shadow-emerald-500/20
                            ${fieldState.error ? 'border-red-400 focus:ring-red-500/30' : 'border-white/40 dark:border-gray-600/40'}
                            ${field.value && !fieldState.error ? 'border-green-400' : ''}
                          `}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>

                      {field.value && !fieldState.error && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <UserCheck size={16} className="text-green-500 animate-pulse" />
                        </div>
                      )}

                      {fieldState.error && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <AlertCircle size={16} className="text-red-500" />
                        </div>
                      )}
                    </div>

                    {fieldState.error && (
                      <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1 mt-1">
                        <AlertCircle size={12} />
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Clean Dialog Implementation */}
        <Dialog open={form.watch('groupId') === "__ADD_NEW_GROUP__"} onOpenChange={(open) => {
          if (!open) form.setValue('groupId', null);
        }}>
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
                <GlassButton onClick={() => form.setValue('groupId', null)} className="mt-4">{t('common.close')}</GlassButton>
              </ModernCard>
            ) : (
              <GroupForm
                onSuccess={handleGroupAdded}
                onCancel={() => form.setValue('groupId', null)}
              />
            )}
          </FormDialogWrapper>
        </Dialog>
      </div>
    </>
  );
});

ContactProfessionalInfo.displayName = 'ContactProfessionalInfo';

export default ContactProfessionalInfo;