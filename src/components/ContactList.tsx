import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Phone, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/integrations/supabase/auth";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ContactService } from "@/services/contact-service"; // Import ContactService

// Define types for contact data
interface PhoneNumber {
  phone_number: string;
  phone_type: string;
  extension?: string | null;
}

interface EmailAddress {
  email_address: string;
  email_type: string;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  position?: string | null;
  company?: string | null;
  street?: string | null; // New: Detailed address field
  city?: string | null;    // New: Detailed address field
  state?: string | null;   // New: Detailed address field
  zip_code?: string | null; // New: Detailed address field
  country?: string | null; // New: Detailed address field
  notes?: string | null;
  phone_numbers: PhoneNumber[];
  email_addresses: EmailAddress[];
  avatar_url?: string | null; // New: Avatar URL
}

interface ContactListProps {
  searchTerm: string;
  selectedGroup: string;
  companyFilter: string;
  sortOption: string;
}

// Cache invalidation period (e.g., 5 minutes)
const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

const ContactItem = ({ contact, onContactDeleted, onContactEdited }: { contact: Contact; onContactDeleted: (id: string) => void; onContactEdited: (id: string) => void }) => {
  const navigate = useNavigate();
  const displayPhoneNumber = contact.phone_numbers.length > 0 ? contact.phone_numbers[0].phone_number : "بدون شماره";
  const displayEmail = contact.email_addresses.length > 0 ? contact.email_addresses[0].email_address : undefined;

  const handleContactClick = () => {
    navigate(`/contacts/${contact.id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const toastId = showLoading("در حال حذف مخاطب...");
    try {
      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", contact.id);

      if (error) throw error;

      showSuccess("مخاطب با موفقیت حذف شد.");
      onContactDeleted(contact.id);
    } catch (error: any) {
      console.error("Error deleting contact:", error);
      showError(`خطا در حذف مخاطب: ${error.message || "خطای ناشناخته"}`);
    } finally {
      dismissToast(toastId);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContactEdited(contact.id);
    navigate(`/contacts/edit/${contact.id}`);
  };

  return (
    <Card
      className="flex items-center justify-between p-4 glass rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01] cursor-pointer"
      onClick={handleContactClick}
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 border border-white/50 dark:border-gray-600/50">
          <AvatarImage src={contact?.avatar_url || undefined} alt={contact?.first_name} />
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
        <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-600/50 transition-all duration-200" onClick={handleEditClick}>
          <Edit size={20} />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-600/50 transition-all duration-200" onClick={(e) => e.stopPropagation()}>
              <Trash2 size={20} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass rounded-xl p-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-800 dark:text-gray-100">آیا از حذف این مخاطب مطمئن هستید؟</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                این عمل قابل بازگشت نیست. این مخاطب برای همیشه حذف خواهد شد.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100">لغو</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold">حذف</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
};

const ContactList = ({ searchTerm, selectedGroup, companyFilter, sortOption }: ContactListProps) => {
  const { session, isLoading: isSessionLoading } = useSession();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [isFetchingRemote, setIsFetchingRemote] = useState(false);

  const fetchContacts = useCallback(async (showLoadingToast: boolean = true) => {
    if (isSessionLoading) return;

    if (!session?.user) {
      setContacts([]);
      setLoadingContacts(false);
      return;
    }

    const cacheKey = `contacts_cache_${session.user.id}_${searchTerm}_${selectedGroup}_${companyFilter}_${sortOption}`;
    const cachedDataString = localStorage.getItem(cacheKey);
    let cachedData: { timestamp: number; contacts: Contact[] } | null = null;

    if (cachedDataString) {
      try {
        cachedData = JSON.parse(cachedDataString);
        const now = Date.now();
        const isCacheFresh = (now - cachedData.timestamp) < CACHE_EXPIRATION_TIME;

        if (isCacheFresh) {
          setContacts(cachedData.contacts);
          setLoadingContacts(false);
          setIsFetchingRemote(false); // No need to fetch remotely if cache is fresh
          return; // Exit early if cache is fresh
        } else {
          // Cache is stale, use it but revalidate in background
          setContacts(cachedData.contacts);
          setLoadingContacts(false);
          // Proceed to fetch remotely in background
        }
      } catch (e) {
        console.error("Failed to parse cached contacts:", e);
        localStorage.removeItem(cacheKey); // Clear corrupted cache
      }
    }

    // If no fresh cache, or cache is stale and we need to revalidate
    let toastId: string | number | undefined;
    if (showLoadingToast && (!cachedData || !cachedData.contacts || cachedData.contacts.length === 0)) {
      toastId = showLoading("در حال بارگذاری مخاطبین...");
    }
    
    setIsFetchingRemote(true);

    try {
      const { data, error } = await ContactService.getFilteredContacts(
        session.user.id,
        searchTerm,
        selectedGroup,
        companyFilter,
        sortOption
      );

      if (error) throw error;

      setContacts(data as Contact[]);
      localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), contacts: data }));
      if (toastId) dismissToast(toastId);
      if (showLoadingToast) showSuccess("مخاطبین با موفقیت بارگذاری شدند.");
    } catch (error: any) {
      console.error("Error fetching contacts from Supabase:", error);
      if (toastId) dismissToast(toastId);
      showError(`خطا در بارگذاری مخاطبین از سرور: ${error.message || "خطای ناشناخته"}`);
      if (!cachedData) { // Only clear contacts if no cached data was available at all
        setContacts([]);
      }
    } finally {
      setLoadingContacts(false);
      setIsFetchingRemote(false);
    }
  }, [session, isSessionLoading, searchTerm, selectedGroup, companyFilter, sortOption]);

  useEffect(() => {
    // Initial fetch on component mount or when dependencies change
    fetchContacts(true); // Show loading toast for initial fetch
  }, [fetchContacts]);

  const handleContactDeleted = (deletedId: string) => {
    // Invalidate cache and refetch after deletion
    localStorage.removeItem(`contacts_cache_${session?.user?.id}_${searchTerm}_${selectedGroup}_${companyFilter}_${sortOption}`);
    fetchContacts(false); // Don't show loading toast for background refetch
  };

  const handleContactEdited = (editedId: string) => {
    // Invalidate cache and refetch after edit
    localStorage.removeItem(`contacts_cache_${session?.user?.id}_${searchTerm}_${selectedGroup}_${companyFilter}_${sortOption}`);
    fetchContacts(false); // Don't show loading toast for background refetch
  };

  if (loadingContacts && !isFetchingRemote) {
    return <p className="text-center text-gray-500 dark:text-gray-400">در حال بارگذاری مخاطبین...</p>;
  }

  return (
    <div className="space-y-4">
      {contacts.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">هیچ مخاطبی یافت نشد.</p>
      ) : (
        contacts.map((contact) => (
          <ContactItem
            key={contact.id}
            contact={contact}
            onContactDeleted={handleContactDeleted}
            onContactEdited={handleContactEdited}
          />
        ))
      )}
    </div>
  );
};

export default ContactList;