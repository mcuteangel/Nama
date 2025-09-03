import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Users, CheckCircle, XCircle, Sparkles, Target } from "lucide-react";
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
import { GlassButton } from "@/components/ui/glass-button";
import AIBaseCard from '../ai/AIBaseCard';

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

const SmartGroupManagement: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const { session, isLoading: isSessionLoading } = useSession();
  const { groups, fetchGroups } = useGroups();

  const [contactsWithoutGroup, setContactsWithoutGroup] = useState<ContactWithoutGroup[]>([]);
  const [groupSuggestions, setGroupSuggestions] = useState<GroupSuggestion[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [hoveredSuggestion, setHoveredSuggestion] = useState<string | null>(null);

  // محاسبات آماری با useMemo برای عملکرد بهتر
  const stats = useMemo(() => ({
    totalContacts: contactsWithoutGroup.length,
    totalSuggestions: groupSuggestions.length,
    uniqueGroups: new Set(groupSuggestions.map(s => s.suggested_group_id)).size,
    successRate: groupSuggestions.length > 0 ? Math.round((groupSuggestions.length / contactsWithoutGroup.length) * 100) : 0,
  }), [contactsWithoutGroup.length, groupSuggestions]);

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
    <AIBaseCard
      title={t('ai_suggestions.smart_group_management_title')}
      description={t('ai_suggestions.smart_group_management_description')}
      icon={<Users size={20} />}
      variant="secondary"
      compact
    >
      {/* آمار سریع */}
      {stats.totalContacts > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gradient-to-r from-purple-50/60 to-blue-50/60 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg border border-purple-200/30 dark:border-purple-700/30">
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{stats.totalContacts}</div>
            <div className="text-xs text-purple-500 dark:text-purple-300">{t('ai_suggestions.ungrouped_contacts', 'بدون گروه')}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.successRate}%</div>
            <div className="text-xs text-blue-500 dark:text-blue-300">{t('ai_suggestions.match_rate', 'نرخ تطابق')}</div>
          </div>
        </div>
      )}

      <GlassButton
        onClick={generateGroupSuggestions}
        disabled={isGeneratingSuggestions || contactsWithoutGroup.length === 0}
        variant="gradient-primary"
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm"
        aria-label={t('ai_suggestions.generate_group_suggestions')}
      >
        {isGeneratingSuggestions ? (
          <LoadingSpinner size={14} />
        ) : (
          <Sparkles size={14} />
        )}
        {t('ai_suggestions.generate_group_suggestions')}
      </GlassButton>

      {contactsWithoutGroup.length === 0 && !isGeneratingSuggestions && (
        <EmptyState
          icon={Users}
          title={t('ai_suggestions.all_contacts_grouped')}
          description={t('ai_suggestions.all_contacts_grouped_description')}
        />
      )}

      {groupSuggestions.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-500" />
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                {t('ai_suggestions.pending_group_suggestions')}
              </span>
              <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full text-xs font-semibold">
                {groupSuggestions.length}
              </span>
            </h4>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Target size={12} />
              {stats.uniqueGroups} {t('ai_suggestions.unique_groups', 'گروه منحصر')}
            </div>
          </div>
          <div className="grid gap-2 max-h-80 overflow-y-auto">
            {groupSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`bg-gradient-to-r from-white/20 via-gray-50/30 to-slate-50/30 dark:from-gray-800/20 dark:via-gray-700/30 dark:to-gray-600/30 p-2 rounded-lg border border-white/30 backdrop-blur-sm shadow-sm transition-all duration-300 ${
                  hoveredSuggestion === suggestion.contact_id ? 'scale-105 shadow-lg' : ''
                }`}
                onMouseEnter={() => setHoveredSuggestion(suggestion.contact_id)}
                onMouseLeave={() => setHoveredSuggestion(null)}
                role="region"
                aria-labelledby={`group-suggestion-${index}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-800 dark:text-gray-100 mb-1" id={`group-suggestion-${index}`}>
                      {suggestion.contact_name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        {t('ai_suggestions.suggested_group')}:
                      </span>
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium text-white inline-flex items-center shadow-sm"
                        style={{ backgroundColor: suggestion.suggested_group_color || '#6366f1' }}
                      >
                        {suggestion.suggested_group_name}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleApplySuggestion(suggestion)}
                      className="w-7 h-7 rounded-full bg-green-100/50 hover:bg-green-200/70 dark:bg-green-900/30 dark:hover:bg-green-800/50 text-green-600 hover:text-green-700 transition-all duration-200"
                      aria-label={t('ai_suggestions.apply_suggestion')}
                    >
                      <CheckCircle size={14} />
                    </GlassButton>
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDiscardSuggestion(suggestion.contact_id)}
                      className="w-7 h-7 rounded-full bg-red-100/50 hover:bg-red-200/70 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-600 hover:text-red-700 transition-all duration-200"
                      aria-label={t('common.discard')}
                    >
                      <XCircle size={14} />
                    </GlassButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AIBaseCard>
  );
});

SmartGroupManagement.displayName = 'SmartGroupManagement';

export default SmartGroupManagement;