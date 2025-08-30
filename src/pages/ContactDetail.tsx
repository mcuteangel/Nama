import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { ModernGrid, GridItem } from "@/components/ui/modern-grid";
import { fetchWithCache } from "@/utils/cache-helpers";
import LoadingMessage from "@/components/common/LoadingMessage";
import CancelButton from "@/components/common/CancelButton";
import { ErrorManager } from "@/lib/error-manager";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ContactHeader } from "./contact-detail/ContactHeader";
import { BasicInfoCard } from "./contact-detail/BasicInfoCard";
import { AddressCard } from "./contact-detail/AddressCard";
import { ContactMethodsCard } from "./contact-detail/ContactMethodsCard";
import { SocialLinksCard } from "./contact-detail/SocialLinksCard";
import { CustomFieldsCard } from "./contact-detail/CustomFieldsCard";
import { NotesCard } from "./contact-detail/NotesCard";
import { TimestampsCard } from "./contact-detail/TimestampsCard";
import { useTranslation } from "react-i18next";

// Interfaces
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

interface GroupData {
  name: string;
  color?: string;
}

interface ContactGroup {
  group_id: string;
  groups: GroupData | null;
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
  gender: string;
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
  custom_fields: CustomField[];
  birthday?: string | null;
  avatar_url?: string | null;
  preferred_contact_method?: 'email' | 'phone' | 'sms' | 'any' | null;
  created_at: string;
  updated_at: string;
}

// Helper functions
const getGenderLabel = (gender: string, t: (key: string) => string) => {
  switch (gender) {
    case "male": return t('gender.male');
    case "female": return t('gender.female');
    default: return t('gender.not_specified');
  }
};

const getPreferredContactMethodLabel = (method: string | null | undefined, t: (key: string) => string) => {
  switch (method) {
    case 'email': return t('contact_method.email');
    case 'phone': return t('contact_method.phone');
    case 'sms': return t('contact_method.sms');
    case 'any': return t('contact_method.any');
    default: return t('gender.not_specified');
  }
};

// Main Component
const ContactDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [contact, setContact] = useState<ContactDetailType | null>(null);

  const onSuccessFetchContact = useCallback((result: { data: ContactDetailType | null; error: string | null; fromCache: boolean }) => {
    setContact(result.data || null);
    if (!result.data) {
      showError(t('contact.delete_error'));
      navigate("/");
    } else {
      if (!result.fromCache) {
        showSuccess(t('contact.delete_success'));
      }
    }
  }, [navigate, t]);

  const onErrorFetchContact = useCallback((err: Error) => {
    console.error("Error fetching contact details:", err);
    showError(`${t('contact.delete_error')}: ${ErrorManager.getErrorMessage(err) || t('common.unknown_error')}`);
    navigate("/");
  }, [navigate, t]);

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
        showError(t('contact.delete_error'));
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
              .select("id, first_name, last_name, gender, position, company, street, city, state, zip_code, country, notes, created_at, updated_at, birthday, avatar_url, preferred_contact_method, phone_numbers(id, phone_type, phone_number, extension), email_addresses(id, email_type, email_address), social_links(id, type, url), contact_groups(group_id, groups(name, color)), custom_fields(id, template_id, field_value, custom_field_templates(name, type, options))")
              .eq("id", id)
              .single();

            if (error) throw error;

            if (data) {
              return { data: data as unknown as ContactDetailType, error: null };
            }
            return { data: null, error: t('contact.delete_error') };
          }
        );

        if (error) {
          throw new Error(error);
        }
        return { data, error: null, fromCache };
      });
    };

    fetchDetails();
  }, [id, navigate, executeFetchContact, t]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-4 h-full w-full">
        <LoadingMessage message={t('loading_messages.loading_contacts')} />
      </div>
    );
  }

  // Error state
  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-4">
        <p className="text-gray-700 dark:text-gray-300">{t('contact.delete_error')}</p>
        <CancelButton text={t('common.cancel')} />
      </div>
    );
  }

  // Main content
  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-6 h-full w-full fade-in-up">
      <ContactHeader contact={contact} />
      
      {/* Main Content Grid */}
      <ModernGrid 
        variant="dynamic" 
        minWidth="300px" 
        gap="lg" 
        className="w-full max-w-4xl mx-auto"
      >
        <GridItem>
          <BasicInfoCard 
            contact={contact} 
            getGenderLabel={(gender) => getGenderLabel(gender, t)}
            getPreferredContactMethodLabel={(method) => getPreferredContactMethodLabel(method, t)}
          />
        </GridItem>
        
        {(contact.street || contact.city || contact.state || contact.zip_code || contact.country) && (
          <GridItem>
            <AddressCard contact={contact} />
          </GridItem>
        )}
        
        {(contact.phone_numbers.length > 0 || contact.email_addresses.length > 0) && (
          <GridItem>
            <ContactMethodsCard 
              phone_numbers={contact.phone_numbers} 
              email_addresses={contact.email_addresses} 
            />
          </GridItem>
        )}
        
        {contact.social_links.length > 0 && (
          <GridItem>
            <SocialLinksCard social_links={contact.social_links} />
          </GridItem>
        )}
        
        {contact.custom_fields.length > 0 && (
          <GridItem>
            <CustomFieldsCard custom_fields={contact.custom_fields} />
          </GridItem>
        )}
        
        {contact.notes && (
          <GridItem>
            <NotesCard notes={contact.notes} />
          </GridItem>
        )}
        
        <GridItem>
          <TimestampsCard 
            created_at={contact.created_at} 
            updated_at={contact.updated_at} 
          />
        </GridItem>
      </ModernGrid>
    </div>
  );
};

export default ContactDetail;