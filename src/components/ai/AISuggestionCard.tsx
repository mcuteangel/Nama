import React, { useCallback, useMemo, useState } from 'react';
import { PlusCircle, UserCheck, Phone, Mail, Building, Briefcase, Link as LinkIcon, XCircle, Edit, Sparkles, Zap, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ExtractedContactInfo } from '@/hooks/use-contact-extractor';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import CancelButton from '../common/CancelButton';
import LoadingSpinner from '../common/LoadingSpinner';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardDescription, ModernCardContent } from "@/components/ui/modern-card";
import { GlassButton } from "@/components/ui/glass-button";

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
  const [isHovered, setIsHovered] = useState(false);

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
    <ModernCard
      variant="glass"
      className={`rounded-xl p-4 shadow-sm transition-all duration-500 transform hover:scale-[1.02] hover:shadow-xl animate-in fade-in slide-in-from-bottom-4 ${isHovered ? 'ring-2 ring-blue-300 dark:ring-blue-600' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ModernCardHeader className="pb-2 relative">
        <div className="absolute top-0 right-0">
          <Sparkles size={16} className="text-yellow-400 animate-pulse" />
        </div>
        <ModernCardTitle className="text-xl font-bold flex items-center gap-2">
          {type === 'new' ? (
            <div className="relative">
              <PlusCircle size={24} className="text-blue-500 animate-bounce" />
              <Zap size={12} className="absolute -top-1 -right-1 text-yellow-400 animate-ping" />
            </div>
          ) : (
            <div className="relative">
              <UserCheck size={24} className="text-green-500 animate-pulse" />
              <Heart size={12} className="absolute -top-1 -right-1 text-red-400 animate-bounce" />
            </div>
          )}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {type === 'new' ? t('ai_suggestions.new_contact_suggestion') : t('ai_suggestions.update_contact_suggestion')}
          </span>
        </ModernCardTitle>
        {type === 'update' && existingContact && (
          <ModernCardDescription className="text-sm text-gray-600 dark:text-gray-400">
            <span className="inline-flex items-center gap-1">
              <UserCheck size={14} className="text-orange-500" />
              {t('ai_suggestions.found_existing_contact', { name: `${existingContact.first_name} ${existingContact.last_name}` })}
            </span>
          </ModernCardDescription>
        )}
      </ModernCardHeader>
      <ModernCardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <UserCheck size={16} className="text-blue-500" />
              {t('common.first_name')}:
            </p>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-50">{extractedData.firstName}</p>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
              <UserCheck size={16} className="text-green-500" />
              {t('common.last_name')}:
            </p>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-50">{extractedData.lastName}</p>
          </div>
          {extractedData.company && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800 md:col-span-2">
              <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <Building size={16} className="text-purple-500" />
                {t('common.company')}:
              </p>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-50">{extractedData.company}</p>
            </div>
          )}
          {extractedData.position && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800 md:col-span-2">
              <p className="text-sm font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-2">
                <Briefcase size={16} className="text-orange-500" />
                {t('common.position')}:
              </p>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-50">{extractedData.position}</p>
            </div>
          )}
        </div>

        {extractedData.phoneNumbers.length > 0 && (
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-cyan-200 dark:border-cyan-800">
            <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-300 flex items-center gap-2 mb-2">
              <Phone size={16} className="text-cyan-500" />
              {t('common.phone_numbers')}:
            </p>
            <div className="space-y-2">
              {extractedData.phoneNumbers.map((phone, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded border">
                  <Phone size={14} className="text-cyan-600" />
                  <span className="text-base font-medium text-gray-900 dark:text-gray-50">
                    {phone.phone_number}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ({t(`phone_type.${phone.phone_type}`)})
                  </span>
                  {phone.extension && (
                    <span className="text-sm text-orange-600 dark:text-orange-400">
                      - {t('common.extension')}: {phone.extension}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {extractedData.emailAddresses.length > 0 && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 mb-2">
              <Mail size={16} className="text-emerald-500" />
              {t('common.email_addresses')}:
            </p>
            <div className="space-y-2">
              {extractedData.emailAddresses.map((email, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded border">
                  <Mail size={14} className="text-emerald-600" />
                  <span className="text-base font-medium text-gray-900 dark:text-gray-50">
                    {email.email_address}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ({t(`email_type.${email.email_type}`)})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {extractedData.socialLinks.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2 mb-2">
              <LinkIcon size={16} className="text-indigo-500" />
              {t('common.social_links')}:
            </p>
            <div className="space-y-2">
              {extractedData.socialLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded border hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                >
                  <LinkIcon size={14} className="text-indigo-600" />
                  <span className="text-base font-medium text-indigo-700 dark:text-indigo-300 hover:underline">
                    {t(`social_type.${link.type}`)}: {link.url}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {extractedData.notes && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-yellow-500" />
              {t('common.notes')}:
            </p>
            <p className="text-base text-gray-900 dark:text-gray-50 leading-relaxed">{extractedData.notes}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <GlassButton
            onClick={handleProcess}
            disabled={isProcessing}
            variant="gradient-primary"
            className="flex-grow flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            {isProcessing ? (
              <LoadingSpinner size={18} className="me-2" />
            ) : (
              <Sparkles size={18} className="animate-pulse" />
            )}
            <span className="text-white">{actionLabel}</span>
          </GlassButton>
          <div className="flex gap-2">
            <GlassButton
              onClick={handleEdit}
              disabled={isProcessing}
              variant="outline"
              className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold shadow-md transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-600"
            >
              <Edit size={16} className="text-blue-600" />
              <span className="hidden sm:inline">{t('common.edit')}</span>
            </GlassButton>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <GlassButton
                  variant="destructive"
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                >
                  <XCircle size={16} />
                  <span className="hidden sm:inline">{t('common.discard')}</span>
                </GlassButton>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass rounded-xl p-6 border-2 border-red-200 dark:border-red-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
                    <XCircle size={20} className="text-red-500" />
                    {t('ai_suggestions.confirm_discard_title')}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-600 dark:text-gray-300 mt-2">
                    {t('ai_suggestions.confirm_discard_description')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3">
                  <CancelButton text={t('common.cancel')} />
                  <AlertDialogAction
                    onClick={handleDiscard}
                    className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    <XCircle size={16} className="me-2" />
                    {t('common.discard')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </ModernCardContent>
    </ModernCard>
  );
});

AISuggestionCard.displayName = 'AISuggestionCard';

export default AISuggestionCard;