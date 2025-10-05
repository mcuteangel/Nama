import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useContactExtractor } from "@/hooks/use-contact-extractor";
import { useSpeechToText } from "@/hooks/use-speech-to-text";
import { useSession } from "@/integrations/supabase/auth";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import { invalidateCache, fetchWithCache } from "@/utils/cache-helpers";
import { useNavigate } from "react-router-dom";
import { ContactFormValues, EmailAddressFormData, PhoneNumberFormData } from "@/types/contact";
import { ContactCrudService } from "@/services/contact-crud-service";
import { ContactListService } from "@/services/contact-list-service";

interface ContactEmail {
  id: string;
  email_type: string;
  email_address: string;
}

interface ContactPhone {
  id: string;
  phone_type: string;
  phone_number: string;
}

interface ContactFromAPI {
  id: string;
  first_name: string;
  last_name: string;
  email_addresses: ContactEmail[];
  phone_numbers: ContactPhone[];
}
import { AISuggestionsService, AISuggestion as AISuggestionServiceType } from "@/services/ai-suggestions-service";
import { AISuggestionDisplay, SuggestionStats } from "@/types/ai-suggestions-display.types";
import { ContactExtractionSuggestion } from "@/types/ai-suggestions.types";

/**
 * Custom hook برای مدیریت state و logic صفحه پیشنهادات هوش مصنوعی
 */
