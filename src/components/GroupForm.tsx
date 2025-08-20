import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";

// Define the schema for the form using Zod
const formSchema = z.object({
  name: z.string().min(1, { message: "نام گروه الزامی است." }),
  color: z.string().optional(),
});

interface GroupFormProps {
  initialData?: { id: string; name: string; color?: string };
  onSuccess?: () => void;
}

const GroupForm = ({ initialData, onSuccess }: GroupFormProps) => {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      color: initialData?.color || "#aabbcc", // Default color
    },
  });

  const handleColorChange = (color: string) => {
    form.setValue("color", color);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const toastId = showLoading(initialData ? "در حال به‌روزرسانی گروه..." : "در حال ذخیره گروه...");
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        showError("برای مدیریت گروه‌ها باید وارد شوید.");
        dismissToast(toastId);
        return;
      }

      if (initialData) {
        // Update existing group
        const { error } = await supabase
          .from("groups")
          .update({
            name: values.name,
            color: values.color,
          })
          .eq("id", initialData.id)
          .eq("user_id", user.id); // Ensure user owns the group

        if (error) throw error;
        showSuccess("گروه با موفقیت به‌روزرسانی شد!");
      } else {
        // Insert new group
        const { error } = await supabase
          .from("groups")
          .insert({
            user_id: user.id,
            name: values.name,
            color: values.color,
          });

        if (error) throw error;
        showSuccess("گروه با موفقیت ذخیره شد!");
        form.reset({ name: "", color: "#aabbcc" }); // Reset form for new entry
      }

      onSuccess?.(); // Call success callback
    } catch (error: any) {
      console.error("Error saving group:", error);
      showError(`خطا در ذخیره گروه: ${error.message || "خطای ناشناخته"}`);
    } finally {
      dismissToast(toastId);
    }
  }

  return (
    <Card className="w-full max-w-md backdrop-blur-lg bg-white/10 dark:bg-gray-800/10 border border-white/20 dark:border-gray-700/20 shadow-lg rounded-xl p-6">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {initialData ? "ویرایش گروه" : "افزودن گروه جدید"}
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          اطلاعات گروه را وارد کنید.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-200">نام گروه</FormLabel>
                  <FormControl>
                    <Input placeholder="نام گروه" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-200">رنگ گروه (اختیاری)</FormLabel>
                  <FormControl>
                    <Popover open={displayColorPicker} onOpenChange={setDisplayColorPicker}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100"
                          style={{ backgroundColor: field.value || "transparent" }}
                        >
                          {field.value ? (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: field.value }}
                              />
                              {field.value}
                            </div>
                          ) : (
                            "انتخاب رنگ"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                        <HexColorPicker color={field.value || "#aabbcc"} onChange={handleColorChange} />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105">
              {initialData ? "به‌روزرسانی گروه" : "ذخیره گروه"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default GroupForm;