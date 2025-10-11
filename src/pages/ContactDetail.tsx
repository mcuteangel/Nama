import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { designTokens } from "@/lib/design-tokens";
import { fetchWithCache } from "@/utils/cache-helpers";
import LoadingMessage from "@/components/common/LoadingMessage";
import CancelButton from "@/components/common/CancelButton";
import { ErrorManager } from "@/lib/error-manager";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { useTranslation } from "react-i18next";
import { ContactDetailBasicInfo } from '@/components/contact-detail/ContactDetailBasicInfo';
import { ContactDetailContactMethods } from '@/components/contact-detail/ContactDetailContactMethods';
import { ContactDetailAddress } from '@/components/contact-detail/ContactDetailAddress';
import { ContactDetailSocialLinks } from '@/components/contact-detail/ContactDetailSocialLinks';
import { ContactDetailCustomFields } from '@/components/contact-detail/ContactDetailCustomFields';
import { ContactDetailNotes } from '@/components/contact-detail/ContactDetailNotes';
import { ContactDetailTimestamps } from '@/components/contact-detail/ContactDetailTimestamps';
import { FaMale, FaFemale } from "react-icons/fa";
import { Edit } from "lucide-react";
import { ModernTooltip, ModernTooltipTrigger, GradientButton, ModernTooltipContent } from "@/components/ui";
import PageHeader from "@/components/ui/PageHeader";

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

  // Extract assigned group from contact data
  const assignedGroup = contact?.contact_groups?.[0]?.groups || null;

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
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen w-full py-8 px-4 md:px-8">
        <div className="w-full max-w-6xl">
          <PageHeader
            title={`${contact.first_name} ${contact.last_name}`}
            description={contact.position && contact.company ?
              `${contact.position} در ${contact.company}` :
              contact.position || contact.company || t('contact_detail.contact_details')
            }
            showBackButton={true}
            className="mb-6 w-full"
          >
            <ModernTooltip>
              <ModernTooltipTrigger asChild>
                <GradientButton
                  gradientType="primary"
                  onClick={() => navigate(`/contacts/edit/${contact.id}`)}
                  className="flex items-center gap-2 px-4 py-2.5 font-medium rounded-xl text-white hover:text-white/90"
                  style={{
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  <Edit size={16} />
                  <span className="hidden sm:inline">{t('contact_detail.edit')}</span>
                </GradientButton>
              </ModernTooltipTrigger>
              <ModernTooltipContent>
                <p>{t('contact_detail.edit')}</p>
              </ModernTooltipContent>
            </ModernTooltip>
          </PageHeader>
        </div>

        {/* Cards Grid - Auto-fill */}
        <div className="w-full max-w-6xl mt-6">
          {/* Avatar Section - وسط صفحه زیر هدر */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div
                className="relative h-24 w-24 rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden shadow-lg"
                style={{
                  background: `radial-gradient(circle at center, ${designTokens.colors.primary[500]}, ${designTokens.colors.secondary[500]})`,
                  boxShadow: `0 8px 24px -4px rgba(0, 0, 0, 0.3)`,
                  border: `3px solid rgba(255, 255, 255, 0.1)`,
                }}
              >
                {contact.avatar_url ? (
                  <img
                    src={contact.avatar_url}
                    alt={`${contact.first_name} ${contact.last_name}`}
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : (
                  <span style={{ color: 'white' }}>
                    {contact.first_name?.[0]} {contact.last_name?.[0]}
                  </span>
                )}
              </div>

              {/* Gender Badge */}
              <div
                className="absolute -top-1 -left-1 w-8 h-8 rounded-full border-3 border-white flex items-center justify-center shadow-md"
                style={{
                  background: designTokens.colors.glass.background,
                  border: `2px solid ${designTokens.colors.glass.border}`,
                  backdropFilter: 'blur(10px)',
                }}
              >
                {contact.gender === 'male' ? (
                  <FaMale size={14} style={{ color: designTokens.colors.primary[500] }} />
                ) : contact.gender === 'female' ? (
                  <FaFemale size={14} style={{ color: designTokens.colors.secondary[500] }} />
                ) : (
                  <div className="w-3 h-3 rounded-full" style={{ background: designTokens.colors.gray[400] }} />
                )}
              </div>
            </div>
          </div>

          <div
            className="grid gap-4 md:gap-6"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gridAutoRows: 'minmax(160px, auto)',
            }}
          >
            {/* Basic Info - Always shown */}
            <ContactDetailBasicInfo
              contact={contact}
              getGenderLabel={getGenderLabel}
              getPreferredContactMethodLabel={getPreferredContactMethodLabel}
            />

            {/* Contact Methods */}
            <ContactDetailContactMethods
              phone_numbers={contact.phone_numbers}
              email_addresses={contact.email_addresses}
            />

            {/* Address */}
            <ContactDetailAddress contact={contact} />

            {/* Social Links */}
            <ContactDetailSocialLinks social_links={contact.social_links} />

            {/* Custom Fields */}
            <ContactDetailCustomFields custom_fields={contact.custom_fields} />

            {/* Notes - Full Width when present */}
            <ContactDetailNotes notes={contact.notes} />

            {/* Timestamps - Always shown */}
            <ContactDetailTimestamps
              created_at={contact.created_at}
              updated_at={contact.updated_at}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetail;