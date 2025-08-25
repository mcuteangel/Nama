import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { showError, showLoading, showSuccess, dismissToast } from "@/utils/toast";
import ContactForm from "@/components/ContactForm";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchWithCache } from "@/utils/cache-helpers";
import LoadingMessage from "@/components/LoadingMessage";
import CancelButton from "@/components/CancelButton";
import { ErrorManager } from "@/lib/error-manager";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ExtractedContactInfo } from "@/hooks/use-contact-extractor";
import { AISuggestionsService } from "@/services/ai-suggestions-service";
import { useSession } from "@/integrations/supabase/auth";
import { ContactFormValues } from "@/types/contact";
import { ContactListService } from "@/services/contact-list-service";
import { ContactCrudService } from "@/services/contact-crud-service";

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
  contact_groups: ContactGroup[];
  birthday?: string | null;
  avatar_url?: string | null;
  preferred_contact_method?: 'email' | 'phone' | 'sms' | 'any' | null;
  custom_fields: CustomField[];
  created_at: string;
  updated_at: string;
}

const mapContactDetailToFormValues = (contact: ContactDetailType): ContactFormValues => {
  return {
    firstName: contact.first_name,
    lastName: contact.last_name,
    gender: contact.gender,
    position: contact.position || undefined,
    company: contact.company || undefined,
    street: contact.street ?? null,
    city: contact.city ?? null,
    state: contact.state ?? null,
    zipCode: contact.zip_code ?? null,
    country: contact.country ?? null,
    notes: contact.notes ?? null,
    groupId: contact.contact_groups?.[0]?.group_id || null,
    birthday: contact.birthday ?? null,
    avatarUrl: contact.avatar_url ?? null,
    preferredContactMethod: contact.preferred_contact_method ?? null,
    phoneNumbers: contact.phone_numbers.map(p => ({
      id: p.id,
      phone_type: p.phone_type,
      phone_number: p.phone_number,
      extension: p.extension,
    })),
    emailAddresses: contact.email_addresses.map(e => ({
      id: e.id,
      email_type: e.email_type,
      email_address: e.email_address,
    })),
    socialLinks: contact.social_links.map(s => ({
      id: s.id,
      type: s.type,
      url: s.url,
    })),
    customFields: contact.custom_fields.map(cf => ({
      template_id: cf.template_id,
      value: cf.field_value,
    })),
  };
};

const EditContact = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session, isLoading: isSessionLoading } = useSession();
  const [initialContactData, setInitialContactData] = useState<ContactFormValues | undefined>(undefined);
  const lastFetchedContactDataRef = useRef<ContactFormValues | undefined>(undefined);

  // Refs for stable callbacks
  const navigateRef = useRef(navigate);
  useEffect(() => { navigateRef.current = navigate; }, [navigate]);

  const sessionRef = useRef(session);
  useEffect(() => { sessionRef.current = session; }, [session]);

  const { executeAsync: executeUpdateSuggestionStatus } = useErrorHandler(null, {
    showToast: false,
    onError: (err) => ErrorManager.logError(err, { component: 'EditContact', action: 'updateSuggestionStatus' }),
  });
  const executeUpdateSuggestionStatusRef = useRef(executeUpdateSuggestionStatus);
  useEffect(() => { executeUpdateSuggestionStatusRef.current = executeUpdateSuggestionStatus; }, [executeUpdateSuggestionStatus]);


  const onSuccessFetchContact = useCallback((result: { data: ContactDetailType | null; error: string | null; fromCache: boolean }) => {
    const currentNavigate = navigateRef.current;
    const currentSession = sessionRef.current;
    const currentExecuteUpdateSuggestionStatus = executeUpdateSuggestionStatusRef.current;

    if (result.data) {
      const mappedData = mapContactDetailToFormValues(result.data);

      if (JSON.stringify(mappedData) !== JSON.stringify(lastFetchedContactDataRef.current)) {
        setInitialContactData(mappedData);
        lastFetchedContactDataRef.current = mappedData;
        if (!result.fromCache) {
          showSuccess("اطلاعات مخاطب با موفقیت بارگذاری شد.");
        }
      } else {
        console.log("EditContact: Fetched data is identical to current state, skipping setInitialContactData.");
      }

      const storedData = localStorage.getItem('ai_prefill_contact_data');
      const suggestionId = localStorage.getItem('ai_suggestion_id_to_update');

      if (storedData) {
        const extracted: ExtractedContactInfo = JSON.parse(storedData);
        const mergedData: ContactFormValues = {
          ...mappedData,
          firstName: extracted.firstName || mappedData.firstName,
          lastName: extracted.lastName || mappedData.lastName,
          company: extracted.company || mappedData.company,
          position: extracted.position || mappedData.position,
          notes: extracted.notes || mappedData.notes,
          phoneNumbers: [...(mappedData.phoneNumbers || []), ...extracted.phoneNumbers.filter(p => !(mappedData.phoneNumbers || []).some(ep => ep.phone_number === p.phone_number))],
          emailAddresses: [...(mappedData.emailAddresses || []), ...extracted.emailAddresses.filter(e => !(mappedData.emailAddresses || []).some(ee => ee.email_address === e.email_address))].filter(Boolean),
          socialLinks: [...(mappedData.socialLinks || []), ...extracted.socialLinks.filter(s => !(mappedData.socialLinks || []).some(es => es.url === s.url))].filter(Boolean),
        };
        
        if (JSON.stringify(mergedData) !== JSON.stringify(lastFetchedContactDataRef.current)) {
          setInitialContactData(mergedData);
          lastFetchedContactDataRef.current = mergedData;
        } else {
          console.log("EditContact: Merged AI prefill data is identical to current state, skipping setInitialContactData.");
        }

        localStorage.removeItem('ai_prefill_contact_data');
        localStorage.removeItem('ai_suggestion_id_to_update');

        if (suggestionId && currentSession?.user) {
          currentExecuteUpdateSuggestionStatus(async () => {
            const { success, error } = await AISuggestionsService.updateSuggestionStatus(suggestionId, 'edited');
            if (!success) throw new Error(error || 'Failed to update AI suggestion status to edited.');
          });
        }
      }

    } else {
      showError("مخاطب برای ویرایش یافت نشد.");
      currentNavigate("/");
    }
  }, []); // Empty dependency array for onSuccessFetchContact

  const onErrorFetchContact = useCallback((err: Error) => {
    const currentNavigate = navigateRef.current;
    console.error("Error fetching contact details for edit:", err);
    showError(`خطا در بارگذاری اطلاعات مخاطب: ${ErrorManager.getErrorMessage(err) || "خطای ناشناخته"}`);
    currentNavigate("/");
  }, []); // Empty dependency array for onErrorFetchContact

  const {
    isLoading: loading,
    executeAsync: executeFetchContact,
  } = useErrorHandler<{ data: ContactDetailType | null; error: string | null; fromCache: boolean }>(null, {
    showToast: false,
    onSuccess: onSuccessFetchContact,
    onError: onErrorFetchContact,
  });

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) {
        showError("شناسه مخاطب برای ویرایش یافت نشد.");
        navigateRef.current("/");
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
  }, [id, executeFetchContact]); // Removed navigate from here, as it's accessed via ref in callbacks

  if (loading) {
    return (
      <LoadingMessage message="در حال بارگذاری اطلاعات مخاطب..." />
    );
  }

  if (!initialContactData) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-4">
        <p className="text-gray-700 dark:text-gray-300">مخاطب برای ویرایش یافت نشد.</p>
        <CancelButton text="بازگشت به لیست مخاطبین" />
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