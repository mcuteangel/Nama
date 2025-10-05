import React from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "@/components/ui/PageHeader";
import LoadingMessage from "@/components/common/LoadingMessage";
import { InputSection } from "@/components/ai/suggestions/InputSection";
import { SuggestionsList } from "@/components/ai/suggestions/SuggestionsList";
import { EmptyState } from "@/components/ai/suggestions/EmptyState";
import AIBaseCard from "@/components/ai/AIBaseCard";
import GenderSuggestionManagement from "@/components/ai/GenderSuggestionManagement";
import SmartGroupManagement from "@/components/groups/SmartGroupManagement";
import DuplicateContactManagement from "@/components/DuplicateContactManagement";
import { useAISuggestions } from "@/hooks/use-ai-suggestions";

const AISuggestions: React.FC = () => {
  const { t } = useTranslation();

  const {
    // State
    rawTextInput,
    setRawTextInput,
    pendingSuggestions,
    isProcessingSuggestions,
    searchQuery,
    setSearchQuery,
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
    startListening,
    stopListening,
    browserSupportsSpeechRecognition,

    // Actions
    handleExtractAndEnqueue,
    handleProcessSuggestion,
    handleDiscardSuggestion,
    handleEditSuggestion,
    handleSelectSuggestion,
    handleBatchAccept,
    handleBatchDiscard,
  } = useAISuggestions();

  if (isSessionLoading) {
    return <LoadingMessage message={t('common.loading')} />;
  }

  if (extractorError || speechError) {
    return (
      <div className="text-center text-red-500 dark:text-red-400 p-4">
        <p>{t('ai_suggestions.extractor_error')}: {extractorError || speechError}</p>
        <button onClick={() => window.location.reload()} className="mt-4">{t('common.reload_page')}</button>
      </div>
    );
  }
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with PageHeader */}
        <PageHeader
          title={t('ai_suggestions.title', 'پیشنهادات هوش مصنوعی')}
          description={t('ai_suggestions.description', 'استخراج هوشمند اطلاعات مخاطبین از متن')}
          showBackButton={true}
          className="mb-6"
        />
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Input Section */}
          <div className="md:col-span-1">
            <InputSection
              rawTextInput={rawTextInput}
              setRawTextInput={setRawTextInput}
              isExtractorLoading={isExtractorLoading}
              isProcessingSuggestions={isProcessingSuggestions}
              isSavingOrUpdating={isSavingOrUpdating}
              browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
              isListening={isListening}
              startListening={startListening}
              stopListening={stopListening}
              onExtractAndEnqueue={handleExtractAndEnqueue}
            />
          </div>

          {/* Main AI Suggestions Card */}
          <div className="md:col-span-1">
            <AIBaseCard
              title={t('ai_suggestions.title', 'پیشنهادات هوش مصنوعی')}
              description={t('ai_suggestions.description', 'استخراج هوشمند اطلاعات مخاطبین از متن')}
              icon={<div className="w-6 h-6 bg-blue-400 rounded-full animate-pulse"></div>}
              variant="secondary"
              className="relative h-full"
            >
          <div className="space-y-6">
            {pendingSuggestions.length > 0 && (
              <SuggestionsList
                pendingSuggestions={pendingSuggestions}
                filteredSuggestions={filteredSuggestions}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                stats={stats}
                isBatchMode={isBatchMode}
                setIsBatchMode={setIsBatchMode}
                selectedSuggestions={selectedSuggestions}
                isLoadingSuggestions={isLoadingSuggestions}
                isSavingOrUpdating={isSavingOrUpdating}
                searchInputRef={searchInputRef}
                handleSelectSuggestion={handleSelectSuggestion}
                handleProcessSuggestion={handleProcessSuggestion}
                handleDiscardSuggestion={handleDiscardSuggestion}
                handleEditSuggestion={handleEditSuggestion}
                handleBatchAccept={handleBatchAccept}
                handleBatchDiscard={handleBatchDiscard}
              />
            )}

            {pendingSuggestions.length === 0 && !isLoadingSuggestions && !isProcessingSuggestions && !isSavingOrUpdating && (
              <EmptyState />
            )}
          </div>
            </AIBaseCard>
            </div>

          {/* AI Features Cards */}
          <div className="md:col-span-2">
            <SmartGroupManagement />
          </div>

          <AIBaseCard
            title={t('ai_suggestions.duplicate_management', 'مدیریت تکراری‌ها')}
            description={t('ai_suggestions.duplicate_contact_management_description', 'شناسایی و ادغام مخاطبین تکراری')}
            icon={<div className="w-6 h-6 bg-gray-500 rounded-full animate-pulse"></div>}
            variant="warning"
            compact
          >
                <DuplicateContactManagement />
          </AIBaseCard>

          <AIBaseCard
            title={t('ai_suggestions.gender_suggestion_title', 'پیشنهاد جنسیت')}
            description={t('ai_suggestions.gender_suggestion_description', 'پیشنهاد هوشمند جنسیت برای مخاطبین')}
            icon={<div className="w-6 h-6 bg-gray-500 rounded-full animate-pulse"></div>}
            variant="info"
            compact
          >
                <GenderSuggestionManagement />
          </AIBaseCard>
        </div>

        {/* Footer */}
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 p-2 rounded-full border">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              قدرت گرفته از هوش مصنوعی پیشرفته
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

AISuggestions.displayName = 'AISuggestions';

export default AISuggestions;