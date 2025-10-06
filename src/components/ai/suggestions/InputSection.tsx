import React from 'react';
import { ModernTextarea } from "@/components/ui/modern-textarea";
import { GlassButton } from "@/components/ui/glass-button";
import { Mic, StopCircle, FileText, Zap, ArrowRight } from "lucide-react";
import { ModernTooltip, ModernTooltipContent, ModernTooltipProvider, ModernTooltipTrigger } from "@/components/ui/modern-tooltip";
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
  const isProcessing = isExtractorLoading || isProcessingSuggestions || isSavingOrUpdating;
  
  const handleClear = () => {
    setRawTextInput('');
    // Stop any active listening and clear the transcript
    if (isListening) {
      stopListening(); // Stop listening first
      // Clear the transcript after a small delay to ensure the stop is processed
      setTimeout(() => {
        setRawTextInput('');
      }, 100);
    } else {
      // If not listening, just clear the input
      setRawTextInput('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 scale-95" />

          <div className="relative bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-4 border-2 border-blue-200/30 dark:border-blue-700/30">
            <div className="flex items-center gap-3 mb-3">
              <FileText size={20} className="text-blue-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {t('ai_suggestions.input_text')}
              </span>
              {rawTextInput.length > 0 && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                  {t('ai_suggestions.character_count', { count: rawTextInput.length })}
                </span>
              )}
            </div>

            <ModernTextarea
              placeholder={t('ai_suggestions.enter_text_placeholder')}
              value={rawTextInput}
              onChange={(e) => setRawTextInput(e.target.value)}
              variant="glass"
              className={`
                bg-white/50 dark:bg-gray-800/50 border-0 text-gray-800 dark:text-gray-100
                placeholder-gray-500 dark:placeholder-gray-400 min-h-[140px] rounded-xl
                focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-600
                transition-all duration-300 resize-none
              `}
              disabled={isProcessing}
            />

            {/* Voice Recognition Button with Status */}
            {browserSupportsSpeechRecognition && (
              <ModernTooltipProvider delayDuration={300}>
                <div className="absolute bottom-6 left-6 flex flex-col items-center gap-1">
                  <ModernTooltip>
                    <ModernTooltipTrigger asChild>
                      <GlassButton
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={isListening ? stopListening : startListening}
                        className={`
                          w-12 h-12 rounded-full transition-all duration-300 transform hover:scale-110 relative
                          ${isListening
                            ? 'bg-gradient-to-r from-emerald-400 to-cyan-500 text-white animate-pulse shadow-lg shadow-emerald-500/50 hover:shadow-cyan-500/50'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white hover:shadow-indigo-500/40'
                          }
                        `}
                        disabled={isProcessing}
                        aria-label={isListening ? t('ai_suggestions.stop_voice') : t('ai_suggestions.start_voice')}
                      >
                        {isListening ? (
                          <div className="relative flex items-center justify-center">
                            <StopCircle size={20} className="animate-pulse" />
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                          </div>
                        ) : (
                          <Mic size={20} />
                        )}
                      </GlassButton>
                    </ModernTooltipTrigger>
                    
                    <ModernTooltipContent 
                      side="right" 
                      className="max-w-xs bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                    >
                      {isListening ? (
                        <div className="space-y-2 p-2">
                          <div className="flex items-center gap-2 text-emerald-400">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            {t('ai_suggestions.listening')}
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-200">
                            <h4 className="font-bold mb-2 text-gray-800 dark:text-white text-base">{t('ai_suggestions.guide')}</h4>
                            <ul className="list-disc list-inside space-y-2 rtl:space-y-reverse text-gray-700 dark:text-gray-200">
                              <li className="rtl:pr-2">{t('ai_suggestions.guide_tip_1')}</li>
                              <li className="rtl:pr-2">{t('ai_suggestions.guide_tip_2')}</li>
                              <li className="rtl:pr-2">{t('ai_suggestions.guide_tip_3')}</li>
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm">
                          {t('ai_suggestions.click_to_speak')}
                        </p>
                      )}
                    </ModernTooltipContent>
                  </ModernTooltip>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                    {isListening ? (
                      <span className="text-emerald-500 font-medium">
                        {t('ai_suggestions.speak_now')}
                      </span>
                    ) : (
                      <span>{t('ai_suggestions.click_to_speak')}</span>
                    )}
                  </div>
                </div>
              </ModernTooltipProvider>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 pb-8">
          {/* Extract Button */}
          <GlassButton
            type="button"
            onClick={onExtractAndEnqueue}
            disabled={!rawTextInput.trim() || isProcessing}
            className={`
              flex items-center justify-center gap-3 px-4 py-3 rounded-2xl font-bold text-base max-w-[280px]
              transition-all duration-500 transform hover:scale-110 hover:-translate-y-3 hover:rotate-1
              ${rawTextInput.trim() && !isProcessing
                ? 'bg-gradient-to-br from-orange-400/90 via-red-500/90 to-pink-600/90 hover:from-orange-300/95 hover:via-red-400/95 hover:to-pink-500/95 text-white shadow-[0_8px_32px_rgba(251,146,60,0.4)] hover:shadow-[0_12px_40px_RGBA(251,146,60,0.6)] border border-orange-300/50 backdrop-blur-xl'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isProcessing ? (
              <>
                <LoadingSpinner size={20} className="animate-spin" />
                <span>{t('common.processing')}</span>
              </>
            ) : (
              <>
                <Zap size={20} className="animate-pulse" />
                <span>{t('ai_suggestions.extract_and_suggest')}</span>
                <ArrowRight size={16} />
              </>
            )}
          </GlassButton>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <ModernTooltip>
              <ModernTooltipTrigger asChild>
                <GlassButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  disabled={isProcessing || !rawTextInput.trim()}
                  className="px-4 py-2 rounded-2xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 bg-gradient-to-br from-orange-300/50 via-red-300/50 to-pink-400/50 dark:from-orange-200/50 dark:via-red-200/50 dark:to-pink-300/50 backdrop-blur-xl border border-orange-300/40 dark:border-orange-200/40 hover:border-orange-200/60 hover:from-orange-200/70 hover:via-red-200/70 hover:to-pink-300/70 text-white hover:text-white shadow-[0_6px_24px_rgba(251,146,60,0.3)] hover:shadow-[0_10px_32px_rgba(251,146,60,0.5)]"
                >
                  {t('common.clear')}
                </GlassButton>
              </ModernTooltipTrigger>
              <ModernTooltipContent 
                side="top" 
                className="max-w-xs"
              >
                <p className="text-sm">{t('ai_suggestions.clear_text')}</p>
              </ModernTooltipContent>
            </ModernTooltip>
          </div>
        </div>

        {/* Processing Animation */}
        {isProcessing && (
          <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-blue-50/60 to-purple-50/60 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/30 dark:border-blue-800/30">
            <Zap size={24} className="text-blue-500 animate-pulse" />
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                {t('ai_suggestions.ai_processing')}
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};
