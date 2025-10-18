import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from '@/components/ui/modern-select';
import { FormField, FormLabel, FormControl } from '@/components/ui/form';
import { ContactFormValues } from '@/types/contact';
import { useTranslation } from 'react-i18next';
import { useGroups } from '@/hooks/use-groups';
import { useGroupColorManagement } from '@/hooks/use-group-color-management';
import { User, User2, Briefcase, Building2, UserCheck, Users } from 'lucide-react';
import GroupForm from '@/components/groups/GroupForm';
import FormDialogWrapper from '@/components/common/FormDialogWrapper';
import { Dialog } from '@/components/ui/dialog';
import { GlassButton } from "@/components/ui/glass-button";
import FormCard from '@/components/ui/FormCard';

const ContactBasicInfo: React.FC = React.memo(() => {
  const { t, i18n } = useTranslation();
  const form = useFormContext<ContactFormValues>();
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

  // Use the custom hook for color management
  const {
    isLoading: isFetchingColors,
    error: fetchColorsError,
    fetchColorsWhenNeeded,
  } = useGroupColorManagement();

  // Memoize gender options to prevent unnecessary re-renders
  const genderOptions = useMemo(() => [
    { value: "male" as const, label: t('gender.male') },
    { value: "female" as const, label: t('gender.female') },
    { value: "not_specified" as const, label: t('gender.not_specified') },
  ], [t]);

  // Memoize group options for search select
  const groupOptions = useMemo(() => {
    // Ensure groups is an array before mapping
    const safeGroups = Array.isArray(groups) ? groups : [];

    const options: { value: string; label: string }[] = [
      { value: t('contact_form.values.no_group_selected'), label: t('contact_form.no_group') },
      ...safeGroups.map((group) => ({
        value: group.id,
        label: group.name,
      })),
      { value: t('contact_form.values.add_new_group'), label: t('contact_form.add_new_group') },
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
    if (value === t('contact_form.values.add_new_group')) {
      await fetchColorsWhenNeeded();
      setIsAddGroupDialogOpen(true);
    } else {
      form.setValue('groupId', value === t('contact_form.values.no_group_selected') ? null : value, { shouldDirty: true, shouldValidate: true });
    }
  }, [form, fetchColorsWhenNeeded, t]);

  // Specialized handler for gender field to ensure proper typing
  const handleGenderChange = useCallback((value: "male" | "female" | "not_specified") => {
    form.setValue('gender', value, { shouldDirty: true });
  }, [form]);

  // Specialized handlers for other fields to avoid typing issues
  const handleFirstNameChange = useCallback((value: string) => {
    form.setValue('firstName', value, { shouldDirty: true });
  }, [form]);

  const handleLastNameChange = useCallback((value: string) => {
    form.setValue('lastName', value, { shouldDirty: true });
  }, [form]);

  const handlePositionChange = useCallback((value: string) => {
    form.setValue('position', value, { shouldDirty: true });
  }, [form]);

  const handleCompanyChange = useCallback((value: string) => {
    form.setValue('company', value, { shouldDirty: true });
  }, [form]);

  // Handle field blur with validation

  return (
    <FormCard
      title={t('basic_info')}
      icon={User}
      iconColor="#3b82f6"
      className="space-y-6"
    >
      <div className="space-y-6">
        {/* All fields in one responsive grid - 2 for mobile, up to 6 for larger screens */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <FormLabel className="flex items-center gap-2">
                  <User size={16} />
                  {t('form_labels.first_name')}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <ModernInput
                    placeholder={t('form_placeholders.enter_name')}
                    variant="glass"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => handleFirstNameChange(e.target.value)}
                  />
                </FormControl>
                {fieldState.error && (
                  <p className="text-sm text-red-600">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <FormLabel className="flex items-center gap-2">
                  <User2 size={16} />
                  {t('form_labels.last_name')}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <ModernInput
                    placeholder={t('form_placeholders.enter_last_name')}
                    variant="glass"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => handleLastNameChange(e.target.value)}
                  />
                </FormControl>
                {fieldState.error && (
                  <p className="text-sm text-red-600">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />

          <FormField
            control={form.control}
            name="position"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <FormLabel className="flex items-center gap-2">
                  <Briefcase size={16} />
                  {t('form_labels.position')}
                </FormLabel>
                <FormControl>
                  <ModernInput
                    placeholder={t('form_placeholders.position_example')}
                    variant="glass"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => handlePositionChange(e.target.value)}
                  />
                </FormControl>
                {fieldState.error && (
                  <p className="text-sm text-red-600">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <FormLabel className="flex items-center gap-2">
                  <Building2 size={16} />
                  {t('form_labels.company')}
                </FormLabel>
                <FormControl>
                  <ModernInput
                    placeholder={t('form_placeholders.company_example')}
                    variant="glass"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => handleCompanyChange(e.target.value)}
                  />
                </FormControl>
                {fieldState.error && (
                  <p className="text-sm text-red-600">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <FormLabel className="flex items-center gap-2">
                  <UserCheck size={16} />
                  {t('form_labels.gender')}
                </FormLabel>
                <FormControl>
                  <ModernSelect
                    value={field.value}
                    onValueChange={handleGenderChange}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    <ModernSelectTrigger variant="glass">
                      <ModernSelectValue placeholder={t('form_placeholders.select_gender')} />
                    </ModernSelectTrigger>
                    <ModernSelectContent variant="glass">
                      {genderOptions.map(option => (
                        <ModernSelectItem key={option.value} value={option.value}>
                          {option.label}
                        </ModernSelectItem>
                      ))}
                    </ModernSelectContent>
                  </ModernSelect>
                </FormControl>
                {fieldState.error && (
                  <p className="text-sm text-red-600">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />

          <FormField
            control={form.control}
            name="groupId"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <FormLabel className="flex items-center gap-2">
                  <Users size={16} />
                  {t('form_labels.group')}
                </FormLabel>
                <FormControl>
                  <ModernSelect
                    value={field.value === null ? t('contact_form.values.no_group_selected') : field.value}
                    onValueChange={handleGroupSelection}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    <ModernSelectTrigger variant="glass">
                      <ModernSelectValue placeholder={t('form_placeholders.select_group')} />
                    </ModernSelectTrigger>
                    <ModernSelectContent variant="glass">
                      {groupOptions.map(option => (
                        <ModernSelectItem key={option.value} value={option.value}>
                          {option.label}
                        </ModernSelectItem>
                      ))}
                    </ModernSelectContent>
                  </ModernSelect>
                </FormControl>
                {fieldState.error && (
                  <p className="text-sm text-red-600">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />
        </div>
      </div>

      {/* Dialog for adding new group */}
      <Dialog open={isAddGroupDialogOpen} onOpenChange={setIsAddGroupDialogOpen}>
        <FormDialogWrapper
          title={t('contact_form.add_group_title')}
          description={t('contact_form.add_group_description')}
        >
          {isFetchingColors ? (
            <div className="flex items-center justify-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="mr-3">{t('contact_form.preparing_group_form')}</span>
            </div>
          ) : fetchColorsError ? (
            <div className="text-center text-red-500 p-6">
              <p>{fetchColorsError.message}</p>
              <GlassButton onClick={() => setIsAddGroupDialogOpen(false)} className="mt-4">
                {t('common.close')}
              </GlassButton>
            </div>
          ) : (
            <GroupForm
              onSuccess={handleGroupAdded}
              onCancel={() => setIsAddGroupDialogOpen(false)}
            />
          )}
        </FormDialogWrapper>
      </Dialog>
    </FormCard>
  );
});

ContactBasicInfo.displayName = 'ContactBasicInfo';

export default ContactBasicInfo;
