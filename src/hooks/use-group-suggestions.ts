import { useState, useCallback, useEffect } from 'react';
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
const normalizeName = (name: string, commonCompanyTerms: string[] = []) => {
  if (!name) return '';
  
  // تبدیل به حروف کوچک و نرمال‌سازی یونیکد
  let normalized = name
    .toLowerCase()
    .normalize('NFKD')
    // حذف اعداد و علائم نگارشی
    .replace(/[\u06F0-\u06F9\u0660-\u06690-9\u200C\u200F\u0640\u200b\s\-_،؛,.]/g, ' ')
    // حذف اعراب
    .replace(/[\u064B-\u065F\u0670\u0610-\u061A\u06D6-\u06ED]/g, '');

  // حذف کلمات رایج شرکت‌ها و اضافه‌کردن فاصله
  if (commonCompanyTerms?.length > 0) {
    const validTerms = commonCompanyTerms
      .filter(term => term?.trim())
      .map(term => term.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      
    if (validTerms.length > 0) {
      const termsPattern = `(?:^|\\s)(${validTerms.join('|')})(?=\\s|$)`;
      const regex = new RegExp(termsPattern, 'g');
      normalized = normalized.replace(regex, ' ');
    }
  }
  
  // حذف فاصله‌های اضافی و نهایی
  return normalized.replace(/\s+/g, ' ').trim();
};

// محاسبه فاصله لونشتاین برای تطابق دقیق‌تر
const levenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

const calculateSimilarity = (name1: string, name2: string, commonCompanyTerms: string[] = []) => {
  if (!name1 || !name2) return 0;
  
  // نرمال‌سازی نام‌ها
  const n1 = normalizeName(name1, commonCompanyTerms);
  const n2 = normalizeName(name2, commonCompanyTerms);

  // اگر دقیقاً یکسان بودند
  if (n1 === n2) return 100;
  
  // اگر یکی از رشته‌ها خالی شد (بعد از نرمال‌سازی)
  if (!n1 || !n2) return 0;

  // اگر یکی زیرمجموعه دیگری باشد، امتیاز بالایی بده
  if (n1.includes(n2) || n2.includes(n1)) {
    return 90; // امتیاز ثابت برای زیرمجموعه‌ها
  }

  // بررسی تشابه کلمات
  const words1 = n1.split(/\s+/).filter(Boolean);
  const words2 = n2.split(/\s+/).filter(Boolean);
  
  // اگر حداقل یک کلمه مشترک وجود داشت
  const commonWords = words1.filter(word => words2.includes(word));
  if (commonWords.length > 0) {
    // محاسبه درصد کلمات مشترک
    const wordSimilarity = (commonWords.length / Math.max(words1.length, words2.length)) * 80;
    return Math.min(90, Math.round(wordSimilarity));
  }
  
  // اگر کلمه مشترکی نبود، از فاصله لونشتاین استفاده کن
  const maxLength = Math.max(n1.length, n2.length);
  const distance = levenshteinDistance(n1, n2);
  const similarity = Math.max(0, 100 - (distance / maxLength) * 100);
  
  // اگر شباهت کمتر از 20% بود، صفر برگردان
  return similarity >= 30 ? Math.round(similarity) : 0;
};

interface UseGroupSuggestionsProps {
  initialSimilarityThreshold?: number;
  initialCompanyTerms?: string[];
}

export const useGroupSuggestions = ({
  initialSimilarityThreshold = 60,
  initialCompanyTerms = []
}: UseGroupSuggestionsProps = {}) => {
  const { t } = useTranslation();
  const { session, isLoading: isSessionLoading } = useSession();
  const { groups } = useGroups();
  
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [similarityThreshold, setSimilarityThreshold] = useState(initialSimilarityThreshold);
  const [companyTerms, setCompanyTerms] = useState<string[]>(initialCompanyTerms);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [contactsWithoutGroup, setContactsWithoutGroup] = useState<ContactWithoutGroup[]>([]);
  const [contactSuggestions, setContactSuggestions] = useState<ContactSuggestions[]>([]);
  const [stats, setStats] = useState<GroupSuggestionStats>({
    totalContacts: 0,
    totalSuggestions: 0,
    successRate: 0,
    uniqueGroups: 0,
    avgConfidence: 0,
    processingTime: 0,
    topCompanies: [],
    recentSuggestions: 0
  });

  // Update stats when contacts or suggestions change
  useEffect(() => {
    setStats({
      totalContacts: contactsWithoutGroup.length,
      totalSuggestions: contactSuggestions.reduce((sum, cs) => sum + cs.suggestions.length, 0),
      uniqueGroups: new Set(contactSuggestions.flatMap(cs => 
        cs.suggestions.map(s => s.suggested_group_id)
      )).size,
      successRate: contactSuggestions.length > 0 
        ? Math.round((contactSuggestions.length / contactsWithoutGroup.length) * 100) 
        : 0,
      avgConfidence: contactSuggestions.length > 0 
        ? Math.round(contactSuggestions.reduce((sum, cs) => 
            sum + cs.suggestions.reduce((s, sug) => s + (sug.confidence || 0), 0), 0) / 
            contactSuggestions.reduce((sum, cs) => sum + cs.suggestions.length, 0)) 
        : 0,
      processingTime: 0, // Will be updated when suggestions are generated
      topCompanies: [...new Set(contactsWithoutGroup
        .map(c => c.company)
        .filter(Boolean))].slice(0, 3) as string[],
      recentSuggestions: contactSuggestions.filter(() => 
        Date.now() - (new Date().getTime() - 3600000) < 3600000
      ).length
    });
  }, [contactsWithoutGroup, contactSuggestions]);

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
    isLoading: isContactsLoading,
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

  const generateGroupSuggestions = useCallback((threshold: number, terms: string[]) => {
    setIsGeneratingSuggestions(true);
    setIsAnimating(true);
    
    // Update the local state with the provided values
    setSimilarityThreshold(threshold);
    setCompanyTerms(terms);

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

        // ساخت مپینگ‌های مختلف برای یادگیری از گروه‌بندی‌های موجود
        const companyToGroup = new Map<string, { groupId: string; groupName: string; groupColor?: string; count: number }>();
        const positionToGroup = new Map<string, { groupId: string; groupName: string; groupColor?: string; count: number }>();
        const companyPatterns = new Map<string, { pattern: string; groupId: string; count: number }>();
        const groupNameWords = new Map<string, { word: string; groupId: string; count: number }>();

        // استخراج الگوهای رایج از نام گروه‌ها
        groups.forEach(group => {
          const words = group.name.toLowerCase().split(/\s+/).filter(Boolean);
          words.forEach(word => {
            if (word.length > 2) { // فقط کلمات با طول بیشتر از 2 حرف
              const existing = groupNameWords.get(word);
              if (existing) {
                existing.count++;
              } else {
                groupNameWords.set(word, { word, groupId: group.id, count: 1 });
              }
            }
          });
        });

        // تحلیل گروه‌بندی‌های موجود
        existingGroupings?.forEach(cg => {
          if (!cg.contacts) return;
          
          const contacts = Array.isArray(cg.contacts) ? cg.contacts : [cg.contacts];
          const group = groups.find(g => g.id === cg.group_id);
          if (!group) return;

          contacts.forEach(contact => {
            if (!contact || typeof contact !== 'object') return;
            
            // یادگیری بر اساس شرکت
            if (contact.company) {
              const company = contact.company.trim().toLowerCase();
              
              // ذخیره کل نام شرکت
              const existingCompany = companyToGroup.get(company);
              if (existingCompany) {
                existingCompany.count++;
              } else {
                companyToGroup.set(company, {
                  groupId: group.id,
                  groupName: group.name,
                  groupColor: group.color,
                  count: 1
                });
              }

              // استخراج کلمات کلیدی از نام شرکت
              const companyWords = company.split(/\s+/).filter((w: string) => w.length > 2);
              companyWords.forEach((word: string) => {
                const existing = companyPatterns.get(word);
                if (existing) {
                  existing.count++;
                } else {
                  companyPatterns.set(word, {
                    pattern: word,
                    groupId: group.id,
                    count: 1
                  });
                }
              });
            }

            // یادگیری بر اساس سمت شغلی
            if (contact.position) {
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
          });
        });

        // تولید پیشنهادات برای هر مخاطب
        contactsWithoutGroup.forEach(contact => {
          const suggestions: Array<GroupSuggestion & { priority: number }> = [];
          const companyName = contact.company?.trim();
          const position = contact.position?.trim();
          let priorityCounter = 1;

          // پیشنهادات بر اساس تطابق کامل شرکت (بالاترین اولویت)
          if (companyName) {
            const normalizedCompany = companyName.toLowerCase();
            const companyWords = normalizedCompany.split(/\s+/).filter(Boolean);

            // 1. تطابق کامل شرکت
            const exactMatch = companyToGroup.get(normalizedCompany);
            if (exactMatch) {
              const confidence = Math.min(100, 90 + (exactMatch.count * 2));
              suggestions.push({
                contact_id: contact.id,
                contact_name: `${contact.first_name} ${contact.last_name}`,
                suggested_group_id: exactMatch.groupId,
                suggested_group_name: exactMatch.groupName,
                suggested_group_color: exactMatch.groupColor,
                confidence,
                reasoning: t('ai_suggestions.group_suggestion_reasoning_company_exact', {
                  count: exactMatch.count,
                  companyName,
                  groupName: exactMatch.groupName
                }),
                priority: priorityCounter++
              });
            }

            // 2. تطابق کلمات کلیدی شرکت
            const companyWordMatches = new Map<string, { groupId: string; groupName: string; groupColor?: string; score: number }>();
            
            companyWords.forEach(word => {
              if (word.length < 3) return;
              
              // جستجوی کلمات مشابه در الگوهای شرکت
              for (const [pattern, info] of companyPatterns.entries()) {
                const similarity = calculateSimilarity(word, pattern, companyTerms);
                if (similarity >= 70) {
                  const existing = companyWordMatches.get(info.groupId);
                  const score = similarity * (info.count * 0.1);
                  
                  if (!existing || score > existing.score) {
                    companyWordMatches.set(info.groupId, {
                      groupId: info.groupId,
                      groupName: groups.find(g => g.id === info.groupId)?.name || info.groupId,
                      groupColor: groups.find(g => g.id === info.groupId)?.color,
                      score
                    });
                  }
                }
              }
            });

            // اضافه کردن پیشنهادات کلمات کلیدی
            companyWordMatches.forEach((match, groupId) => {
              if (!suggestions.some(s => s.suggested_group_id === groupId)) {
                const group = groups.find(g => g.id === groupId);
                if (group) {
                  suggestions.push({
                    contact_id: contact.id,
                    contact_name: `${contact.first_name} ${contact.last_name}`,
                    suggested_group_id: groupId,
                    suggested_group_name: group.name,
                    suggested_group_color: group.color,
                    confidence: Math.min(90, Math.round(match.score)),
                    reasoning: t('ai_suggestions.group_suggestion_reasoning_company_pattern', {
                      companyName,
                      groupName: group.name
                    }),
                    priority: priorityCounter++
                  });
                }
              }
            });

            // 3. تطابق جزئی شرکت
            for (const [existingCompany, groupInfo] of companyToGroup.entries()) {
              if (normalizedCompany === existingCompany) continue; // از قبل اضافه شده
              
              const similarity = calculateSimilarity(normalizedCompany, existingCompany, companyTerms);
              if (similarity >= 60) {
                const confidence = Math.min(85, similarity + (groupInfo.count * 2));
                if (!suggestions.some(s => s.suggested_group_id === groupInfo.groupId)) {
                  suggestions.push({
                    contact_id: contact.id,
                    contact_name: `${contact.first_name} ${contact.last_name}`,
                    suggested_group_id: groupInfo.groupId,
                    suggested_group_name: groupInfo.groupName,
                    suggested_group_color: groupInfo.groupColor,
                    confidence,
                    reasoning: t('ai_suggestions.group_suggestion_reasoning_company_similar', {
                      companyName,
                      existingCompany,
                      groupName: groupInfo.groupName,
                      similarity: Math.round(similarity)
                    }),
                    priority: priorityCounter++
                  });
                }
              }
            }
          }

          // پیشنهادات بر اساس سمت شغلی (اولویت پایین‌تر)
          if (position) {
            const normalizedPosition = position.toLowerCase();
            const positionWords = normalizedPosition.split(/\s+/).filter(Boolean);
            const positionWordMatches = new Map<string, { groupId: string; groupName: string; groupColor?: string; score: number }>();

            // 1. تطابق کامل سمت شغلی
            const exactPositionMatch = positionToGroup.get(normalizedPosition);
            if (exactPositionMatch) {
              const confidence = Math.min(100, 85 + (exactPositionMatch.count * 2));
              if (!suggestions.some(s => s.suggested_group_id === exactPositionMatch.groupId)) {
                suggestions.push({
                  contact_id: contact.id,
                  contact_name: `${contact.first_name} ${contact.last_name}`,
                  suggested_group_id: exactPositionMatch.groupId,
                  suggested_group_name: exactPositionMatch.groupName,
                  suggested_group_color: exactPositionMatch.groupColor,
                  confidence,
                  reasoning: t('ai_suggestions.group_suggestion_reasoning_position_exact', {
                    position,
                    groupName: exactPositionMatch.groupName,
                    count: exactPositionMatch.count
                  }),
                  priority: priorityCounter++
                });
              }
            }

            // 2. تطابق کلمات کلیدی سمت شغلی
            positionWords.forEach((word: string) => {
              if (word.length < 3) return;
              
              for (const [existingPosition, groupInfo] of positionToGroup.entries()) {
                if (existingPosition.includes(word) || word.includes(existingPosition)) {
                  const existing = positionWordMatches.get(groupInfo.groupId);
                  const score = 70 + (groupInfo.count * 2);
                  
                  if (!existing || score > existing.score) {
                    positionWordMatches.set(groupInfo.groupId, {
                      groupId: groupInfo.groupId,
                      groupName: groupInfo.groupName,
                      groupColor: groupInfo.groupColor,
                      score
                    });
                  }
                }
              }
            });

            // اضافه کردن پیشنهادات کلمات کلیدی سمت شغلی
            positionWordMatches.forEach((match, groupId) => {
              if (!suggestions.some(s => s.suggested_group_id === groupId)) {
                const group = groups.find(g => g.id === groupId);
                if (group) {
                  suggestions.push({
                    contact_id: contact.id,
                    contact_name: `${contact.first_name} ${contact.last_name}`,
                    suggested_group_id: groupId,
                    suggested_group_name: group.name,
                    suggested_group_color: group.color,
                    confidence: Math.min(85, Math.round(match.score)),
                    reasoning: t('ai_suggestions.group_suggestion_reasoning_position_pattern', {
                      position,
                      groupName: group.name
                    }),
                    priority: priorityCounter++
                  });
                }
              }
            });

            // 3. تطابق جزئی سمت شغلی
            for (const [existingPosition, groupInfo] of positionToGroup.entries()) {
              if (normalizedPosition === existingPosition) continue; // از قبل اضافه شده
              
              const similarity = calculateSimilarity(normalizedPosition, existingPosition, companyTerms);
              if (similarity >= 60) {
                const confidence = Math.min(80, similarity + (groupInfo.count * 2));
                if (!suggestions.some(s => s.suggested_group_id === groupInfo.groupId)) {
                  suggestions.push({
                    contact_id: contact.id,
                    contact_name: `${contact.first_name} ${contact.last_name}`,
                    suggested_group_id: groupInfo.groupId,
                    suggested_group_name: groupInfo.groupName,
                    suggested_group_color: groupInfo.groupColor,
                    confidence,
                    reasoning: t('ai_suggestions.group_suggestion_reasoning_position_similar', {
                      position,
                      existingPosition,
                      groupName: groupInfo.groupName,
                      similarity: Math.round(similarity)
                    }),
                    priority: priorityCounter++
                  });
                }
              }
            }
          }

          // پیشنهادات بر اساس similarity قدیمی (اولویت پایین‌تر)
          if (companyName) {
            const companyMatches = groups
              .map(group => ({
                group,
                similarity: calculateSimilarity ? calculateSimilarity(companyName, group.name, companyTerms) : 0
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
                  reasoning: t('ai_suggestions.group_suggestion_reasoning_company_similarity', {
                    companyName,
                    groupName: match.group.name,
                    similarity: match.similarity
                  }),
                  priority: priorityCounter++
                });
              }
            });
          }

          if (position && !suggestions.find(s => s.contact_id === contact.id && s.reasoning?.includes(t('ai_suggestions.group_suggestion_reasoning_position_similarity', { position: '', groupName: '', similarity: 0 }).split(' ')[0]))) {
            const positionMatches = groups
              .map(group => ({
                group,
                similarity: calculateSimilarity ? calculateSimilarity(position, group.name, companyTerms) : 0
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
                  reasoning: t('ai_suggestions.group_suggestion_reasoning_position_similarity', {
                    position,
                    groupName: match.group.name,
                    similarity: match.similarity
                  }),
                  priority: priorityCounter++
                });
              }
            });
          }

          // پیشنهاد گروه عمومی (اولویت پایین‌ترین)
          const generalGroups = groups.filter(g =>
            g.name.toLowerCase().includes(t('general_group_keywords.general')) ||
            g.name.toLowerCase().includes(t('general_group_keywords.other')) ||
            g.name.toLowerCase().includes(t('general_group_keywords.miscellaneous'))
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
              reasoning: t('ai_suggestions.group_suggestion_reasoning_general'),
              priority: priorityCounter++
            });
          }

          // مرتب‌سازی پیشنهادات بر اساس اولویت
          suggestions.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));

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
  }, [contactsWithoutGroup, groups, t, session, companyTerms]);

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

  // Update the generateGroupSuggestions function to use the new state
  const generateGroupSuggestionsWithSettings = useCallback(() => {
    // Use the current state values
    return generateGroupSuggestions(similarityThreshold, companyTerms);
  }, [generateGroupSuggestions, similarityThreshold, companyTerms]);

  return {
    // State
    contactsWithoutGroup,
    contactSuggestions,
    isGeneratingSuggestions,
    isAnimating,
    isLoadingContacts: isContactsLoading,
    stats,
    similarityThreshold,
    companyTerms,
    showAdvancedSettings,

    // Actions
    fetchContactsWithoutGroup,
    generateGroupSuggestions: generateGroupSuggestionsWithSettings,
    handleApplySuggestion,
    handleDiscardSuggestion,
    applyAllSuggestions,
    setSimilarityThreshold,
    setCompanyTerms,
    setShowAdvancedSettings,

    // Computed
    hasSuggestions: contactSuggestions.length > 0,
    canGenerateSuggestions: contactsWithoutGroup.length > 0 && !isGeneratingSuggestions,
  };
};
