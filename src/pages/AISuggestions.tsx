import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { ModernTextarea } from "@/components/ui/modern-textarea";
import { GlassButton } from "@/components/ui/glass-button";
import { ModernTabs, ModernTabsList, ModernTabsTrigger, ModernTabsContent } from "@/components/ui/modern-tabs";
import { Sparkles, Mic, StopCircle, Search, Brain, Settings, Users, Wrench, Copy, Heart, CheckSquare, Square, CheckCircle, XCircle } from "lucide-react";
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
  const stats = useMemo(() => {
    const newContacts = pendingSuggestions.filter(s => s.type === 'new').length;
    const updates = pendingSuggestions.filter(s => s.type === 'update').length;
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
    <DashboardLayout title={t('ai_suggestions.title', 'پیشنهادات هوش مصنوعی')}>
      {/* Header with Compact Stats */}
      <div className="mb-6">
        <CompactStats
          newContacts={stats.newContacts}
          updates={stats.updates}
          total={stats.total}
          filtered={filteredSuggestions.length}
        />
      </div>

      {/* Main Tabs */}
      <ModernTabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
        aria-label="AI Suggestions Navigation"
        role="tabpanel"
      >
        <ModernTabsList className="grid w-full grid-cols-3 mb-6" role="tablist">
          <ModernTabsTrigger
            value="suggestions"
            className="flex items-center gap-2"
            role="tab"
            aria-selected={activeTab === 'suggestions'}
            aria-controls="suggestions-panel"
            id="suggestions-tab"
          >
            <Sparkles size={16} aria-hidden="true" />
            <span className="hidden sm:inline">{t('ai_suggestions.suggestions', 'پیشنهادات')}</span>
          </ModernTabsTrigger>
          <ModernTabsTrigger
            value="management"
            className="flex items-center gap-2"
            role="tab"
            aria-selected={activeTab === 'management'}
            aria-controls="management-panel"
            id="management-tab"
          >
            <Wrench size={16} aria-hidden="true" />
            <span className="hidden sm:inline">{t('ai_suggestions.management', 'مدیریت')}</span>
          </ModernTabsTrigger>
          <ModernTabsTrigger
            value="settings"
            className="flex items-center gap-2"
            role="tab"
            aria-selected={activeTab === 'settings'}
            aria-controls="settings-panel"
            id="settings-tab"
          >
            <Settings size={16} aria-hidden="true" />
            <span className="hidden sm:inline">{t('settings.title', 'تنظیمات')}</span>
          </ModernTabsTrigger>
        </ModernTabsList>

        {/* Suggestions Tab */}
        <ModernTabsContent
          value="suggestions"
          className="space-y-6"
          role="tabpanel"
          aria-labelledby="suggestions-tab"
          id="suggestions-panel"
        >
          {/* Input Section */}
          <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles size={24} className="text-blue-500" />
              <h3 className="text-xl font-bold">{t('ai_suggestions.extract_contacts', 'استخراج اطلاعات')}</h3>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <ModernTextarea
                  placeholder={t('ai_suggestions.enter_text', 'متن خود را وارد کنید...')}
                  value={rawTextInput}
                  onChange={(e) => setRawTextInput(e.target.value)}
                  variant="glass"
                  className="bg-white/50 dark:bg-gray-800/50 border-2 border-blue-200 dark:border-blue-700 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 min-h-[120px] pr-12 rounded-xl focus:ring-4 focus:ring-blue-300"
                  disabled={isExtractorLoading || isProcessingSuggestions || isSavingOrUpdating}
                />
                {browserSupportsSpeechRecognition && (
                  <GlassButton
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={isListening ? stopListening : startListening}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg transform hover:scale-110 transition-all duration-300"
                    disabled={isExtractorLoading || isProcessingSuggestions || isSavingOrUpdating}
                  >
                    {isListening ? <StopCircle size={20} className="animate-pulse" /> : <Mic size={20} />}
                  </GlassButton>
                )}
              </div>

              <GlassButton
                type="button"
                onClick={handleExtractAndEnqueue}
                disabled={!rawTextInput.trim() || isExtractorLoading || isProcessingSuggestions || isSavingOrUpdating}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {(isExtractorLoading || isProcessingSuggestions || isSavingOrUpdating) ? (
                  <LoadingSpinner size={20} className="animate-spin" />
                ) : (
                  <Sparkles size={20} className="animate-pulse" />
                )}
                <span>
                  {isExtractorLoading || isProcessingSuggestions || isSavingOrUpdating ? t('common.processing', 'در حال پردازش...') : t('ai_suggestions.extract_and_suggest', 'استخراج و پیشنهاد')}
                </span>
              </GlassButton>
            </div>
          </div>

          {/* Search & Results */}
          {pendingSuggestions.length > 0 && (
            <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Brain size={24} className="text-yellow-500 animate-pulse" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                      {t('ai_suggestions.smart_suggestions', 'پیشنهادات هوشمند')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {filteredSuggestions.length} {t('common.of', 'از')} {stats.total} {t('ai_suggestions.suggestions', 'پیشنهاد')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Batch Mode Toggle */}
                  <GlassButton
                    onClick={() => setIsBatchMode(!isBatchMode)}
                    variant={isBatchMode ? "gradient-primary" : "outline"}
                    className="flex items-center gap-2"
                  >
                    {isBatchMode ? <CheckSquare size={16} /> : <Square size={16} />}
                    {t('ai_suggestions.batch_mode', 'حالت گروهی')}
                  </GlassButton>
                  <div className="relative w-full sm:w-80">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder={t('common.search_suggestions', 'جستجو در پیشنهادات...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Batch Actions */}
              {isBatchMode && selectedSuggestions.size > 0 && (
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50/60 to-purple-50/60 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl border border-white/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckSquare size={20} className="text-blue-500" />
                      <span className="font-medium text-gray-800 dark:text-gray-100">
                        {selectedSuggestions.size} {t('ai_suggestions.selected', 'انتخاب شده')}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <GlassButton
                        onClick={handleBatchAccept}
                        variant="gradient-primary"
                        className="flex items-center gap-2"
                        disabled={isSavingOrUpdating}
                      >
                        <CheckCircle size={16} />
                        {t('ai_suggestions.accept_selected', 'پذیرش انتخاب شده‌ها')}
                      </GlassButton>
                      <GlassButton
                        onClick={handleBatchDiscard}
                        variant="destructive"
                        className="flex items-center gap-2"
                        disabled={isSavingOrUpdating}
                      >
                        <XCircle size={16} />
                        {t('ai_suggestions.discard_selected', 'رد انتخاب شده‌ها')}
                      </GlassButton>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {(isLoadingSuggestions || isSavingOrUpdating) && (
                <div className="text-center py-8">
                  <LoadingSpinner size={48} className="mx-auto mb-4 animate-spin text-blue-500" />
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {t('ai_suggestions.loading_suggestions', 'بارگذاری پیشنهادات...')}
                  </p>
                </div>
              )}

              {/* Suggestions List */}
              <div className="space-y-4">
                {filteredSuggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.id}
                    className="animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      {isBatchMode && (
                        <GlassButton
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSelectSuggestion(suggestion.id)}
                          className={`mt-2 flex-shrink-0 ${selectedSuggestions.has(suggestion.id) ? 'text-blue-500' : 'text-gray-400'}`}
                        >
                          {selectedSuggestions.has(suggestion.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                        </GlassButton>
                      )}
                      <div className="flex-1">
                        <AISuggestionCard
                          suggestion={suggestion}
                          onProcess={handleProcessSuggestion}
                          onDiscard={handleDiscardSuggestion}
                          onEdit={handleEditSuggestion}
                          isProcessing={isSavingOrUpdating}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Search Results */}
              {filteredSuggestions.length === 0 && searchQuery && (
                <div className="text-center py-8">
                  <Search size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    {t('common.no_results', 'نتیجه‌ای یافت نشد')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {t('common.no_results_for', 'هیچ نتیجه‌ای برای')} "{searchQuery}" {t('common.not_found', 'یافت نشد')}
                  </p>
                  <GlassButton
                    onClick={() => setSearchQuery('')}
                    variant="outline"
                    className="px-6 py-2 rounded-xl"
                  >
                    {t('common.clear_search', 'پاک کردن جستجو')}
                  </GlassButton>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {pendingSuggestions.length === 0 && !isLoadingSuggestions && !isProcessingSuggestions && !isSavingOrUpdating && (
            <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-12 border border-white/20 text-center">
              <div className="relative mb-8">
                <Sparkles size={80} className="mx-auto text-blue-400 animate-pulse" />
                <div className="absolute -top-4 -right-4">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full animate-ping"></div>
                  <div className="w-8 h-8 bg-yellow-400 rounded-full absolute top-0 left-0 animate-pulse"></div>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                {t('ai_suggestions.ready_to_start', 'آماده شروع هستیم!')} 🚀
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                {t('ai_suggestions.enter_text_to_start', 'متن خود را وارد کنید تا هوش مصنوعی شروع به کار کند')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
                  <p className="font-semibold text-blue-800 dark:text-blue-200 mb-2">💡 {t('common.hint', 'راهنمایی')}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">{t('ai_suggestions.enter_text_hint', 'متن خود را در کادر بالا وارد کنید')}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-700">
                  <p className="font-semibold text-purple-800 dark:text-purple-200 mb-2">🎤 {t('common.voice', 'صدا')}</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">{t('ai_suggestions.use_microphone_hint', 'از میکروفون برای ورود متن استفاده کنید')}</p>
                </div>
              </div>
            </div>
          )}
        </ModernTabsContent>

        {/* Management Tab */}
        <ModernTabsContent
          value="management"
          className="space-y-6"
          role="tabpanel"
          aria-labelledby="management-tab"
          id="management-panel"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="animate-in fade-in slide-in-from-left-4" style={{ animationDelay: '200ms' }}>
              <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Copy size={20} className="text-orange-500 animate-pulse" />
                  {t('ai_suggestions.duplicate_management', 'مدیریت تکراری‌ها')}
                </h3>
                <DuplicateContactManagement />
              </div>
            </div>

            <div className="animate-in fade-in slide-in-from-right-4" style={{ animationDelay: '400ms' }}>
              <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Users size={20} className="text-purple-500 animate-bounce" />
                  {t('ai_suggestions.group_management', 'مدیریت گروه‌ها')}
                </h3>
                <SmartGroupManagement />
              </div>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-left-4" style={{ animationDelay: '600ms' }}>
            <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Heart size={20} className="text-pink-500 animate-bounce" />
                {t('ai_suggestions.gender_suggestion_title', 'پیشنهاد جنسیت')}
              </h3>
              <GenderSuggestionManagement />
            </div>
          </div>
        </ModernTabsContent>

        {/* Settings Tab */}
        <ModernTabsContent
          value="settings"
          className="space-y-6"
          role="tabpanel"
          aria-labelledby="settings-tab"
          id="settings-panel"
        >
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

AISuggestions.displayName = 'AISuggestions';

export default AISuggestions;