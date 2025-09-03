import React, { useState, useCallback, useEffect, useMemo } from "react";
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { ModernTextarea } from "@/components/ui/modern-textarea";
import { GlassButton } from "@/components/ui/glass-button";
import { Sparkles, UserCheck, Mic, StopCircle, TrendingUp, PlusCircle, RefreshCw, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useContactExtractor } from "@/hooks/use-contact-extractor";
import { ErrorManager } from "@/lib/error-manager";
import LoadingMessage from "@/components/common/LoadingMessage";
import AISuggestionCard, { AISuggestion as AISuggestionCardProps } from "@/components/ai/AISuggestionCard";
import { ContactFormValues } from "@/types/contact";
import { ContactCrudService } from "@/services/contact-crud-service"; // Updated import
import { ContactListService } from "@/services/contact-list-service"; // Updated import
import { PhoneNumberFormData } from "@/types/contact";
import { useSession } from "@/integrations/supabase/auth";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { invalidateCache, fetchWithCache } from "@/utils/cache-helpers";
import { useNavigate } from "react-router-dom";
import { AISuggestionsService, AISuggestion as AISuggestionServiceType } from "@/services/ai-suggestions-service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SmartGroupManagement from "@/components/groups/SmartGroupManagement";
import DuplicateContactManagement from "@/components/DuplicateContactManagement";
import GenderSuggestionManagement from "@/components/ai/GenderSuggestionManagement";
import { useSpeechToText } from "@/hooks/use-speech-to-text";
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface AISuggestionDisplay extends AISuggestionCardProps {
  id: string;
}

