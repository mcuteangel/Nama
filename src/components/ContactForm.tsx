import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "@/integrations/supabase/auth";
import AddGroupDialog from "./AddGroupDialog";
import { useGroups } from "@/hooks/use-groups";
import { useContactFormLogic } from "@/hooks/use-contact-form-logic";
import { ContactService } from "@/services/contact-service";
import { CustomFieldTemplate } from "@/domain/schemas/custom-field-template";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns-jalali";
import { JalaliCalendar } from "@/components/JalaliCalendar";
import { cn } from "@/lib/utils";
import AddCustomFieldTemplateDialog from "./AddCustomFieldTemplateDialog";

// Define the schema for the form using Zod
const formSchema = z.object({
  firstName: z.string().min(1, { message: "نام الزامی است." }),
  lastName: z.string().min(1, { message: "نام خانوادگی الزامی است." }),
  phoneNumber: z.string().regex(/^09\d{9}$/, { message: "شماره تلفن معتبر نیست (مثال: 09123456789)." }).optional().or(z.literal('')),
  emailAddress: z.string().email({ message: "آدرس ایمیل معتبر نیست." }).optional().or(z.literal('')),
  gender: z.enum(["male", "female", "not_specified"], { message: "جنسیت معتبر نیست." }).default("not_specified"),
  position: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  groupId: z.string().optional(),
  customFields: z.array(z.object({
    template_id: z.string().min(1, { message: "شناسه قالب فیلد سفارشی الزامی است." }),
    value: z.string().min(1, { message: "مقدار فیلد سفارشی نمی‌تواند خالی باشد." }),
  })).optional(),
});

