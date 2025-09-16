import { UseFormReturn } from "react-hook-form";
import { Session } from "@supabase/supabase-js";
import { NavigateFunction } from "react-router-dom";
import { CustomFieldTemplate } from "@/domain/schemas/custom-field-template";
import { ContactFormValues, CustomFieldFormData } from "../types/contact.ts";
import { invalidateCache } from "@/utils/cache-helpers";
import { useErrorHandler } from "./use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import { useCallback, useRef } from "react";
import { ContactCrudService } from "@/services/contact-crud-service"; // Updated import
import { updateLearnedGenderPreference } from "@/utils/gender-learning"; // New import

export const useContactFormLogic = (
  contactId: string | undefined,
  navigate: NavigateFunction,
  session: Session | null,
  form: UseFormReturn<ContactFormValues>,
  availableTemplates: CustomFieldTemplate[]
) => {
  // Use a ref to prevent multiple submissions
  const isSubmittingRef = useRef(false);

  const onSuccessCallback = useCallback(() => {
    console.log("useContactFormLogic: onSuccessCallback triggered.");
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

    console.log("useContactFormLogic: Navigating to /");
    navigate("/"); // Navigate back to contacts list after success
  }, [contactId, form, session, navigate]);

  const onErrorCallback = useCallback((err: Error) => {
    console.error("useContactFormLogic: onErrorCallback triggered.", err);
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
    console.log("useContactFormLogic: onSubmit started. isSubmitting:", isSubmitting);
    
    // Prevent multiple submissions
    if (isSubmittingRef.current) {
      console.log("useContactFormLogic: Submission already in progress, ignoring.");
      return;
    }
    
    isSubmittingRef.current = true;
    
    const user = session?.user;

    if (!user) {
      ErrorManager.notifyUser("برای افزودن/ویرایش مخاطب باید وارد شوید.", 'error');
      navigate("/login");
      isSubmittingRef.current = false;
      return;
    }

    await executeSave(async () => {
      console.log("useContactFormLogic: executeSave async function started.");
      let res;
      if (contactId) {
        console.log("useContactFormLogic: Calling ContactCrudService.updateContact...");
        res = await ContactCrudService.updateContact(contactId, values); // Updated service call
        if (res.error) {
          console.error("useContactFormLogic: ContactCrudService.updateContact returned error:", res.error);
          throw new Error(res.error);
        }
        console.log("useContactFormLogic: ContactCrudService.updateContact successful.");
      } else {
        console.log("useContactFormLogic: Calling ContactCrudService.addContact...");
        res = await ContactCrudService.addContact(values); // Updated service call
        if (res.error) {
          console.error("useContactFormLogic: ContactCrudService.addContact returned error:", res.error);
          throw new Error(res.error);
        }
        console.log("useContactFormLogic: ContactCrudService.addContact successful.");
      }
      console.log("useContactFormLogic: executeSave async function finished successfully.");
      // Fix the return value to match the expected type
      return res && 'data' in res ? res.data : null; // Return data for onSuccess callback if needed
    }).finally(() => {
      // Reset submission flag when done
      isSubmittingRef.current = false;
    });
    
    console.log("useContactFormLogic: onSubmit finished.");
  };

  // Add a simple loading state based on whether we're submitting or have an initial load
  const isLoading = isSubmitting || (contactId && !form.getValues('firstName'));

  return { 
    onSubmit, 
    isSubmitting, 
    isLoading,
    error, 
    errorMessage, 
    retrySave, 
    retryCount 
  };
};