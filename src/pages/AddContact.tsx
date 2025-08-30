import ContactForm from "@/components/ContactForm";
import { 
  ModernCard, 
  ModernCardHeader, 
  ModernCardTitle, 
  ModernCardDescription 
} from "@/components/ui/modern-card";
import { useEffect, useState } from "react";
import { ExtractedContactInfo } from "@/hooks/use-contact-extractor";
import { ContactFormValues } from "@/types/contact";
import { AISuggestionsService } from "@/services/ai-suggestions-service";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import { useSession } from "@/integrations/supabase/auth";

const AddContact = () => {
  const [prefillData, setPrefillData] = useState<ContactFormValues | undefined>(undefined);
  const { session } = useSession();

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
    <div className="flex flex-col items-center justify-center p-4 h-full w-full fade-in-up">
      <ModernCard variant="glass" hover="lift" className="w-full max-w-3xl">
        <ModernCardHeader className="text-center">
          <ModernCardTitle className="text-2xl font-bold text-gradient">
            افزودن مخاطب جدید
          </ModernCardTitle>
          <ModernCardDescription>
            اطلاعات مخاطب جدید را وارد کنید.
          </ModernCardDescription>
        </ModernCardHeader>
        <ContactForm initialData={prefillData} />
      </ModernCard>
    </div>
  );
};

export default AddContact;