interface ContactFormProps {
  initialData?: {
    id: string;
    first_name: string;
    last_name: string;
    gender: "male" | "female" | "not_specified";
    position?: string;
    company?: string;
    address?: string;
    notes?: string;
    phoneNumber?: string;
    emailAddress?: string;
    groupId?: string;
    custom_fields?: { id: string; template_id: string; field_value: string; custom_field_templates: { name: string; type: string; options?: string[] } }[];
  };
  contactId?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ initialData, contactId }) => {
  const navigate = useNavigate();
  const { session } = useSession();
  const { groups, fetchGroups } = useGroups();
  const [availableTemplates, setAvailableTemplates] = useState<CustomFieldTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: initialData?.first_name || "",
      lastName: initialData?.last_name || "",
      phoneNumber: initialData?.phoneNumber || "",
      emailAddress: initialData?.emailAddress || "",
      gender: initialData?.gender || "not_specified",
      position: initialData?.position || "",
      company: initialData?.company || "",
      address: initialData?.address || "",
      notes: initialData?.notes || "",
      groupId: initialData?.groupId || "",
      customFields: initialData?.custom_fields?.map(cf => ({
        template_id: cf.template_id,
        value: cf.field_value,
      })) || [],
    },
  });

  const { onSubmit } = useContactFormLogic(contactId, navigate, session, form, availableTemplates);

  const fetchTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    const { data, error } = await ContactService.getAllCustomFieldTemplates();
    if (error) {
      console.error("Error fetching custom field templates:", error);
      setAvailableTemplates([]);
    } else {
      setAvailableTemplates(data || []);
    }
    setLoadingTemplates(false);
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    if (initialData) {
      form.reset({
        firstName: initialData.first_name,
        lastName: initialData.last_name,
        phoneNumber: initialData.phoneNumber,
        emailAddress: initialData.emailAddress,
        gender: initialData.gender,
        position: initialData.position,
        company: initialData.company,
        address: initialData.address,
        notes: initialData.notes,
        groupId: initialData.groupId || "",
        customFields: initialData.custom_fields?.map(cf => ({
          template_id: cf.template_id,
          value: cf.field_value,
        })) || [],
      });
    }
  }, [initialData, form]);

  // New useEffect to manage customFields array based on availableTemplates and initialData
  useEffect(() => {
    if (loadingTemplates) return; // Wait for templates to load

    const newCustomFieldsFormState: { template_id: string; value: string }[] = [];
    const initialCustomFieldValuesMap = new Map<string, string>();

    // Populate map with initial data's custom field values
    initialData?.custom_fields?.forEach(cf => {
      initialCustomFieldValuesMap.set(cf.template_id, cf.field_value);
    });

    // For each available template, create a form field entry
    availableTemplates.forEach(template => {
      const existingValue = initialCustomFieldValuesMap.get(template.id!);
      newCustomFieldsFormState.push({
        template_id: template.id!,
        value: existingValue !== undefined ? existingValue : "", // Use existing value or empty string
      });
    });

    // Sort to ensure consistent order, which helps React Hook Form's internal diffing
    newCustomFieldsFormState.sort((a, b) => {
      const templateA = availableTemplates.find(t => t.id === a.template_id)?.name || '';
      const templateB = availableTemplates.find(t => t.id === b.template_id)?.name || '';
      return templateA.localeCompare(templateB);
    });

    // Only update if the new state is different from the current form state
    const currentFormValues = form.getValues("customFields");
    const isDifferent = currentFormValues.length !== newCustomFieldsFormState.length ||
                        currentFormValues.some((field, index) =>
                          field.template_id !== newCustomFieldsFormState[index].template_id ||
                          field.value !== newCustomFieldsFormState[index].value
                        );

    if (isDifferent) {
      form.setValue("customFields", newCustomFieldsFormState, { shouldValidate: true, shouldDirty: true });
    }

  }, [availableTemplates, initialData, loadingTemplates, form]);

  const handleCancel = () => {
    navigate(-1);
  };

  const customFieldsWatch = form.watch("customFields");

  return (
    <CardContent className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-200">نام<span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="نام" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-200">نام خانوادگی<span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="نام خانوادگی" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-200">جنسیت</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100">
                        <SelectValue placeholder="انتخاب جنسیت" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                      <SelectItem value="male">مرد</SelectItem>
                      <SelectItem value="female">زن</SelectItem>
                      <SelectItem value="not_specified">نامشخص</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-200">شماره تلفن اصلی</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: 09123456789" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emailAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-200">آدرس ایمیل</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="مثال: example@domain.com" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-end gap-2">
              <FormField
                control={form.control}
                name="groupId"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel className="text-gray-700 dark:text-gray-200">گروه</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "no-group-selected" ? "" : value)}
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
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <AddGroupDialog onGroupAdded={fetchGroups} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

          {/* Dynamic Custom Fields Section */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">فیلدهای سفارشی</h3>
              <AddCustomFieldTemplateDialog onTemplateAdded={fetchTemplates} />
            </div>
            {loadingTemplates ? (
              <p className="text-center text-gray-500 dark:text-gray-400">در حال بارگذاری قالب‌های فیلد سفارشی...</p>
            ) : availableTemplates.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400">هیچ قالب فیلد سفارشی تعریف نشده است.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableTemplates.map((template, index) => {
                  const fieldName = `customFields.${index}.value` as const;
                  // The value for the field is now managed by the top-level useEffect
                  // and accessed directly via form.watch or form.getValues
                  
                  return (
                    <FormField
                      key={template.id}
                      control={form.control}
                      name={fieldName}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-200">
                            {template.name}
                            {template.required && <span className="text-red-500">*</span>}
                          </FormLabel>
                          <FormControl>
                            {template.type === 'text' && (
                              <Input
                                placeholder={template.description || `مقدار ${template.name}`}
                                className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                {...field}
                                value={field.value || ''}
                              />
                            )}
                            {template.type === 'number' && (
                              <Input
                                type="number"
                                placeholder={template.description || `مقدار ${template.name}`}
                                className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                {...field}
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                              />
                            )}
                            {template.type === 'date' && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="ml-2 h-4 w-4" />
                                    {field.value ? format(new Date(field.value), "yyyy/MM/dd") : <span>تاریخ را انتخاب کنید</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <JalaliCalendar
                                    selected={field.value ? new Date(field.value) : undefined}
                                    onSelect={(date) => field.onChange(date ? date.toISOString() : "")}
                                    showToggle={false}
                                  />
                                </PopoverContent>
                              </Popover>
                            )}
                            {template.type === 'list' && template.options && (
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || ''}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100">
                                    <SelectValue placeholder={`انتخاب ${template.name}`} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                                  {template.options.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold shadow-md transition-all duration-300 transform hover:scale-105 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 dark:border-gray-600"
            >
              انصراف
            </Button>
            <Button type="submit" className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105">
              {contactId ? "به‌روزرسانی مخاطب" : "ذخیره مخاطب"}
            </Button>
          </div>
        </form>
      </Form>
    </CardContent>
  );
};

export default ContactForm;