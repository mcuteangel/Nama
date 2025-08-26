import React, { useState, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useGroups } from '@/hooks/use-groups';
import { useGroupColorManagement } from '@/hooks/use-group-color-management';
import { ContactFormValues } from '@/types/contact';
import { Separator } from '@/components/ui/separator';
import { PlusCircle } from 'lucide-react';
import GroupForm from '@/components/groups/GroupForm';
import FormDialogWrapper from '@/components/common/FormDialogWrapper';
import { Dialog } from '@/components/ui/dialog';
import LoadingMessage from '@/components/common/LoadingMessage';
import { Button } from '@/components/ui/button';

const ContactOtherDetails: React.FC = React.memo(() => {
  const form = useFormContext<ContactFormValues>();
  const { t } = useTranslation();
  const { groups, fetchGroups } = useGroups();
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <FormField
            control={form.control}
            name="groupId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-200">{t('contact_form.group')}</FormLabel>
                <Select
                  onValueChange={handleGroupSelection}
                  value={field.value === null ? "no-group-selected" : field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100">
                      <SelectValue placeholder={t('contact_form.select_group')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                    <SelectItem value="no-group-selected">{t('contact_form.no_group')}</SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                    <Separator className="my-1" />
                    <SelectItem value="__ADD_NEW_GROUP__" className="text-blue-600 dark:text-blue-400">
                      <div className="flex items-center gap-2">
                        <PlusCircle size={16} />
                        {t('contact_form.add_new_group')}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Clean Dialog Implementation */}
          <Dialog open={isAddGroupDialogOpen} onOpenChange={setIsAddGroupDialogOpen}>
            <FormDialogWrapper>
              {isFetchingColors ? (
                <div className="w-full max-w-md glass rounded-xl p-6 bg-white/90 dark:bg-gray-900/90">
                  <LoadingMessage message={t('contact_form.preparing_group_form')} />
                </div>
              ) : fetchColorsError ? (
                <div className="w-full max-w-md glass rounded-xl p-6 bg-white/90 dark:bg-gray-900/90 text-center text-red-500 dark:text-red-400">
                  <p>{fetchColorsError.message}</p>
                  <Button onClick={() => setIsAddGroupDialogOpen(false)} className="mt-4">{t('common.close')}</Button>
                </div>
              ) : (
                <GroupForm
                  onSuccess={handleGroupAdded}
                  onCancel={() => setIsAddGroupDialogOpen(false)}
                  initialData={{ name: '', color: memoizedInitialColor }}
                />
              )}
            </FormDialogWrapper>
          </Dialog>
        </div>
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-200">{t('contact_form.company')}</FormLabel>
              <FormControl>
                <Input placeholder={t('contact_form.company_placeholder')} className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-200">{t('contact_form.position')}</FormLabel>
              <FormControl>
                <Input placeholder={t('contact_form.position_placeholder')} className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Detailed Address Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="col-span-full text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{t('contact_form.address')}</h3>
        <FormField
          control={form.control}
          name="street"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-200">{t('contact_form.street')}</FormLabel>
              <FormControl>
                <Input placeholder={t('contact_form.street_placeholder')} className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-200">{t('contact_form.city')}</FormLabel>
              <FormControl>
                <Input placeholder={t('contact_form.city_placeholder')} className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-200">{t('contact_form.state')}</FormLabel>
              <FormControl>
                <Input placeholder={t('contact_form.state_placeholder')} className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="zipCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-200">{t('contact_form.zip_code')}</FormLabel>
              <FormControl>
                <Input placeholder={t('contact_form.zip_code_placeholder')} className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-200">{t('contact_form.country')}</FormLabel>
              <FormControl>
                <Input placeholder={t('contact_form.country_placeholder')} className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Preferred Communication Method */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <FormField
          control={form.control}
          name="preferredContactMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-200">{t('contact_form.preferred_contact_method')}</FormLabel>
              <Select onValueChange={(value) => field.onChange(value === "" ? null : value)} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger className="w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100">
                    <SelectValue placeholder={t('contact_form.select_contact_method')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                  <SelectItem value="any">{t('contact_form.any_method')}</SelectItem>
                  <SelectItem value="email">{t('contact_form.email')}</SelectItem>
                  <SelectItem value="phone">{t('contact_form.phone')}</SelectItem>
                  <SelectItem value="sms">{t('contact_form.sms')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel className="text-gray-700 dark:text-gray-200">{t('contact_form.notes')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('contact_form.notes_placeholder')} className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
});

ContactOtherDetails.displayName = 'ContactOtherDetails';

export default ContactOtherDetails;