import ContactForm from "@/components/ContactForm";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { ExtractedContactInfo } from "@/hooks/use-contact-extractor";
import { ContactFormValues } from "@/types/contact";
import { AISuggestionsService } from "@/services/ai-suggestions-service";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import { useSession } from "@/integrations/supabase/auth";
import { useNavigate } from "react-router-dom";

const AddContact = () => {
  const [prefillData, setPrefillData] = useState<ContactFormValues | undefined>(undefined);
  const { session } = useSession();
  const navigate = useNavigate();

  const { executeAsync: executeUpdateSuggestionStatus } = useErrorHandler(null, {
    showToast: false,
    onError: (err) => ErrorManager.logError(err, { component: 'AddContact', action: 'updateSuggestionStatus' }),
  });

  useEffect(() => {
    const storedData = localStorage.getItem('ai_prefill_contact_data');
    const suggestionId = localStorage.getItem('ai_suggestion_id_to_update');

    if (storedData) {
      const extracted: ExtractedContactInfo = JSON.parse(storedData);
      const formattedData: ContactFormValues = {
        firstName: extracted.firstName,
        lastName: extracted.lastName,
        company: extracted.company,
        position: extracted.position,
        notes: extracted.notes,
        phoneNumbers: extracted.phoneNumbers,
        emailAddresses: extracted.emailAddresses,
        socialLinks: extracted.socialLinks,
        gender: "not_specified", // Default value
        groupId: null, // Default value
        birthday: null, // Default value
        avatarUrl: null, // Default value
        preferredContactMethod: null, // Default value
        street: null, city: null, state: null, zipCode: null, country: null, // Default address fields
        customFields: [], // Default empty
      };
      setPrefillData(formattedData);

      // Clear local storage items after use
      localStorage.removeItem('ai_prefill_contact_data');
      localStorage.removeItem('ai_suggestion_id_to_update');

      // Update the suggestion status to 'edited' if it came from AI suggestions
      if (suggestionId && session?.user) {
        executeUpdateSuggestionStatus(async () => {
          const { success, error } = await AISuggestionsService.updateSuggestionStatus(suggestionId, 'edited');
          if (!success) throw new Error(error || 'Failed to update AI suggestion status to edited.');
        });
      }
    }
  }, [session, executeUpdateSuggestionStatus]);

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full">
      <Card className="w-full max-w-3xl glass rounded-xl p-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            افزودن مخاطب جدید
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            اطلاعات مخاطب جدید را وارد کنید.
          </CardDescription>
        </CardHeader>
        <ContactForm initialData={prefillData} />
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default AddContact;