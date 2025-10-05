import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from "react-i18next";
import { useSession } from "@/integrations/supabase/auth";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import { supabase } from '@/integrations/supabase/client';
import { invalidateCache } from '@/utils/cache-helpers';
import { useGroups } from '@/hooks/use-groups';
import {
  ContactWithoutGroup,
  ContactSuggestions,
  GroupSuggestion,
  GroupSuggestionStats
} from '@/types/group-suggestions';

// توابع کمکی برای محاسبه شباهت
const normalizeName = (name: string) => {
  return name
    .toLowerCase()
    .replace(/شرکت|سازمان|موسسه|مجموعه/g, '') // حذف کلمات اضافه
    .replace(/[^\w\s]/g, '') // حذف کاراکترهای خاص
    .trim();
};

const calculateSimilarity = (name1: string, name2: string) => {
  const n1 = normalizeName(name1);
  const n2 = normalizeName(name2);

  if (n1 === n2) return 100; // کاملاً یکسان

  // چک کردن اینکه یکی زیرمجموعه دیگری هست
  if (n1.includes(n2) || n2.includes(n1)) return 80;

  // چک کردن کلمات مشترک
  const words1 = new Set(n1.split(/\s+/));
  const words2 = new Set(n2.split(/\s+/));
  const commonWords = [...words1].filter(word => words2.has(word));
  const similarity = (commonWords.length / Math.max(words1.size, words2.size)) * 70;

  return Math.round(similarity);
};

