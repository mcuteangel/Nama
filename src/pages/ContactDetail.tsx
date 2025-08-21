import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { showError, showLoading, showSuccess, dismissToast } from "@/utils/toast"; // Import toast functions
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, Building, Briefcase, MapPin, Info, User, Users, Tag, CalendarClock, Gift, Link as LinkIcon, Linkedin, Twitter, Instagram, Send, HomeIcon, Globe, Map, ClipboardList } from "lucide-react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useJalaliCalendar } from "@/hooks/use-jalali-calendar";
import { fetchWithCache } from "@/utils/cache-helpers";
import LoadingMessage from "@/components/LoadingMessage"; // Import LoadingMessage
import CancelButton from "@/components/CancelButton"; // Import CancelButton
import { ErrorManager } from "@/lib/error-manager"; // Import ErrorManager

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
  groups: Array<{
    name: string;
    color?: string;
  }> | null;
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
  const [loading, setLoading] = useState(true);
  const { formatDate } = useJalaliCalendar();

  useEffect(() => {
    const fetchContactDetails = async () => {
      if (!id) {
        showError("شناسه مخاطب یافت نشد.");
        navigate("/");
        return;
      }

      const cacheKey = `contact_detail_${id}`;
      setLoading(true);
      const toastId = showLoading("در حال بارگذاری جزئیات مخاطب..."); // Add toast

      try {
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
              return { data: data as ContactDetailType, error: null };
            }
            return { data: null, error: "مخاطب یافت نشد." };
          }
        );

        if (error) {
          throw new Error(error);
        }

        setContact(data || null);
        if (!data) {
          showError("مخاطب یافت نشد.");
          navigate("/");
        } else {
          if (!fromCache) { // Only show success toast if not from cache
            showSuccess("جزئیات مخاطب با موفقیت بارگذاری شد.");
          }
        }
      } catch (err: any) {
        console.error("Error fetching contact details:", err);
        showError(`خطا در بارگذاری جزئیات مخاطب: ${ErrorManager.getErrorMessage(err) || "خطای ناشناخته"}`); // Fixed: Use error directly
        navigate("/");
      } finally {
        dismissToast(toastId); // Dismiss toast
        setLoading(false);
      }
    };

    fetchContactDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <LoadingMessage message="در حال بارگذاری جزئیات مخاطب..." />
    );
  }

  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-4">
        <p className="text-gray-700 dark:text-gray-300">مخاطب یافت نشد.</p>
        <CancelButton text="بازگشت به لیست مخاطبین" /> {/* Use CancelButton */}
      </div>
    );
  }

  const assignedGroup = contact.contact_groups.length > 0 && contact.contact_groups[0].groups && contact.contact_groups[0].groups.length > 0
    ? contact.contact_groups[0].groups[0]
    : null;

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full">
      <Card className="w-full max-w-2xl glass rounded-xl p-6">
        <CardHeader className="text-center">
          <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-blue-400 dark:border-blue-600">
            <AvatarImage src={contact.avatar_url || undefined} alt={`${contact.first_name} ${contact.last_name}`} />
            <AvatarFallback className="bg-blue-500 text-white dark:bg-blue-700 text-4xl font-bold">
              {contact.first_name ? contact.first_name[0] : "?"}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            {contact.first_name} {contact.last_name}
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
            جزئیات مخاطب
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><User size={16} /> جنسیت</Label>
              <Input value={contact.gender === "male" ? "مرد" : contact.gender === "female" ? "زن" : "نامشخص"} readOnly className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
            </div>
            {contact.position && (
              <div>
                <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><Briefcase size={16} /> سمت/شغل</Label>
                <Input value={contact.position} readOnly className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
              </div>
            )}
            {contact.company && (
              <div>
                <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><Building size={16} /> شرکت</Label>
                <Input value={contact.company} readOnly className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
              </div>
            )}
            {contact.street && (
              <div>
                <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><HomeIcon size={16} /> خیابان/کوچه</Label>
                <Input value={contact.street} readOnly className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
              </div>
            )}
            {contact.city && (
              <div>
                <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><Map size={16} /> شهر</Label>
                <Input value={contact.city} readOnly className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
              </div>
            )}
            {contact.state && (
              <div>
                <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><MapPin size={16} /> استان</Label>
                <Input value={contact.state} readOnly className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
              </div>
            )}
            {contact.zip_code && (
              <div>
                <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><Tag size={16} /> کد پستی</Label>
                <Input value={contact.zip_code} readOnly className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
              </div>
            )}
            {contact.country && (
              <div>
                <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><Globe size={16} /> کشور</Label>
                <Input value={contact.country} readOnly className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
              </div>
            )}
            {assignedGroup && (
              <div>
                <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><Users size={16} /> گروه</Label>
                <Input value={assignedGroup.name} readOnly className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" style={{ backgroundColor: assignedGroup.color || 'transparent' }} />
              </div>
            )}
            {contact.birthday && (
              <div>
                <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><Gift size={16} /> تاریخ تولد</Label>
                <Input value={formatDate(new Date(contact.birthday), 'jYYYY/jMM/jDD')} readOnly className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
              </div>
            )}
            {contact.preferred_contact_method && (
              <div>
                <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><Mail size={16} /> روش ارتباط ترجیحی</Label>
                <Input value={getPreferredContactMethodLabel(contact.preferred_contact_method)} readOnly className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
              </div>
            )}
          </div>

          {contact.phone_numbers.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><Phone size={16} /> شماره تلفن‌ها</Label>
              {contact.phone_numbers.map((phone) => (
                <Input key={phone.id} value={`${phone.phone_number} (${phone.phone_type})${phone.extension ? ` - داخلی: ${phone.extension}` : ''}`} readOnly className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
              ))}
            </div>
          )}

          {contact.email_addresses.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><Mail size={16} /> آدرس‌های ایمیل</Label>
              {contact.email_addresses.map((email) => (
                <Input key={email.id} value={`${email.email_address} (${email.email_type})`} readOnly className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
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
                    <Input value={formatDate(new Date(field.field_value), 'jYYYY/jMM/jDD')} readOnly className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
                  ) : (
                    <Input value={field.field_value} readOnly className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
                  )}
                </div>
              ))}
            </div>
          )}

          {contact.notes && (
            <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><Info size={16} /> یادداشت‌ها</Label>
              <Textarea value={contact.notes} readOnly className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><CalendarClock size={16} /> تاریخ ایجاد</Label>
              <Input value={formatDate(new Date(contact.created_at), 'jYYYY/jMM/jDD HH:mm')} readOnly className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
            </div>
            <div>
              <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><CalendarClock size={16} /> آخرین ویرایش</Label>
              <Input value={formatDate(new Date(contact.updated_at), 'jYYYY/jMM/jDD HH:mm')} readOnly className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <CancelButton /> {/* Use CancelButton */}
          </div>
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default ContactDetail;