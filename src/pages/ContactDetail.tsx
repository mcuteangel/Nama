import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, Building, Briefcase, MapPin, Info, User } from "lucide-react";
import { MadeWithDyad } from "@/components/made-with-dyad";

interface PhoneNumber {
  id: string;
  phone_type: string;
  phone_number: string;
}

interface EmailAddress {
  id: string;
  email_type: string;
  email_address: string;
}

interface ContactDetailType {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  position?: string;
  company?: string;
  address?: string;
  notes?: string;
  phone_numbers: PhoneNumber[];
  email_addresses: EmailAddress[];
  created_at: string;
  updated_at: string;
  avatarUrl?: string; // Placeholder for avatar, if we implement it later
}

const ContactDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<ContactDetailType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactDetails = async () => {
      if (!id) {
        showError("شناسه مخاطب یافت نشد.");
        navigate("/"); // Redirect to contacts list if no ID
        return;
      }

      const toastId = showLoading("در حال بارگذاری جزئیات مخاطب...");
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("contacts")
          .select("*, phone_numbers(id, phone_type, phone_number), email_addresses(id, email_type, email_address)")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          setContact(data as ContactDetailType);
          showSuccess("جزئیات مخاطب با موفقیت بارگذاری شد.");
        } else {
          showError("مخاطب یافت نشد.");
          navigate("/"); // Redirect if contact not found
        }
      } catch (error: any) {
        console.error("Error fetching contact details:", error);
        showError(`خطا در بارگذاری جزئیات مخاطب: ${error.message || "خطای ناشناخته"}`);
        navigate("/"); // Redirect on error
      } finally {
        dismissToast(toastId);
        setLoading(false);
      }
    };

    fetchContactDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-800">
        <p className="text-gray-700 dark:text-gray-300">در حال بارگذاری جزئیات مخاطب...</p>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <p className="text-gray-700 dark:text-gray-300">مخاطب یافت نشد.</p>
        <Button onClick={() => navigate('/')} className="mt-4 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105">بازگشت به لیست مخاطبین</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-2xl backdrop-blur-lg bg-white/10 dark:bg-gray-800/10 border border-white/20 dark:border-gray-700/20 shadow-lg rounded-xl p-6">
        <CardHeader className="text-center">
          <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-blue-400 dark:border-blue-600">
            <AvatarImage src={contact.avatarUrl} alt={`${contact.first_name} ${contact.last_name}`} />
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
            {contact.address && (
              <div className="md:col-span-2">
                <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><MapPin size={16} /> آدرس</Label>
                <Textarea value={contact.address} readOnly className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
              </div>
            )}
          </div>

          {contact.phone_numbers.length > 0 && (
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><Phone size={16} /> شماره تلفن‌ها</Label>
              {contact.phone_numbers.map((phone) => (
                <Input key={phone.id} value={`${phone.phone_number} (${phone.phone_type})`} readOnly className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
              ))}
            </div>
          )}

          {contact.email_addresses.length > 0 && (
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><Mail size={16} /> آدرس‌های ایمیل</Label>
              {contact.email_addresses.map((email) => (
                <Input key={email.id} value={`${email.email_address} (${email.email_type})`} readOnly className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
              ))}
            </div>
          )}

          {contact.notes && (
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-1"><Info size={16} /> یادداشت‌ها</Label>
              <Textarea value={contact.notes} readOnly className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100" />
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => navigate('/')} variant="outline" className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold shadow-md transition-all duration-300 transform hover:scale-105 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 dark:border-gray-600">
              بازگشت
            </Button>
          </div>
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default ContactDetail;