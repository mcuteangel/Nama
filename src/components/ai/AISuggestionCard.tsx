import React, { useCallback, useMemo, useState } from 'react';
import { PlusCircle, UserCheck, Phone, Mail, Building, Briefcase, Link as LinkIcon, XCircle, Edit, Sparkles, Zap, Heart, ChevronDown, ChevronUp, CheckCircle, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ExtractedContactInfo } from '@/hooks/use-contact-extractor';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import CancelButton from '../common/CancelButton';
import LoadingSpinner from '../common/LoadingSpinner';
import { GlassButton } from "@/components/ui/glass-button";
import AIBaseCard from './AIBaseCard';

interface ExistingContactSummary {
  id: string;
  first_name: string;
  last_name: string;
  email_addresses: { email_address: string }[];
  phone_numbers: { phone_number: string }[];
}

export interface AISuggestion {
  id: string;
  type: 'new' | 'update';
  extractedData: ExtractedContactInfo;
  existingContact?: ExistingContactSummary;
}

interface AISuggestionCardProps {
  suggestion: AISuggestion;
  onProcess: (suggestion: AISuggestion) => void;
  onDiscard: (suggestionId: string) => void;
  onEdit: (suggestion: AISuggestion) => void;
  isProcessing: boolean;
}

const AISuggestionCard: React.FC<AISuggestionCardProps> = React.memo(({
  suggestion,
  onProcess,
  onDiscard,
  onEdit,
  isProcessing
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const { extractedData, existingContact, type } = suggestion;

  // محاسبات آماری با useMemo برای عملکرد بهتر
  const stats = useMemo(() => ({
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

  const getActionLabel = useCallback(() => {
    if (type === 'new') {
      return t('ai_suggestions.add_new_contact', 'افزودن مخاطب جدید');
    } else {
      return t('ai_suggestions.update_existing_contact', 'به‌روزرسانی مخاطب موجود');
    }
  }, [type, t]);

  const handleProcess = useCallback(() => {
    onProcess(suggestion);
  }, [onProcess, suggestion]);

  const handleEdit = useCallback(() => {
    onEdit(suggestion);
  }, [onEdit, suggestion]);

  const handleDiscard = useCallback(() => {
    onDiscard(suggestion.id);
  }, [onDiscard, suggestion.id]);

  const actionLabel = useMemo(() => getActionLabel(), [getActionLabel]);

  const cardTitle = type === 'new'
    ? t('ai_suggestions.new_contact', 'مخاطب جدید')
    : t('ai_suggestions.update_contact', 'به‌روزرسانی مخاطب');

  const cardDescription = type === 'update' && existingContact
    ? t('ai_suggestions.found_existing', { name: `${existingContact.first_name} ${existingContact.last_name}` })
    : undefined;

  const actions = (
    <div className="flex flex-col sm:flex-row gap-2">
      <GlassButton
        onClick={handleProcess}
        disabled={isProcessing}
        variant="gradient-primary"
        className="flex-grow flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm"
        aria-label={actionLabel}
      >
        {isProcessing ? (
          <LoadingSpinner size={14} />
        ) : (
          <CheckCircle size={14} />
        )}
        <span className="text-white text-sm">{actionLabel}</span>
      </GlassButton>
      <div className="flex gap-1">
        <GlassButton
          onClick={handleEdit}
          disabled={isProcessing}
          variant="outline"
          size="sm"
          className="flex items-center gap-1 px-2 py-2 rounded-lg"
          aria-label={t('common.edit', 'ویرایش')}
        >
          <Edit size={12} />
        </GlassButton>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <GlassButton
              variant="destructive"
              disabled={isProcessing}
              size="sm"
              className="flex items-center gap-1 px-2 py-2 rounded-lg"
              aria-label={t('common.discard', 'حذف')}
            >
              <XCircle size={12} />
            </GlassButton>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass rounded-lg p-4">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
                <XCircle size={18} />
                {t('ai_suggestions.confirm_discard_title', 'تأیید حذف')}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-300 mt-1 text-sm">
                {t('ai_suggestions.confirm_discard_description', 'آیا مطمئن هستید که می‌خواهید این پیشنهاد را حذف کنید؟')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <CancelButton text={t('common.cancel', 'لغو')} />
              <AlertDialogAction
                onClick={handleDiscard}
                className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm"
              >
                <XCircle size={12} className="mr-1" />
                {t('common.discard', 'حذف')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );

  return (
    <div
      className={`transition-all duration-300 ${hovered ? 'scale-105' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AIBaseCard
        title={cardTitle}
        description={cardDescription}
        icon={type === 'new' ? <PlusCircle size={18} /> : <UserCheck size={18} />}
        variant={type === 'new' ? 'primary' : 'warning'}
        actions={actions}
        compact
      >
        {/* آمار سریع */}
        <div className="flex items-center gap-2 mb-3 p-2 bg-gradient-to-r from-gray-50/60 to-gray-100/60 dark:from-gray-800/30 dark:to-gray-700/30 rounded-lg border border-gray-200/30 dark:border-gray-600/30">
          <div className="flex items-center gap-1">
            <Info size={12} className="text-blue-500" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {stats.totalFields} {t('ai_suggestions.fields', 'فیلد')}
            </span>
          </div>
          {stats.hasPhone && <Phone size={10} className="text-cyan-500" />}
          {stats.hasEmail && <Mail size={10} className="text-emerald-500" />}
          {stats.hasCompany && <Building size={10} className="text-purple-500" />}
          {stats.hasPosition && <Briefcase size={10} className="text-orange-500" />}
          {stats.hasNotes && <Sparkles size={10} className="text-yellow-500" />}
          {stats.hasSocialLinks && <LinkIcon size={10} className="text-indigo-500" />}
        </div>

        <div className="flex flex-wrap gap-1 text-sm mb-2">
          <span className="font-medium text-gray-900 dark:text-gray-50">
            {extractedData.firstName} {extractedData.lastName}
          </span>
          {extractedData.company && (
            <span className="text-gray-600 dark:text-gray-400">• {extractedData.company}</span>
          )}
          {extractedData.position && (
            <span className="text-gray-600 dark:text-gray-400">• {extractedData.position}</span>
          )}
        </div>

        <div className="flex justify-end mb-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            aria-expanded={isExpanded}
            aria-controls={`details-${suggestion.id}`}
          >
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {isExpanded ? t('common.collapse', 'بستن') : t('common.expand', 'باز کردن')}
          </button>
        </div>

        {isExpanded && (
          <div
            id={`details-${suggestion.id}`}
            className="space-y-2 animate-in slide-in-from-top-2 duration-200"
          >
            {extractedData.phoneNumbers.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Phone size={12} className="text-cyan-500" />
                <span className="text-gray-900 dark:text-gray-50">
                  {extractedData.phoneNumbers.map(phone => phone.phone_number).join(', ')}
                </span>
              </div>
            )}

            {extractedData.emailAddresses.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Mail size={12} className="text-emerald-500" />
                <span className="text-gray-900 dark:text-gray-50">
                  {extractedData.emailAddresses.map(email => email.email_address).join(', ')}
                </span>
              </div>
            )}

            {extractedData.socialLinks.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <LinkIcon size={12} className="text-indigo-500" />
                <span className="text-gray-900 dark:text-gray-50">
                  {extractedData.socialLinks.length} {t('common.social_links', 'لینک شبکه اجتماعی')}
                </span>
              </div>
            )}

            {extractedData.notes && (
              <div className="flex items-center gap-2 text-sm">
                <Sparkles size={12} className="text-yellow-500" />
                <span className="text-gray-900 dark:text-gray-50 truncate max-w-xs">
                  {extractedData.notes}
                </span>
              </div>
            )}
          </div>
        )}
      </AIBaseCard>
    </div>
  );
});

AISuggestionCard.displayName = 'AISuggestionCard';

export default AISuggestionCard;