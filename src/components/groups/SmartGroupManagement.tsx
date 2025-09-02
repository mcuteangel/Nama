import React, { useState, useEffect, useCallback } from 'react';
import { Users, CheckCircle, XCircle, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSession } from "@/integrations/supabase/auth";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import LoadingMessage from "../common/LoadingMessage";
import { supabase } from '@/integrations/supabase/client';
import { invalidateCache } from '@/utils/cache-helpers';
import { useGroups } from '@/hooks/use-groups';
import EmptyState from '../common/EmptyState';
import LoadingSpinner from '../common/LoadingSpinner';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardDescription, ModernCardContent } from "@/components/ui/modern-card";
import { GlassButton, GradientGlassButton } from "@/components/ui/glass-button";

interface ContactWithoutGroup {
  id: string;
  first_name: string;
  last_name: string;
  company?: string;
  position?: string;
  suggested_group_id?: string;
  suggested_group_name?: string;
}

interface GroupSuggestion {
  contact_id: string;
  contact_name: string;
  suggested_group_id: string;
  suggested_group_name: string;
  suggested_group_color?: string;
}

const SmartGroupManagement: React.FC = () => {
  const { t } = useTranslation();
  const { session, isLoading: isSessionLoading } = useSession();
  const { groups, fetchGroups } = useGroups();

  const [contactsWithoutGroup, setContactsWithoutGroup] = useState<ContactWithoutGroup[]>([]);
  const [groupSuggestions, setGroupSuggestions] = useState<GroupSuggestion[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  const onSuccessFetchContacts = useCallback((result: { data: ContactWithoutGroup[] | null; error: string | null; fromCache: boolean }) => {
    if (result.data) {
      setContactsWithoutGroup(result.data);
    }
  }, []);

  const onErrorFetchContacts = useCallback((err: Error) => {
    ErrorManager.logError(err, { component: 'SmartGroupManagement', action: 'fetchContactsWithoutGroup' });
    ErrorManager.notifyUser(t('ai_suggestions.error_fetching_ungrouped_contacts'), 'error');
  }, [t]);

  const {
    isLoading: isLoadingContacts,
    executeAsync: executeFetchContacts,
  } = useErrorHandler(null, {
    showToast: false,
    onSuccess: onSuccessFetchContacts,
    onError: onErrorFetchContacts,
  });

  const fetchContactsWithoutGroup = useCallback(async () => {
    if (isSessionLoading || !session?.user) {
      setContactsWithoutGroup([]);
      return;
    }

    await executeFetchContacts(async () => {
      // Fetch contacts that are not in any group
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select(`
          id,
          first_name,
          last_name,
          company,
          position,
          contact_groups(group_id)
        `)
        .eq('user_id', session.user.id);

      if (contactsError) throw new Error(contactsError.message);

      const ungroupedContacts = contacts.filter(c => c.contact_groups.length === 0);

      // For now, we'll just return the ungrouped contacts.
      // In a more advanced AI scenario, we'd use an AI model to suggest groups.
      return { data: ungroupedContacts as ContactWithoutGroup[], error: null, fromCache: false };
    });
  }, [session, isSessionLoading, executeFetchContacts]);

  useEffect(() => {
    fetchContactsWithoutGroup();
    fetchGroups();
  }, [fetchContactsWithoutGroup, fetchGroups]);

  const generateGroupSuggestions = useCallback(() => {
    setIsGeneratingSuggestions(true);
    const newSuggestions: GroupSuggestion[] = [];

    contactsWithoutGroup.forEach(contact => {
      // Simple heuristic: suggest a group based on company name if a group with that name exists
      const companyName = contact.company?.trim();
      if (companyName) {
        const existingGroup = groups.find(g => g.name.toLowerCase() === companyName.toLowerCase());
        if (existingGroup) {
          newSuggestions.push({
            contact_id: contact.id,
            contact_name: `${contact.first_name} ${contact.last_name}`,
            suggested_group_id: existingGroup.id,
            suggested_group_name: existingGroup.name,
            suggested_group_color: existingGroup.color,
          });
        }
      }
      // Add more complex AI-based suggestions here in the future
    });
    setGroupSuggestions(newSuggestions);
    setIsGeneratingSuggestions(false);
    if (newSuggestions.length === 0) {
      ErrorManager.notifyUser(t('ai_suggestions.no_group_suggestions_found'), 'info');
    } else {
      ErrorManager.notifyUser(t('ai_suggestions.group_suggestions_generated'), 'success');
    }
  }, [contactsWithoutGroup, groups, t]);

  const handleApplySuggestion = useCallback(async (suggestion: GroupSuggestion) => {
    if (!session?.user) {
      ErrorManager.notifyUser(t('common.auth_required'), 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('contact_groups')
        .insert({
          user_id: session.user.id,
          contact_id: suggestion.contact_id,
          group_id: suggestion.suggested_group_id,
        });

      if (error) throw new Error(error.message);

      ErrorManager.notifyUser(t('ai_suggestions.group_suggestion_applied_success'), 'success');
      // Remove the applied suggestion from the list
      setGroupSuggestions(prev => prev.filter(s => s.contact_id !== suggestion.contact_id));
      // Invalidate cache for contacts list and re-fetch ungrouped contacts
      invalidateCache(`contacts_list_${session.user.id}_`);
      fetchContactsWithoutGroup();
    } catch (err: unknown) {
      ErrorManager.logError(err, { component: 'SmartGroupManagement', action: 'applyGroupSuggestion', suggestion });
      ErrorManager.notifyUser(`${t('ai_suggestions.error_applying_group_suggestion')}: ${ErrorManager.getErrorMessage(err)}`, 'error');
    }
  }, [session, t, fetchContactsWithoutGroup]);

  const handleDiscardSuggestion = useCallback((contactId: string) => {
    setGroupSuggestions(prev => prev.filter(s => s.contact_id !== contactId));
    ErrorManager.notifyUser(t('ai_suggestions.group_suggestion_discarded'), 'info');
  }, [t]);

  if (isSessionLoading || isLoadingContacts) {
    return <LoadingMessage message={t('ai_suggestions.loading_smart_management_data')} />;
  }

  return (
    <div className="space-y-6">
      <ModernCard variant="glass" className="rounded-xl p-4 fade-in-up">
        <ModernCardHeader className="pb-2">
          <ModernCardTitle className="text-xl font-bold flex items-center gap-2">
            <Users size={20} className="text-purple-500" /> {t('ai_suggestions.smart_group_management_title')}
          </ModernCardTitle>
          <ModernCardDescription>
            {t('ai_suggestions.smart_group_management_description')}
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent className="space-y-4">
          <GradientGlassButton
            onClick={generateGroupSuggestions}
            disabled={isGeneratingSuggestions || contactsWithoutGroup.length === 0}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg hover-lift"
          >
            {isGeneratingSuggestions && <LoadingSpinner size={20} />}
            <Sparkles size={20} />
            {t('ai_suggestions.generate_group_suggestions')}
          </GradientGlassButton>

          {contactsWithoutGroup.length === 0 && !isGeneratingSuggestions && (
            <EmptyState
              icon={Users}
              title={t('ai_suggestions.all_contacts_grouped')}
              description={t('ai_suggestions.all_contacts_grouped_description')}
            />
          )}

          {groupSuggestions.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{t('ai_suggestions.pending_group_suggestions')}</h4>
              {groupSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center justify-between p-4 glass rounded-xl shadow-sm hover-lift">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{suggestion.contact_name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1 mt-1">
                      {t('ai_suggestions.suggested_group')}:
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium text-white inline-flex items-center"
                        style={{ backgroundColor: suggestion.suggested_group_color || '#cccccc' }}
                      >
                        {suggestion.suggested_group_name}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <GlassButton
                      variant="ghost"
                      size="icon"
                      onClick={() => handleApplySuggestion(suggestion)}
                      className="text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-gray-600/50 hover-lift"
                    >
                      <CheckCircle size={20} />
                    </GlassButton>
                    <GlassButton
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDiscardSuggestion(suggestion.contact_id)}
                      className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-600/50 hover-lift"
                    >
                      <XCircle size={20} />
                    </GlassButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModernCardContent>
      </ModernCard>
    </div>
  );
};

export default SmartGroupManagement;