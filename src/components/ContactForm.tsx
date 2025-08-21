import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

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
    phoneNumber?: string; // Added for initial data
    emailAddress?: string; // Added for initial data
  };
  contactId?: string; // Optional: ID of the contact being edited
}

const ContactForm: React.FC<ContactFormProps> = ({ initialData, contactId }) => {
  const navigate = useNavigate();

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
    },
  });

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
      });
    }
  }, [initialData, form]);

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const toastId = showLoading(contactId ? "در حال به‌روزرسانی مخاطب..." : "در حال ذخیره مخاطب...");
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        showError("برای افزودن/ویرایش مخاطب باید وارد شوید.");
        dismissToast(toastId);
        navigate("/login");
        return;
      }

      let currentContactId = contactId;

      if (contactId) {
        // Update existing contact
        const { error: contactError } = await supabase
          .from("contacts")
          .update({
            first_name: values.firstName,
            last_name: values.lastName,
            gender: values.gender,
            position: values.position,
            company: values.company,
            address: values.address,
            notes: values.notes,
          })
          .eq("id", contactId)
          .eq("user_id", user.id); // Ensure user owns the contact

        if (contactError) throw contactError;

        // Handle phone number update/insert/delete
        if (values.phoneNumber) {
          const { data: existingPhone, error: fetchPhoneError } = await supabase
            .from("phone_numbers")
            .select("id")
            .eq("contact_id", contactId)
            .eq("user_id", user.id)
            .single();

          if (fetchPhoneError && fetchPhoneError.code !== 'PGRST116') { // PGRST116 means no rows found
            throw fetchPhoneError;
          }

          if (existingPhone) {
            // Update existing phone number
            const { error: updatePhoneError } = await supabase
              .from("phone_numbers")
              .update({ phone_number: values.phoneNumber })
              .eq("id", existingPhone.id);
            if (updatePhoneError) throw updatePhoneError;
          } else {
            // Insert new phone number
            const { error: insertPhoneError } = await supabase
              .from("phone_numbers")
              .insert({
                user_id: user.id,
                contact_id: contactId,
                phone_type: "mobile",
                phone_number: values.phoneNumber,
              });
            if (insertPhoneError) throw insertPhoneError;
          }
        } else {
          // If phone number is cleared, delete existing one
          await supabase
            .from("phone_numbers")
            .delete()
            .eq("contact_id", contactId)
            .eq("user_id", user.id);
        }

        // Handle email address update/insert/delete
        if (values.emailAddress) {
          const { data: existingEmail, error: fetchEmailError } = await supabase
            .from("email_addresses")
            .select("id")
            .eq("contact_id", contactId)
            .eq("user_id", user.id)
            .single();

          if (fetchEmailError && fetchEmailError.code !== 'PGRST116') { // PGRST116 means no rows found
            throw fetchEmailError;
          }

          if (existingEmail) {
            // Update existing email address
            const { error: updateEmailError } = await supabase
              .from("email_addresses")
              .update({ email_address: values.emailAddress })
              .eq("id", existingEmail.id);
            if (updateEmailError) throw updateEmailError;
          } else {
            // Insert new email address
            const { error: insertEmailError } = await supabase
              .from("email_addresses")
              .insert({
                user_id: user.id,
                contact_id: contactId,
                email_type: "personal",
                email_address: values.emailAddress,
              });
            if (insertEmailError) throw insertEmailError;
          }
        } else {
          // If email address is cleared, delete existing one
          await supabase
            .from("email_addresses")
            .delete()
            .eq("contact_id", contactId)
            .eq("user_id", user.id);
        }

        showSuccess("مخاطب با موفقیت به‌روزرسانی شد!");
      } else {
        // Insert new contact
        const { data: contactData, error: contactError } = await supabase
          .from("contacts")
          .insert({
            user_id: user.id,
            first_name: values.firstName,
            last_name: values.lastName,
            gender: values.gender,
            position: values.position,
            company: values.company,
            address: values.address,
            notes: values.notes,
          })
          .select()
          .single();

        if (contactError) throw contactError;

        currentContactId = contactData.id;

        // Insert into phone_numbers table if phoneNumber exists
        if (values.phoneNumber) {
          const { error: phoneError } = await supabase
            .from("phone_numbers")
            .insert({
              user_id: user.id,
              contact_id: currentContactId,
              phone_type: "mobile", // Defaulting to 'mobile'
              phone_number: values.phoneNumber,
            });
          if (phoneError) throw phoneError;
        }

        // Insert into email_addresses table if emailAddress exists
        if (values.emailAddress) {
          const { error: emailError } = await supabase
            .from("email_addresses")
            .insert({
              user_id: user.id,
              contact_id: currentContactId,
              email_type: "personal", // Defaulting to 'personal'
              email_address: values.emailAddress,
            });
          if (emailError) throw emailError;
        }

        showSuccess("مخاطب با موفقیت ذخیره شد!");
        form.reset(); // Reset form after successful submission for new contact
      }

      navigate("/"); // Redirect to contacts list after successful submission/update
    } catch (error: any) {
      console.error("Error saving contact:", error);
      showError(`خطا در ذخیره مخاطب: ${error.message || "خطای ناشناخته"}`);
    } finally {
      dismissToast(toastId);
    }
  }

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