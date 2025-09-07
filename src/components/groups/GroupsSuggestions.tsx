import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  CheckCircle,
  XCircle,
  Wand2,
  Lightbulb,
  Target
} from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from "@/components/ui/modern-card";
import LoadingSpinner from "../common/LoadingSpinner";

interface GroupSuggestion {
  contact_id: string;
  contact_name: string;
  suggested_group_id: string;
  suggested_group_name: string;
  suggested_group_color?: string;
}

interface GroupsSuggestionsProps {
  contactsWithoutGroup: any[];
  groupSuggestions: GroupSuggestion[];
  isLoadingSuggestions: boolean;
  generateSuggestions: () => void;
  handleApplySuggestion: (suggestion: GroupSuggestion) => void;
  handleDiscardSuggestion: (contactId: string) => void;
  activeTab: 'overview' | 'manage';
}

const GroupsSuggestions: React.FC<GroupsSuggestionsProps> = ({
  contactsWithoutGroup,
  groupSuggestions,
  isLoadingSuggestions,
  generateSuggestions,
  handleApplySuggestion,
  handleDiscardSuggestion,
  activeTab
}) => {
  const { t } = useTranslation();

  if (contactsWithoutGroup.length === 0 || activeTab !== 'overview') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <ModernCard
        variant="glass"
        className="fade-in-up rounded-3xl shadow-2xl border-2 border-white/40 dark:border-gray-600/40 backdrop-blur-xl bg-gradient-to-br from-yellow-50/50 via-orange-50/30 to-red-50/20 dark:from-yellow-900/20 dark:via-orange-900/10 dark:to-red-900/5 overflow-hidden transition-all duration-500 hover:shadow-3xl hover:border-yellow-300/50 dark:hover:border-yellow-600/50"
      >
        <ModernCardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-xl">
                  <Sparkles size={32} className="text-white animate-spin-slow" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <ModernCardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  {t('groups.smart_suggestions_title')}
                </ModernCardTitle>
                <ModernCardDescription className="text-lg">
                  {t('groups.smart_suggestions_description')}
                </ModernCardDescription>
              </div>
            </div>

            <GlassButton
              onClick={generateSuggestions}
              disabled={isLoadingSuggestions}
              variant="gradient-primary"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isLoadingSuggestions ? (
                <LoadingSpinner size={20} />
              ) : (
                <Wand2 size={20} className="animate-pulse" />
              )}
              {t('ai_suggestions.generate_suggestions')}
            </GlassButton>
          </div>
        </ModernCardHeader>

        <ModernCardContent className="space-y-6">
          {groupSuggestions.length > 0 ? (
            <div className="space-y-4">
              {groupSuggestions.map((suggestion, index) => (
                <motion.div
                  key={`${suggestion.contact_id}-${suggestion.suggested_group_id}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group flex items-center justify-between p-6 rounded-3xl shadow-xl hover-lift border-2 border-white/40 dark:border-gray-600/40 backdrop-blur-lg bg-gradient-to-r from-white/60 via-white/40 to-white/20 dark:from-gray-800/60 dark:via-gray-800/40 dark:to-gray-800/20 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/20 hover:scale-[1.02]"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Lightbulb size={20} className="text-yellow-500 animate-pulse" />
                      <p className="font-bold text-gray-800 dark:text-gray-100 text-xl group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors duration-300">
                        {suggestion.contact_name}
                      </p>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 flex items-center gap-3 text-lg">
                      <Target size={16} className="text-blue-500" />
                      {t('groups.suggested_group')}:
                      <span
                        className="px-4 py-2 rounded-2xl text-white font-semibold shadow-lg backdrop-blur-sm border-2 border-white/30 flex items-center gap-2 hover:scale-105 transition-all duration-300"
                        style={{ backgroundColor: suggestion.suggested_group_color || '#6366f1' }}
                      >
                        <div
                          className="w-3 h-3 rounded-full bg-white/30"
                          style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                        />
                        {suggestion.suggested_group_name}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-4 ms-6">
                    <GlassButton
                      variant="ghost"
                      size="icon"
                      onClick={() => handleApplySuggestion(suggestion)}
                      className="text-green-600 hover:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-900/30 hover-lift w-14 h-14 border-2 border-green-200/50 dark:border-green-800/50 rounded-2xl hover:scale-110 transition-all duration-300 group"
                    >
                      <CheckCircle size={28} className="group-hover:rotate-12 transition-transform duration-300" />
                    </GlassButton>
                    <GlassButton
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDiscardSuggestion(suggestion.contact_id)}
                      className="text-red-600 hover:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-900/30 hover-lift w-14 h-14 border-2 border-red-200/50 dark:border-red-800/50 rounded-2xl hover:scale-110 transition-all duration-300 group"
                    >
                      <XCircle size={28} className="group-hover:-rotate-12 transition-transform duration-300" />
                    </GlassButton>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12"
            >
              <div className="relative mb-6">
                <Sparkles size={64} className="text-gray-400 mx-auto mb-4 animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-2xl opacity-0 animate-pulse"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                {t('ai_suggestions.no_suggestions_available')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {t('ai_suggestions.click_generate', 'برای تولید پیشنهادات هوشمند کلیک کنید')}
              </p>
              <GlassButton
                onClick={generateSuggestions}
                disabled={isLoadingSuggestions}
                variant="glass"
                className="px-6 py-3 hover:scale-105 transition-transform duration-300"
              >
                {isLoadingSuggestions ? (
                  <LoadingSpinner size={20} />
                ) : (
                  <Wand2 size={20} className="animate-bounce" />
                )}
                {t('ai_suggestions.generate_suggestions')}
              </GlassButton>
            </motion.div>
          )}
        </ModernCardContent>
      </ModernCard>
    </motion.div>
  );
};

export default GroupsSuggestions;