import React, { useState, useCallback, useEffect } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, PlusCircle, UserCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useContactExtractor } from "@/hooks/use-contact-extractor";
import { ErrorManager } from "@/lib/error-manager";
import LoadingMessage from "@/components/LoadingMessage";
import AISuggestionCard from "@/components/AISuggestionCard";
import { ContactFormValues, PhoneNumberFormData, EmailAddressFormData, SocialLinkFormData } from "@/types/contact";
import { ContactService } from "@/services/contact-service";
import { useSession } from "@/integrations/supabase/auth";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { invalidateCache } from "@/utils/cache-helpers";
import { useNavigate } from "react-router-dom";

interface ExtractedContactInfo {
  firstName: string;
  lastName: string;
  company: string;
  position: string;
  phoneNumbers: PhoneNumberFormData[];
  emailAddresses: EmailAddressFormData[];
  socialLinks: SocialLinkFormData[];
  notes: string;
}

interface ExistingContactSummary {
  id: string;
  first_name: string;
  last_name: string;
  email_addresses: { email_address: string }[];
  phone_numbers: { phone_number: string }[];
}

interface AISuggestion {
  type: 'new' | 'update';
  extractedData: ExtractedContactInfo;
  existingContact?: ExistingContactSummary;
}

const AISuggestions: React.FC = () => {
  const { t } = useTranslation();
  const { session, isLoading: isSessionLoading } = useSession();
  const navigate = useNavigate();

  const [rawTextInput, setRawTextInput] = useState('');
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isProcessingSuggestions, setIsProcessingSuggestions] = useState(false);

  const { extractContactInfo, isLoading: isExtractorLoading, error: extractorError } = useContactExtractor();

  const {
    isLoading: isSavingOrUpdating,
    executeAsync: executeSaveOrUpdate,
  } = useErrorHandler(null, {
    showToast: true,
    customErrorMessage: t('ai_suggestions.error_processing_contact'),
    onSuccess: () => {
      ErrorManager.notifyUser(t('ai_suggestions.contact_processed_success'), 'success');
      invalidateCache(`contacts_list_${session?.user?.id}_`);
      invalidateCache(`statistics_dashboard_${session?.user?.id}`);
      setSuggestions([]); // Clear suggestions after processing
      setRawTextInput(''); // Clear input text
    },
    onError: (err) => {
      ErrorManager.logError(err, { component: 'AISuggestions', action: 'saveOrUpdateContact' });
    },
  });

  const handleExtractAndSuggest = useCallback(async () => {
    if (!rawTextInput.trim()) {
      ErrorManager.notifyUser(t('ai_suggestions.empty_text_for_extraction'), 'warning');
      return;
    }

    setIsProcessingSuggestions(true);
    setSuggestions([]); // Clear previous suggestions

    const extracted = await extractContactInfo(rawTextInput);

    if (extracted) {
      if (!session?.user?.id) {
        ErrorManager.notifyUser(t('common.auth_required'), 'error');
        setIsProcessingSuggestions(false);
        return;
      }

      // Fetch all contacts for comparison
      const { data: allContacts, error: fetchContactsError } = await ContactService.getFilteredContacts(
        session.user.id, "", "", "", "first_name_asc" // Fetch all contacts
      );

      if (fetchContactsError) {
        ErrorManager.notifyUser(`${t('ai_suggestions.error_fetching_existing_contacts')}: ${fetchContactsError}`, 'error');
        setIsProcessingSuggestions(false);
        return;
      }

      const existingContact = allContacts?.find(contact =>
        (contact.first_name === extracted.firstName && contact.last_name === extracted.lastName) ||
        extracted.emailAddresses.some(e => contact.email_addresses.some((ce: any) => ce.email_address === e.email_address)) ||
        extracted.phoneNumbers.some(p => contact.phone_numbers.some((cp: any) => cp.phone_number === p.phone_number))
      );

      if (existingContact) {
        setSuggestions([{
          type: 'update',
          extractedData: extracted,
          existingContact: {
            id: existingContact.id,
            first_name: existingContact.first_name,
            last_name: existingContact.last_name,
            email_addresses: existingContact.email_addresses,
            phone_numbers: existingContact.phone_numbers,
          },
        }]);
      } else {
        setSuggestions([{
          type: 'new',
          extractedData: extracted,
        }]);
      }
    }
    setIsProcessingSuggestions(false);
  }, [rawTextInput, extractContactInfo, session, t]);

  const handleProcessSuggestion = useCallback(async (suggestion: AISuggestion) => {
    const contactValues: ContactFormValues = {
      firstName: suggestion.extractedData.firstName,
      lastName: suggestion.extractedData.lastName,
      company: suggestion.extractedData.company,
      position: suggestion.extractedData.position,
      notes: suggestion.extractedData.notes,
      phoneNumbers: suggestion.extractedData.phoneNumbers,
      emailAddresses: suggestion.extractedData.emailAddresses,
      socialLinks: suggestion.extractedData.socialLinks,
      gender: "not_specified", // Default value
      groupId: null, // Default value
      birthday: null, // Default value
      avatarUrl: null, // Default value
      preferredContactMethod: null, // Default value
      street: null, city: null, state: null, zipCode: null, country: null, // Default address fields
      customFields: [], // Default empty
    };

    await executeSaveOrUpdate(async () => {
      if (suggestion.type === 'new') {
        const { error } = await ContactService.addContact(contactValues);
        if (error) throw new Error(error);
      } else if (suggestion.type === 'update' && suggestion.existingContact) {
        const { error } = await ContactService.updateContact(suggestion.existingContact.id, contactValues);
        if (error) throw new Error(error);
      }
    });
  }, [executeSaveOrUpdate]);

  if (isSessionLoading) {
    return <LoadingMessage message={t('common.loading')} />;
  }

  if (extractorError) {
    return (
      <div className="text-center text-red-500 dark:text-red-400 p-4">
        <p>{t('ai_suggestions.extractor_error')}: {extractorError}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">{t('common.reload_page')}</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full">
      <Card className="w-full max-w-4xl glass rounded-xl p-6">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {t('ai_suggestions.title')}
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
            {t('ai_suggestions.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Sparkles size={20} className="text-blue-500" /> {t('ai_suggestions.input_section_title')}
            </h3>
            <Textarea
              placeholder={t('ai_suggestions.paste_text_placeholder')}
              value={rawTextInput}
              onChange={(e) => setRawTextInput(e.target.value)}
              className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 min-h-[150px]"
              disabled={isExtractorLoading || isProcessingSuggestions || isSavingOrUpdating}
            />
            <Button
              type="button"
              onClick={handleExtractAndSuggest}
              disabled={!rawTextInput.trim() || isExtractorLoading || isProcessingSuggestions || isSavingOrUpdating}
              className="w-full flex items-center gap-2 px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
            >
              {isExtractorLoading || isProcessingSuggestions ? (
                <Loader2 size={16} className="me-2 animate-spin" />
              ) : (
                <Sparkles size={16} className="me-2" />
              )}
              {isExtractorLoading || isProcessingSuggestions ? t('ai_suggestions.processing_text') : t('ai_suggestions.extract_and_suggest_button')}
            </Button>
          </div>

          {suggestions.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <UserCheck size={20} className="text-green-500" /> {t('ai_suggestions.suggestions_section_title')}
              </h3>
              {suggestions.map((suggestion, index) => (
                <AISuggestionCard
                  key={index}
                  suggestion={suggestion}
                  onProcess={handleProcessSuggestion}
                  isProcessing={isSavingOrUpdating}
                />
              ))}
            </div>
          )}

          {(isExtractorLoading || isProcessingSuggestions || isSavingOrUpdating) && (
            <LoadingMessage message={t('ai_suggestions.loading_suggestions')} />
          )}

          {suggestions.length === 0 && !isExtractorLoading && !isProcessingSuggestions && !isSavingOrUpdating && rawTextInput.trim() && (
            <p className="text-center text-gray-500 dark:text-gray-400">{t('ai_suggestions.no_suggestions_found')}</p>
          )}
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default AISuggestions;