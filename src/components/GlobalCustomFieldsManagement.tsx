"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"; // Added import
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import { ContactService } from "@/services/contact-service";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import {
  customFieldTemplateSchema,
  updateCustomFieldTemplateSchema,
  type CreateCustomFieldTemplateInput,
  type CustomFieldTemplate,
} from "@/domain/schemas/custom-field-template";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useSession } from "@/integrations/supabase/auth";

type TemplateType = 'text' | 'number' | 'date' | 'list';

interface TemplateViewModel {
  id?: string; // Changed to string as per UUID
  name: string;
  type: TemplateType;
  options?: string[];
  description?: string;
  required: boolean;
}

export function GlobalCustomFieldsManagement() {
  const { session, isLoading: isSessionLoading } = useSession();
  const [customFields, setCustomFields] = useState<TemplateViewModel[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<TemplateViewModel | null>(null);
  
  const {
    isLoading: loading,
    error,
    errorMessage,
    retryCount,
    retry: retryLastOperation,
    executeAsync,
    setError
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

  const createForm = useForm<CreateCustomFieldTemplateInput>({
    resolver: zodResolver(customFieldTemplateSchema),
    defaultValues: {
      name: "",
      type: "text",
      options: [],
      description: "",
      required: false,
    },
    mode: "onChange",
  });

  const editForm = useForm<CreateCustomFieldTemplateInput>({ // Changed to CreateCustomFieldTemplateInput for full validation
    resolver: zodResolver(customFieldTemplateSchema),
    defaultValues: {},
    mode: "onChange",
  });

  const loadTemplates = async () => {
    if (isSessionLoading || !session?.user) {
      setCustomFields([]);
      return;
    }
    await executeAsync(async () => {
      const res = await ContactService.getAllCustomFieldTemplates();
      if (res.error) {
        throw new Error(res.error || "خطا در دریافت لیست قالب‌های فیلدهای سفارشی");
      }
      setCustomFields(res.data!.map((t: CustomFieldTemplate) => ({
        id: t.id,
        name: t.name,
        type: t.type as TemplateType,
        options: t.options || [],
        description: t.description || "",
        required: t.required
      })));
    }, {
      component: "GlobalCustomFieldsManagement",
      action: "loadTemplates"
    });
  };

  useEffect(() => {
    loadTemplates();
  }, [session, isSessionLoading]); // Reload when session changes

  useEffect(() => {
    if (isDialogOpen) {
      if (editingField) {
        editForm.reset({
          name: editingField.name,
          type: editingField.type,
          options: editingField.type === 'list' ? (editingField.options || []) : undefined,
          description: editingField.description,
          required: editingField.required,
        });
      } else {
        createForm.reset({
          name: "",
          type: "text",
          options: [],
          description: "",
          required: false,
        });
      }
    }
  }, [isDialogOpen, editingField, createForm, editForm]);

  const handleAddField = async (data: CreateCustomFieldTemplateInput) => {
    await executeAsync(async () => {
      const res = await ContactService.addCustomFieldTemplate({
        name: data.name.trim(),
        type: data.type,
        options: data.type === 'list' ? (data.options || []).filter(Boolean) : undefined,
        description: data.description?.trim() || "",
        required: !!data.required,
      });
      if (res.error) {
        throw new Error(res.error || "خطا در افزودن قالب فیلد سفارشی");
      }
      
      ErrorManager.notifyUser("قالب با موفقیت اضافه شد", "success");
      setIsDialogOpen(false);
      await loadTemplates();
    }, {
      component: "GlobalCustomFieldsManagement",
      action: "addCustomField"
    });
  };

  const handleEditField = async (data: CreateCustomFieldTemplateInput) => { // Changed to CreateCustomFieldTemplateInput
    if (!editingField?.id) return;
    
    await executeAsync(async () => {
      const res = await ContactService.updateCustomFieldTemplate(editingField.id, {
        name: data.name.trim(),
        type: data.type,
        options: data.type === 'list' ? (data.options || []).filter(Boolean) : undefined,
        description: data.description?.trim() || "",
        required: !!data.required,
      });
      
      if (res.error) {
        throw new Error(res.error || "خطا در به‌روزرسانی قالب فیلد سفارشی");
      }
      
      ErrorManager.notifyUser("قالب با موفقیت به‌روزرسانی شد", "success");
      setEditingField(null);
      setIsDialogOpen(false);
      await loadTemplates();
    }, {
      component: "GlobalCustomFieldsManagement",
      action: "updateCustomField"
    });
  };

  const handleDeleteField = async (id?: string) => { // Changed to string
    if (id == null) return;
    
    if (window.confirm("آیا از حذف این فیلد مطمئن هستید؟ این عمل داده‌های موجود را حذف نمی‌کند.")) {
      await executeAsync(async () => {
        const res = await ContactService.deleteCustomFieldTemplate(id);
        if (res.error) {
          throw new Error(res.error || "خطا در حذف قالب فیلد سفارشی");
        }
        
        ErrorManager.notifyUser("قالب با موفقیت حذف شد", "success");
        await loadTemplates();
      }, {
        component: "GlobalCustomFieldsManagement",
        action: "deleteCustomField"
      });
    }
  };

  const addOption = (isEdit: boolean) => {
    if (isEdit) {
      const current = editForm.getValues("options") || [];
      editForm.setValue("options", [...current, ""], { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    } else {
      const current = createForm.getValues("options") || [];
      createForm.setValue("options", [...current, ""], { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    }
  };

  const removeOption = (isEdit: boolean, index: number) => {
    if (isEdit) {
      const current = (editForm.getValues("options") || []).filter((_, i) => i !== index);
      editForm.setValue("options", current, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    } else {
      const current = (createForm.getValues("options") || []).filter((_, i) => i !== index);
      createForm.setValue("options", current, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    }
  };

  const setOptionAt = (isEdit: boolean, index: number, value: string) => {
    if (isEdit) {
      const current = [...(editForm.getValues("options") || [])];
      current[index] = value;
      editForm.setValue("options", current, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    } else {
      const current = [...(createForm.getValues("options") || [])];
      current[index] = value;
      createForm.setValue("options", current, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    }
  };

  const renderFormFields = (isEdit: boolean) => {
    const f = isEdit ? editForm : createForm;
    const values = f.watch(); // Use watch to react to changes

    return (
      <div className="grid gap-4 py-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="field-name" className="text-gray-700 dark:text-gray-200">نام فیلد</Label>
          <Input
            id="field-name"
            {...f.register("name")}
            placeholder="مثال: تاریخ تولد"
            className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
          {f.formState.errors.name && (
            <p className="text-xs text-red-500">{f.formState.errors.name.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="field-type" className="text-gray-700 dark:text-gray-200">نوع فیلد</Label>
          <Select
            value={values.type || "text"}
            onValueChange={(value) => {
              f.setValue("type", value as TemplateType, { shouldValidate: true });
              if (value !== "list") {
                f.setValue("options", undefined, { shouldValidate: true });
              } else {
                f.setValue("options", f.getValues("options") || [""], { shouldValidate: true });
              }
            }}
          >
            <SelectTrigger className="w-full bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100">
              <SelectValue placeholder="انتخاب نوع" />
            </SelectTrigger>
            <SelectContent className="backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
              <SelectItem value="text">متن</SelectItem>
              <SelectItem value="number">عدد</SelectItem>
              <SelectItem value="date">تاریخ</SelectItem>
              <SelectItem value="list">لیست</SelectItem>
            </SelectContent>
          </Select>
          {f.formState.errors.type && (
            <p className="text-xs text-red-500">{f.formState.errors.type.message}</p>
          )}
        </div>

        {(values.type === 'list') && (
          <div className="flex flex-col gap-2">
            <Label className="text-gray-700 dark:text-gray-200">گزینه‌های لیست</Label>
            {(values.options || []).map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => setOptionAt(isEdit, index, e.target.value)}
                  placeholder="گزینه"
                  className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(isEdit, index)}
                  className="text-red-500 hover:bg-red-100 dark:hover:bg-gray-700/50"
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => addOption(isEdit)}
              className="w-full flex items-center gap-2 px-6 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold shadow-sm transition-all duration-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            >
              <Plus size={16} className="me-2" /> افزودن گزینه
            </Button>
            {f.formState.errors.options && (
              <p className="text-xs text-red-500">{(f.formState.errors.options as any)?.message}</p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="field-description" className="text-gray-700 dark:text-gray-200">توضیحات (اختیاری)</Label>
          <Textarea
            id="field-description"
            {...f.register("description")}
            placeholder="توضیحات درباره این فیلد"
            className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="field-required"
            {...f.register("required")}
            className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <Label htmlFor="field-required" className="text-gray-700 dark:text-gray-200">فیلد الزامی</Label>
        </div>
      </div>
    );
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingField(null); setIsDialogOpen(true); }}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
              >
                <Plus size={18} className="me-2" /> افزودن فیلد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] glass rounded-xl p-6">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-gray-800 dark:text-gray-100">
                    {editingField ? 'ویرایش فیلد سفارشی' : 'افزودن فیلد سفارشی جدید'}
                  </DialogTitle>
                  {error && (
                    <div className="text-sm text-destructive flex items-center gap-2">
                      <span>{errorMessage}</span>
                      {retryCount > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={retryLastOperation}
                          disabled={loading}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          تلاش مجدد ({retryCount} از ۳)
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </DialogHeader>

              {editingField ? renderFormFields(true) : renderFormFields(false)}

              <DialogFooter className="flex justify-end gap-4 p-0 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}
                  className="px-6 py-2 rounded-md text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  انصراف
                </Button>
                {editingField ? (
                  <Button type="button" onClick={editForm.handleSubmit(handleEditField)}
                    className="px-6 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    <Save size={16} className="me-2" />
                    ذخیره تغییرات
                  </Button>
                ) : (
                  <Button type="button" onClick={createForm.handleSubmit(handleAddField)}
                    className="px-6 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    <Plus size={16} className="me-2" />
                    افزودن فیلد
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading && customFields.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">در حال بارگذاری فیلدهای سفارشی...</p>
        ) : customFields.length === 0 ? (
          <div className="glass p-8 rounded-lg text-center">
            <p className="text-muted-foreground mb-4">هنوز فیلد سفارشی تعریف نشده است.</p>
            <p className="text-sm text-muted-foreground">با افزودن فیلدهای سفارشی، می‌توانید قالب‌های استاندارد برای اطلاعات مخاطبین خود ایجاد کنید.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {customFields.map((field, index) => (
              <div key={field.id || index} className="glass p-4 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
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
                      onClick={() => {
                        setEditingField(field);
                        setIsDialogOpen(true);
                      }}
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
                          <AlertDialogCancel className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100">لغو</AlertDialogCancel>
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
    </Card>
  );
}