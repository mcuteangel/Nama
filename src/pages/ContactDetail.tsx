import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from "@/components/ui/modern-card";
import { ModernButton } from "@/components/ui/modern-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { ModernInput } from "@/components/ui/modern-input";
import { ModernTextarea } from "@/components/ui/modern-textarea";
import { Phone, Mail, Building, Briefcase, MapPin, Info, User, Users, Tag, CalendarClock, Gift, Link as LinkIcon, Linkedin, Twitter, Instagram, Send, HomeIcon, Globe, Map, ClipboardList } from "lucide-react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useJalaliCalendar } from "@/hooks/use-jalali-calendar";
import { fetchWithCache } from "@/utils/cache-helpers";
import LoadingMessage from "@/components/common/LoadingMessage";
import CancelButton from "@/components/common/CancelButton";
import { ErrorManager } from "@/lib/error-manager";
import { useErrorHandler } from "@/hooks/use-error-handler";

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

const getSocialIcon = (type: string) => {
  switch (type) {
    case 'linkedin': return <Linkedin size={16} />;
    case 'twitter': return <Twitter size={16} />;
    case 'instagram': return <Instagram size={16} />;
    case 'telegram': return <Send size={16} />;
    case 'website': return <LinkIcon size={16} />;
    default: return <LinkIcon size={16} />;
  }
};

const getSocialLabel = (type: string) => {
  switch (type) {
    case 'linkedin': return 'لینکدین';
    case 'twitter': return 'توییتر';
    case 'instagram': return 'اینستاگرام';
    case 'telegram': return 'تلگرام';
    case 'website': return 'وب‌سایت';
    default: return 'سایر';
  }
};

const getPreferredContactMethodLabel = (method: string | null | undefined) => {
  switch (method) {
    case 'email': return 'ایمیل';
    case 'phone': return 'تلفن';
    case 'sms': return 'پیامک';
    case 'any': return 'هر کدام';
    default: return 'نامشخص';
  }
};

const ContactDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<ContactDetailType | null>(null);
  const { formatDate } = useJalaliCalendar();

  const onSuccessFetchContact = useCallback((result: { data: ContactDetailType | null; error: string | null; fromCache: boolean }) => {
    setContact(result.data || null);
    if (!result.data) {
      showError("مخاطب یافت نشد.");
      navigate("/");
    } else {
      if (!result.fromCache) {
        showSuccess("جزئیات مخاطب با موفقیت بارگذاری شد.");
      }
    }
  }, [navigate]);

  const onErrorFetchContact = useCallback((err: Error) => {
    console.error("Error fetching contact details:", err);
    showError(`خطا در بارگذاری جزئیات مخاطب: ${ErrorManager.getErrorMessage(err) || "خطای ناشناخته"}`);
    navigate("/");
  }, [navigate]);

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
        showError("شناسه مخاطب یافت نشد.");
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
            return { data: null, error: "مخاطب یافت نشد." };
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

  const assignedGroup = contact?.contact_groups?.[0]?.groups || null;

  if (loading) {
    return (
      <LoadingMessage message="در حال بارگذاری جزئیات مخاطب..." />
    );
  }

  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-4">
        <p className="text-gray-700 dark:text-gray-300">مخاطب یافت نشد.</p>
        <CancelButton text="بازگشت به لیست مخاطبین" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full fade-in-up">
      <ModernCard variant="glass" hover="lift" className="w-full max-w-2xl">
        <ModernCardHeader className="text-center">
          <Avatar className="h-24 w-24 mx-auto mb-4 ring-4 ring-primary/20">
            <AvatarImage src={contact.avatar_url || undefined} alt={`${contact.first_name} ${contact.last_name}`} />
            <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-bold">
              {contact.first_name ? contact.first_name[0] : "?"}
            </AvatarFallback>
          </Avatar>
          <ModernCardTitle className="text-3xl font-bold text-gradient">
            {contact.first_name} {contact.last_name}
          </ModernCardTitle>
          <ModernCardDescription className="text-lg">
            جزئیات مخاطب
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><User size={16} /> جنسیت</Label>
              <ModernInput value={contact.gender === "male" ? "مرد" : contact.gender === "female" ? "زن" : "نامشخص"} readOnly variant="glass" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
            </div>
            {contact.position && (
              <div>
                <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><Briefcase size={16} /> سمت/شغل</Label>
                <ModernInput value={contact.position} readOnly variant="glass" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
              </div>
            )}
            {contact.company && (
              <div>
                <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><Building size={16} /> شرکت</Label>
                <ModernInput value={contact.company} readOnly variant="glass" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
              </div>
            )}
            {contact.street && (
              <div>
                <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><HomeIcon size={16} /> خیابان/کوچه</Label>
                <ModernInput value={contact.street} readOnly variant="glass" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
              </div>
            )}
            {contact.city && (
              <div>
                <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><Map size={16} /> شهر</Label>
                <ModernInput value={contact.city} readOnly variant="glass" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
              </div>
            )}
            {contact.state && (
              <div>
                <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><MapPin size={16} /> استان</Label>
                <ModernInput value={contact.state} readOnly variant="glass" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
              </div>
            )}
            {contact.zip_code && (
              <div>
                <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><Tag size={16} /> کد پستی</Label>
                <ModernInput value={contact.zip_code} readOnly variant="glass" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
              </div>
            )}
            {contact.country && (
              <div>
                <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><Globe size={16} /> کشور</Label>
                <ModernInput value={contact.country} readOnly variant="glass" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
              </div>
            )}
            <div>
              <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><Users size={16} /> گروه</Label>
              {assignedGroup ? (
                <ModernInput value={assignedGroup.name} readOnly variant="glass" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" style={{ backgroundColor: assignedGroup.color || 'transparent' }} />
              ) : (
                <ModernInput value="بدون گروه" readOnly variant="glass" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
              )}
            </div>
            {contact.birthday && (
              <div>
                <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><Gift size={16} /> تاریخ تولد</Label>
                <ModernInput value={formatDate(new Date(contact.birthday), 'jYYYY/jMM/jDD')} readOnly variant="glass" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
              </div>
            )}
            {contact.preferred_contact_method && (
              <div>
                <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><Mail size={16} /> روش ارتباط ترجیحی</Label>
                <ModernInput value={getPreferredContactMethodLabel(contact.preferred_contact_method)} readOnly variant="glass" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
              </div>
            )}
          </div>

          {contact.phone_numbers.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><Phone size={16} /> شماره تلفن‌ها</Label>
              {contact.phone_numbers.map((phone) => (
                <a key={phone.id} href={`tel:${phone.phone_number}`} className="block">
                  <ModernInput value={`${phone.phone_number} (${phone.phone_type})${phone.extension ? ` - داخلی: ${phone.extension}` : ''}`} readOnly variant="glass" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer" />
                </a>
              ))}
            </div>
          )}

          {contact.email_addresses.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><Mail size={16} /> آدرس‌های ایمیل</Label>
              {contact.email_addresses.map((email) => (
                <a key={email.id} href={`mailto:${email.email_address}`} className="block">
                  <ModernInput value={`${email.email_address} (${email.email_type})`} readOnly variant="glass" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer" />
                </a>
              ))}
            </div>
          )}

          {contact.social_links.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><LinkIcon size={16} /> لینک‌های شبکه‌های اجتماعی</Label>
              {contact.social_links.map((link) => (
                <div key={link.id} className="flex items-center gap-2 bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 rounded-md p-2">
                  {getSocialIcon(link.type)}
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400 text-sm">
                    {getSocialLabel(link.type)}: {link.url}
                  </a>
                </div>
              ))}
            </div>
          )}

          {contact.custom_fields.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><ClipboardList size={16} /> فیلدهای سفارشی</Label>
              {contact.custom_fields.map((field) => (
                <div key={field.id} className="flex flex-col gap-1">
                  <Label className="text-gray-700 dark:text-gray-200 text-sm font-medium">
                    {field.custom_field_templates && field.custom_field_templates.length > 0
                      ? `${field.custom_field_templates[0].name}:`
                      : 'نام فیلد نامشخص:'}
                  </Label>
                  {field.custom_field_templates && field.custom_field_templates.length > 0 && field.custom_field_templates[0].type === 'date' ? (
                    <ModernInput value={formatDate(new Date(field.field_value), 'jYYYY/jMM/jDD')} readOnly variant="glass" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
                  ) : (
                    <ModernInput value={field.field_value} readOnly variant="glass" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
                  )}
                </div>
              ))}
            </div>
          )}

          {contact.notes && (
            <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><Info size={16} /> یادداشت‌ها</Label>
              <ModernTextarea value={contact.notes} readOnly variant="glass" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><CalendarClock size={16} /> تاریخ ایجاد</Label>
              <ModernInput value={formatDate(new Date(contact.created_at), 'jYYYY/jMM/jDD HH:mm')} readOnly variant="glass" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
            </div>
            <div>
              <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><CalendarClock size={16} /> آخرین ویرایش</Label>
              <ModernInput value={formatDate(new Date(contact.updated_at), 'jYYYY/jMM/jDD HH:mm')} readOnly variant="glass" className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <ModernButton
              onClick={() => navigate(`/contacts/edit/${id}`)}
              variant="default"
              className="hover-lift"
            >
              ویرایش مخاطب
            </ModernButton>
            <CancelButton />
          </div>
        </ModernCardContent>
      </ModernCard>
      <MadeWithDyad />
    </div>
  );
};

export default ContactDetail;