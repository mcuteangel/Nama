import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, TrendingUp, Activity, Award } from 'lucide-react';
import AIBaseCard from '../AIBaseCard';
import { useGenderSuggestionStats } from '@/hooks/use-gender-suggestion-stats';
import { GenderSuggestion } from '@/types/ai-suggestions.types';

interface ContactForGenderSuggestion {
  id: string;
  first_name: string;
  last_name: string;
  gender: 'male' | 'female' | 'not_specified';
}

interface GenderSuggestionStatsProps {
  ungenderedContacts: ContactForGenderSuggestion[];
  genderSuggestions: GenderSuggestion[];
}

const GenderSuggestionStats: React.FC<GenderSuggestionStatsProps> = ({
  ungenderedContacts,
  genderSuggestions,
}) => {
  const { t } = useTranslation();
  const stats = useGenderSuggestionStats(ungenderedContacts, genderSuggestions);

  if (stats.totalContacts === 0) {
    return null;
  }

  return (
    <AIBaseCard
      title={t('ai_suggestions.gender_suggestion_title')}
      description={t('ai_suggestions.gender_suggestion_description')}
      icon={<div className="text-pink-500 animate-pulse">💖</div>}
      variant="gradient"
      className="relative overflow-hidden"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 dark:from-pink-500/20 dark:to-pink-600/20 rounded-2xl p-4 border border-pink-200/30 dark:border-pink-800/30 backdrop-blur-sm text-center">
          <Users size={24} className="text-pink-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{stats.totalContacts}</div>
          <div className="text-sm text-pink-500 dark:text-pink-300">{t('ai_suggestions.ungendered_contacts', 'بدون جنسیت')}</div>
        </div>

        <div className="bg-gradient-to-br from-rose-500/10 to-rose-600/10 dark:from-rose-500/20 dark:to-rose-600/20 rounded-2xl p-4 border border-rose-200/30 dark:border-rose-800/30 backdrop-blur-sm text-center">
          <TrendingUp size={24} className="text-rose-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.successRate}%</div>
          <div className="text-sm text-rose-500 dark:text-rose-300">{t('ai_suggestions.match_rate', 'نرخ تطابق')}</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 rounded-2xl p-4 border border-blue-200/30 dark:border-blue-800/30 backdrop-blur-sm text-center">
          <Activity size={24} className="text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.maleSuggestions}</div>
          <div className="text-sm text-blue-500 dark:text-blue-300">👨 {t('gender.male', 'مرد')}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-500/20 dark:to-purple-600/20 rounded-2xl p-4 border border-purple-200/30 dark:border-purple-800/30 backdrop-blur-sm text-center">
          <Award size={24} className="text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.femaleSuggestions}</div>
          <div className="text-sm text-purple-500 dark:text-purple-300">👩 {t('gender.female', 'زن')}</div>
        </div>
      </div>
    </AIBaseCard>
  );
};

export default GenderSuggestionStats;
