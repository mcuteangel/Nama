import React, { useState } from 'react';
import { ModernTextarea } from "@/components/ui/modern-textarea";
import { GlassButton } from "@/components/ui/glass-button";
import { Sparkles, Mic, StopCircle, FileText, Zap, Brain, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AIBaseCard from '../AIBaseCard';

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
  const [isFocused, setIsFocused] = useState(false);

  const isProcessing = isExtractorLoading || isProcessingSuggestions || isSavingOrUpdating;
  const canExtract = rawTextInput.trim() && !isProcessing;

  return (
    <AIBaseCard
      title={t('ai_suggestions.extract_contacts', 'استخراج هوشمند اطلاعات')}
      description={t('ai_suggestions.extract_description', 'متن خود را وارد کنید تا هوش مصنوعی اطلاعات مخاطبین را استخراج کند')}
      icon={<Brain size={24} className="text-blue-500 animate-pulse" />}
      variant="gradient"
      className="relative overflow-hidden max-w-2xl mx-auto"
    >
      <div className="space-y-6">
        {/* Enhanced Input Area */}
        <div className="relative">
          <div className={`
            absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl
            transition-all duration-500 ${isFocused ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `} />

          <div className="relative bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-4 border-2 border-blue-200/30 dark:border-blue-700/30">
            <div className="flex items-center gap-3 mb-3">
              <FileText size={20} className="text-blue-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {t('ai_suggestions.input_text', 'متن ورودی')}
              </span>
              {rawTextInput.length > 0 && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                  {rawTextInput.length} کاراکتر
                </span>
              )}
            </div>

            <ModernTextarea
              placeholder={t('ai_suggestions.enter_text_placeholder', 'مثال: جان دو مدیرعامل شرکت ABC است. ایمیل: john.doe@abc.com تلفن: ۱۲۳۴۵۶۷۸۹۰...')}
              value={rawTextInput}
              onChange={(e) => setRawTextInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              variant="glass"
              className={`
                bg-white/50 dark:bg-gray-800/50 border-0 text-gray-800 dark:text-gray-100
                placeholder-gray-500 dark:placeholder-gray-400 min-h-[140px] rounded-xl
                focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-600
                transition-all duration-300 resize-none
              `}
              disabled={isProcessing}
            />

            {/* Voice Recognition Button */}
            {browserSupportsSpeechRecognition && (
              <div className="absolute bottom-6 left-6">
                <GlassButton
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={isListening ? stopListening : startListening}
                  className={`
                    w-10 h-10 rounded-full transition-all duration-300 transform hover:scale-110
                    ${isListening
                      ? 'bg-gradient-to-r from-emerald-400 to-cyan-500 text-white animate-pulse shadow-lg shadow-emerald-500/50 hover:shadow-cyan-500/50'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white hover:shadow-indigo-500/40'
                    }
                  `}
                  disabled={isProcessing}
                  title={isListening ? t('ai_suggestions.stop_voice', 'توقف تشخیص گفتار') : t('ai_suggestions.start_voice', 'شروع تشخیص گفتار')}
                >
                  {isListening ? <StopCircle size={18} className="animate-pulse" /> : <Mic size={18} />}
                </GlassButton>
              </div>
            )}
          </div>
        </div>

        {/* Action Section */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 pb-8">
          {/* Extract Button */}
          <GlassButton
            type="button"
            onClick={onExtractAndEnqueue}
            disabled={!canExtract}
            className={`
              flex items-center justify-center gap-3 px-4 py-3 rounded-2xl font-bold text-base max-w-[280px]
              transition-all duration-500 transform hover:scale-110 hover:-translate-y-3 hover:rotate-1
              ${canExtract
                ? 'bg-gradient-to-br from-orange-400/90 via-red-500/90 to-pink-600/90 hover:from-orange-300/95 hover:via-red-400/95 hover:to-pink-500/95 text-white shadow-[0_8px_32px_rgba(251,146,60,0.4)] hover:shadow-[0_12px_40px_rgba(251,146,60,0.6)] border border-orange-300/50 backdrop-blur-xl'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isProcessing ? (
              <>
                <LoadingSpinner size={20} className="animate-spin" />
                <span>{t('common.processing', 'در حال پردازش...')}</span>
              </>
            ) : (
              <>
                <Zap size={20} className="animate-pulse" />
                <span>{t('ai_suggestions.extract_and_suggest', 'استخراج هوشمند')}</span>
                <ArrowRight size={16} />
              </>
            )}
          </GlassButton>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <GlassButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRawTextInput('')}
              disabled={isProcessing || !rawTextInput.trim()}
              className="px-4 py-2 rounded-2xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 bg-gradient-to-br from-orange-300/50 via-red-300/50 to-pink-400/50 dark:from-orange-200/50 dark:via-red-200/50 dark:to-pink-300/50 backdrop-blur-xl border border-orange-300/40 dark:border-orange-200/40 hover:border-orange-200/60 hover:from-orange-200/70 hover:via-red-200/70 hover:to-pink-300/70 text-white hover:text-white shadow-[0_6px_24px_rgba(251,146,60,0.3)] hover:shadow-[0_10px_32px_rgba(251,146,60,0.5)]"
              title={t('ai_suggestions.clear_text', 'پاک کردن متن')}
            >
              {t('common.clear', 'پاک کردن')}
            </GlassButton>
          </div>
        </div>

        {/* Processing Animation */}
        {isProcessing && (
          <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-blue-50/60 to-purple-50/60 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/30 dark:border-blue-800/30">
            <Brain size={24} className="text-blue-500 animate-pulse" />
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                {t('ai_suggestions.ai_processing', 'هوش مصنوعی در حال تحلیل')}
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AIBaseCard>
  );
};
