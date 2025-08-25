import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { showError, showLoading, showSuccess, dismissToast } from "@/utils/toast"; // Import toast functions
import ContactForm from "@/components/ContactForm";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchWithCache } from "@/utils/cache-helpers";
import LoadingMessage from "@/components/LoadingMessage"; // Import LoadingMessage
import CancelButton from "@/components/CancelButton"; // Import CancelButton
import { ErrorManager } from "@/lib/error-manager"; // Import ErrorManager
import { useErrorHandler } from "@/hooks/use-error-handler"; // Import useErrorHandler

interface PhoneNumber {
  id: string;
  phone_type: string;
  phone_number: string;
  extension?: string | null;
}

interface EmailAddress {
  id: string;
  email_type: string;
  email_address: string;
}

interface SocialLink {
  id: string;
  type: string;
  url: string;
}

interface ContactGroup {
  group_id: string;
}

interface CustomField {
  id: string;
  template_id: string;
  field_value: string;
  custom_field_templates: Array<{
    name: string;
    type: string;
    options?: string[];
  }>;
}

interface ContactDetailType {
  id: string;
  first_name: string;
  last_name: string;
  gender: "male" | "female" | "not_specified";
  position?: string | null;
  company?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  country?: string | null;
  notes?: string | null;
  phone_numbers: PhoneNumber[];
  email_addresses: EmailAddress[];
  social_links: SocialLink[];
  contact_groups: ContactGroup[]; // Ensure this is included
  groupId?: string | null; // Add groupId for easier form initialization
  birthday?: string | null;
  avatar_url?: string | null;
  preferred_contact_method?: 'email' | 'phone' | 'sms' | 'any' | null;
  custom_fields: CustomField[];
  created_at: string;
  updated_at: string;
}

const EditContact = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initialContactData, setInitialContactData] = useState<ContactDetailType | null>(null);

  const onSuccessFetchContact = useCallback((result: { data: ContactDetailType | null; error: string | null; fromCache: boolean }) => {
    if (result.data) {
      // Extract groupId from contact_groups for form initialization
      const formattedData: ContactDetailType = {
        ...result.data,
        groupId: result.data.contact_groups?.[0]?.group_id || null,
      };
      setInitialContactData(formattedData);
      if (!result.fromCache) {
        showSuccess("اطلاعات مخاطب با موفقیت بارگذاری شد.");
      }
    } else {
      showError("مخاطب برای ویرایش یافت نشد.");
      navigate("/");
    }
  }, [navigate]);

  const onErrorFetchContact = useCallback((err: Error) => {
    console.error("Error fetching contact details for edit:", err);
    showError(`خطا در بارگذاری اطلاعات مخاطب: ${ErrorManager.getErrorMessage(err) || "خطای ناشناخته"}`);
    navigate("/");
  }, [navigate]);

  const {
    isLoading: loading,
    executeAsync: executeFetchContact,
  } = useErrorHandler<{ data: ContactDetailType | null; error: string | null; fromCache: boolean }>(null, {
    showToast: false, // Control toasts manually
    onSuccess: onSuccessFetchContact,
    onError: onErrorFetchContact,
  });

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) {
        showError("شناسه مخاطب برای ویرایش یافت نشد.");
        navigate("/");
        return;
      }

      await executeFetchContact(async () => {
        const cacheKey = `contact_detail_${id}`;
        const { data, error, fromCache } = await fetchWithCache<ContactDetailType>(
          cacheKey,
          async () => {
            const { data, error } = await supabase
              .from("contacts")
              .select("id, first_name, last_name, gender, position, company, street, city, state, zip_code, country, notes, created_at, updated_at, birthday, avatar_url, preferred_contact_method, phone_numbers(id, phone_type, phone_number, extension), email_addresses(id, email_type, email_address), social_links(id, type, url), contact_groups(group_id), custom_fields(id, template_id, field_value, custom_field_templates(name, type, options))")
              .eq("id", id)
              .single();

            if (error) throw error;

            if (data) {
              return { data: data as ContactDetailType, error: null };
            }
            return { data: null, error: "مخاطب برای ویرایش یافت نشد." };
          }
        );

        if (error) {
          throw new Error(error);
        }
        return { data, error: null, fromCache };
      });
    };

    fetchDetails();
  }, [id, navigate, executeFetchContact]);

  if (loading) {
    return (
      <LoadingMessage message="در حال بارگذاری اطلاعات مخاطب..." />
    );
  }

  if (!initialContactData) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-4">
        <p className="text-gray-700 dark:text-gray-300">مخاطب برای ویرایش یافت نشد.</p>
        <CancelButton text="بازگشت به لیست مخاطبین" /> {/* Use CancelButton */}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full">
      <Card className="w-full max-w-3xl glass rounded-xl p-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            ویرایش مخاطب
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            اطلاعات مخاطب را ویرایش کنید.
          </CardDescription>
        </CardHeader>
        <ContactForm initialData={initialContactData} contactId={id} />
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default EditContact;