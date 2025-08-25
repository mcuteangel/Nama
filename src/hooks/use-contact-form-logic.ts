import { UseFormReturn } from "react-hook-form";
import { Session } from "@supabase/supabase-js";
import { NavigateFunction } from "react-router-dom";
import { CustomFieldTemplate } from "@/domain/schemas/custom-field-template";
import { ContactFormValues, CustomFieldFormData } from "../types/contact.ts";
import { invalidateCache } from "@/utils/cache-helpers";
import { useErrorHandler } from "./use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import { useCallback } from "react";
import { ContactService } from "@/services/contact-service";
import { updateLearnedGenderPreference } from "@/utils/gender-learning"; // New import

export const useContactFormLogic = (
  contactId: string | undefined,
  navigate: NavigateFunction,
  session: Session | null,
  form: UseFormReturn<ContactFormValues>,
  availableTemplates: CustomFieldTemplate[]
) => {
  const onSuccessCallback = useCallback(() => {
    ErrorManager.notifyUser(contactId ? "مخاطب با موفقیت به‌روزرسانی شد!" : "مخاطب با موفقیت ذخیره شد!", 'success');
    if (!contactId) { // Only reset form for new contacts
      form.reset();
    }
    invalidateCache(`contacts_list_${session?.user?.id}_`); // Invalidate all contact lists for this user
    invalidateCache(`statistics_dashboard_${session?.user?.id}`); // Invalidate statistics cache
    if (contactId) {
      invalidateCache(`contact_detail_${contactId}`); // Invalidate single contact cache
    }

    // New: Update learned gender preferences based on form submission
    const { firstName, gender } = form.getValues();
    if (firstName && gender && gender !== 'not_specified') {
      updateLearnedGenderPreference(firstName, gender);
    }

    navigate("/"); // Navigate back to contacts list after success
  }, [contactId, form, session, navigate]);

  const onErrorCallback = useCallback((err: Error) => {
    ErrorManager.logError(err, { component: "useContactFormLogic", action: contactId ? "updateContact" : "createContact" });
  }, [contactId]);

  const {
    isLoading: isSubmitting,
    error,
    errorMessage,
    retry: retrySave,
    executeAsync: executeSave,
    retryCount,
  } = useErrorHandler(null, {
    maxRetries: 3,
    retryDelay: 1000,
    showToast: true,
    customErrorMessage: contactId ? "خطایی در به‌روزرسانی مخاطب رخ داد" : "خطایی در ذخیره مخاطب رخ داد",
    onSuccess: onSuccessCallback,
    onError: onErrorCallback,
  });

  const onSubmit = async (values: ContactFormValues) => {
    const user = session?.user;

    if (!user) {
      ErrorManager.notifyUser("برای افزودن/ویرایش مخاطب باید وارد شوید.", 'error');
      navigate("/login");
      return;
    }

    await executeSave(async () => {
      let res;
      if (contactId) {
        res = await ContactService.updateContact(contactId, values);
        if (res.error) throw new Error(res.error);
      } else {
        res = await ContactService.addContact(values);
        if (res.error) throw new Error(res.error);
      }
      return res.data; // Return data for onSuccess callback if needed
    });
  };

  return { onSubmit, isSubmitting, error, errorMessage, retrySave, retryCount };
};