import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Phone, Mail, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ContactService } from "@/services/contact-service";
import { fetchWithCache, invalidateCache } from "@/utils/cache-helpers";
import { useSession } from "@/integrations/supabase/auth";
import LoadingMessage from "./LoadingMessage";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import EmptyState from './EmptyState';
import LoadingSpinner from './LoadingSpinner';

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
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  country?: string | null;
  notes?: string | null;
  phone_numbers: PhoneNumber[];
  email_addresses: EmailAddress[];
  avatar_url?: string | null;
}

interface ContactListProps {
  searchTerm: string;
  selectedGroup: string;
  companyFilter: string;
  sortOption: string;
}

const ContactItem = ({ contact, onContactDeleted, onContactEdited }: { contact: Contact; onContactDeleted: (id: string) => void; onContactEdited: (id: string) => void }) => {
  const navigate = useNavigate();
  const displayPhoneNumber = contact.phone_numbers.length > 0 ? contact.phone_numbers[0].phone_number : "بدون شماره";
  const displayEmail = contact.email_addresses.length > 0 ? contact.email_addresses[0].email_address : undefined;

  const onSuccessDelete = useCallback(() => {
    ErrorManager.notifyUser("مخاطب با موفقیت حذف شد.", 'success');
    onContactDeleted(contact.id);
  }, [contact.id, onContactDeleted]);

  const onErrorDelete = useCallback((err: Error) => {
    ErrorManager.logError(err, { component: 'ContactItem', action: 'deleteContact', contactId: contact.id });
  }, [contact.id]);

  const {
    isLoading: isDeleting,
    executeAsync: executeDelete,
  } = useErrorHandler(null, {
    maxRetries: 3,
    retryDelay: 1000,
    showToast: true,
    customErrorMessage: "خطا در حذف مخاطب",
    onSuccess: onSuccessDelete,
    onError: onErrorDelete,
  });

  const handleContactClick = () => {
    navigate(`/contacts/${contact.id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await executeDelete(async () => {
      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", contact.id);

      if (error) throw error;
    });
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
            <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-600/50 transition-all duration-200" onClick={(e) => e.stopPropagation()} disabled={isDeleting}>
              {isDeleting ? <LoadingSpinner size={20} /> : <Trash2 size={20} />}
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
              <AlertDialogAction onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold" disabled={isDeleting}>
                {isDeleting && <LoadingSpinner size={16} className="me-2" />}
                حذف
              </AlertDialogAction>
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

  const onSuccessFetch = useCallback((result: { data: Contact[] | null; error: string | null; fromCache: boolean }) => {
    if (result && !result.fromCache) {
      ErrorManager.notifyUser("مخاطبین با موفقیت بارگذاری شدند.", 'success');
    }
  }, []);

  const onErrorFetch = useCallback((err: Error) => {
    ErrorManager.logError(err, { component: 'ContactList', action: 'fetchContacts' });
  }, []);

  const {
    isLoading,
    executeAsync,
  } = useErrorHandler<{ data: Contact[] | null; error: string | null; fromCache: boolean }>(null, {
    maxRetries: 3,
    retryDelay: 1000,
    showToast: false,
    customErrorMessage: "خطا در بارگذاری مخاطبین",
    onSuccess: onSuccessFetch,
    onError: onErrorFetch,
  });

  const fetchContacts = useCallback(async () => {
    if (isSessionLoading || !session?.user) {
      setContacts([]);
      return;
    }

    const cacheKey = `contacts_list_${session.user.id}_${searchTerm}_${selectedGroup}_${companyFilter}_${sortOption}`;
    
    await executeAsync(async () => {
      const { data, error, fromCache } = await fetchWithCache<Contact[]>(
        cacheKey,
        async () => {
          const result = await ContactService.getFilteredContacts(
            session.user.id,
            searchTerm,
            selectedGroup,
            companyFilter,
            sortOption
          );
          return { data: result.data as Contact[], error: result.error };
        }
      );

      if (error) {
        throw new Error(error);
      }
      setContacts(data || []);
      return { data, error: null, fromCache };
    });
  }, [session, isSessionLoading, searchTerm, selectedGroup, companyFilter, sortOption, executeAsync]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleContactDeleted = (deletedId: string) => {
    const cacheKey = `contacts_list_${session?.user?.id}_${searchTerm}_${selectedGroup}_${companyFilter}_${sortOption}`;
    invalidateCache(cacheKey);
    fetchContacts();
  };

  const handleContactEdited = (editedId: string) => {
    const cacheKey = `contacts_list_${session?.user?.id}_${searchTerm}_${selectedGroup}_${companyFilter}_${sortOption}`;
    invalidateCache(cacheKey);
    fetchContacts();
  };

  if (isLoading || isSessionLoading) {
    return <LoadingMessage message="در حال بارگذاری مخاطبین..." />;
  }

  return (
    <div className="space-y-4">
      {contacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="هیچ مخاطبی یافت نشد."
          description="برای شروع، یک مخاطب جدید اضافه کنید."
        />
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