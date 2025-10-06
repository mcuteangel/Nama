import React, { useCallback, useMemo, useState } from 'react';
import { PlusCircle, UserCheck, Phone, Mail, Building, Briefcase, Link as LinkIcon, XCircle, Edit, Sparkles, ChevronDown, ChevronUp, CheckCircle, Info, Zap, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import LoadingSpinner from '../common/LoadingSpinner';
import { GlassButton } from "@/components/ui/glass-button";
import { CancelButton } from "@/components/common";
import AIBaseCard from './AIBaseCard';
import { ContactExtractionSuggestion } from '@/types/ai-suggestions.types';

export interface AISuggestionCardProps {
  suggestion: ContactExtractionSuggestion;
  onProcess: (suggestion: ContactExtractionSuggestion) => void;
  onDiscard: (suggestionId: string) => void;
  onEdit: (suggestion: ContactExtractionSuggestion) => void;
  isProcessing?: boolean;
  showConfidence?: boolean;
  showStats?: boolean;
  compact?: boolean;
}

const AISuggestionCard: React.FC<AISuggestionCardProps> = React.memo(({
  suggestion,
  onProcess,
  onDiscard,
  onEdit,
  isProcessing = false,
  showConfidence = true,
  showStats = true,
  compact = false
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const { extractedData, existingContact, source: { confidence = 0 }, priority, status } = suggestion;

  // محاسبه فیلدهای موجود با useMemo برای عملکرد بهتر
  const fieldStats = useMemo(() => ({
    hasPhone: extractedData.phoneNumbers.length > 0,
    hasEmail: extractedData.emailAddresses.length > 0,
    hasCompany: !!extractedData.company,
    hasPosition: !!extractedData.position,
    hasNotes: !!extractedData.notes,
    hasSocialLinks: extractedData.socialLinks.length > 0,
    totalFields: [
      extractedData.firstName,
      extractedData.lastName,
      extractedData.company,
      extractedData.position,
      extractedData.notes,
      ...extractedData.phoneNumbers.map(p => p.phone_number),
      ...extractedData.emailAddresses.map(e => e.email_address),
      ...extractedData.socialLinks.map(s => s.url)
    ].filter(Boolean).length,
  }), [extractedData]);

  // تولید عنوان اکشن بر اساس نوع پیشنهاد
  const getActionLabel = useCallback(() => {
    if (!existingContact) {
      return t('ai_suggestions.add_new_contact');
    } else {
      return t('ai_suggestions.update_existing_contact');
    }
  }, [existingContact, t]);

  // هندلرهای رویدادها
  const handleProcess = useCallback(() => {
    onProcess(suggestion);
  }, [onProcess, suggestion]);

  const handleEdit = useCallback(() => {
    onEdit(suggestion);
  }, [onEdit, suggestion]);

  const handleDiscard = useCallback(() => {
    onDiscard(suggestion.id);
  }, [onDiscard, suggestion.id]);

  // تولید اکشن‌ها با طراحی جدید
  const actions = useMemo(() => (
    <div className={`flex ${compact ? 'flex-col' : 'flex-col sm:flex-row'} gap-3`}>
      <GlassButton
        onClick={handleProcess}
        disabled={isProcessing}
        variant="gradient-primary"
        className={`flex-1 flex items-center justify-center gap-2 ${compact ? 'px-3 py-2' : 'px-4 py-3'} rounded-xl font-semibold text-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
        aria-label={getActionLabel()}
      >
        {isProcessing ? (
          <LoadingSpinner size={16} className="animate-spin" />
        ) : (
          <div className="flex items-center gap-2">
            <CheckCircle size={16} />
            <Zap size={14} className="animate-pulse" />
          </div>
        )}
        <span className="text-white font-medium">{getActionLabel()}</span>
      </GlassButton>
      <div className={`flex ${compact ? 'flex-col' : 'flex-row'} gap-2`}>
        <GlassButton
          onClick={handleEdit}
          disabled={isProcessing}
          variant="outline"
          size={compact ? "sm" : "default"}
          className={`flex items-center gap-2 ${compact ? 'px-3 py-2' : 'px-3 py-3'} rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-300 hover:scale-105`}
          aria-label={t('common.edit')}
        >
          <Edit size={14} />
          {!compact && <span>{t('common.edit')}</span>}
        </GlassButton>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <GlassButton
              variant="destructive"
              disabled={isProcessing}
              size={compact ? "sm" : "default"}
              className={`flex items-center gap-2 ${compact ? 'px-3 py-2' : 'px-3 py-3'} rounded-xl hover:scale-105 transition-all duration-300`}
              aria-label={t('common.discard')}
            >
              <XCircle size={14} />
              {!compact && <span>{t('common.discard')}</span>}
            </GlassButton>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass rounded-xl p-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-800 dark:text-red-200 flex items-center gap-3 text-lg">
                <XCircle size={20} className="animate-pulse" />
                {t('ai_suggestions.confirm_discard_title')}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                {t('ai_suggestions.confirm_discard_description')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <CancelButton text={t('common.cancel')} />
              <AlertDialogAction
                onClick={handleDiscard}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <XCircle size={14} className="mr-2" />
                {t('common.discard')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  ), [compact, isProcessing, handleProcess, handleEdit, handleDiscard, getActionLabel, t]);

  // تولید عنوان و توضیحات کارت
  const cardTitle = useMemo(() => {
    if (!existingContact) {
      return t('ai_suggestions.new_contact');
    } else {
      return t('ai_suggestions.update_contact');
    }
  }, [existingContact, t]);

  const cardDescription = useMemo(() => {
    if (existingContact) {
      return t('ai_suggestions.found_existing', { name: `${existingContact.firstName} ${existingContact.lastName}` });
    }
    return undefined;
  }, [existingContact, t]);

  // تولید آیکون مناسب
  const cardIcon = useMemo(() => {
    if (!existingContact) {
      return <PlusCircle size={20} className="animate-bounce" />;
    } else {
      return <UserCheck size={20} className="animate-pulse" />;
    }
  }, [existingContact]);

  // تولید نوار آمار پیشرفته
  const statsBar = useMemo(() => {
    if (!showStats) return null;

    return (
      <div className={`relative mb-4 p-3 bg-gradient-to-r from-gray-50/60 via-white/40 to-gray-50/20 dark:from-gray-800/60 dark:via-gray-700/40 dark:to-gray-600/20 rounded-xl border-2 border-gray-200/30 dark:border-gray-600/30 backdrop-blur-sm overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-100/60 dark:bg-blue-900/40 rounded-lg">
              <Info size={12} className="text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                {fieldStats.totalFields} {t('ai_suggestions.fields')}
              </span>
            </div>
            {showConfidence && (
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  {t('ai_suggestions.confidence')}:
                </span>
                <div className="flex items-center gap-1">
                  <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000"
                      style={{ width: `${confidence}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-green-600 dark:text-green-400">
                    {confidence}%
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            {fieldStats.hasPhone && <Phone size={12} className="text-cyan-500 animate-pulse" />}
            {fieldStats.hasEmail && <Mail size={12} className="text-emerald-500 animate-pulse" />}
            {fieldStats.hasCompany && <Building size={12} className="text-purple-500 animate-pulse" />}
            {fieldStats.hasPosition && <Briefcase size={12} className="text-orange-500 animate-pulse" />}
            {fieldStats.hasNotes && <Sparkles size={12} className="text-yellow-500 animate-pulse" />}
            {fieldStats.hasSocialLinks && <LinkIcon size={12} className="text-indigo-500 animate-pulse" />}
          </div>
        </div>
      </div>
    );
  }, [fieldStats, confidence, showConfidence, showStats, t]);

  // تولید اطلاعات تماس
  const contactInfo = useMemo(() => (
    <div className="space-y-3 mb-4">
      <div className="flex flex-wrap gap-2 text-sm">
        <span className="font-bold text-lg text-gray-900 dark:text-gray-50 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {extractedData.firstName} {extractedData.lastName}
        </span>
        {extractedData.company && (
          <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold border border-purple-200 dark:border-purple-800">
            {extractedData.company}
          </span>
        )}
        {extractedData.position && (
          <span className="px-3 py-1 bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-semibold border border-orange-200 dark:border-orange-800">
            {extractedData.position}
          </span>
        )}
      </div>
    </div>
  ), [extractedData]);

  // تولید دکمه گسترش/جمع کردن جزئیات
  const expandButton = useMemo(() => (
    <div className="flex justify-center mb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg"
        aria-expanded={isExpanded}
        aria-controls={`details-${suggestion.id}`}
      >
        {isExpanded ? <ChevronUp size={14} className="animate-bounce" /> : <ChevronDown size={14} className="animate-bounce" />}
        <span className="font-medium">
          {isExpanded ? t('common.collapse') : t('common.expand')}
        </span>
      </button>
    </div>
  ), [isExpanded, suggestion.id, t]);

  // تولید جزئیات گسترش‌یافته
  const expandedDetails = useMemo(() => {
    if (!isExpanded) return null;

    return (
      <div
        id={`details-${suggestion.id}`}
        className="space-y-3 animate-in slide-in-from-top-3 duration-300"
      >
        {fieldStats.hasPhone && (
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-cyan-50/60 to-cyan-100/40 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-xl border border-cyan-200/30 dark:border-cyan-800/30">
            <Phone size={14} className="text-cyan-600 dark:text-cyan-400 animate-pulse" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
              {extractedData.phoneNumbers.map(phone => phone.phone_number).join(', ')}
            </span>
          </div>
        )}

        {fieldStats.hasEmail && (
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50/60 to-emerald-100/40 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl border border-emerald-200/30 dark:border-emerald-800/30">
            <Mail size={14} className="text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
              {extractedData.emailAddresses.map(email => email.email_address).join(', ')}
            </span>
          </div>
        )}

        {fieldStats.hasSocialLinks && (
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50/60 to-indigo-100/40 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl border border-indigo-200/30 dark:border-indigo-800/30">
            <LinkIcon size={14} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
              {extractedData.socialLinks.length} {t('ai_suggestions.social_links')}
            </span>
          </div>
        )}

        {fieldStats.hasNotes && (
          <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-yellow-50/60 to-yellow-100/40 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl border border-yellow-200/30 dark:border-yellow-800/30">
            <Heart size={14} className="text-yellow-600 dark:text-yellow-400 animate-pulse mt-0.5" />
            <span className="text-sm text-gray-900 dark:text-gray-50 leading-relaxed">
              {extractedData.notes}
            </span>
          </div>
        )}
      </div>
    );
  }, [isExpanded, fieldStats, extractedData, suggestion.id, t]);

  return (
    <div
      className={`relative group transition-all duration-500 ${hovered ? 'scale-[1.02]' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AIBaseCard
        title={cardTitle}
        description={cardDescription}
        icon={cardIcon}
        variant={!existingContact ? 'primary' : 'warning'}
        actions={actions}
        suggestionType="contact_extraction"
        priority={priority}
        status={status}
        confidence={confidence}
        showConfidence={showConfidence}
        showStats={showStats}
        loading={isProcessing}
      >
        {statsBar}
        {contactInfo}
        {expandButton}
        {expandedDetails}
      </AIBaseCard>
    </div>
  );
});

AISuggestionCard.displayName = 'AISuggestionCard';

export default AISuggestionCard;
