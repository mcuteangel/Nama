import React, { useCallback, useMemo } from 'react';
import { PlusCircle, UserCheck, Phone, Mail, Building, Briefcase, Link as LinkIcon, XCircle, Edit } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ExtractedContactInfo } from '@/hooks/use-contact-extractor';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import CancelButton from '../common/CancelButton';
import LoadingSpinner from '../common/LoadingSpinner';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardDescription, ModernCardContent } from "@/components/ui/modern-card";
import { ModernButton } from "@/components/ui/modern-button";

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

const AISuggestionCard: React.FC<AISuggestionCardProps> = React.memo(({ suggestion, onProcess, onDiscard, onEdit, isProcessing }) => {
  const { t } = useTranslation();

  const { extractedData, existingContact, type } = suggestion;

  const getActionLabel = useCallback(() => {
    if (type === 'new') {
      return t('ai_suggestions.add_new_contact');
    } else {
      return t('ai_suggestions.update_existing_contact');
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

  return (
    <ModernCard variant="glass" className="rounded-xl p-4 shadow-sm">
      <ModernCardHeader className="pb-2">
        <ModernCardTitle className="text-xl font-bold flex items-center gap-2">
          {type === 'new' ? (
            <PlusCircle size={20} className="text-blue-500" />
          ) : (
            <UserCheck size={20} className="text-green-500" />
          )}
          {type === 'new' ? t('ai_suggestions.new_contact_suggestion') : t('ai_suggestions.update_contact_suggestion')}
        </ModernCardTitle>
        {type === 'update' && existingContact && (
          <ModernCardDescription>
            {t('ai_suggestions.found_existing_contact', { name: `${existingContact.first_name} ${existingContact.last_name}` })}
          </ModernCardDescription>
        )}
      </ModernCardHeader>
      <ModernCardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('common.first_name')}:</p>
            <p className="text-base text-gray-900 dark:text-gray-50">{extractedData.firstName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('common.last_name')}:</p>
            <p className="text-base text-gray-900 dark:text-gray-50">{extractedData.lastName}</p>
          </div>
          {extractedData.company && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1"><Building size={14} /> {t('common.company')}:</p>
              <p className="text-base text-gray-900 dark:text-gray-50">{extractedData.company}</p>
            </div>
          )}
          {extractedData.position && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1"><Briefcase size={14} /> {t('common.position')}:</p>
              <p className="text-base text-gray-900 dark:text-gray-50">{extractedData.position}</p>
            </div>
          )}
        </div>

        {extractedData.phoneNumbers.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1"><Phone size={14} /> {t('common.phone_numbers')}:</p>
            {extractedData.phoneNumbers.map((phone, idx) => (
              <p key={idx} className="text-base text-gray-900 dark:text-gray-50">
                {phone.phone_number} ({t(`phone_type.${phone.phone_type}`)}) {phone.extension && ` - ${t('common.extension')}: ${phone.extension}`}
              </p>
            ))}
          </div>
        )}

        {extractedData.emailAddresses.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1"><Mail size={14} /> {t('common.email_addresses')}:</p>
            {extractedData.emailAddresses.map((email, idx) => (
              <p key={idx} className="text-base text-gray-900 dark:text-gray-50">
                {email.email_address} ({t(`email_type.${email.email_type}`)})
              </p>
            ))}
          </div>
        )}

        {extractedData.socialLinks.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1"><LinkIcon size={14} /> {t('common.social_links')}:</p>
            {extractedData.socialLinks.map((link, idx) => (
              <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400 text-sm block">
                {t(`social_type.${link.type}`)}: {link.url}
              </a>
            ))}
          </div>
        )}

        {extractedData.notes && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('common.notes')}:</p>
            <p className="text-base text-gray-900 dark:text-gray-50">{extractedData.notes}</p>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <ModernButton
            onClick={handleProcess}
            disabled={isProcessing}
            variant="gradient-primary"
            className="flex-grow flex items-center gap-2 px-6 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
          >
            {isProcessing && <LoadingSpinner size={16} className="me-2" />}
            {actionLabel}
          </ModernButton>
          <ModernButton
            onClick={handleEdit}
            disabled={isProcessing}
            variant="outline"
            className="flex items-center gap-2 px-6 py-2 rounded-lg font-semibold shadow-sm transition-all duration-300"
          >
            <Edit size={16} />
            {t('common.edit')}
          </ModernButton>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <ModernButton
                variant="destructive"
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-2 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
              >
                <XCircle size={16} />
                {t('common.discard')}
              </ModernButton>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass rounded-xl p-6">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-gray-800 dark:text-gray-100">{t('ai_suggestions.confirm_discard_title')}</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                  {t('ai_suggestions.confirm_discard_description')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <CancelButton text={t('common.cancel')} />
                <AlertDialogAction onClick={handleDiscard} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold">
                  {t('common.discard')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </ModernCardContent>
    </ModernCard>
  );
});

AISuggestionCard.displayName = 'AISuggestionCard';

export default AISuggestionCard;