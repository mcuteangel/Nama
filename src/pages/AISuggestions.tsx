import React, { useState, useCallback, useEffect, useMemo } from "react";
import { ModernTextarea } from "@/components/ui/modern-textarea";
import { GlassButton } from "@/components/ui/glass-button";
import { ModernTabs, ModernTabsList, ModernTabsTrigger, ModernTabsContent } from "@/components/ui/modern-tabs";
import { Sparkles, UserCheck, Mic, StopCircle, Search, Brain, Zap, Settings, Users, Shield, FileText, Wrench } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useContactExtractor } from "@/hooks/use-contact-extractor";
import { ErrorManager } from "@/lib/error-manager";
import LoadingMessage from "@/components/common/LoadingMessage";
import AISuggestionCard, { AISuggestion as AISuggestionCardProps } from "@/components/ai/AISuggestionCard";
import { ContactFormValues } from "@/types/contact";
import { ContactCrudService } from "@/services/contact-crud-service";
import { ContactListService } from "@/services/contact-list-service";
import { PhoneNumberFormData } from "@/types/contact";
import { useSession } from "@/integrations/supabase/auth";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { invalidateCache, fetchWithCache } from "@/utils/cache-helpers";
import { useNavigate } from "react-router-dom";
import { AISuggestionsService, AISuggestion as AISuggestionServiceType } from "@/services/ai-suggestions-service";
import SmartGroupManagement from "@/components/groups/SmartGroupManagement";
import DuplicateContactManagement from "@/components/DuplicateContactManagement";
import GenderSuggestionManagement from "@/components/ai/GenderSuggestionManagement";
import GeminiSettings from "@/components/ai/GeminiSettings";
import { useSpeechToText } from "@/hooks/use-speech-to-text";
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import DashboardLayout from '@/components/ai/DashboardLayout';
import CompactStats from '@/components/ai/CompactStats';

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

  // Update rawTextInput with transcript when listening
  useEffect(() => {
    if (isListening && transcript) {
      setRawTextInput(transcript);
    }
  }, [isListening, transcript]);

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
      gender: "not_specified",
      groupId: null,
      birthday: null,
      avatarUrl: null,
      preferredContactMethod: null,
      street: null, city: null, state: null, zipCode: null, country: null,
      customFields: [],
    };

    await executeSaveOrUpdate(async () => {
      if (suggestion.type === 'new') {
        const { error } = await ContactCrudService.addContact(contactValues);
        if (error) throw new Error(error);
      } else if (suggestion.type === 'update' && suggestion.existingContact) {
        const { error } = await ContactCrudService.updateContact(suggestion.existingContact.id, contactValues);
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

  const handleEditSuggestion = useCallback((suggestion: AISuggestionDisplay) => {
    localStorage.setItem('ai_prefill_contact_data', JSON.stringify(suggestion.extractedData));
    localStorage.setItem('ai_suggestion_id_to_update', suggestion.id);

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
    <DashboardLayout
      title={t('ai_suggestions.title', 'پیشنهادات هوش مصنوعی')}
      description={t('ai_suggestions.description', 'مدیریت هوشمند مخاطبین با کمک هوش مصنوعی')}
      icon={<Brain size={64} className="text-blue-600" />}
      headerStats={stats.total > 0 ? <CompactStats {...stats} filtered={filteredSuggestions.length} /> : undefined}
    >
      <ModernTabs defaultValue="suggestions" className="w-full">
        <ModernTabsList className="grid w-full grid-cols-3 mb-6">
          <ModernTabsTrigger value="suggestions" className="flex items-center gap-2">
            <FileText size={16} />
            {t('ai_suggestions.tab_suggestions', 'پیشنهادات')}
          </ModernTabsTrigger>
          <ModernTabsTrigger value="management" className="flex items-center gap-2">
            <Wrench size={16} />
            {t('ai_suggestions.tab_management', 'مدیریت')}
          </ModernTabsTrigger>
          <ModernTabsTrigger value="settings" className="flex items-center gap-2">
            <Settings size={16} />
            {t('ai_suggestions.tab_settings', 'تنظیمات')}
          </ModernTabsTrigger>
        </ModernTabsList>

        {/* Suggestions Tab */}
        <ModernTabsContent value="suggestions" className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Sparkles size={20} className="text-blue-500" />
                  {t('ai_suggestions.input_section_title', 'ورود متن')}
                </h3>
                <div className="space-y-4">
                  <div className="relative">
                    <ModernTextarea
                      placeholder={t('ai_suggestions.input_placeholder', 'متن خود را وارد کنید...')}
                      value={rawTextInput}
                      onChange={(e) => setRawTextInput(e.target.value)}
                      className="min-h-[120px]"
                      disabled={isExtractorLoading || isProcessingSuggestions || isSavingOrUpdating}
                    />
                    {browserSupportsSpeechRecognition && (
                      <GlassButton
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={isListening ? stopListening : startListening}
                        className="absolute top-3 right-3 w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
                        disabled={isExtractorLoading || isProcessingSuggestions || isSavingOrUpdating}
                      >
                        {isListening ? <StopCircle size={20} /> : <Mic size={20} />}
                      </GlassButton>
                    )}
                  </div>
                  <GlassButton
                    onClick={handleExtractAndEnqueue}
                    disabled={!rawTextInput.trim() || isExtractorLoading || isProcessingSuggestions || isSavingOrUpdating}
                    className="w-full"
                  >
                    {(isExtractorLoading || isProcessingSuggestions || isSavingOrUpdating) ? (
                      <LoadingSpinner size={16} className="mr-2" />
                    ) : (
                      <Sparkles size={16} className="mr-2" />
                    )}
                    {isExtractorLoading || isProcessingSuggestions || isSavingOrUpdating
                      ? t('ai_suggestions.processing', 'در حال پردازش...')
                      : t('ai_suggestions.extract_and_suggest', 'استخراج و پیشنهاد')}
                  </GlassButton>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {/* Search */}
              {pendingSuggestions.length > 0 && (
                <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Sparkles size={24} className="text-yellow-500" />
                      <div>
                        <h3 className="text-lg font-bold">
                          {t('ai_suggestions.smart_suggestions', 'پیشنهادات هوشمند')}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {filteredSuggestions.length} {t('common.of', 'از')} {stats.total} {t('ai_suggestions.suggestions', 'پیشنهاد')}
                        </p>
                      </div>
                    </div>
                    <div className="relative w-full sm:w-80">
                      <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder={t('ai_suggestions.search_placeholder', 'جستجو در پیشنهادات...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {(isLoadingSuggestions || isSavingOrUpdating) && (
                <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center">
                  <LoadingSpinner size={32} className="mx-auto mb-4" />
                  <p className="text-lg font-semibold">
                    {t('ai_suggestions.loading_suggestions', 'بارگذاری پیشنهادات...')}
                  </p>
                </div>
              )}

              {/* Suggestions List */}
              {pendingSuggestions.length > 0 && (
                <div className="space-y-4">
                  {filteredSuggestions.map((suggestion, index) => (
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

              {/* Empty State */}
              {pendingSuggestions.length === 0 && !isLoadingSuggestions && !isProcessingSuggestions && !isSavingOrUpdating && (
                <EmptyState
                  icon={Sparkles}
                  title={t('ai_suggestions.ready_to_start', 'آماده شروع هستیم! 🚀')}
                  description={t('ai_suggestions.enter_text_to_start', 'متن خود را وارد کنید تا هوش مصنوعی شروع به کار کند')}
                />
              )}

              {/* No Search Results */}
              {filteredSuggestions.length === 0 && searchQuery && (
                <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center">
                  <Search size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">
                    {t('ai_suggestions.no_results_found', 'نتیجه‌ای یافت نشد')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {t('ai_suggestions.no_suggestions_for_query', 'هیچ پیشنهادی با عبارت')} "{searchQuery}" {t('ai_suggestions.found', 'یافت نشد')}
                  </p>
                  <GlassButton
                    onClick={() => setSearchQuery('')}
                    variant="outline"
                  >
                    {t('ai_suggestions.clear_search', 'پاک کردن جستجو')}
                  </GlassButton>
                </div>
              )}
            </div>
          </div>
        </ModernTabsContent>

        {/* Management Tab */}
        <ModernTabsContent value="management" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Users size={20} className="text-purple-500" />
                {t('ai_suggestions.smart_group_management_title', 'مدیریت گروه‌ها')}
              </h3>
              <SmartGroupManagement />
            </div>

            <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Shield size={20} className="text-orange-500" />
                {t('ai_suggestions.duplicate_contact_management_title', 'مدیریت تکراری‌ها')}
              </h3>
              <DuplicateContactManagement />
            </div>

            <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 lg:col-span-2">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <UserCheck size={20} className="text-pink-500" />
                {t('ai_suggestions.gender_suggestion_title', 'پیشنهاد جنسیت')}
              </h3>
              <GenderSuggestionManagement />
            </div>
          </div>
        </ModernTabsContent>

        {/* Settings Tab */}
        <ModernTabsContent value="settings" className="space-y-6">
          <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Settings size={20} className="text-blue-500" />
              {t('settings.gemini_settings', 'تنظیمات Gemini')}
            </h3>
            <GeminiSettings />
          </div>
        </ModernTabsContent>
      </ModernTabs>
    </DashboardLayout>
  );
};

export default AISuggestions;