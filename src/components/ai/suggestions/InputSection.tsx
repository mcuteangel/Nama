import React from 'react';
import { ModernTextarea } from "@/components/ui/modern-textarea";
import { GlassButton } from "@/components/ui/glass-button";
import { Sparkles, Mic, StopCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface InputSectionProps {
  rawTextInput: string;
  setRawTextInput: (value: string) => void;
  isExtractorLoading: boolean;
  isProcessingSuggestions: boolean;
  isSavingOrUpdating: boolean;
  browserSupportsSpeechRecognition: boolean;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  onExtractAndEnqueue: () => void;
}

export const InputSection: React.FC<InputSectionProps> = ({
  rawTextInput,
  setRawTextInput,
  isExtractorLoading,
  isProcessingSuggestions,
  isSavingOrUpdating,
  browserSupportsSpeechRecognition,
  isListening,
  startListening,
  stopListening,
  onExtractAndEnqueue,
}) => {
  const { t } = useTranslation();

  return (
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
          onClick={onExtractAndEnqueue}
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
  );
};
