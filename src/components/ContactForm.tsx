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

// Define the schema for the form using Zod
const formSchema = z.object({
  firstName: z.string().min(1, { message: "نام الزامی است." }),
  lastName: z.string().min(1, { message: "نام خانوادگی الزامی است." }),
  phoneNumber: z.string().regex(/^09\d{9}$/, { message: "شماره تلفن معتبر نیست (مثال: 09123456789)." }).optional().or(z.literal('')),
  emailAddress: z.string().email({ message: "آدرس ایمیل معتبر نیست." }).optional().or(z.literal('')),
  gender: z.enum(["male", "female", "not_specified"], { message: "جنسیت معتبر نیست." }).default("not_specified"),
  position: z.string().optional(), // Changed from 'role' to 'position'
  company: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

const ContactForm = () => {
  const navigate = useNavigate();

  // Initialize react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      emailAddress: "",
      gender: "not_specified",
      position: "", // Changed from 'role' to 'position'
      company: "",
      address: "",
      notes: "",
    },
  });

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const toastId = showLoading("در حال ذخیره مخاطب...");
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        showError("برای افزودن مخاطب باید وارد شوید.");
        dismissToast(toastId);
        // Optionally redirect to login if not authenticated
        // navigate("/login");
        return;
      }

      // Insert into contacts table
      const { data: contactData, error: contactError } = await supabase
        .from("contacts")
        .insert({
          user_id: user.id,
          first_name: values.firstName,
          last_name: values.lastName,
          gender: values.gender,
          position: values.position, // Changed from 'role' to 'position'
          company: values.company,
          address: values.address,
          notes: values.notes,
        })
        .select()
        .single();

      if (contactError) throw contactError;

      const contactId = contactData.id;

      // Insert into phone_numbers table if phoneNumber exists
      if (values.phoneNumber) {
        const { error: phoneError } = await supabase
          .from("phone_numbers")
          .insert({
            user_id: user.id,
            contact_id: contactId,
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
            contact_id: contactId,
            email_type: "personal", // Defaulting to 'personal'
            email_address: values.emailAddress,
          });
        if (emailError) throw emailError;
      }

      showSuccess("مخاطب با موفقیت ذخیره شد!");
      form.reset(); // Reset form after successful submission
      navigate("/"); // Redirect to contacts list
    } catch (error: any) {
      console.error("Error saving contact:", error);
      showError(`خطا در ذخیره مخاطب: ${error.message || "خطای ناشناخته"}`);
    } finally {
      dismissToast(toastId);
    }
  }

  return (
    <Card className="w-full max-w-md backdrop-blur-lg bg-white/10 dark:bg-gray-800/10 border border-white/20 dark:border-gray-700/20 shadow-lg rounded-xl p-6">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          افزودن/ویرایش مخاطب
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          اطلاعات مخاطب را وارد کنید.
        </CardDescription>
      </CardHeader>
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
              name="position" // Changed from 'role' to 'position'
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
              ذخیره مخاطب
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ContactForm;