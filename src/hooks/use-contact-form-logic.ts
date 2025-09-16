import { UseFormReturn } from "react-hook-form";
import { Session } from "@supabase/supabase-js";
import { NavigateFunction } from "react-router-dom";
import { CustomFieldTemplate } from "@/domain/schemas/custom-field-template";
import { ContactFormValues } from "../types/contact.ts";
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
  availableTemplates: CustomFieldTemplate[] = []
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

  const onErrorCallback = useCallback((error: Error) => {
    console.error("useContactFormLogic: onErrorCallback triggered.", error);
    ErrorManager.logError(error, { component: "useContactFormLogic", action: contactId ? "updateContact" : "createContact" });
  }, [contactId]);

  const {
    executeAsync: executeSave,
    isLoading: isSubmitting,
    error,
    errorMessage,
    retry: retrySave,
    retryCount,
  } = useErrorHandler(null, {
    maxRetries: 3,
    retryDelay: 1000,
    showToast: true,
    customErrorMessage: contactId ? 'خطایی در به‌روزرسانی مخاطب رخ داد' : 'خطایی در ذخیره مخاطب رخ داد',
    onSuccess: onSuccessCallback,
    onError: onErrorCallback,
  });

  const onSubmit = useCallback(async (data: ContactFormValues) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    try {
      // Validate custom fields against templates if available
      if (data.customFields && availableTemplates?.length > 0) {
        const customFields = data.customFields.map(field => {
          const template = availableTemplates.find(t => t.id === field.template_id);
          if (template) {
            // Convert value to appropriate type based on template
            let value = field.value;
            if (template.type === 'number' && value) {
              value = String(Number(value));
            } else if (template.type === 'date' && value) {
              value = new Date(value).toISOString();
            }
            return { ...field, value };
          }
          return field;
        });
        data = { ...data, customFields };
      }

      return await executeSave(async () => {
        console.log("useContactFormLogic: executeSave async function started.");
        let res;
        if (contactId) {
          console.log("useContactFormLogic: Calling ContactCrudService.updateContact...");
          res = await ContactCrudService.updateContact(contactId, data);
          if (res.error) {
            console.error("useContactFormLogic: ContactCrudService.updateContact returned error:", res.error);
            throw new Error(res.error);
          }
          console.log("useContactFormLogic: ContactCrudService.updateContact successful.");
        } else {
          console.log("useContactFormLogic: Calling ContactCrudService.addContact...");
          res = await ContactCrudService.addContact(data);
          if (res.error) {
            console.error("useContactFormLogic: ContactCrudService.addContact returned error:", res.error);
            throw new Error(res.error);
          }
          console.log("useContactFormLogic: ContactCrudService.addContact successful.");
        }
        console.log("useContactFormLogic: executeSave async function finished successfully.");
        return res && 'data' in res ? res.data : null;
      });
    } finally {
      isSubmittingRef.current = false;
    }
  }, [availableTemplates, contactId, executeSave]);

  return { 
    onSubmit, 
    isSubmitting, 
    error, 
    errorMessage, 
    retrySave, 
    retryCount 
  };
};