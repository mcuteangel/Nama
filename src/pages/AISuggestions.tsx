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
    <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-pink-50/80 dark:from-gray-900/90 dark:via-purple-900/30 dark:to-pink-900/30 p-4 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with PageHeader */}
        <PageHeader
          title={t('ai_suggestions.title', 'پیشنهادات هوش مصنوعی')}
          description={t('ai_suggestions.description', 'استخراج هوشمند اطلاعات مخاطبین از متن')}
          showBackButton={true}
          className="mb-6"
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Main AI Suggestions Card */}
          <div className="xl:col-span-2">
            <AIBaseCard
              title={t('ai_suggestions.title', 'پیشنهادات هوش مصنوعی')}
              icon={<div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse"></div>}
              variant="gradient"
              className="relative overflow-hidden"
            >
          <div className="space-y-6">
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
          <AIBaseCard
            title={t('ai_suggestions.smart_group_management_title', 'مدیریت هوشمند گروه‌ها')}
            description={t('ai_suggestions.smart_group_management_description', 'پیشنهاد هوشمند گروه‌بندی مخاطبین')}
            icon={<div className="w-6 h-6 bg-purple-500 rounded-full animate-pulse"></div>}
            variant="secondary"
            compact
          >
            <SmartGroupManagement />
          </AIBaseCard>

          <AIBaseCard
            title={t('ai_suggestions.duplicate_management', 'مدیریت تکراری‌ها')}
            description={t('ai_suggestions.duplicate_contact_management_description', 'شناسایی و ادغام مخاطبین تکراری')}
            icon={<div className="w-6 h-6 bg-orange-500 rounded-full animate-pulse"></div>}
            variant="warning"
            compact
          >
                <DuplicateContactManagement />
          </AIBaseCard>

          <AIBaseCard
            title={t('ai_suggestions.gender_suggestion_title', 'پیشنهاد جنسیت')}
            description={t('ai_suggestions.gender_suggestion_description', 'پیشنهاد هوشمند جنسیت برای مخاطبین')}
            icon={<div className="w-6 h-6 bg-pink-500 rounded-full animate-pulse"></div>}
            variant="info"
            compact
          >
                <GenderSuggestionManagement />
          </AIBaseCard>
        </div>

        {/* Footer */}
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl px-4 py-2 rounded-full shadow-lg border border-white/20">
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