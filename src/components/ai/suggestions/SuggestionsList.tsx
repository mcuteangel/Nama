import React from 'react';
import { GlassButton } from "@/components/ui/glass-button";
import { Brain, Search, CheckSquare, Square, CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import AISuggestionCard from "@/components/ai/AISuggestionCard";
import { mapToContactExtractionSuggestion } from "@/utils/mappers";
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { AISuggestionDisplay } from "@/types/ai-suggestions-display.types";
import { ContactExtractionSuggestion } from "@/types/ai-suggestions.types";

interface SuggestionsListProps {
  pendingSuggestions: AISuggestionDisplay[];
  filteredSuggestions: AISuggestionDisplay[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  stats: { newContacts: number; updates: number; total: number };
  isBatchMode: boolean;
  setIsBatchMode: (mode: boolean) => void;
  selectedSuggestions: Set<string>;
  isLoadingSuggestions: boolean;
  isSavingOrUpdating: boolean;
  searchInputRef: React.RefObject<HTMLInputElement>;

  // Handlers
  handleSelectSuggestion: (suggestionId: string) => void;
  handleProcessSuggestion: (suggestion: ContactExtractionSuggestion) => void;
  handleDiscardSuggestion: (suggestionId: string) => void;
  handleEditSuggestion: (suggestion: ContactExtractionSuggestion) => void;
  handleBatchAccept: () => void;
  handleBatchDiscard: () => void;
}

export const SuggestionsList: React.FC<SuggestionsListProps> = ({
  pendingSuggestions,
  filteredSuggestions,
  searchQuery,
  setSearchQuery,
  stats,
  isBatchMode,
  setIsBatchMode,
  selectedSuggestions,
  isLoadingSuggestions,
  isSavingOrUpdating,
  searchInputRef,

  handleSelectSuggestion,
  handleProcessSuggestion,
  handleDiscardSuggestion,
  handleEditSuggestion,
  handleBatchAccept,
  handleBatchDiscard,
}) => {
  const { t } = useTranslation();

  if (pendingSuggestions.length === 0 && !isLoadingSuggestions) {
    return null;
  }

  return (
    <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Brain size={24} className="text-yellow-500 animate-pulse" />
          <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {t('ai_suggestions.smart_suggestions')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredSuggestions.length} {t('common.of')} {stats.total} {t('ai_suggestions.suggestions')}
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
            {t('ai_suggestions.batch_mode')}
          </GlassButton>
          <div className="relative w-full sm:w-80">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              ref={searchInputRef}
              placeholder={t('common.search_suggestions')}
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
                {selectedSuggestions.size} {t('ai_suggestions.selected')}
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
                {t('ai_suggestions.accept_selected')}
              </GlassButton>
              <GlassButton
                onClick={handleBatchDiscard}
                variant="destructive"
                className="flex items-center gap-2"
                disabled={isSavingOrUpdating}
              >
                <XCircle size={16} />
                {t('ai_suggestions.discard_selected')}
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
            {t('ai_suggestions.loading_suggestions')}
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
                  suggestion={mapToContactExtractionSuggestion(suggestion)}
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
            {t('common.no_results')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('common.no_results_for')} "{searchQuery}" {t('common.not_found')}
          </p>
          <GlassButton
            onClick={() => setSearchQuery('')}
            variant="outline"
            className="px-6 py-2 rounded-xl"
          >
            {t('common.clear_search')}
          </GlassButton>
        </div>
      )}
    </div>
  );
};
