import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Phone, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/integrations/supabase/auth";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { useNavigate } from "react-router-dom"; // Import useNavigate

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
  const navigate = useNavigate(); // Initialize useNavigate
  const displayPhoneNumber = contact.phone_numbers.length > 0 ? contact.phone_numbers[0].phone_number : "بدون شماره";
  const displayEmail = contact.email_addresses.length > 0 ? contact.email_addresses[0].email_address : undefined;

  const handleContactClick = () => {
    navigate(`/contacts/${contact.id}`); // Navigate to contact detail page
  };

  return (
    <Card
      className="flex items-center justify-between p-4 bg-white/20 dark:bg-gray-700/20 border border-white/30 dark:border-gray-600/30 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01] cursor-pointer" // Add cursor-pointer
      onClick={handleContactClick} // Add onClick handler
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
        <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-600/50 transition-all duration-200" onClick={(e) => e.stopPropagation()}> {/* Stop propagation to prevent navigation */}
          <Edit size={20} />
        </Button>
        <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-600/50 transition-all duration-200" onClick={(e) => e.stopPropagation()}> {/* Stop propagation */}
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

  useEffect(() => {
    const fetchContacts = async () => {
      if (isSessionLoading) return; // Wait for session to load

      if (!session?.user) {
        setContacts([]);
        setLoadingContacts(false);
        return;
      }

      const toastId = showLoading("در حال بارگذاری مخاطبین...");
      setLoadingContacts(true);

      try {
        const { data, error } = await supabase
          .from("contacts")
          .select("*, phone_numbers(phone_number), email_addresses(email_address)")
          .eq("user_id", session.user.id);

        if (error) throw error;

        setContacts(data as Contact[]);
        showSuccess("مخاطبین با موفقیت بارگذاری شدند.");
      } catch (error: any) {
        console.error("Error fetching contacts:", error);
        showError(`خطا در بارگذاری مخاطبین: ${error.message || "خطای ناشناخته"}`);
        setContacts([]);
      } finally {
        dismissToast(toastId);
        setLoadingContacts(false);
      }
    };

    fetchContacts();
  }, [session, isSessionLoading]); // Re-run when session or session loading state changes

  if (loadingContacts) {
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