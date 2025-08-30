import ContactForm from "@/components/ContactForm";
import { 
  ModernCard, 
  ModernCardHeader, 
  ModernCardTitle, 
  ModernCardDescription 
} from "@/components/ui/modern-card";
import { useEffect, useState, useMemo, Suspense } from "react";
import { ExtractedContactInfo } from "@/hooks/use-contact-extractor";
import { ContactFormValues } from "@/types/contact";
import { AISuggestionsService } from "@/services/ai-suggestions-service";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import { useSession } from "@/integrations/supabase/auth";
import { useTranslation } from "react-i18next";
import { ModernLoader } from "@/components/ui/modern-loader";

const AddContact = () => {
  const [prefillData, setPrefillData] = useState<ContactFormValues | undefined>(undefined);
  const [formLoaded, setFormLoaded] = useState(false);
  const { session } = useSession();
  const { t } = useTranslation();

  const { executeAsync: executeUpdateSuggestionStatus } = useErrorHandler(null, {
    showToast: false,
    onError: (err) => ErrorManager.logError(err, { component: 'AddContact', action: 'updateSuggestionStatus' }),
  });

  // Memoize the initial data processing to prevent unnecessary re-renders
  const processInitialData = useMemo(() => () => {
    const storedData = localStorage.getItem('ai_prefill_contact_data');
    const suggestionId = localStorage.getItem('ai_suggestion_id_to_update');

    if (storedData) {
      try {
        const extracted: ExtractedContactInfo = JSON.parse(storedData);
        const formattedData: ContactFormValues = {
          firstName: extracted.firstName || "",
          lastName: extracted.lastName || "",
          company: extracted.company || "",
          position: extracted.position || "",
          notes: extracted.notes || "",
          phoneNumbers: Array.isArray(extracted.phoneNumbers) ? extracted.phoneNumbers : [],
          emailAddresses: Array.isArray(extracted.emailAddresses) ? extracted.emailAddresses : [],
          socialLinks: Array.isArray(extracted.socialLinks) ? extracted.socialLinks : [],
          gender: "not_specified",
          groupId: null,
          birthday: null,
          avatarUrl: null,
          preferredContactMethod: null,
          street: null, city: null, state: null, zipCode: null, country: null,
          customFields: [],
        };
        
        // Clear local storage items after use
        localStorage.removeItem('ai_prefill_contact_data');
        localStorage.removeItem('ai_suggestion_id_to_update');
        
        return { formattedData, suggestionId };
      } catch (error) {
        console.error("Error parsing stored data:", error);
        localStorage.removeItem('ai_prefill_contact_data');
        localStorage.removeItem('ai_suggestion_id_to_update');
        return { formattedData: undefined, suggestionId: null };
      }
    }
    
    return { formattedData: undefined, suggestionId: null };
  }, []);

  useEffect(() => {
    const { formattedData, suggestionId } = processInitialData();
    if (formattedData) {
      setPrefillData(formattedData);

      // Update the suggestion status to 'edited' if it came from AI suggestions
      if (suggestionId && session?.user) {
        executeUpdateSuggestionStatus(async () => {
          const { success, error } = await AISuggestionsService.updateSuggestionStatus(suggestionId, 'edited');
          if (!success) throw new Error(error || 'Failed to update AI suggestion status to edited.');
        });
      }
    }
    
    // Mark form as loaded after initial data processing
    setFormLoaded(true);
  }, [processInitialData, session, executeUpdateSuggestionStatus]);

  return (
    <div className="flex flex-col items-center p-4 md:p-6 h-full w-full fade-in-up">
      <ModernCard 
        variant="glass" 
        hover="lift" 
        className="w-full max-w-4xl mb-6"
      >
        <ModernCardHeader className="text-center pb-4">
          <ModernCardTitle className="text-2xl md:text-3xl font-bold text-gradient heading-2">
            {t('contacts.add_new_contact')}
          </ModernCardTitle>
          <ModernCardDescription className="text-base md:text-lg mt-2">
            {t('contacts.add_contact_description')}
          </ModernCardDescription>
        </ModernCardHeader>
      </ModernCard>
      
      <div className="w-full max-w-4xl">
        {formLoaded ? (
          <Suspense fallback={
            <div className="flex justify-center items-center p-8">
              <ModernLoader variant="spinner" size="lg" />
            </div>
          }>
            <ContactForm initialData={prefillData} />
          </Suspense>
        ) : (
          <div className="flex justify-center items-center p-8">
            <ModernLoader variant="spinner" size="lg" />
          </div>
        )}
      </div>
    </div>
  );
};

export default AddContact;