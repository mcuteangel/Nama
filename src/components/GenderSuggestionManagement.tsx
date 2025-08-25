import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, User, CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSession } from "@/integrations/supabase/auth";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import LoadingMessage from "./LoadingMessage";
import { supabase } from '@/integrations/supabase/client';
import { invalidateCache } from '@/utils/cache-helpers';
// AISuggestionsService is no longer used for gender suggestions directly

interface ContactForGenderSuggestion {
  id: string;
  first_name: string;
  last_name: string;
  gender: 'male' | 'female' | 'not_specified';
}

interface GenderSuggestionDisplay {
  contactId: string;
  contactName: string;
  currentGender: 'male' | 'female' | 'not_specified';
  suggestedGender: 'male' | 'female' | 'not_specified';
}

// --- Client-side gender suggestion logic (very basic) ---
const suggestGenderFromName = (firstName: string): 'male' | 'female' | 'not_specified' => {
  const lowerFirstName = firstName.toLowerCase();
  // A very basic, limited set of rules for common Persian names
  // This is NOT comprehensive and will be inaccurate for many names.
  // For a more robust solution without AI, a large local database of names would be needed.
  if (['علی', 'محمد', 'رضا', 'حسین', 'امیر', 'حسن', 'مهدی', 'جواد', 'سعید', 'محمود', 'احمد', 'مصطفی', 'مجید', 'ناصر', 'بهنام', 'فرهاد', 'کاوه', 'کوروش', 'داریوش', 'آرش', 'بابک', 'پویا', 'کیوان', 'مانی', 'نادر', 'هومن', 'یوسف'].includes(lowerFirstName)) {
    return 'male';
  }
  if (['فاطمه', 'زهرا', 'مریم', 'سارا', 'نازنین', 'زینب', 'آزاده', 'پریسا', 'ژاله', 'شیرین', 'لیلا', 'مهسا', 'نسترن', 'هدیه', 'یاسمن', 'آرزو', 'بهار', 'پگاه', 'ترانه', 'ثمین', 'خاطره', 'دلارام', 'رعنا', 'رویا', 'سحر', 'شبنم', 'غزل', 'فرناز', 'کیمیا', 'گلناز', 'لاله', 'مرجان', 'نوشین', 'ویدا'].includes(lowerFirstName)) {
    return 'female';
  }
  return 'not_specified';
};
// --- End client-side gender suggestion logic ---