export function useAISuggestions() {
  const { t } = useTranslation();
  const { session, isLoading: isSessionLoading } = useSession();
  const navigate = useNavigate();

  const [rawTextInput, setRawTextInput] = useState('');
  const [pendingSuggestions, setPendingSuggestions] = useState<AISuggestionDisplay[]>([]);
  const [isProcessingSuggestions, setIsProcessingSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('suggestions');
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const { enqueueContactExtraction, isLoading: isExtractorLoading, error: extractorError } = useContactExtractor();
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition,
    error: speechError,
  } = useSpeechToText();

  // Update rawTextInput with transcript when listening
  useEffect(() => {
    if (isListening && transcript) {
      setRawTextInput(transcript);
    }
  }, [isListening, transcript]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearchQuery('');
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Calculate statistics with useMemo for performance
  const stats = useMemo((): SuggestionStats => {
    const newContacts = pendingSuggestions.filter(s => s.type === 'contact_extraction').length;
    const updates = pendingSuggestions.filter(s => s.existingContact).length;
    return { newContacts, updates, total: pendingSuggestions.length };
  }, [pendingSuggestions]);

  // Filter suggestions based on search query with useMemo
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return pendingSuggestions;

    const query = searchQuery.toLowerCase();
    return pendingSuggestions.filter(suggestion => {
      const { extractedData } = suggestion;
      return (
        extractedData.firstName?.toLowerCase().includes(query) ||
        extractedData.lastName?.toLowerCase().includes(query) ||
        extractedData.company?.toLowerCase().includes(query) ||
        extractedData.position?.toLowerCase().includes(query) ||
        extractedData.emailAddresses.some(email => email.email_address.toLowerCase().includes(query)) ||
        extractedData.phoneNumbers.some(phone => phone.phone_number.includes(query))
      );
    });
  }, [pendingSuggestions, searchQuery]);

  // Handle tab change with accessibility
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    // انتقال focus به محتوای تب جدید برای دسترسی‌پذیری بهتر
    setTimeout(() => {
      const tabContent = document.querySelector(`[data-value="${value}"]`) as HTMLElement;
      tabContent?.focus();
    }, 100);
  }, []);

  // Define fetchPendingSuggestions first, as it's a dependency for other callbacks
  const onSuccessFetchSuggestions = useCallback((result: { data: AISuggestionServiceType[] | null; error: string | null; fromCache: boolean }) => {
    if (result.data) {
      const formattedSuggestions: AISuggestionDisplay[] = result.data.map(s => ({
        id: s.id,
        type: 'contact_extraction',
        extractedData: s.extracted_data,
        stats: {
          totalFields: [
            s.extracted_data.firstName,
            s.extracted_data.lastName,
            s.extracted_data.company,
            s.extracted_data.position,
            s.extracted_data.notes,
            ...s.extracted_data.phoneNumbers.map(p => p.phone_number),
            ...s.extracted_data.emailAddresses.map(e => e.email_address),
            ...s.extracted_data.socialLinks.map(s => s.url)
          ].filter(Boolean).length,
          confidence: {
            score: 85,
            factors: ['name_extraction', 'email_extraction'],
            lastUpdated: new Date()
          },
          dataQuality: 'good'
        },
        confidence: {
          score: 85,
          factors: ['name_extraction', 'email_extraction'],
          lastUpdated: new Date()
        },
        priority: 'medium',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        source: {
          text: s.extracted_data.firstName + ' ' + s.extracted_data.lastName,
          method: 'text_input',
          confidence: 85
        }
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
        const { data: allContacts, error: fetchContactsError } = await ContactListService.getFilteredContacts(
          userId, "", "", "", "first_name_asc"
        );

        if (fetchContactsError) {
          ErrorManager.notifyUser(`${t('ai_suggestions.error_fetching_existing_contacts')}: ${fetchContactsError}`, 'error');
          throw new Error(fetchContactsError);
        }

        for (const s of data) {
          const extracted = s.extracted_data;
          const existingContact = allContacts?.find(contact =>
            (contact.first_name === extracted.firstName && contact.last_name === extracted.lastName) ||
            extracted.emailAddresses.some(e => contact.email_addresses.some(ce => ce.email_address === e.email_address)) ||
            extracted.phoneNumbers.some(p => contact.phone_numbers.some(cp => cp.phone_number === p.phone_number))
          );

          if (existingContact) {
            formattedSuggestions.push({
              id: s.id,
              type: 'contact_extraction',
              extractedData: extracted,
              existingContact: existingContact ? {
                id: existingContact.id,
                firstName: existingContact.first_name,
                lastName: existingContact.last_name,
                emailAddresses: existingContact.email_addresses.map(e => e.email_address),
                phoneNumbers: existingContact.phone_numbers.map(p => p.phone_number),
                similarity: 95,
                matchType: 'exact'
              } : undefined,
              stats: {
                totalFields: [
                  extracted.firstName,
                  extracted.lastName,
                  extracted.company,
                  extracted.position,
                  extracted.notes,
                  ...extracted.phoneNumbers.map(p => p.phone_number),
                  ...extracted.emailAddresses.map(e => e.email_address),
                  ...extracted.socialLinks.map(s => s.url)
                ].filter(Boolean).length,
                confidence: {
                  score: 90,
                  factors: ['existing_contact_match'],
                  lastUpdated: new Date()
                },
                dataQuality: 'excellent'
              },
              confidence: {
                score: 90,
                factors: ['existing_contact_match'],
                lastUpdated: new Date()
              },
              priority: 'high',
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
              tags: [],
              source: {
                text: extracted.firstName + ' ' + extracted.lastName,
                method: 'text_input',
                confidence: 90
              }
            });
          } else {
            formattedSuggestions.push({
              id: s.id,
              type: 'contact_extraction',
              extractedData: extracted,
              stats: {
                totalFields: [
                  extracted.firstName,
                  extracted.lastName,
                  extracted.company,
                  extracted.position,
                  extracted.notes,
                  ...extracted.phoneNumbers.map(p => p.phone_number),
                  ...extracted.emailAddresses.map(e => e.email_address),
                  ...extracted.socialLinks.map(s => s.url)
                ].filter(Boolean).length,
                confidence: {
                  score: 85,
                  factors: ['name_extraction', 'email_extraction'],
                  lastUpdated: new Date()
                },
                dataQuality: 'good'
              },
              confidence: {
                score: 85,
                factors: ['name_extraction', 'email_extraction'],
                lastUpdated: new Date()
              },
              priority: 'medium',
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
              tags: [],
              source: {
                text: extracted.firstName + ' ' + extracted.lastName,
                method: 'text_input',
                confidence: 85
              }
            });
          }
        }
      }
      setPendingSuggestions(formattedSuggestions);
      return { data, error: null, fromCache };
    });
  }, [session, isSessionLoading, executeFetchSuggestions, t]);

  const onSuccessProcessContact = useCallback(() => {
    ErrorManager.notifyUser(t('ai_suggestions.contact_processed_success'), 'success');
    invalidateCache(`contacts_list_${session?.user?.id}_`);
    invalidateCache(`statistics_dashboard_${session?.user?.id}`);
    setRawTextInput('');
    fetchPendingSuggestions();
  }, [session, t, fetchPendingSuggestions]);

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

  useEffect(() => {
    fetchPendingSuggestions();
  }, [fetchPendingSuggestions]);

  const handleExtractAndEnqueue = useCallback(async () => {
    if (!rawTextInput.trim()) {
      ErrorManager.notifyUser(t('ai_suggestions.empty_text_for_extraction'), 'warning');
      return;
    }

    setIsProcessingSuggestions(true);
    const { success, error } = await enqueueContactExtraction(rawTextInput);

    if (success) {
      invalidateCache(`ai_pending_suggestions_${session?.user?.id}`);
      fetchPendingSuggestions();
    } else {
      ErrorManager.notifyUser(error || t('ai_suggestions.error_enqueuing_text'), 'error');
    }
    setIsProcessingSuggestions(false);
  }, [rawTextInput, enqueueContactExtraction, session, t, fetchPendingSuggestions]);

  const handleProcessSuggestion = useCallback(async (suggestion: ContactExtractionSuggestion) => {
    const contactValues: ContactFormValues = {
      firstName: suggestion.extractedData.firstName,
      lastName: suggestion.extractedData.lastName,
      company: suggestion.extractedData.company,
      position: suggestion.extractedData.position,
      notes: suggestion.extractedData.notes,
      phoneNumbers: suggestion.extractedData.phoneNumbers,
      emailAddresses: suggestion.extractedData.emailAddresses,
      socialLinks: suggestion.extractedData.socialLinks,
      gender: "not_specified",
      groupId: null,
      birthday: null,
      avatarUrl: null,
      preferredContactMethod: null,
      street: null, city: null, state: null, zipCode: null, country: null,
      customFields: [],
      tags: [],
    };

    await executeSaveOrUpdate(async () => {
      if (suggestion.existingContact) {
        const { error } = await ContactCrudService.updateContact(suggestion.existingContact.id, contactValues);
        if (error) throw new Error(error);
      } else {
        const { error } = await ContactCrudService.addContact(contactValues);
        if (error) throw new Error(error);
      }
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

  const handleEditSuggestion = useCallback((suggestion: ContactExtractionSuggestion) => {
    localStorage.setItem('ai_prefill_contact_data', JSON.stringify(suggestion.extractedData));
    localStorage.setItem('ai_suggestion_id_to_update', suggestion.id);

    if (suggestion.existingContact) {
      navigate(`/contacts/edit/${suggestion.existingContact.id}`);
    } else {
      navigate('/add-contact');
    }
  }, [navigate]);

  // Batch operations functions
  const handleSelectSuggestion = useCallback((suggestionId: string) => {
    setSelectedSuggestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(suggestionId)) {
        newSet.delete(suggestionId);
      } else {
        newSet.add(suggestionId);
      }
      return newSet;
    });
  }, []);

  const handleBatchAccept = useCallback(async () => {
    if (selectedSuggestions.size === 0) return;

    const selectedItems = filteredSuggestions.filter(s => selectedSuggestions.has(s.id));

    for (const suggestion of selectedItems) {
      await handleProcessSuggestion(suggestion);
    }

    setSelectedSuggestions(new Set());
    ErrorManager.notifyUser(t('ai_suggestions.batch_accept_success', { count: selectedItems.length }), 'success');
  }, [selectedSuggestions, filteredSuggestions, handleProcessSuggestion, t]);

  const handleBatchDiscard = useCallback(async () => {
    if (selectedSuggestions.size === 0) return;

    const selectedItems = filteredSuggestions.filter(s => selectedSuggestions.has(s.id));

    for (const suggestion of selectedItems) {
      await handleDiscardSuggestion(suggestion.id);
    }

    setSelectedSuggestions(new Set());
    ErrorManager.notifyUser(t('ai_suggestions.batch_discard_success', { count: selectedItems.length }), 'success');
  }, [selectedSuggestions, filteredSuggestions, handleDiscardSuggestion, t]);

  return {
    // State
    rawTextInput,
    setRawTextInput,
    pendingSuggestions,
    isProcessingSuggestions,
    searchQuery,
    setSearchQuery,
    activeTab,
    selectedSuggestions,
    isBatchMode,
    setIsBatchMode,
    searchInputRef,

    // Computed values
    stats,
    filteredSuggestions,
    isLoadingSuggestions,
    isSavingOrUpdating,
    isExtractorLoading,
    isSessionLoading,
    extractorError,
    speechError,

    // Speech recognition
    isListening,
    transcript,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition,

    // Actions
    handleTabChange,
    handleExtractAndEnqueue,
    handleProcessSuggestion,
    handleDiscardSuggestion,
    handleEditSuggestion,
    handleSelectSuggestion,
    handleBatchAccept,
    handleBatchDiscard,
  };
}
