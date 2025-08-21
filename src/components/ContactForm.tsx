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
import { useEffect } from "react";
import { useSession } from "@/integrations/supabase/auth";
import AddGroupDialog from "./AddGroupDialog"; // New import
import { useGroups } from "@/hooks/use-groups"; // New import
import { useContactFormLogic } from "@/hooks/use-contact-form-logic"; // New import

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
  groupId: z.string().optional(), // New field for group ID
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
    groupId?: string; // Added for initial data
  };
  contactId?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ initialData, contactId }) => {
  const navigate = useNavigate();
  const { session } = useSession();
  const { groups, fetchGroups } = useGroups(); // Use the new useGroups hook

  // Initialize react-hook-form
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
      groupId: initialData?.groupId || "", // Set initial group ID
    },
  });

  // Use the new useContactFormLogic hook for submission
  const { onSubmit } = useContactFormLogic(contactId, navigate, session, form);

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
        groupId: initialData.groupId || "", // Ensure groupId is reset
      });
    }
  }, [initialData, form]);

  return (
    <CardContent className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-200">نام</FormLabel>
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
                <FormLabel className="text-gray-700 dark:text-gray-200">نام خانوادگی</FormLabel>
                <FormControl>
                  <Input placeholder="نام خانوادگی" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            <AddGroupDialog onGroupAdded={fetchGroups} /> {/* Use the new AddGroupDialog component */}
          </div>
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
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
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
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-200">یادداشت‌ها</FormLabel>
                <FormControl>
                  <Textarea placeholder="یادداشت‌های اضافی" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105">
            {contactId ? "به‌روزرسانی مخاطب" : "ذخیره مخاطب"}
          </Button>
        </form>
      </Form>
    </CardContent>
  );
};

export default ContactForm;