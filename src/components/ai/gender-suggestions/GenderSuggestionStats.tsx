import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, TrendingUp } from 'lucide-react';
import { FaMale, FaFemale } from 'react-icons/fa';
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
    <div className="relative overflow-hidden rounded-3xl shadow-2xl backdrop-blur-xl bg-gradient-to-br from-pink-50/80 via-white/60 to-purple-50/80 dark:from-pink-950/30 dark:via-gray-900/60 dark:to-purple-950/30 border border-white/20 dark:border-white/10 hover:shadow-pink-500/20 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 w-full max-w-6xl mx-auto">
        <div className="group relative bg-gradient-to-br from-pink-500/10 via-pink-400/5 to-pink-600/10 dark:from-pink-500/20 dark:via-pink-400/10 dark:to-pink-600/20 rounded-2xl p-2 border border-pink-200/30 dark:border-pink-800/30 backdrop-blur-sm text-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/30 hover:-translate-y-1 min-w-0">
          <Users size={18} className="text-pink-500 mx-auto mb-0.5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
          <div className="text-lg font-bold text-pink-600 dark:text-pink-400 relative z-10 leading-tight">{stats.totalContacts}</div>
          <div className="text-[11px] text-pink-500 dark:text-pink-300 relative z-10 leading-tight px-0.5">{t('ai_suggestions.ungendered_contacts')}</div>
        </div>

        <div className="group relative bg-gradient-to-br from-rose-500/10 via-rose-400/5 to-rose-600/10 dark:from-rose-500/20 dark:via-rose-400/10 dark:to-rose-600/20 rounded-2xl p-2 border border-rose-200/30 dark:border-rose-800/30 backdrop-blur-sm text-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/30 hover:-translate-y-1 min-w-0">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
          <TrendingUp size={18} className="text-rose-500 mx-auto mb-0.5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
          <div className="text-lg font-bold text-rose-600 dark:text-rose-400 relative z-10 leading-tight">{stats.successRate}%</div>
          <div className="text-[11px] text-rose-500 dark:text-rose-300 relative z-10 leading-tight px-0.5">{t('ai_suggestions.match_rate')}</div>
        </div>

        <div className="group relative bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-blue-600/10 dark:from-blue-500/20 dark:via-blue-400/10 dark:to-blue-600/20 rounded-2xl p-2 border border-blue-200/30 dark:border-blue-800/30 backdrop-blur-sm text-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1 min-w-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
          <FaMale size={18} className="text-blue-500 mx-auto mb-0.5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400 relative z-10 leading-tight">{stats.maleSuggestions}</div>
          <div className="text-[11px] text-blue-500 dark:text-blue-300 relative z-10 leading-tight px-0.5">{t('ai_suggestions.male_suggestions')}</div>
        </div>

        <div className="group relative bg-gradient-to-br from-purple-500/10 via-purple-400/5 to-purple-600/10 dark:from-purple-500/20 dark:via-purple-400/10 dark:to-purple-600/20 rounded-2xl p-2 border border-purple-200/30 dark:border-purple-800/30 backdrop-blur-sm text-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-1 min-w-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
          <FaFemale size={18} className="text-purple-500 mx-auto mb-0.5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400 relative z-10 leading-tight">{stats.femaleSuggestions}</div>
          <div className="text-[11px] text-purple-500 dark:text-purple-300 relative z-10 leading-tight px-0.5">{t('ai_suggestions.female_suggestions')}</div>
        </div>
      </div>
    </div>
  );
};
export default GenderSuggestionStats;
