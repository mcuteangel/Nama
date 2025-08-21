"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Edit } from "lucide-react";
import { ContactService } from "@/services/contact-service";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import { type CustomFieldTemplate } from "@/domain/schemas/custom-field-template";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useSession } from "@/integrations/supabase/auth";
import CustomFieldTemplateForm from "./CustomFieldTemplateForm";
import AddCustomFieldTemplateDialog from "./AddCustomFieldTemplateDialog";
import { fetchWithCache, invalidateCache } from "@/utils/cache-helpers";
import FormDialogWrapper from "./FormDialogWrapper"; // Import the new wrapper
import LoadingMessage from "./LoadingMessage"; // Import LoadingMessage
import CancelButton from "./CancelButton"; // Import CancelButton
import { showLoading, dismissToast, showError, showSuccess } from "@/utils/toast"; // Import toast functions

type TemplateType = 'text' | 'number' | 'date' | 'list';

interface TemplateViewModel {
  id: string;
  name: string;
  type: TemplateType;
  options?: string[];
  description?: string;
  required: boolean;
}

export function GlobalCustomFieldsManagement() {
  const { session, isLoading: isSessionLoading } = useSession();
  const [customFields, setCustomFields] = useState<TemplateViewModel[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomFieldTemplate | null>(null);

  const {
    isLoading: loading,
    error,
    errorMessage,
    retryCount,
    retry: retryLastOperation,
    executeAsync,
  } = useErrorHandler(null, {
    maxRetries: 3,
    retryDelay: 1000,
    showToast: true,
    customErrorMessage: "خطایی در مدیریت فیلدهای سفارشی رخ داد",
    onError: (error) => {
      ErrorManager.logError(error, {
        component: 'GlobalCustomFieldsManagement',
        action: 'customFieldsOperation',
        metadata: {
          operation: error.message.includes('دریافت') ? 'fetch' :
                   error.message.includes('افزودن') ? 'add' :
                   error.message.includes('ویرایش') ? 'edit' :
                   error.message.includes('حذف') ? 'delete' : 'unknown'
        }
      });
    }
  });

  const loadTemplates = async () => {
    if (isSessionLoading || !session?.user) {
      setCustomFields([]);
      return;
    }
    const cacheKey = `custom_field_templates_${session.user.id}`;
    const toastId = showLoading("در حال بارگذاری قالب‌های فیلد سفارشی..."); // Add toast

    const { data, error } = await fetchWithCache<CustomFieldTemplate[]>(
      cacheKey,
      async () => {
        const res = await ContactService.getAllCustomFieldTemplates();
        if (res.error) {
          throw new Error(res.error || "خطا در دریافت لیست قالب‌های فیلدهای سفارشی");
        }
        return { data: res.data, error: null };
      }
    );

    if (error) {
      console.error("Error loading custom field templates:", error);
      showError(`خطا در دریافت لیست قالب‌های فیلدهای سفارشی: ${error || "خطای ناشناخته"}`); // Fixed: Use error directly
      setCustomFields([]);
    } else {
      setCustomFields(data!.map((t: CustomFieldTemplate) => ({
        id: t.id,
        name: t.name,
        type: t.type as TemplateType,
        options: t.options || [],
        description: t.description || "",
        required: t.required
      })));
      showSuccess("قالب‌های فیلد سفارشی با موفقیت بارگذاری شدند."); // Add success toast
    }
    dismissToast(toastId); // Dismiss toast
  };

  useEffect(() => {
    loadTemplates();
  }, [session, isSessionLoading]);

  const handleDeleteField = async (id: string) => {
    await executeAsync(async () => {
      const res = await ContactService.deleteCustomFieldTemplate(id);
      if (res.error) {
        throw new Error(res.error || "خطا در حذف قالب فیلد سفارشی");
      }

      ErrorManager.notifyUser("قالب با موفقیت حذف شد", "success");
      invalidateCache(`custom_field_templates_${session?.user?.id}`);
      await loadTemplates();
    }, {
      component: "GlobalCustomFieldsManagement",
      action: "deleteCustomField"
    });
  };

  const handleEditClick = (field: CustomFieldTemplate) => {
    setEditingField(field);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingField(null);
    invalidateCache(`custom_field_templates_${session?.user?.id}`);
    loadTemplates();
  };

  const handleEditCancel = () => {
    setIsEditDialogOpen(false);
    setEditingField(null);
  };

  return (
    <Card className="w-full max-w-4xl glass rounded-xl p-6">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          مدیریت فیلدهای سفارشی
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end items-center mb-6">
          <AddCustomFieldTemplateDialog onTemplateAdded={loadTemplates} />
        </div>

        {loading && customFields.length === 0 ? (
          <LoadingMessage message="در حال بارگذاری فیلدهای سفارشی..." />
        ) : customFields.length === 0 ? (
          <div className="glass p-8 rounded-lg text-center">
            <p className="text-muted-foreground mb-4">هنوز فیلد سفارشی تعریف نشده است.</p>
            <p className="text-sm text-muted-foreground">با افزودن فیلدهای سفارشی، می‌توانید قالب‌های استاندارد برای اطلاعات مخاطبین خود ایجاد کنید.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {customFields.map((field) => (
              <div key={field.id} className="glass p-4 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">{field.name}</h3>
                      <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                        {field.type === 'text' ? 'متن' :
                         field.type === 'number' ? 'عدد' :
                         field.type === 'date' ? 'تاریخ' : 'لیست'}
                      </span>
                      {field.required && (
                        <span className="px-2 py-1 bg-destructive text-destructive-foreground rounded text-xs">
                          الزامی
                        </span>
                      )}
                    </div>
                    {field.description && (
                      <p className="text-sm text-muted-foreground mb-2">{field.description}</p>
                    )}
                    {field.type === 'list' && field.options && field.options.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        گزینه‌ها: {field.options.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(field as CustomFieldTemplate)}
                      className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-600/50 transition-all duration-200"
                    >
                      <Edit size={16} />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-600/50 transition-all duration-200">
                          <Trash2 size={16} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass rounded-xl p-6">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-gray-800 dark:text-gray-100">آیا از حذف این فیلد سفارشی مطمئن هستید؟</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                            این عمل قابل بازگشت نیست. این قالب فیلد برای همیشه حذف خواهد شد. (داده‌های موجود در مخاطبین حذف نمی‌شوند)
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <CancelButton onClick={() => {}} text="لغو" /> {/* Use CancelButton */}
                          <AlertDialogAction onClick={() => handleDeleteField(field.id)} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold">حذف</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <FormDialogWrapper> {/* Use the new wrapper */}
          <CustomFieldTemplateForm
            initialData={editingField || undefined}
            onSuccess={handleEditSuccess}
            onCancel={handleEditCancel}
          />
        </FormDialogWrapper>
      </Dialog>
    </Card>
  );
}