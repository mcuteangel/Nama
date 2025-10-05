import React, { useState } from 'react';
import { designTokens } from '@/lib/design-tokens';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModernTooltip, ModernTooltipContent, ModernTooltipProvider, ModernTooltipTrigger } from "@/components/ui/modern-tooltip";
import { CheckCircle, XCircle, Star, Lightbulb, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from "react-i18next";
import { GlassButton } from "@/components/ui/glass-button";
import { GroupSuggestion } from '@/types/group-suggestions';

interface GroupSuggestionCardProps {
  contactName: string;
  suggestions: Array<GroupSuggestion & { priority: number }>;
  onApply: (suggestion: GroupSuggestion) => void;
  onDiscard: (contactId: string, priority: number) => void;
  isHovered?: boolean;
  isSelected?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const GroupSuggestionCard: React.FC<GroupSuggestionCardProps> = ({
  contactName,
  suggestions,
  onApply,
  onDiscard,
  isHovered = false,
  isSelected = false,
  onMouseEnter,
  onMouseLeave,
  onClick,
  style,
}) => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <ModernTooltipProvider>
      <div
        className={`
          group bg-gradient-to-r from-white/80 via-white/60 to-white/40
          dark:from-gray-800/80 dark:via-gray-800/60 dark:to-gray-700/40
          p-4 rounded-2xl border-2 backdrop-blur-sm shadow-lg
          transition-all duration-500 ease-out
          hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-[1.02] hover:-translate-y-0.5
          ${isHovered ? 'border-purple-300/70 shadow-purple-500/30' : 'border-white/40 dark:border-gray-600/40'}
          ${isSelected ? 'ring-4 ring-purple-500/50 bg-purple-50/50 dark:bg-purple-900/20' : ''}
          animate-slide-in
        `}
        style={style}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        role="button"
        tabIndex={0}
      >
        <div className="space-y-4">
          {/* Contact Header */}
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 transition-all duration-300 hover:ring-4"
                style={{
                  border: `2px solid ${designTokens.colors.primary[300]}`,
                  boxShadow: designTokens.shadows.lg
                }}
              >
                <AvatarImage src={undefined} alt={contactName} />
                <AvatarFallback
                  style={{
                    background: designTokens.gradients.primary,
                    color: 'white',
                    fontSize: designTokens.typography.sizes.lg,
                    fontWeight: designTokens.typography.weights.bold
                  }}
                >
                  {contactName.split(' ').slice(0, 2).map(n => n[0]).join(' ')}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <p className="font-bold text-base text-gray-800 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                {contactName}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {suggestions.length} پیشنهاد هوشمند
              </p>
            </div>
            <GlassButton
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setIsCollapsed(!isCollapsed);
              }}
              className="w-8 h-8 rounded-full bg-purple-500/20 hover:bg-purple-500/30 dark:bg-purple-900/40 dark:hover:bg-purple-800/60 text-purple-600 hover:text-purple-700 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl backdrop-blur-sm"
              aria-label={isCollapsed ? t('common.expand') : t('common.collapse')}
            >
              {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </GlassButton>
          </div>

          {/* Suggestions List */}
          {!isCollapsed && (
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
              <div
                key={`${suggestion.contact_id}-${suggestion.priority}`}
                className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/30 dark:border-gray-700/30 transition-all duration-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold shadow-sm ${
                      suggestion.priority === 1 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                      suggestion.priority === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                      suggestion.priority === 3 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      اولویت {suggestion.priority}
                    </span>
                    <span
                      className="px-3 py-1.5 rounded-xl font-semibold shadow-sm flex items-center gap-2"
                      style={{
                        backgroundColor: `${suggestion.suggested_group_color}20`,
                        color: suggestion.suggested_group_color || '#6366f1'
                      }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: suggestion.suggested_group_color || '#6366f1' }}
                      ></div>
                      {suggestion.suggested_group_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Star size={14} className="text-yellow-500" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {t('ai_suggestions.confidence')}: {suggestion.confidence}%
                      </span>
                    </div>

                    {suggestion.reasoning && (
                      <div className="flex items-center gap-2">
                        <Lightbulb size={14} className="text-blue-500" />
                        <span className="text-gray-600 dark:text-gray-300">
                          {suggestion.reasoning}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confidence Bar */}
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-600 h-1.5 rounded-full transition-all duration-1000 ease-out shadow-sm"
                        style={{ width: `${suggestion.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <ModernTooltip>
                    <ModernTooltipTrigger asChild>
                      <GlassButton
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onApply(suggestion);
                        }}
                        className="w-10 h-10 rounded-full bg-green-500/20 hover:bg-green-500/30 dark:bg-green-900/40 dark:hover:bg-green-800/60 text-green-600 hover:text-green-700 transition-all duration-300 hover:scale-110 border border-green-200/60 dark:border-green-800/60 shadow-lg hover:shadow-xl backdrop-blur-sm"
                        aria-label={t('ai_suggestions.apply_suggestion')}
                      >
                        <CheckCircle size={18} />
                      </GlassButton>
                    </ModernTooltipTrigger>
                    <ModernTooltipContent>
                      <p className="text-sm">{t('ai_suggestions.apply_this_suggestion')}</p>
                    </ModernTooltipContent>
                  </ModernTooltip>

                  <ModernTooltip>
                    <ModernTooltipTrigger asChild>
                      <GlassButton
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDiscard(suggestion.contact_id, suggestion.priority);
                        }}
                        className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/30 dark:bg-red-900/40 dark:hover:bg-red-800/60 text-red-600 hover:text-red-700 transition-all duration-300 hover:scale-110 border border-red-200/60 dark:border-red-800/60 shadow-lg hover:shadow-xl backdrop-blur-sm"
                        aria-label={t('common.discard')}
                      >
                        <XCircle size={18} />
                      </GlassButton>
                    </ModernTooltipTrigger>
                    <ModernTooltipContent>
                      <p className="text-sm">{t('ai_suggestions.discard_this_suggestion')}</p>
                    </ModernTooltipContent>
                  </ModernTooltip>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </ModernTooltipProvider>
  );
};
