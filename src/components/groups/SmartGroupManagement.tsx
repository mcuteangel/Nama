import React, { useEffect } from 'react';
import {
  Users,
  Sparkles,
  Brain,
  Zap,
  TrendingUp,
  BarChart3,
  Target,
  Star,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSession } from "@/integrations/supabase/auth";
import EmptyState from '../common/EmptyState';
import LoadingSpinner from '../common/LoadingSpinner';
import { GlassButton, GradientGlassButton } from "@/components/ui/glass-button";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";
import { useGroupSuggestions } from '@/hooks/use-group-suggestions';
import { GroupSuggestionsList } from './GroupSuggestionsList';

const SmartGroupManagement: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const { isLoading: isSessionLoading } = useSession();

  const {
    contactsWithoutGroup,
    contactSuggestions,
    isGeneratingSuggestions,
    isLoadingContacts,
    stats,
    fetchContactsWithoutGroup,
    generateGroupSuggestions,
    handleApplySuggestion,
    handleDiscardSuggestion,
    applyAllSuggestions,
    hasSuggestions,
    canGenerateSuggestions,
  } = useGroupSuggestions();

  useEffect(() => {
    fetchContactsWithoutGroup();
  }, [fetchContactsWithoutGroup]);

  if (isSessionLoading || isLoadingContacts) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <LoadingSpinner size={48} className="text-purple-500 mx-auto" />
          <span className="text-lg text-gray-600 dark:text-gray-400">
            {t('ai_suggestions.loading_smart_management_data')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <ModernCard
      variant="glass"
      className="rounded-3xl shadow-2xl border-2 border-white/40 dark:border-gray-600/40 backdrop-blur-xl bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-indigo-50/20 dark:from-purple-900/20 dark:via-blue-900/10 dark:to-indigo-900/5 overflow-hidden transition-all duration-500 hover:shadow-3xl hover:border-purple-300/50 dark:hover:border-purple-600/50 hover:-translate-y-1 hover:scale-[1.02]"
    >
      <ModernCardHeader className="pb-4">
        <ModernCardTitle className="text-gray-800 dark:text-gray-100 flex items-center gap-2 text-xl font-bold">
          <Brain size={24} className="text-blue-500 animate-pulse" />
          <span className="text-gray-800 dark:text-gray-200">{t('ai_suggestions.smart_group_management_title')}</span>
        </ModernCardTitle>
        <p className="text-base text-gray-600 dark:text-gray-400">
        </p>
      </ModernCardHeader>

      <ModernCardContent className="space-y-4">
        {/* Statistics */}
        {stats.totalContacts > 0 && !isGeneratingSuggestions && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 rounded-2xl p-3 border border-blue-200/30 dark:border-blue-800/30 backdrop-blur-sm text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <BarChart3 size={20} className="text-blue-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.totalContacts}</div>
              <div className="text-xs text-blue-500 dark:text-blue-300">{t('ai_suggestions.ungrouped_contacts')}</div>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 rounded-2xl p-3 border border-green-200/30 dark:border-green-800/30 backdrop-blur-sm text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <TrendingUp size={20} className="text-green-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{stats.successRate}%</div>
              <div className="text-xs text-green-500 dark:text-green-300">{t('ai_suggestions.match_rate')}</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-500/20 dark:to-purple-600/20 rounded-2xl p-3 border border-purple-200/30 dark:border-purple-800/30 backdrop-blur-sm text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Target size={20} className="text-purple-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats.uniqueGroups}</div>
              <div className="text-xs text-purple-500 dark:text-purple-300">{t('ai_suggestions.unique_groups')}</div>
            </div>

            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 dark:from-orange-500/20 dark:to-orange-600/20 rounded-2xl p-3 border border-orange-200/30 dark:border-orange-800/30 backdrop-blur-sm text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Star size={20} className="text-orange-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{stats.avgConfidence}%</div>
              <div className="text-xs text-orange-500 dark:text-orange-300">{t('ai_suggestions.confidence', 'اعتماد')}</div>
            </div>
          </div>
        )}

        {/* Generate Suggestions Button */}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <GradientGlassButton
            onClick={generateGroupSuggestions}
            disabled={!canGenerateSuggestions}
            className="px-4 py-3 rounded-2xl font-semibold text-sm bg-gradient-to-r from-purple-500 via-blue-600 to-indigo-600 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
          >
            {isGeneratingSuggestions ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size={18} className="text-white" />
                <span className="text-sm">{t('ai_suggestions.analyzing_contacts', 'در حال تحلیل...')}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles size={18} />
                <span className="text-sm">{t('ai_suggestions.generate_group_suggestions')}</span>
              </div>
            )}
          </GradientGlassButton>

          {hasSuggestions && (
            <GradientGlassButton
              onClick={applyAllSuggestions}
              className="px-4 py-3 rounded-2xl font-semibold text-sm bg-gradient-to-r from-purple-500 via-blue-600 to-indigo-600 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 w-full sm:w-auto"
            >
              <Zap size={16} className="mr-2" />
              <span className="text-sm">{t('ai_suggestions.apply_all', 'اعمال همه')}</span>
            </GradientGlassButton>
          )}
        </div>

        {/* AI Processing Animation */}
        {isGeneratingSuggestions && (
          <div className="bg-gradient-to-r from-purple-50/60 to-blue-50/60 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-4 border border-purple-200/30 dark:border-purple-800/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <Brain size={28} className="text-purple-500 animate-pulse" />
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
        <GroupSuggestionsList
          contactSuggestions={contactSuggestions}
          onApplySuggestion={handleApplySuggestion}
          onDiscardSuggestion={handleDiscardSuggestion}
        />
      </ModernCardContent>
    </ModernCard>
  );
});

SmartGroupManagement.displayName = 'SmartGroupManagement';

export default SmartGroupManagement;
