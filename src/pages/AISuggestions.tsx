import React, { useState, useCallback, useEffect } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, PlusCircle, UserCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useContactExtractor, ExtractedContactInfo } from "@/hooks/use-contact-extractor";
import { ErrorManager } from "@/lib/error-manager";
import LoadingMessage from "@/components/LoadingMessage";
import AISuggestionCard, { AISuggestion as AISuggestionCardProps } from "@/components/AISuggestionCard"; // Renamed import
import { ContactFormValues, PhoneNumberFormData, EmailAddressFormData, SocialLinkFormData } from "@/types/contact";
import { ContactService } from "@/services/contact-service";
import { useSession } from "@/integrations/supabase/auth";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { invalidateCache, fetchWithCache } from "@/utils/cache-helpers";
import { useNavigate } from "react-router-dom";
import { AISuggestionsService, AISuggestion as AISuggestionServiceType } from "@/services/ai-suggestions-service"; // Import new service

interface ExistingContactSummary {
  id: string;
  first_name: string;
  last_name: string;
  email_addresses: { email_address: string }[];
  phone_numbers: { phone_number: string }[];
}

interface AISuggestionDisplay extends AISuggestionCardProps {
  id: string; // The ID of the suggestion in the ai_suggestions table
}

const AISuggestions: React.FC = () => {
  const { t } = useTranslation();
  const { session, isLoading: isSessionLoading } = useSession();
  const navigate = useNavigate();

  const [rawTextInput, setRawTextInput] = useState('');
  const [pendingSuggestions, setPendingSuggestions] = useState<AISuggestionDisplay[]>([]);
  const [isProcessingSuggestions, setIsProcessingSuggestions] = useState(false);

  const { enqueueContactExtraction, isLoading: isExtractorLoading, error: extractorError } = useContactExtractor();

  const onSuccessProcessContact = useCallback(() => {
    ErrorManager.notifyUser(t('ai_suggestions.contact_processed_success'), 'success');
    invalidateCache(`contacts_list_${session?.user?.id}_`);
    invalidateCache(`statistics_dashboard_${session?.user?.id}`);
    setRawTextInput(''); // Clear input text
    fetchPendingSuggestions(); // Refresh the list of suggestions
  }, [session, t]);

  const onErrorProcessContact = useCallback((err: Error) => {
    ErrorManager.logError(err, { component: 'AISuggestions', action: 'saveOrUpdateContact' });
  }, []);

  const {
    isLoading: isSavingOrUpdating,
    executeAsync: executeSaveOrUpdate,
  } = useErrorHandler(null, {
    showToast: true,
    customErrorMessage: t('ai_suggestions.error_processing_contact'),
    onSuccess: onSuccessProcessContact,
    onError: onErrorProcessContact,
  });

  const onSuccessFetchSuggestions = useCallback((result: { data: AISuggestionServiceType[] | null; error: string | null; fromCache: boolean }) => {
    if (result.data) {
      const formattedSuggestions: AISuggestionDisplay[] = result.data.map(s => ({
        id: s.id,
        type: 'new', // Default to new, will check for existing later
        extractedData: s.extracted_data,
      }));
      setPendingSuggestions(formattedSuggestions);
    }
  }, []);

  const onErrorFetchSuggestions = useCallback((err: Error) => {
    ErrorManager.logError(err, { component: 'AISuggestions', action: 'fetchPendingSuggestions' });
    ErrorManager.notifyUser(t('ai_suggestions.error_fetching_suggestions'), 'error');
  }, [t]);

  const {
    isLoading: isLoadingSuggestions,
    executeAsync: executeFetchSuggestions,
  } = useErrorHandler(null, {
    showToast: false,
    onSuccess: onSuccessFetchSuggestions,
    onError: onErrorFetchSuggestions,
  });

  const fetchPendingSuggestions = useCallback(async () => {
    if (isSessionLoading || !session?.user) {
      setPendingSuggestions([]);
      return;
    }

    const userId = session.user.id;
    const cacheKey = `ai_pending_suggestions_${userId}`;

    await executeFetchSuggestions(async () => {
      const { data, error, fromCache } = await fetchWithCache<AISuggestionServiceType[]>(
        cacheKey,
        async () => {
          const res = await AISuggestionsService.getPendingSuggestions(userId);
          if (res.error) {
            throw new Error(res.error);
          }
          return { data: res.data, error: null };
        }
      );

      if (error) {
        throw new Error(error);
      }

      // Now, for each fetched suggestion, check if it's an update or new
      const formattedSuggestions: AISuggestionDisplay[] = [];
      if (data) {
        const { data: allContacts, error: fetchContactsError } = await ContactService.getFilteredContacts(
          userId, "", "", "", "first_name_asc" // Fetch all contacts for comparison
        );

        if (fetchContactsError) {
          ErrorManager.notifyUser(`${t('ai_suggestions.error_fetching_existing_contacts')}: ${fetchContactsError}`, 'error');
          throw new Error(fetchContactsError);
        }

        for (const s of data) {
          const extracted = s.extracted_data;
          const existingContact = allContacts?.find(contact =>
            (contact.first_name === extracted.firstName && contact.last_name === extracted.lastName) ||
            extracted.emailAddresses.some(e => contact.email_addresses.some((ce: any) => ce.email_address === e.email_address)) ||
            extracted.phoneNumbers.some(p => contact.phone_numbers.some((cp: any) => cp.phone_number === p.phone_number))
          );

          if (existingContact) {
            formattedSuggestions.push({
              id: s.id,
              type: 'update',
              extractedData: extracted,
              existingContact: {
                id: existingContact.id,
                first_name: existingContact.first_name,
                last_name: existingContact.last_name,
                email_addresses: existingContact.email_addresses,
                phone_numbers: existingContact.phone_numbers,
              },
            });
          } else {
            formattedSuggestions.push({
              id: s.id,
              type: 'new',
              extractedData: extracted,
            });
          }
        }
      }
      setPendingSuggestions(formattedSuggestions);
      return { data, error: null, fromCache };
    });
  }, [session, isSessionLoading, executeFetchSuggestions, t]);

  useEffect(() => {
    fetchPendingSuggestions();
  }, [fetchPendingSuggestions]);

  const handleExtractAndEnqueue = useCallback(async () => {
    if (!rawTextInput.trim()) {
      ErrorManager.notifyUser(t('ai_suggestions.empty_text_for_extraction'), 'warning');
      return;
    }

    setIsProcessingSuggestions(true);
    const { success, error, suggestionId } = await enqueueContactExtraction(rawTextInput);

    if (success) {
      // Invalidate cache for pending suggestions to force a refetch
      invalidateCache(`ai_pending_suggestions_${session?.user?.id}`);
      fetchPendingSuggestions(); // Refresh the list immediately
    } else {
      ErrorManager.notifyUser(error || t('ai_suggestions.error_enqueuing_text'), 'error');
    }
    setIsProcessingSuggestions(false);
  }, [rawTextInput, enqueueContactExtraction, session, t, fetchPendingSuggestions]);

  const handleProcessSuggestion = useCallback(async (suggestion: AISuggestionDisplay) => {
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
      preferredContactMethod: null, // Default address fields
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
      // Update suggestion status in DB
      const { success, error: updateError } = await AISuggestionsService.updateSuggestionStatus(suggestion.id, 'accepted');
      if (!success) throw new Error(updateError || 'Failed to update suggestion status.');
    });
  }, [executeSaveOrUpdate]);

  const handleDiscardSuggestion = useCallback(async (suggestionId: string) => {
    await executeSaveOrUpdate(async () => {
      const { success, error } = await AISuggestionsService.updateSuggestionStatus(suggestionId, 'discarded');
      if (!success) throw new Error(error || 'Failed to discard suggestion.');
    });
  }, [executeSaveOrUpdate]);

  const handleEditSuggestion = useCallback((suggestion: AISuggestionDisplay) => {
    // Store the extracted data in local storage or a state management solution
    // Then navigate to the AddContact or EditContact page with pre-filled data
    localStorage.setItem('ai_prefill_contact_data', JSON.stringify(suggestion.extractedData));
    localStorage.setItem('ai_suggestion_id_to_update', suggestion.id); // Store suggestion ID to update its status later

    if (suggestion.type === 'update' && suggestion.existingContact) {
      navigate(`/contacts/edit/${suggestion.existingContact.id}`);
    } else {
      navigate('/add-contact');
    }
  }, [navigate]);

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
              onClick={handleExtractAndEnqueue}
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

          {(isLoadingSuggestions || isSavingOrUpdating) && (
            <LoadingMessage message={t('ai_suggestions.loading_suggestions')} />
          )}

          {pendingSuggestions.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <UserCheck size={20} className="text-green-500" /> {t('ai_suggestions.suggestions_section_title')}
              </h3>
              {pendingSuggestions.map((suggestion) => (
                <AISuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onProcess={handleProcessSuggestion}
                  onDiscard={handleDiscardSuggestion}
                  onEdit={handleEditSuggestion}
                  isProcessing={isSavingOrUpdating}
                />
              ))}
            </div>
          )}

          {pendingSuggestions.length === 0 && !isLoadingSuggestions && !isProcessingSuggestions && !isSavingOrUpdating && (
            <p className="text-center text-gray-500 dark:text-gray-400">{t('ai_suggestions.no_suggestions_found')}</p>
          )}
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default AISuggestions;