const GenderSuggestionManagement: React.FC = () => {
  const { t } = useTranslation();
  const { session, isLoading: isSessionLoading } = useSession();

  const [ungenderedContacts, setUngenderedContacts] = useState<ContactForGenderSuggestion[]>([]);
  const [genderSuggestions, setGenderSuggestions] = useState<GenderSuggestionDisplay[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const onSuccessFetchContacts = useCallback((result: { data: ContactForGenderSuggestion[] | null; error: string | null; fromCache: boolean }) => {
    if (result.data) {
      setUngenderedContacts(result.data);
    }
  }, []);

  const onErrorFetchContacts = useCallback((err: Error) => {
    ErrorManager.logError(err, { component: 'GenderSuggestionManagement', action: 'fetchUngenderedContacts' });
    ErrorManager.notifyUser(t('ai_suggestions.error_fetching_ungendered_contacts'), 'error');
  }, [t]);

  const {
    isLoading: isLoadingContacts,
    executeAsync: executeFetchContacts,
  } = useErrorHandler(null, {
    showToast: false,
    onSuccess: onSuccessFetchContacts,
    onError: onErrorFetchContacts,
  });

  const fetchUngenderedContacts = useCallback(async () => {
    if (isSessionLoading || !session?.user) {
      setUngenderedContacts([]);
      return;
    }

    await executeFetchContacts(async () => {
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, gender')
        .eq('user_id', session.user.id)
        .eq('gender', 'not_specified');

      if (contactsError) throw new Error(contactsError.message);

      return { data: contacts as ContactForGenderSuggestion[], error: null, fromCache: false };
    });
  }, [session, isSessionLoading, executeFetchContacts]);

  useEffect(() => {
    fetchUngenderedContacts();
  }, [fetchUngenderedContacts]);

  const handleGenerateSuggestions = useCallback(async () => {
    if (!session?.user) {
      ErrorManager.notifyUser(t('common.auth_required'), 'error');
      return;
    }
    if (ungenderedContacts.length === 0) {
      ErrorManager.notifyUser(t('ai_suggestions.no_ungendered_contacts'), 'info');
      return;
    }

    setIsGenerating(true);
    const toastId = ErrorManager.notifyUser(t('ai_suggestions.generating_gender_suggestions_local'), 'info'); // Updated message

    try {
      const newSuggestions: GenderSuggestionDisplay[] = ungenderedContacts
        .map(contact => {
          const suggestedGender = suggestGenderFromName(contact.first_name);
          return {
            contactId: contact.id,
            contactName: `${contact.first_name} ${contact.last_name}`,
            currentGender: contact.gender,
            suggestedGender: suggestedGender,
          };
        })
        .filter(s => s.suggestedGender !== 'not_specified'); // Only show actionable suggestions

      setGenderSuggestions(newSuggestions);
      if (newSuggestions.length === 0) {
        ErrorManager.notifyUser(t('ai_suggestions.no_gender_suggestions_found_local'), 'info'); // Updated message
      } else {
        ErrorManager.notifyUser(t('ai_suggestions.gender_suggestions_generated_local'), 'success'); // Updated message
      }
    } catch (err: any) {
      ErrorManager.logError(err, { component: 'GenderSuggestionManagement', action: 'generateGenderSuggestionsLocal' });
      ErrorManager.notifyUser(`${t('ai_suggestions.error_generating_gender_suggestions_local')}: ${ErrorManager.getErrorMessage(err)}`, 'error'); // Updated message
    } finally {
      setIsGenerating(false);
      // dismissToast(toastId); // Assuming notifyUser returns a toastId if needed
    }
  }, [session, ungenderedContacts, t]);

  const handleAcceptSuggestion = useCallback(async (suggestion: GenderSuggestionDisplay) => {
    if (!session?.user) {
      ErrorManager.notifyUser(t('common.auth_required'), 'error');
      return;
    }

    const toastId = ErrorManager.notifyUser(t('ai_suggestions.applying_gender_suggestion'), 'info');
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ gender: suggestion.suggestedGender })
        .eq('id', suggestion.contactId)
        .eq('user_id', session.user.id);

      if (error) throw new Error(error.message);

      ErrorManager.notifyUser(t('ai_suggestions.gender_suggestion_applied_success'), 'success');
      // Remove the applied suggestion from the list
      setGenderSuggestions(prev => prev.filter(s => s.contactId !== suggestion.contactId));
      // Invalidate cache for contacts list and re-fetch ungendered contacts
      invalidateCache(`contacts_list_${session.user.id}_`);
      fetchUngenderedContacts();
    } catch (err: any) {
      ErrorManager.logError(err, { component: 'GenderSuggestionManagement', action: 'acceptGenderSuggestion', suggestion });
      ErrorManager.notifyUser(`${t('ai_suggestions.error_applying_gender_suggestion')}: ${ErrorManager.getErrorMessage(err)}`, 'error');
    } finally {
      // dismissToast(toastId); // Assuming notifyUser returns a toastId if needed
    }
  }, [session, t, fetchUngenderedContacts]);

  const handleDiscardSuggestion = useCallback((contactId: string) => {
    setGenderSuggestions(prev => prev.filter(s => s.contactId !== contactId));
    ErrorManager.notifyUser(t('ai_suggestions.gender_suggestion_discarded'), 'info');
  }, [t]);

  if (isSessionLoading || isLoadingContacts) {
    return <LoadingMessage message={t('ai_suggestions.loading_gender_management_data')} />;
  }

  return (
    <div className="space-y-6">
      <Card className="glass rounded-xl p-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <User size={20} className="text-pink-500" /> {t('ai_suggestions.gender_suggestion_title')}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            {t('ai_suggestions.gender_suggestion_description_local')} {/* Updated description */}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGenerateSuggestions}
            disabled={isGenerating || ungenderedContacts.length === 0}
            className="w-full flex items-center gap-2 px-6 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
          >
            {isGenerating ? (
              <Loader2 size={16} className="me-2 animate-spin" />
            ) : (
              <Sparkles size={16} className="me-2" />
            )}
            {t('ai_suggestions.generate_gender_suggestions')}
          </Button>

          {ungenderedContacts.length === 0 && !isGenerating && (
            <p className="text-center text-gray-500 dark:text-gray-400">{t('ai_suggestions.all_contacts_gendered')}</p>
          )}

          {genderSuggestions.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{t('ai_suggestions.pending_gender_suggestions')}</h4>
              {genderSuggestions.map((suggestion, index) => (
                <div key={suggestion.contactId} className="flex items-center justify-between p-3 glass rounded-lg shadow-sm">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{suggestion.contactName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {t('ai_suggestions.suggested_gender')}:
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ms-1 ${
                        suggestion.suggestedGender === 'male' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        suggestion.suggestedGender === 'female' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {t(`gender.${suggestion.suggestedGender}`)}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAcceptSuggestion(suggestion)}
                      className="text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-gray-600/50"
                    >
                      <CheckCircle size={20} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDiscardSuggestion(suggestion.contactId)}
                      className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-600/50"
                    >
                      <XCircle size={20} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GenderSuggestionManagement;