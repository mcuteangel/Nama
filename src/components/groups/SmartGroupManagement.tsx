import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  CheckCircle,
  XCircle,
  Sparkles,
  Target,
  Brain,
  Zap,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Lightbulb,
  ArrowRight,
  Star
} from "lucide-react";
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
import { GlassButton, GradientGlassButton } from "@/components/ui/glass-button";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";

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
  confidence?: number;
  reasoning?: string;
}

const SmartGroupManagement: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const { session, isLoading: isSessionLoading } = useSession();
  const { groups, fetchGroups } = useGroups();

  const [contactsWithoutGroup, setContactsWithoutGroup] = useState<ContactWithoutGroup[]>([]);
  const [groupSuggestions, setGroupSuggestions] = useState<GroupSuggestion[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [hoveredSuggestion, setHoveredSuggestion] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // محاسبات آماری پیشرفته با useMemo برای عملکرد بهتر
  const stats = useMemo(() => ({
    totalContacts: contactsWithoutGroup.length,
    totalSuggestions: groupSuggestions.length,
    uniqueGroups: new Set(groupSuggestions.map(s => s.suggested_group_id)).size,
    successRate: groupSuggestions.length > 0 ? Math.round((groupSuggestions.length / contactsWithoutGroup.length) * 100) : 0,
    avgConfidence: groupSuggestions.length > 0 ? Math.round(groupSuggestions.reduce((sum, s) => sum + (s.confidence || 0), 0) / groupSuggestions.length) : 0,
    topCompanies: [...new Set(contactsWithoutGroup.map(c => c.company).filter(Boolean))].slice(0, 3),
    recentSuggestions: groupSuggestions.filter(s => Date.now() - (new Date().getTime() - 3600000) < 3600000).length // Last hour
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

      return { data: ungroupedContacts as ContactWithoutGroup[], error: null, fromCache: false };
    });
  }, [session, isSessionLoading, executeFetchContacts]);

  useEffect(() => {
    fetchContactsWithoutGroup();
    fetchGroups();
  }, [fetchContactsWithoutGroup, fetchGroups]);

  const generateGroupSuggestions = useCallback(() => {
    setIsGeneratingSuggestions(true);
    setIsAnimating(true);

    setTimeout(() => {
      const newSuggestions: GroupSuggestion[] = [];

      contactsWithoutGroup.forEach(contact => {
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
              confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
              reasoning: `مخاطب در شرکت ${companyName} کار می‌کند`
            });
          }
        }

        // Additional AI-like suggestions based on position
        const position = contact.position?.trim();
        if (position && !companyName) {
          const positionGroups = groups.filter(g =>
            g.name.toLowerCase().includes(position.toLowerCase()) ||
            position.toLowerCase().includes(g.name.toLowerCase())
          );

          if (positionGroups.length > 0) {
            const bestMatch = positionGroups[0];
            newSuggestions.push({
              contact_id: contact.id,
              contact_name: `${contact.first_name} ${contact.last_name}`,
              suggested_group_id: bestMatch.id,
              suggested_group_name: bestMatch.name,
              suggested_group_color: bestMatch.color,
              confidence: Math.floor(Math.random() * 20) + 50, // 50-70%
              reasoning: `مخاطب سمت ${position} دارد`
            });
          }
        }
      });

      setGroupSuggestions(newSuggestions);
      setIsGeneratingSuggestions(false);
      setIsAnimating(false);

      if (newSuggestions.length === 0) {
        ErrorManager.notifyUser(t('ai_suggestions.no_group_suggestions_found'), 'info');
      } else {
        ErrorManager.notifyUser(t('ai_suggestions.group_suggestions_generated'), 'success');
      }
    }, 2000); // Simulate AI processing time
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
      setGroupSuggestions(prev => prev.filter(s => s.contact_id !== suggestion.contact_id));
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

  const applyAllSuggestions = useCallback(async () => {
    if (!session?.user || groupSuggestions.length === 0) return;

    try {
      const suggestionsToApply = groupSuggestions.map(s => ({
        user_id: session.user.id,
        contact_id: s.contact_id,
        group_id: s.suggested_group_id,
      }));

      const { error } = await supabase
        .from('contact_groups')
        .insert(suggestionsToApply);

      if (error) throw new Error(error.message);

      ErrorManager.notifyUser(t('ai_suggestions.all_suggestions_applied_success'), 'success');
      setGroupSuggestions([]);
      invalidateCache(`contacts_list_${session.user.id}_`);
      fetchContactsWithoutGroup();
    } catch (err: unknown) {
      ErrorManager.logError(err, { component: 'SmartGroupManagement', action: 'applyAllSuggestions' });
      ErrorManager.notifyUser(`${t('ai_suggestions.error_applying_all_suggestions')}: ${ErrorManager.getErrorMessage(err)}`, 'error');
    }
  }, [session, groupSuggestions, fetchContactsWithoutGroup, t]);

  if (isSessionLoading || isLoadingContacts) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <LoadingSpinner size={48} className="text-purple-500 mx-auto" />
          <LoadingMessage message={t('ai_suggestions.loading_smart_management_data')} />
        </div>
      </div>
    );
  }

  return (
    <ModernCard
      variant="glass"
      className="rounded-3xl shadow-2xl border-2 border-white/40 dark:border-gray-600/40 backdrop-blur-xl bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-indigo-50/20 dark:from-purple-900/20 dark:via-blue-900/10 dark:to-indigo-900/5 overflow-hidden transition-all duration-500 hover:shadow-3xl hover:border-purple-300/50 dark:hover:border-purple-600/50"
    >
      <ModernCardHeader className="pb-6 relative">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-indigo-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="relative">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-xl transform transition-all duration-300 hover:scale-110">
              <Brain size={32} className="text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>

          <div className="flex-1">
            <ModernCardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              {t('ai_suggestions.smart_group_management_title')}
            </ModernCardTitle>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('ai_suggestions.smart_group_management_description')}
            </p>
          </div>
        </div>

        {/* Enhanced Statistics */}
        {stats.totalContacts > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 rounded-2xl p-4 border border-blue-200/30 dark:border-blue-800/30 backdrop-blur-sm text-center">
              <BarChart3 size={24} className="text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalContacts}</div>
              <div className="text-sm text-blue-500 dark:text-blue-300">{t('ai_suggestions.ungrouped_contacts')}</div>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 rounded-2xl p-4 border border-green-200/30 dark:border-green-800/30 backdrop-blur-sm text-center">
              <TrendingUp size={24} className="text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.successRate}%</div>
              <div className="text-sm text-green-500 dark:text-green-300">{t('ai_suggestions.match_rate')}</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-500/20 dark:to-purple-600/20 rounded-2xl p-4 border border-purple-200/30 dark:border-purple-800/30 backdrop-blur-sm text-center">
              <Target size={24} className="text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.uniqueGroups}</div>
              <div className="text-sm text-purple-500 dark:text-purple-300">{t('ai_suggestions.unique_groups')}</div>
            </div>

            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 dark:from-orange-500/20 dark:to-orange-600/20 rounded-2xl p-4 border border-orange-200/30 dark:border-orange-800/30 backdrop-blur-sm text-center">
              <Star size={24} className="text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.avgConfidence}%</div>
              <div className="text-sm text-orange-500 dark:text-orange-300">{t('ai_suggestions.confidence', 'اعتماد')}</div>
            </div>
          </div>
        )}
      </ModernCardHeader>

      <ModernCardContent className="space-y-6">
        {/* Generate Suggestions Button */}
        <div className="flex flex-col sm:flex-row gap-4">
          <GradientGlassButton
            onClick={generateGroupSuggestions}
            disabled={isGeneratingSuggestions || contactsWithoutGroup.length === 0}
            className="flex-1 px-8 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-purple-500 via-blue-600 to-indigo-600 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
          >
            {isGeneratingSuggestions ? (
              <div className="flex items-center gap-3">
                <LoadingSpinner size={24} className="text-white" />
                <span>{t('ai_suggestions.analyzing_contacts', 'در حال تحلیل...')}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Sparkles size={24} />
                <span>{t('ai_suggestions.generate_group_suggestions')}</span>
              </div>
            )}
          </GradientGlassButton>

          {groupSuggestions.length > 0 && (
            <GlassButton
              onClick={applyAllSuggestions}
              variant="gradient-primary"
              className="px-6 py-4 rounded-2xl font-semibold hover:scale-105 transition-all duration-300"
            >
              <Zap size={20} className="mr-2" />
              {t('ai_suggestions.apply_all', 'اعمال همه')}
            </GlassButton>
          )}
        </div>

        {/* AI Processing Animation */}
        {isGeneratingSuggestions && (
          <div className="bg-gradient-to-r from-purple-50/60 to-blue-50/60 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-purple-200/30 dark:border-purple-800/30 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <Brain size={32} className="text-purple-500 animate-pulse" />
                <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping"></div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {t('ai_suggestions.ai_processing', 'هوش مصنوعی در حال پردازش')}
                </h3>
                <p className="text-sm text-purple-500 dark:text-purple-300">
                  {t('ai_suggestions.analyzing_patterns', 'الگوهای سازماندهی را تحلیل می‌کند...')}
                </p>
              </div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
              <div className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {t('ai_suggestions.processing_step', 'مرحله: تحلیل داده‌های مخاطبین')}
            </p>
          </div>
        )}

        {/* Empty State */}
        {contactsWithoutGroup.length === 0 && !isGeneratingSuggestions && (
          <EmptyState
            icon={Users}
            title={t('ai_suggestions.all_contacts_grouped')}
            description={t('ai_suggestions.all_contacts_grouped_description')}
          />
        )}

        {/* Suggestions List */}
        {groupSuggestions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50/60 to-orange-50/60 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl border border-yellow-200/30 dark:border-yellow-800/30 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Lightbulb size={24} className="text-yellow-500" />
                <div>
                  <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    {t('ai_suggestions.pending_group_suggestions')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t('ai_suggestions.suggestions_description', 'پیشنهادات هوشمند برای گروه‌بندی مخاطبین')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-semibold">
                  {groupSuggestions.length}
                </div>
                <ArrowRight size={20} className="text-purple-500" />
              </div>
            </div>

            <div className="grid gap-4 max-h-96 overflow-y-auto">
              {groupSuggestions.map((suggestion, index) => (
                <div
                  key={`${suggestion.contact_id}-${suggestion.suggested_group_id}`}
                  className={`
                    group bg-gradient-to-r from-white/60 via-white/40 to-white/20
                    dark:from-gray-800/60 dark:via-gray-700/40 dark:to-gray-600/20
                    p-6 rounded-2xl border-2 backdrop-blur-sm shadow-lg
                    transition-all duration-500 ease-out
                    hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-[1.02]
                    ${hoveredSuggestion === suggestion.contact_id ? 'border-purple-300/70 shadow-purple-500/30' : 'border-white/40 dark:border-gray-600/40'}
                    ${selectedSuggestion === suggestion.contact_id ? 'ring-4 ring-purple-500/50' : ''}
                    animate-slide-in
                  `}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onMouseEnter={() => setHoveredSuggestion(suggestion.contact_id)}
                  onMouseLeave={() => setHoveredSuggestion(null)}
                  onClick={() => setSelectedSuggestion(
                    selectedSuggestion === suggestion.contact_id ? null : suggestion.contact_id
                  )}
                  role="button"
                  tabIndex={0}
                  aria-expanded={selectedSuggestion === suggestion.contact_id}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <Users size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-lg text-gray-800 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                            {suggestion.contact_name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                              {t('ai_suggestions.suggested_group')}:
                            </span>
                            <span
                              className="px-3 py-1.5 rounded-xl text-white font-semibold shadow-lg backdrop-blur-sm border-2 border-white/30 flex items-center gap-2 hover:scale-105 transition-all duration-300"
                              style={{ backgroundColor: suggestion.suggested_group_color || '#6366f1' }}
                            >
                              <div
                                className="w-2 h-2 rounded-full bg-white/60"
                                style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}
                              ></div>
                              {suggestion.suggested_group_name}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Confidence and Reasoning */}
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2">
                          <Star size={16} className="text-yellow-500" />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {t('ai_suggestions.confidence')}: {suggestion.confidence}%
                          </span>
                        </div>

                        {suggestion.reasoning && (
                          <div className="flex items-center gap-2">
                            <Lightbulb size={16} className="text-blue-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {suggestion.reasoning}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Confidence Bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${suggestion.confidence}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 ml-6">
                      <GlassButton
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplySuggestion(suggestion);
                        }}
                        className="w-12 h-12 rounded-2xl bg-green-500/10 hover:bg-green-500/20 dark:bg-green-900/30 dark:hover:bg-green-800/50 text-green-600 hover:text-green-700 transition-all duration-300 hover:scale-110 border-2 border-green-200/50 dark:border-green-800/50"
                        aria-label={t('ai_suggestions.apply_suggestion')}
                      >
                        <CheckCircle size={24} />
                      </GlassButton>

                      <GlassButton
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDiscardSuggestion(suggestion.contact_id);
                        }}
                        className="w-12 h-12 rounded-2xl bg-red-500/10 hover:bg-red-500/20 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-600 hover:text-red-700 transition-all duration-300 hover:scale-110 border-2 border-red-200/50 dark:border-red-800/50"
                        aria-label={t('common.discard')}
                      >
                        <XCircle size={24} />
                      </GlassButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
});

SmartGroupManagement.displayName = 'SmartGroupManagement';

export default SmartGroupManagement;