const AISuggestions: React.FC = () => {
  const { t } = useTranslation();
  const { session, isLoading: isSessionLoading } = useSession();
  const navigate = useNavigate();

  const [rawTextInput, setRawTextInput] = useState('');
  const [pendingSuggestions, setPendingSuggestions] = useState<AISuggestionDisplay[]>([]);
  const [isProcessingSuggestions, setIsProcessingSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { enqueueContactExtraction, isLoading: isExtractorLoading, error: extractorError } = useContactExtractor();
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition,
    error: speechError,
  } = useSpeechToText();

  // Calculate statistics
  const stats = useMemo(() => {
    const newContacts = pendingSuggestions.filter(s => s.type === 'new').length;
    const updates = pendingSuggestions.filter(s => s.type === 'update').length;
    return { newContacts, updates, total: pendingSuggestions.length };
  }, [pendingSuggestions]);

  // Filter suggestions based on search query
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return pendingSuggestions;

    return pendingSuggestions.filter(suggestion => {
      const query = searchQuery.toLowerCase();
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

  // Update rawTextInput with transcript when listening
  useEffect(() => {
    if (isListening && transcript) {
      setRawTextInput(transcript);
    }
  }, [isListening, transcript]);

  // Define fetchPendingSuggestions first, as it's a dependency for other callbacks
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
        const { data: allContacts, error: fetchContactsError } = await ContactListService.getFilteredContacts( // Updated service call
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
            extracted.emailAddresses.some(e => contact.email_addresses.some((ce: { id: string; email_type: string; email_address: string }) => ce.email_address === e.email_address)) ||
            extracted.phoneNumbers.some(p => contact.phone_numbers.some((cp: PhoneNumberFormData) => cp.phone_number === p.phone_number))
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


  const onSuccessProcessContact = useCallback(() => {
    ErrorManager.notifyUser(t('ai_suggestions.contact_processed_success'), 'success');
    invalidateCache(`contacts_list_${session?.user?.id}_`);
    invalidateCache(`statistics_dashboard_${session?.user?.id}`);
    setRawTextInput(''); // Clear input text
    fetchPendingSuggestions(); // Refresh the list of suggestions
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
        const { error } = await ContactCrudService.addContact(contactValues); // Updated service call
        if (error) throw new Error(error);
      } else if (suggestion.type === 'update' && suggestion.existingContact) {
        const { error } = await ContactCrudService.updateContact(suggestion.existingContact.id, contactValues); // Updated service call
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

  if (extractorError || speechError) {
    return (
      <div className="text-center text-red-500 dark:text-red-400 p-4">
        <p>{t('ai_suggestions.extractor_error')}: {extractorError || speechError}</p>
        <GlassButton onClick={() => window.location.reload()} className="mt-4">{t('common.reload_page')}</GlassButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full">
      <ModernCard variant="glass" className="w-full max-w-6xl rounded-xl p-6">
        <ModernCardHeader className="text-center relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
            <Sparkles size={32} className="text-yellow-400 animate-bounce" />
          </div>
          <ModernCardTitle className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 animate-in fade-in slide-in-from-top-4">
            {t('ai_suggestions.title')}
          </ModernCardTitle>
          <ModernCardDescription className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            {t('ai_suggestions.description')}
          </ModernCardDescription>

          {/* Statistics Section */}
          {stats.total > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-3">
                  <PlusCircle size={24} className="text-blue-600 animate-pulse" />
                  <div>
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{stats.newContacts}</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">{t('ai_suggestions.new_contacts')}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-700">
                <div className="flex items-center gap-3">
                  <RefreshCw size={24} className="text-green-600 animate-spin" />
                  <div>
                    <p className="text-2xl font-bold text-green-800 dark:text-green-200">{stats.updates}</p>
                    <p className="text-sm text-green-600 dark:text-green-400">{t('ai_suggestions.updates')}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-3">
                  <TrendingUp size={24} className="text-purple-600 animate-bounce" />
                  <div>
                    <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">{stats.total}</p>
                    <p className="text-sm text-purple-600 dark:text-purple-400">{t('ai_suggestions.total_suggestions')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ModernCardHeader>
        <ModernCardContent className="space-y-6">
          <Tabs defaultValue="extract-info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="extract-info">{t('ai_suggestions.tab_extract_info')}</TabsTrigger>
              <TabsTrigger value="smart-management">{t('ai_suggestions.tab_smart_management')}</TabsTrigger>
              <TabsTrigger value="gender-suggestions">{t('ai_suggestions.tab_gender_suggestions')}</TabsTrigger>
            </TabsList>
            <TabsContent value="extract-info" className="space-y-6 pt-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <Sparkles size={20} className="text-blue-500" /> {t('ai_suggestions.input_section_title')}
                </h3>
                <div className="relative">
                  <ModernTextarea
                    placeholder={t('ai_suggestions.paste_text_placeholder')}
                    value={rawTextInput}
                    onChange={(e) => setRawTextInput(e.target.value)}
                    variant="glass"
                    className="bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-400 min-h-[150px] pr-12"
                    disabled={isExtractorLoading || isProcessingSuggestions || isSavingOrUpdating}
                  />
                  {browserSupportsSpeechRecognition && (
                    <GlassButton
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={isListening ? stopListening : startListening}
                      className="absolute top-2 right-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                      disabled={isExtractorLoading || isProcessingSuggestions || isSavingOrUpdating}
                    >
                      {isListening ? <StopCircle size={20} className="animate-pulse text-red-500" /> : <Mic size={20} />}
                    </GlassButton>
                  )}
                </div>
                <GlassButton
                  type="button"
                  onClick={handleExtractAndEnqueue}
                  disabled={!rawTextInput.trim() || isExtractorLoading || isProcessingSuggestions || isSavingOrUpdating}
                  className="w-full flex items-center gap-2 px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
                >
                  {(isExtractorLoading || isProcessingSuggestions || isSavingOrUpdating) && <LoadingSpinner size={16} className="me-2" />}
                  {isExtractorLoading || isProcessingSuggestions || isSavingOrUpdating ? t('ai_suggestions.processing_text') : t('ai_suggestions.extract_and_suggest_button')}
                </GlassButton>
              </div>

              {(isLoadingSuggestions || isSavingOrUpdating) && (
                <LoadingMessage message={t('ai_suggestions.loading_suggestions')} />
              )}

              {pendingSuggestions.length > 0 && (
                <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                      <UserCheck size={24} className="text-green-500 animate-pulse" />
                      <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        {t('ai_suggestions.suggestions_section_title')}
                      </span>
                      <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-semibold">
                        {filteredSuggestions.length} {t('ai_suggestions.items')}
                      </span>
                    </h3>

                    {/* Search Bar */}
                    <div className="relative w-full sm:w-80">
                      <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder={t('ai_suggestions.search_suggestions')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:gap-8">
                    {filteredSuggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.id}
                        className="animate-in fade-in slide-in-from-bottom-4"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <AISuggestionCard
                          suggestion={suggestion}
                          onProcess={handleProcessSuggestion}
                          onDiscard={handleDiscardSuggestion}
                          onEdit={handleEditSuggestion}
                          isProcessing={isSavingOrUpdating}
                        />
                      </div>
                    ))}
                  </div>

                  {filteredSuggestions.length === 0 && searchQuery && (
                    <div className="text-center py-8">
                      <Search size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 text-lg">
                        {t('ai_suggestions.no_search_results')}
                      </p>
                      <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                        {t('ai_suggestions.try_different_search')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {pendingSuggestions.length === 0 && !isLoadingSuggestions && !isProcessingSuggestions && !isSavingOrUpdating && (
                <div className="text-center py-12 px-6">
                  <div className="relative mb-6">
                    <Sparkles size={64} className="mx-auto text-blue-400 animate-pulse" />
                    <div className="absolute -top-2 -right-2">
                      <div className="w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
                      <div className="w-6 h-6 bg-yellow-400 rounded-full absolute top-0 left-0 animate-pulse"></div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                    {t('ai_suggestions.no_suggestions_found')}
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                    {t('ai_suggestions.no_suggestions_description')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg">
                      💡 {t('ai_suggestions.try_pasting_text')}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg">
                      🎤 {t('ai_suggestions.try_voice_input')}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="smart-management" className="space-y-6 pt-4">
              <SmartGroupManagement />
              <DuplicateContactManagement />
            </TabsContent>
            <TabsContent value="gender-suggestions" className="space-y-6 pt-4">
              <GenderSuggestionManagement />
            </TabsContent>
          </Tabs>
        </ModernCardContent>
      </ModernCard>
    </div>
  );
};

export default AISuggestions;