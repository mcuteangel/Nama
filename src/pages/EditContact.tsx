import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import ContactForm from "@/components/ContactForm";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  street?: string | null; // New: Detailed address field
  city?: string | null;    // New: Detailed address field
  state?: string | null;   // New: Detailed address field
  zip_code?: string | null; // New: Detailed address field
  country?: string | null; // New: Detailed address field
  notes?: string | null;
  phone_numbers: PhoneNumber[]; // Now an array
  email_addresses: EmailAddress[]; // Now an array
  social_links: SocialLink[]; // New: Social Links
  groupId?: string | null;
  birthday?: string | null;
  avatar_url?: string | null; // New: Avatar URL
  preferred_contact_method?: 'email' | 'phone' | 'sms' | 'any' | null; // New: Preferred contact method
  custom_fields: CustomField[];
  created_at: string;
  updated_at: string;
}

const EditContact = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initialContactData, setInitialContactData] = useState<ContactDetailType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactDetails = async () => {
      if (!id) {
        showError("شناسه مخاطب برای ویرایش یافت نشد.");
        navigate("/");
        return;
      }

      const toastId = showLoading("در حال بارگذاری اطلاعات مخاطب برای ویرایش...");
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("contacts")
          .select("id, first_name, last_name, gender, position, company, street, city, state, zip_code, country, notes, created_at, updated_at, birthday, avatar_url, preferred_contact_method, phone_numbers(id, phone_type, phone_number, extension), email_addresses(id, email_type, email_address), social_links(id, type, url), contact_groups(group_id), custom_fields(id, template_id, field_value, custom_field_templates(name, type, options))")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          const formattedData: ContactDetailType = {
            ...data,
            phone_numbers: data.phone_numbers || [],
            email_addresses: data.email_addresses || [],
            social_links: data.social_links || [], // New: Social Links
            groupId: data.contact_groups[0]?.group_id || null, // Ensure null for no group
            custom_fields: data.custom_fields || [],
          } as ContactDetailType;

          setInitialContactData(formattedData);
          showSuccess("اطلاعات مخاطب با موفقیت بارگذاری شد.");
        } else {
          showError("مخاطب برای ویرایش یافت نشد.");
          navigate("/");
        }
      } catch (error: any) {
        console.error("Error fetching contact details for edit:", error);
        showError(`خطا در بارگذاری اطلاعات مخاطب: ${error.message || "خطای ناشناخته"}`);
        navigate("/");
      } finally {
        dismissToast(toastId);
        setLoading(false);
      }
    };

    fetchContactDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-gray-700 dark:text-gray-300">در حال بارگذاری اطلاعات مخاطب...</p>
      </div>
    );
  }

  if (!initialContactData) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-4">
        <p className="text-gray-700 dark:text-gray-300">مخاطب برای ویرایش یافت نشد.</p>
        <Button onClick={() => navigate('/')} className="mt-4 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105">بازگشت به لیست مخاطبین</Button>
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