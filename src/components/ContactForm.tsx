import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardContent } from "@/components/ui/card";
import { useForm, useFieldArray } from "react-hook-form";
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
import { CalendarIcon, Plus, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns-jalali";
import { JalaliCalendar } from "@/components/JalaliCalendar";
import { cn } from "@/lib/utils";
import AddCustomFieldTemplateDialog from "./AddCustomFieldTemplateDialog";

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
    phone_numbers?: { id?: string; phone_type: string; phone_number: string; extension?: string | null }[];
    email_addresses?: { id?: string; email_type: string; email_address: string }[];
    groupId?: string;
    custom_fields?: {
      id: string;
      template_id: string;
      field_value: string;
      custom_field_templates: Array<{
        name: string;
        type: string;
        options?: string[];
      }>;
    }[];
  };
  contactId?: string;
}

const phoneTypeOptions = [
  { value: "mobile", label: "موبایل" },
  { value: "home", label: "منزل" },
  { value: "work", label: "کار" },
  { value: "fax", label: "فکس" },
  { value: "other", label: "سایر" },
];

const emailTypeOptions = [
  { value: "personal", label: "شخصی" },
  { value: "work", label: "کار" },
  { value: "other", label: "سایر" },
];

export const formSchema = z.object({
  firstName: z.string().min(1, { message: "نام الزامی است." }),
  lastName: z.string().min(1, { message: "نام خانوادگی الزامی است." }),
  phoneNumbers: z.array(z.object({
    id: z.string().optional(),
    phone_type: z.string().min(1, { message: "نوع شماره الزامی است." }),
    phone_number: z.string().regex(/^09\d{9}$/, { message: "شماره تلفن معتبر نیست (مثال: 09123456789)." }),
    extension: z.string().optional().nullable(),
  })).optional(),
  emailAddresses: z.array(z.object({
    id: z.string().optional(),
    email_type: z.string().min(1, { message: "نوع ایمیل الزامی است." }),
    email_address: z.string().email({ message: "آدرس ایمیل معتبر نیست." }),
  })).optional(),
  gender: z.enum(["male", "female", "not_specified"], { message: "جنسیت معتبر نیست." }).default("not_specified"),
  position: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  groupId: z.string().optional(),
  customFields: z.array(z.object({
    template_id: z.string(),
    value: z.string(),
  })).optional(),
}).superRefine((data, ctx) => {
  if (data.customFields) {
    data.customFields.forEach((field, index) => {
      const template = (ctx as any).parent.availableTemplates?.find((t: CustomFieldTemplate) => t.id === field.template_id);
      if (template && template.required && !field.value.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${template.name} الزامی است.`,
          path: [`customFields`, index, `value`],
        });
      }
    });
  }
});

type ContactFormValues = z.infer<typeof formSchema>;

const ContactForm: React.FC<ContactFormProps> = ({ initialData, contactId }) => {
  const navigate = useNavigate();
  const { session } = useSession();
  const { groups, fetchGroups } = useGroups();
  const [availableTemplates, setAvailableTemplates] = useState<CustomFieldTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: initialData?.first_name || "",
      lastName: initialData?.last_name || "",
      gender: initialData?.gender || "not_specified",
      position: initialData?.position || "",
      company: initialData?.company || "",
      address: initialData?.address || "",
      notes: initialData?.notes || "",
      groupId: initialData?.groupId || "",
      phoneNumbers: initialData?.phone_numbers || [],
      emailAddresses: initialData?.email_addresses || [],
      customFields: initialData?.custom_fields?.map(cf => ({
        template_id: cf.template_id,
        value: cf.field_value,
      })) || [],
    },
    context: { availableTemplates }, // Pass availableTemplates to Zod context for superRefine
  });

  const { onSubmit } = useContactFormLogic(contactId, navigate, session, form, availableTemplates);

  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
    control: form.control,
    name: "phoneNumbers",
  });

  const { fields: emailFields, append: appendEmail, remove: removeEmail } = useFieldArray({
    control: form.control,
    name: "emailAddresses",
  });

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
        gender: initialData.gender,
        position: initialData.position,
        company: initialData.company,
        address: initialData.address,
        notes: initialData.notes,
        groupId: initialData.groupId || "",
        phoneNumbers: initialData.phone_numbers || [],
        emailAddresses: initialData.email_addresses || [],
        customFields: initialData.custom_fields?.map(cf => ({
          template_id: cf.template_id,
          value: cf.field_value,
        })) || [],
      });
    }
  }, [initialData, form]);

  useEffect(() => {
    if (loadingTemplates) return;

    const newCustomFieldsFormState: { template_id: string; value: string }[] = [];
    const initialCustomFieldValuesMap = new Map<string, string>();

    initialData?.custom_fields?.forEach(cf => {
      initialCustomFieldValuesMap.set(cf.template_id, cf.field_value);
    });

    availableTemplates.forEach(template => {
      const existingValue = initialCustomFieldValuesMap.get(template.id!);
      newCustomFieldsFormState.push({
        template_id: template.id!,
        value: existingValue !== undefined ? existingValue : "",
      });
    });

    newCustomFieldsFormState.sort((a, b) => {
      const templateA = availableTemplates.find(t => t.id === a.template_id)?.name || '';
      const templateB = availableTemplates.find(t => t.id === b.template_id)?.name || '';
      return templateA.localeCompare(templateB);
    });

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
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100">
                        <SelectValue placeholder="انتخاب جنسیت" />
                      </SelectTrigger>
                      <SelectContent className="backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                        <SelectItem value="male">مرد</SelectItem>
                        <SelectItem value="female">زن</SelectItem>
                        <SelectItem value="not_specified">نامشخص</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Phone Numbers Section */}
          <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">شماره تلفن‌ها</h3>
            {phoneFields.map((item, index) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <FormField
                  control={form.control}
                  name={`phoneNumbers.${index}.phone_type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-200">نوع شماره</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100">
                            <SelectValue placeholder="انتخاب نوع" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                          {phoneTypeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`phoneNumbers.${index}.phone_number`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-200">شماره تلفن</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: 09123456789" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-end gap-2">
                  <FormField
                    control={form.control}
                    name={`phoneNumbers.${index}.extension`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormLabel className="text-gray-700 dark:text-gray-200">داخلی (اختیاری)</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: 123" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removePhone(index)} className="text-red-500 hover:bg-red-100 dark:hover:bg-gray-700/50">
                    <X size={16} />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => appendPhone({ phone_type: "mobile", phone_number: "", extension: null })}
              className="w-full flex items-center gap-2 px-6 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold shadow-sm transition-all duration-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            >
              <Plus size={16} className="me-2" /> افزودن شماره تلفن
            </Button>
          </div>

          {/* Email Addresses Section */}
          <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">آدرس‌های ایمیل</h3>
            {emailFields.map((item, index) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <FormField
                  control={form.control}
                  name={`emailAddresses.${index}.email_type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-200">نوع ایمیل</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100">
                            <SelectValue placeholder="انتخاب نوع" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                          {emailTypeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-end gap-2">
                  <FormField
                    control={form.control}
                    name={`emailAddresses.${index}.email_address`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormLabel className="text-gray-700 dark:text-gray-200">آدرس ایمیل</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="مثال: example@domain.com" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeEmail(index)} className="text-red-500 hover:bg-red-100 dark:hover:bg-gray-700/50">
                    <X size={16} />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => appendEmail({ email_type: "personal", email_address: "" })}
              className="w-full flex items-center gap-2 px-6 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold shadow-sm transition-all duration-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            >
              <Plus size={16} className="me-2" /> افزودن آدرس ایمیل
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                {form.watch("customFields")?.map((fieldItem, index) => {
                  const template = availableTemplates.find(t => t.id === fieldItem.template_id);
                  if (!template) return null; // Should not happen if logic is correct

                  const fieldName = `customFields.${index}.value` as const;
                  
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
                            {template.type === 'text' ? (
                              <Input
                                placeholder={template.description || `مقدار ${template.name}`}
                                className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                {...field}
                                value={field.value || ''}
                              />
                            ) : template.type === 'number' ? (
                              <Input
                                type="number"
                                placeholder={template.description || `مقدار ${template.name}`}
                                className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                {...field}
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                              />
                            ) : template.type === 'date' ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    <span className="flex items-center">
                                      <CalendarIcon className="ml-2 h-4 w-4" />
                                      {field.value ? format(new Date(field.value), "yyyy/MM/dd") : <span>تاریخ را انتخاب کنید</span>}
                                    </span>
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
                            ) : template.type === 'list' ? (
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || ''}
                                disabled={!template.options || template.options.length === 0}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100">
                                    <SelectValue placeholder={!template.options || template.options.length === 0 ? "گزینه‌ای یافت نشد" : `انتخاب ${template.name}`} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                                  {template.options && template.options.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input disabled placeholder="نوع فیلد نامشخص" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" />
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