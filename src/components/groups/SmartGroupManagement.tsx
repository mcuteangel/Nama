import React, { useEffect, useState } from 'react';
import {
  Users,
  Sparkles,
  Brain,
  Zap,
  TrendingUp,
  BarChart3,
  Target,
  Star,
  RefreshCw,
  Settings,
  ChevronUp,
  X,
  Plus,
  
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSession } from "@/integrations/supabase/auth";
import LoadingSpinner from '../common/LoadingSpinner';
import { GradientGlassButton } from "@/components/ui/glass-button";
import { useGroupSuggestions } from '@/hooks/use-group-suggestions';
import { GroupSuggestionsList } from './GroupSuggestionsList';
import { EmptyState } from '../common';
import { ModernSlider } from '@/components/ui/modern-slider';
import { ModernInput } from '@/components/ui/modern-input';

const SmartGroupManagement: React.FC = () => {
  const { t } = useTranslation();
  const { isLoading: isSessionLoading } = useSession();
  
  // Function to handle slider value change
  const handleSliderChange = (value: number[]) => {
    setSimilarityThreshold(value[0]);
  };

  const {
    contactsWithoutGroup,
    contactSuggestions,
    isGeneratingSuggestions,
    isLoadingContacts,
    isAnimating,
    stats,
    similarityThreshold,
    companyTerms,
    showAdvancedSettings,
    fetchContactsWithoutGroup,
    generateGroupSuggestions,
    handleApplySuggestion,
    handleDiscardSuggestion,
    applyAllSuggestions,
    setSimilarityThreshold,
    setCompanyTerms,
    setShowAdvancedSettings,
    hasSuggestions,
    canGenerateSuggestions,
  } = useGroupSuggestions();

  const [newTerm, setNewTerm] = useState('');
  const [localCompanyTerms, setLocalCompanyTerms] = useState<string[]>(companyTerms);

  useEffect(() => {
    setLocalCompanyTerms(companyTerms);
  }, [companyTerms]);

  const handleAddTerm = () => {
    if (newTerm.trim() && !localCompanyTerms.includes(newTerm.trim())) {
      const updatedTerms = [...localCompanyTerms, newTerm.trim()];
      setLocalCompanyTerms(updatedTerms);
      setCompanyTerms(updatedTerms);
      setNewTerm('');
    }
  };

  const handleRemoveTerm = (termToRemove: string) => {
    const updatedTerms = localCompanyTerms.filter(term => term !== termToRemove);
    setLocalCompanyTerms(updatedTerms);
    setCompanyTerms(updatedTerms);
  };

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
    <div className="space-y-6">
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
              <div className="text-xs text-orange-500 dark:text-orange-300">{t('ai_suggestions.confidence')}</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <button
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-all duration-300 shadow-sm hover:shadow"
            >
              {showAdvancedSettings ? (
                <>
                  <ChevronUp size={16} className="shrink-0" />
                  {t('common.hide_advanced')}
                </>
              ) : (
                <>
                  <Settings size={16} className="shrink-0" />
                  {t('common.advanced_settings')}
                </>
              )}
            </button>
          </div>

          {showAdvancedSettings && (
            <div className="bg-white/30 dark:bg-gray-800/30 p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm shadow-lg space-y-6 transition-all duration-300">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('ai_suggestions.similarity_threshold')}
                  </span>
                  <span className="text-sm font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full">
                    {similarityThreshold}%
                  </span>
                </div>
                <div className="mt-4 px-2">
                  <ModernSlider
                    value={[similarityThreshold]}
                    onValueChange={handleSliderChange}
                    min={30}
                    max={100}
                    step={5}
                    variant="primary"
                    size="md"
                    showThumb={true}
                    showRange={true}
                    showTicks={false}
                    className="w-full"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('ai_suggestions.similarity_threshold_help')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('ai_suggestions.company_terms')}
                </label>
                <div className="flex gap-2">
                  <ModernInput
                    type="text"
                    value={newTerm}
                    variant="glass"
                    inputSize="lg"
                    onChange={(e) => setNewTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTerm()}
                    placeholder={t('ai_suggestions.add_company_term')}
                    className="flex-1 h-12 text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border-2 border-white/30 dark:border-gray-700/50 rounded-xl shadow-lg focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400/30 transition-all duration-300 placeholder-gray-500/70 dark:placeholder-gray-400/60 text-gray-800 dark:text-gray-200 focus:outline-none focus:shadow-outline transform hover:scale-[1.01] focus:scale-[1.01] hover:shadow-[0_4px_20px_-5px_rgba(59,130,246,0.2)] focus:shadow-[0_4px_20px_-5px_rgba(59,130,246,0.3)]"
                  />
                  <button
                    onClick={handleAddTerm}
                    disabled={!newTerm.trim()}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm hover:shadow-md"
                  >
                    <Plus size={16} />
                    {t('common.add')}
                  </button>
                </div>
                {localCompanyTerms.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {localCompanyTerms.map((term) => (
                      <span 
                      key={term}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 rounded-full border border-blue-100/70 dark:border-blue-800/50 hover:bg-blue-100/70 dark:hover:bg-blue-900/40 transition-colors"
                      >
                        <span className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 transition-colors">
                          {term}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTerm(term)}
                          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
                          aria-label={t('common.remove')}
                        >
                          <X size={12} className="shrink-0" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-3">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <GradientGlassButton
              onClick={generateGroupSuggestions}
              disabled={!canGenerateSuggestions}
              className={`px-4 py-3 rounded-2xl font-semibold text-sm bg-gradient-to-r from-purple-500 via-blue-600 to-indigo-600 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 transform ${isAnimating ? 'animate-pulse' : 'hover:-translate-y-1 hover:scale-105'}`}
            >
              {isGeneratingSuggestions ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size={18} className="text-white" />
                  <span className="text-sm">{t('ai_suggestions.analyzing_contacts')}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles size={18} />
                  <span className="text-sm">{t('ai_suggestions.generate_group_suggestions')}</span>
                </div>
              )}
            </GradientGlassButton>

            <GradientGlassButton
              onClick={fetchContactsWithoutGroup}
              disabled={isLoadingContacts}
              className="px-4 py-3 rounded-2xl font-semibold text-sm bg-gradient-to-r from-blue-500 to-cyan-600 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
            >
              <div className="flex items-center gap-2">
                <RefreshCw size={18} className={isLoadingContacts ? 'animate-spin' : ''} />
                <span className="text-sm">{t('common.refresh')}</span>
              </div>
            </GradientGlassButton>
          </div>

          {hasSuggestions && (
            <GradientGlassButton
              onClick={applyAllSuggestions}
              className="px-4 py-3 rounded-2xl font-semibold text-sm bg-gradient-to-r from-purple-500 via-blue-600 to-indigo-600 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 w-full sm:w-auto"
            >
              <Zap size={16} className="mr-2" />
              <span className="text-sm">{t('ai_suggestions.apply_all')}</span>
            </GradientGlassButton>
          )}
        </div>

        {/* AI Processing Animation */}
        {(isGeneratingSuggestions || isAnimating) && (
          <div className="bg-gradient-to-r from-purple-50/60 to-blue-50/60 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-4 border border-purple-200/30 dark:border-purple-800/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <Brain size={28} className="text-purple-500 animate-pulse" />
                <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping"></div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {t('ai_suggestions.ai_processing')}
                </h3>
                <p className="text-sm text-purple-500 dark:text-purple-300">
                  {t('ai_suggestions.analyzing_patterns')}
                </p>
              </div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
              <div className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {t('ai_suggestions.processing_step')}
            </p>
          </div>
        )}

        {/* Empty State */}
        <div className={`transition-all duration-500 ${contactsWithoutGroup.length === 0 && !isGeneratingSuggestions ? 'opacity-100 scale-100' : 'opacity-0 scale-95 h-0 overflow-hidden'}`}></div>
        {contactsWithoutGroup.length === 0 && !isGeneratingSuggestions && (
          <EmptyState
            icon={Users}
            title={t('ai_suggestions.all_contacts_grouped')}
            description={t('ai_suggestions.all_contacts_grouped_description')}
          />
        )}
        </div>

        {/* Suggestions List */}
        <GroupSuggestionsList
          contactSuggestions={contactSuggestions}
          onApplySuggestion={handleApplySuggestion}
          onDiscardSuggestion={handleDiscardSuggestion}
        />
      </div>
    );
};

export default React.memo(SmartGroupManagement);
