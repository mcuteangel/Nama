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
import { Brain, Sparkles, Users, VenetianMask, ScanText } from "lucide-react";

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
            <div className="h-full">
              <AIBaseCard
                title={t('ai_suggestions.input_section_title', 'ورود اطلاعات')}
                description={t('ai_suggestions.input_section_description', 'متن خود را وارد کنید یا از قابلیت گفتار به متن استفاده کنید')}
                icon={<ScanText className="w-5 h-5 text-indigo-400" />}
                variant="gradient"
                className="h-full backdrop-blur-lg bg-gradient-to-br from-indigo-500/10 to-blue-500/10 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl shadow-xl border border-indigo-200/30 dark:border-indigo-800/30"
                headerClassName="px-6 pt-4 pb-2"
              >
                <div className="p-1">
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
              </AIBaseCard>
            </div>
          </div>

          {/* Main AI Suggestions Card */}
          <div className="md:col-span-1">
            <AIBaseCard
              title={t('ai_suggestions.title', 'پیشنهادات هوشمند')}
              description={t('ai_suggestions.description', 'پیشنهادات استخراج شده از متن ورودی')}
              icon={<ScanText className="w-5 h-5 text-indigo-400" />}
              variant="gradient"
              className="relative h-full backdrop-blur-lg bg-gradient-to-br from-indigo-500/10 to-blue-500/10 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl shadow-xl border border-indigo-200/30 dark:border-indigo-800/30"
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
            <AIBaseCard
              title={t('ai_suggestions.smart_group_management_title', 'مدیریت گروه‌های هوشمند')}
              description={t('ai_suggestions.smart_group_management_description', 'ایجاد و مدیریت خودکار گروه‌های مخاطبین')}
              icon={<Brain className="w-5 h-5 text-purple-500" />}
              variant="gradient"
              className="h-full backdrop-blur-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 dark:from-purple-900/30 dark:to-blue-900/30 rounded-2xl shadow-xl border border-purple-200/30 dark:border-purple-800/30"
              headerClassName="px-6 pt-4 pb-2"
            >
              <SmartGroupManagement />
            </AIBaseCard>
          </div>

          <AIBaseCard
            title={t('ai_suggestions.duplicate_management', 'مدیریت تکراری‌ها')}
            description={t('ai_suggestions.duplicate_contact_management_description', 'شناسایی و ادغام خودکار مخاطبین تکراری')}
            icon={<Users className="w-5 h-5 text-amber-500" />}
            variant="warning"
            className="h-full backdrop-blur-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl shadow-xl border border-amber-200/30 dark:border-amber-800/30"
            headerClassName="px-6 pt-4 pb-2"
          >
            <DuplicateContactManagement />
          </AIBaseCard>

          <AIBaseCard
            title={t('ai_suggestions.gender_suggestion_title', 'پیشنهاد جنسیت')}
            description={t('ai_suggestions.gender_suggestion_description', 'پیشنهاد هوشمند جنسیت بر اساس نام مخاطبین')}
            icon={<VenetianMask className="w-5 h-5 text-blue-500" />}
            variant="info"
            className="h-full backdrop-blur-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl shadow-xl border border-blue-200/30 dark:border-blue-800/30"
            headerClassName="px-6 pt-4 pb-2"
          >
            <GenderSuggestionManagement />
          </AIBaseCard>
        </div>

        {/* Footer */}
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 p-2 px-4 rounded-full backdrop-blur-lg bg-white/30 dark:bg-gray-800/50 shadow-lg border border-white/20 dark:border-gray-700/50">
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