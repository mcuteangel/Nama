import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Phone, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/integrations/supabase/auth";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { useNavigate } from "react-router-dom";

// Define types for contact data
interface PhoneNumber {
  phone_number: string;
}

interface EmailAddress {
  email_address: string;
}

interface Contact {
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
  avatarUrl?: string; // Assuming this might come from profiles or be generated
}

const ContactItem = ({ contact }: { contact: Contact }) => {
  const navigate = useNavigate();
  const displayPhoneNumber = contact.phone_numbers.length > 0 ? contact.phone_numbers[0].phone_number : "بدون شماره";
  const displayEmail = contact.email_addresses.length > 0 ? contact.email_addresses[0].email_address : undefined;

  const handleContactClick = () => {
    navigate(`/contacts/${contact.id}`);
  };

  return (
    <Card
      className="flex items-center justify-between p-4 glass rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01] cursor-pointer"
      onClick={handleContactClick}
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 border border-white/50 dark:border-gray-600/50">
          <AvatarImage src={contact?.avatarUrl} alt={contact?.first_name} />
          <AvatarFallback className="bg-blue-500 text-white dark:bg-blue-700">
            {contact?.first_name ? contact.first_name[0] : "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-lg text-gray-800 dark:text-gray-100">
            {contact?.first_name} {contact?.last_name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
            <Phone size={14} /> {displayPhoneNumber}
          </p>
          {displayEmail && (
            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <Mail size={14} /> {displayEmail}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-600/50 transition-all duration-200" onClick={(e) => e.stopPropagation()}>
          <Edit size={20} />
        </Button>
        <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-600/50 transition-all duration-200" onClick={(e) => e.stopPropagation()}>
          <Trash2 size={20} />
        </Button>
      </div>
    </Card>
  );
};

const ContactList = () => {
  const { session, isLoading: isSessionLoading } = useSession();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [isFetchingRemote, setIsFetchingRemote] = useState(false);

  useEffect(() => {
    const fetchContacts = async () => {
      if (isSessionLoading) return;

      if (!session?.user) {
        setContacts([]);
        setLoadingContacts(false);
        return;
      }

      let toastId: string | number | undefined;

      // 1. Try to load from local storage first
      const cachedData = localStorage.getItem('cachedContacts');
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          setContacts(parsedData as Contact[]);
          setLoadingContacts(false); // Data is available immediately
          showSuccess("مخاطبین از حافظه محلی بارگذاری شدند.");
        } catch (e) {
          console.error("Failed to parse cached contacts:", e);
          localStorage.removeItem('cachedContacts'); // Clear corrupted cache
        }
      } else {
        // If no cache, show loading toast immediately
        toastId = showLoading("در حال بارگذاری مخاطبین...");
      }

      setIsFetchingRemote(true); // Indicate that remote fetch is starting

      try {
        const { data, error } = await supabase
          .from("contacts")
          .select("*, phone_numbers(phone_number), email_addresses(email_address)")
          .eq("user_id", session.user.id);

        if (error) throw error;

        // 2. Update state and cache with fresh data
        setContacts(data as Contact[]);
        localStorage.setItem('cachedContacts', JSON.stringify(data));
        if (toastId) dismissToast(toastId); // Dismiss initial loading toast if it was shown
        showSuccess("مخاطبین با موفقیت از سرور به‌روزرسانی شدند.");
      } catch (error: any) {
        console.error("Error fetching contacts from Supabase:", error);
        if (toastId) dismissToast(toastId); // Dismiss initial loading toast
        showError(`خطا در بارگذاری مخاطبین از سرور: ${error.message || "خطای ناشناخته"}`);
        // If there was an error and no cached data was available, set contacts to empty
        if (!cachedData) {
          setContacts([]);
        }
      } finally {
        setLoadingContacts(false); // Final loading state update
        setIsFetchingRemote(false); // Remote fetch finished
      }
    };

    fetchContacts();
  }, [session, isSessionLoading]);

  if (loadingContacts && !isFetchingRemote) {
    return <p className="text-center text-gray-500 dark:text-gray-400">در حال بارگذاری مخاطبین...</p>;
  }

  return (
    <div className="space-y-4">
      {contacts.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">هیچ مخاطبی یافت نشد.</p>
      ) : (
        contacts.map((contact) => (
          <ContactItem key={contact.id} contact={contact} />
        ))
      )}
    </div>
  );
};

export default ContactList;