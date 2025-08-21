import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import AddGroupDialog from '@/components/AddGroupDialog';
import { useGroups } from '@/hooks/use-groups';
import { ContactFormValues } from '@/types/contact';
import { Separator } from '@/components/ui/separator';
import { PlusCircle } from 'lucide-react';

const ContactOtherDetails: React.FC = () => {
  const form = useFormContext<ContactFormValues>();
  const { groups, fetchGroups } = useGroups();
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex items-end gap-2">
          <FormField
            control={form.control}
            name="groupId"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormLabel className="text-gray-700 dark:text-gray-200">گروه</FormLabel>
                <Select
                  onValueChange={(value) => {
                    if (value === "__ADD_NEW_GROUP__") {
                      setIsAddGroupDialogOpen(true);
                    } else {
                      field.onChange(value === "no-group-selected" ? "" : value);
                    }
                  }}
                  value={field.value === "" ? "no-group-selected" : field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100">
                      <SelectValue placeholder="انتخاب گروه" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                    <SelectItem value="no-group-selected">بدون گروه</SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                    <Separator className="my-1" />
                    <SelectItem value="__ADD_NEW_GROUP__" className="text-blue-600 dark:text-blue-400">
                      <div className="flex items-center gap-2">
                        <PlusCircle size={16} />
                        افزودن گروه جدید
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <AddGroupDialog
            open={isAddGroupDialogOpen}
            onOpenChange={setIsAddGroupDialogOpen}
            onGroupAdded={fetchGroups}
          />
        </div>
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-200">شرکت</FormLabel>
              <FormControl>
                <Input placeholder="مثال: شرکت X" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} />
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
              <FormLabel className="text-gray-700 dark:text-gray-200">سمت/شغل</FormLabel>
              <FormControl>
                <Input placeholder="مثال: مهندس نرم‌افزار" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel className="text-gray-700 dark:text-gray-200">آدرس</FormLabel>
              <FormControl>
                <Textarea placeholder="آدرس کامل" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel className="text-gray-700 dark:text-gray-200">یادداشت‌ها</FormLabel>
              <FormControl>
                <Textarea placeholder="یادداشت‌های اضافی" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default ContactOtherDetails;