export const useGroupSuggestions = () => {
  const { t } = useTranslation();
  const { session, isLoading: isSessionLoading } = useSession();
  const { groups, fetchGroups } = useGroups();

  const [contactsWithoutGroup, setContactsWithoutGroup] = useState<ContactWithoutGroup[]>([]);
  const [contactSuggestions, setContactSuggestions] = useState<ContactSuggestions[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // محاسبات آماری پیشرفته با useMemo برای عملکرد بهتر
  const stats: GroupSuggestionStats = useMemo(() => ({
    totalContacts: contactsWithoutGroup.length,
    totalSuggestions: contactSuggestions.reduce((sum, cs) => sum + cs.suggestions.length, 0),
    uniqueGroups: new Set(contactSuggestions.flatMap(cs => cs.suggestions.map(s => s.suggested_group_id))).size,
    successRate: contactSuggestions.length > 0 ? Math.round((contactSuggestions.length / contactsWithoutGroup.length) * 100) : 0,
    avgConfidence: contactSuggestions.length > 0 ? Math.round(contactSuggestions.reduce((sum, cs) => sum + cs.suggestions.reduce((s, sug) => s + (sug.confidence || 0), 0), 0) / contactSuggestions.reduce((sum, cs) => sum + cs.suggestions.length, 0)) : 0,
    topCompanies: [...new Set(contactsWithoutGroup.map(c => c.company).filter(Boolean))].slice(0, 3),
    recentSuggestions: contactSuggestions.filter(() => Date.now() - (new Date().getTime() - 3600000) < 3600000).length // Last hour
  }), [contactsWithoutGroup, contactSuggestions]);

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
      // اول همه مخاطبین رو بگیر
      const { data: allContacts, error: contactsError } = await supabase
        .from('contacts')
        .select(`
          id,
          first_name,
          last_name,
          company,
          position
        `)
        .eq('user_id', session.user.id);

      if (contactsError) throw new Error(contactsError.message);

      // بعد مخاطبینی که گروه ندارن رو پیدا کن
      const { data: groupedContactIds, error: groupedError } = await supabase
        .from('contact_groups')
        .select('contact_id')
        .eq('user_id', session.user.id);

      if (groupedError) throw new Error(groupedError.message);

      const groupedIds = new Set(groupedContactIds?.map(cg => cg.contact_id) || []);
      const ungroupedContacts = allContacts?.filter(contact => !groupedIds.has(contact.id)) || [];

      return { data: ungroupedContacts as ContactWithoutGroup[], error: null, fromCache: false };
    });
  }, [session, isSessionLoading, executeFetchContacts]);

  const generateGroupSuggestions = useCallback(() => {
    setIsGeneratingSuggestions(true);
    setIsAnimating(true);

    setTimeout(async () => {
      const newContactSuggestions: ContactSuggestions[] = [];

      try {
        // اول الگوهای گروه‌بندی فعلی رو تحلیل کن
        const { data: existingGroupings, error: groupingsError } = await supabase
          .from('contact_groups')
          .select(`
            group_id,
            contacts!inner(
              id,
              first_name,
              last_name,
              company,
              position
            )
          `)
          .eq('user_id', session?.user?.id);

        if (groupingsError) throw new Error(groupingsError.message);

        // ساخت مپینگ شرکت -> گروه و سمت شغلی -> گروه
        const companyToGroup = new Map<string, { groupId: string; groupName: string; groupColor?: string; count: number }>();
        const positionToGroup = new Map<string, { groupId: string; groupName: string; groupColor?: string; count: number }>();

        existingGroupings?.forEach(cg => {
          if (cg.contacts) {
            const contact = cg.contacts as any;
            const groupId = cg.group_id;
            const group = groups.find(g => g.id === groupId);

            if (group && contact.company) {
              const company = contact.company.trim().toLowerCase();
              const existing = companyToGroup.get(company);
              if (existing) {
                existing.count++;
              } else {
                companyToGroup.set(company, {
                  groupId: group.id,
                  groupName: group.name,
                  groupColor: group.color,
                  count: 1
                });
              }
            }

            if (group && contact.position) {
              const position = contact.position.trim().toLowerCase();
              const existing = positionToGroup.get(position);
              if (existing) {
                existing.count++;
              } else {
                positionToGroup.set(position, {
                  groupId: group.id,
                  groupName: group.name,
                  groupColor: group.color,
                  count: 1
                });
              }
            }
          }
        });

        // تولید پیشنهادات برای هر مخاطب
        contactsWithoutGroup.forEach(contact => {
          const suggestions: Array<GroupSuggestion & { priority: number }> = [];
          const companyName = contact.company?.trim();
          const position = contact.position?.trim();
          let priorityCounter = 1;

          // پیشنهادات بر اساس الگوهای فعلی (اولویت بالاتر)
          if (companyName) {
            const normalizedCompany = companyName.toLowerCase();

            for (const [existingCompany, groupInfo] of companyToGroup.entries()) {
              const similarity = normalizedCompany === existingCompany ? 100 :
                               normalizedCompany.includes(existingCompany) || existingCompany.includes(normalizedCompany) ? 80 :
                               0;

              if (similarity > 0) {
                const confidence = Math.min(95, similarity + (groupInfo.count * 5));
                suggestions.push({
                  contact_id: contact.id,
                  contact_name: `${contact.first_name} ${contact.last_name}`,
                  suggested_group_id: groupInfo.groupId,
                  suggested_group_name: groupInfo.groupName,
                  suggested_group_color: groupInfo.groupColor,
                  confidence,
                  reasoning: `بر اساس الگوی فعلی: ${groupInfo.count} مخاطب از شرکت "${companyName}" در گروه "${groupInfo.groupName}" قرار دارن`,
                  priority: priorityCounter++
                });
              }
            }
          }

          // پیشنهادات بر اساس سمت شغلی (اولویت پایین‌تر)
          if (position) {
            const normalizedPosition = position.toLowerCase();

            for (const [existingPosition, groupInfo] of positionToGroup.entries()) {
              const similarity = normalizedPosition === existingPosition ? 100 :
                               normalizedPosition.includes(existingPosition) || existingPosition.includes(normalizedPosition) ? 70 :
                               0;

              if (similarity > 0) {
                const confidence = Math.min(85, similarity + (groupInfo.count * 3));
                suggestions.push({
                  contact_id: contact.id,
                  contact_name: `${contact.first_name} ${contact.last_name}`,
                  suggested_group_id: groupInfo.groupId,
                  suggested_group_name: groupInfo.groupName,
                  suggested_group_color: groupInfo.groupColor,
                  confidence,
                  reasoning: `بر اساس الگوی فعلی: ${groupInfo.count} مخاطب با سمت "${position}" در گروه "${groupInfo.groupName}" قرار دارن`,
                  priority: priorityCounter++
                });
              }
            }
          }

          // پیشنهادات بر اساس similarity قدیمی (اولویت پایین‌تر)
          if (companyName) {
            const companyMatches = groups
              .map(group => ({
                group,
                similarity: calculateSimilarity ? calculateSimilarity(companyName, group.name) : 0
              }))
              .filter(match => match.similarity >= 60)
              .sort((a, b) => b.similarity - a.similarity)
              .slice(0, 2); // حداکثر 2 پیشنهاد

            companyMatches.forEach(match => {
              if (!suggestions.find(s => s.suggested_group_id === match.group.id)) {
                suggestions.push({
                  contact_id: contact.id,
                  contact_name: `${contact.first_name} ${contact.last_name}`,
                  suggested_group_id: match.group.id,
                  suggested_group_name: match.group.name,
                  suggested_group_color: match.group.color,
                  confidence: Math.min(90, match.similarity + 15),
                  reasoning: `نام شرکت "${companyName}" با گروه "${match.group.name}" مشابه است (${match.similarity}% تطابق)`,
                  priority: priorityCounter++
                });
              }
            });
          }

          if (position && !suggestions.find(s => s.contact_id === contact.id && s.reasoning?.includes('سمت شغلی'))) {
            const positionMatches = groups
              .map(group => ({
                group,
                similarity: calculateSimilarity ? calculateSimilarity(position, group.name) : 0
              }))
              .filter(match => match.similarity >= 50)
              .sort((a, b) => b.similarity - a.similarity)
              .slice(0, 2); // حداکثر 2 پیشنهاد

            positionMatches.forEach(match => {
              if (!suggestions.find(s => s.suggested_group_id === match.group.id)) {
                suggestions.push({
                  contact_id: contact.id,
                  contact_name: `${contact.first_name} ${contact.last_name}`,
                  suggested_group_id: match.group.id,
                  suggested_group_name: match.group.name,
                  suggested_group_color: match.group.color,
                  confidence: Math.min(75, match.similarity + 10),
                  reasoning: `سمت شغلی "${position}" با گروه "${match.group.name}" مرتبط است (${match.similarity}% تطابق)`,
                  priority: priorityCounter++
                });
              }
            });
          }

          // پیشنهاد گروه عمومی (اولویت پایین‌ترین)
          const generalGroups = groups.filter(g =>
            g.name.toLowerCase().includes('عمومی') ||
            g.name.toLowerCase().includes('سایر') ||
            g.name.toLowerCase().includes('متفرقه')
          );

          if (generalGroups.length > 0 && suggestions.length === 0) {
            const generalGroup = generalGroups[0];
            suggestions.push({
              contact_id: contact.id,
              contact_name: `${contact.first_name} ${contact.last_name}`,
              suggested_group_id: generalGroup.id,
              suggested_group_name: generalGroup.name,
              suggested_group_color: generalGroup.color,
              confidence: 30,
              reasoning: `پیشنهاد گروه عمومی برای مخاطبی که اطلاعات خاصی ندارد`,
              priority: priorityCounter++
            });
          }

          // مرتب‌سازی پیشنهادات بر اساس اولویت
          suggestions.sort((a, b) => a.priority - b.priority);

          if (suggestions.length > 0) {
            newContactSuggestions.push({
              contact_id: contact.id,
              contact_name: `${contact.first_name} ${contact.last_name}`,
              suggestions
            });
          }
        });

      } catch (error) {
        console.error('Error generating suggestions:', error);
        ErrorManager.notifyUser(t('ai_suggestions.error_generating_suggestions'), 'error');
        return;
      }

      setContactSuggestions(newContactSuggestions);
      setIsGeneratingSuggestions(false);
      setIsAnimating(false);

      if (newContactSuggestions.length === 0) {
        ErrorManager.notifyUser(t('ai_suggestions.no_group_suggestions_found'), 'info');
      } else {
        ErrorManager.notifyUser(t('ai_suggestions.group_suggestions_generated'), 'success');
      }
    }, 2500);
  }, [contactsWithoutGroup, groups, t, session]);

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

      // حذف این پیشنهاد از لیست
      setContactSuggestions(prev =>
        prev.map(cs =>
          cs.contact_id === suggestion.contact_id
            ? {
                ...cs,
                suggestions: cs.suggestions.filter(s => s.priority !== suggestion.priority)
              }
            : cs
        ).filter(cs => cs.suggestions.length > 0)
      );

      invalidateCache(`contacts_list_${session.user.id}_`);
      fetchContactsWithoutGroup();
    } catch (err: unknown) {
      ErrorManager.logError(err, { component: 'SmartGroupManagement', action: 'applyGroupSuggestion', suggestion });
      ErrorManager.notifyUser(`${t('ai_suggestions.error_applying_group_suggestion')}: ${ErrorManager.getErrorMessage(err)}`, 'error');
    }
  }, [session, t, fetchContactsWithoutGroup]);

  const handleDiscardSuggestion = useCallback((contactId: string, priority: number) => {
    setContactSuggestions(prev =>
      prev.map(cs =>
        cs.contact_id === contactId
          ? {
              ...cs,
              suggestions: cs.suggestions.filter(s => s.priority !== priority)
            }
          : cs
      ).filter(cs => cs.suggestions.length > 0)
    );
    ErrorManager.notifyUser(t('ai_suggestions.group_suggestion_discarded'), 'info');
  }, [t]);

  const applyAllSuggestions = useCallback(async () => {
    if (!session?.user || contactSuggestions.length === 0) return;

    try {
      const suggestionsToApply = contactSuggestions.flatMap(cs =>
        cs.suggestions.map(s => ({
          user_id: session.user.id,
          contact_id: s.contact_id,
          group_id: s.suggested_group_id,
        }))
      );

      const { error } = await supabase
        .from('contact_groups')
        .insert(suggestionsToApply);

      if (error) throw new Error(error.message);

      ErrorManager.notifyUser(t('ai_suggestions.all_suggestions_applied_success'), 'success');
      setContactSuggestions([]);
      invalidateCache(`contacts_list_${session.user.id}_`);
      fetchContactsWithoutGroup();
    } catch (err: unknown) {
      ErrorManager.logError(err, { component: 'SmartGroupManagement', action: 'applyAllSuggestions' });
      ErrorManager.notifyUser(`${t('ai_suggestions.error_applying_all_suggestions')}: ${ErrorManager.getErrorMessage(err)}`, 'error');
    }
  }, [session, contactSuggestions, fetchContactsWithoutGroup, t]);

  return {
    // State
    contactsWithoutGroup,
    contactSuggestions,
    isGeneratingSuggestions,
    isAnimating,
    isLoadingContacts,
    stats,

    // Actions
    fetchContactsWithoutGroup,
    generateGroupSuggestions,
    handleApplySuggestion,
    handleDiscardSuggestion,
    applyAllSuggestions,

    // Computed
    hasSuggestions: contactSuggestions.length > 0,
    canGenerateSuggestions: contactsWithoutGroup.length > 0 && !isGeneratingSuggestions,
  };
};
