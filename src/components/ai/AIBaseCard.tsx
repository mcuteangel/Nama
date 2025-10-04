import React, { useState, useMemo } from 'react';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardDescription, ModernCardContent } from '@/components/ui/modern-card';
import { useTranslation } from 'react-i18next';
import { ConfidenceLevel, SuggestionType, SuggestionPriority, SuggestionStatus } from '@/types/ai-suggestions.types';

interface AIBaseCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'gradient';
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  compact?: boolean;
  simple?: boolean;
  animated?: boolean;
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  // ویژگی‌های جدید برای پیشنهادات
  suggestionType?: SuggestionType;
  priority?: SuggestionPriority;
  status?: SuggestionStatus;
  confidence?: ConfidenceLevel;
  showConfidence?: boolean;
  showStats?: boolean;
  loading?: boolean;
  error?: string;
  success?: boolean;
  // استایلینگ پیشرفته
  gradient?: boolean;
  glow?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  border?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const AIBaseCard: React.FC<AIBaseCardProps> = ({
  title,
  description,
  icon,
  variant = 'primary',
  children,
  actions,
  className = '',
  compact = false,
  simple = false,
  animated = true,
  hoverable = true,
  clickable = false,
  onClick,
  suggestionType,
  priority,
  status,
  confidence,
  showConfidence = false,
  showStats = false,
  loading = false,
  error,
  success,
  gradient = false,
  glow = false,
  shadow = 'lg',
  border = true,
  rounded = 'xl'
}) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  // محاسبه استایل‌های پیشرفته با useMemo برای عملکرد بهتر
  const cardStyles = useMemo(() => {
    if (simple) {
      return {
        base: `rounded-${rounded} ${border ? 'border border-gray-200 dark:border-gray-700' : ''}`,
        variant: '',
        shadow: '',
        animation: ''
      };
    }

    const baseStyles = `rounded-${rounded} backdrop-blur-xl transition-all duration-300`;
    const shadowStyles = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
      '2xl': 'shadow-2xl'
    }[shadow];

    const hoverStyles = hoverable ? 'hover:shadow-xl' : '';
    const clickStyles = clickable ? 'cursor-pointer' : '';
    const glowStyles = glow ? 'hover:shadow-2xl hover:shadow-blue-500/20' : '';
    const animationStyles = animated ? 'hover:scale-[1.02] hover:-translate-y-1' : '';

    let variantStyles = '';
    let gradientStyles = '';

    switch (variant) {
      case 'primary':
        variantStyles = 'border-white/30 bg-gradient-to-br from-white/20 via-blue-50/30 to-purple-50/30 dark:from-white/10 dark:via-blue-900/20 dark:to-purple-900/20';
        break;
      case 'secondary':
        variantStyles = 'border-white/30 bg-gradient-to-br from-white/20 via-gray-50/30 to-slate-50/30 dark:from-white/10 dark:via-gray-800/20 dark:to-slate-800/20';
        break;
      case 'success':
        variantStyles = 'border-white/30 bg-gradient-to-br from-white/20 via-green-50/30 to-emerald-50/30 dark:from-white/10 dark:via-green-900/20 dark:to-emerald-900/20';
        break;
      case 'warning':
        variantStyles = 'border-white/30 bg-gradient-to-br from-white/20 via-yellow-50/30 to-orange-50/30 dark:from-white/10 dark:via-yellow-900/20 dark:to-orange-900/20';
        break;
      case 'danger':
        variantStyles = 'border-white/30 bg-gradient-to-br from-white/20 via-red-50/30 to-pink-50/30 dark:from-white/10 dark:via-red-900/20 dark:to-pink-900/20';
        break;
      case 'info':
        variantStyles = 'border-white/30 bg-gradient-to-br from-white/20 via-cyan-50/30 to-blue-50/30 dark:from-white/10 dark:via-cyan-900/20 dark:to-blue-900/20';
        break;
      case 'gradient':
        gradientStyles = 'bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-pink-500/20 dark:from-violet-900/20 dark:via-purple-900/20 dark:to-pink-900/20';
        variantStyles = 'border-purple-200/30 dark:border-purple-800/30';
        break;
      default:
        variantStyles = baseStyles;
    }

    return {
      base: baseStyles,
      variant: variantStyles,
      gradient: gradientStyles,
      shadow: shadowStyles,
      hover: `${hoverStyles} ${glowStyles} ${animationStyles}`,
      click: clickStyles,
      animation: animated ? 'transition-all duration-300' : ''
    };
  }, [simple, variant, shadow, hoverable, clickable, glow, animated, gradient, border, rounded]);

  // رنگ آیکون بر اساس نوع پیشنهاد و وضعیت
  const getIconColor = useMemo(() => {
    if (simple) {
      return 'text-gray-500 dark:text-gray-400';
    }

    if (loading) return 'text-blue-400 animate-pulse';
    if (error) return 'text-red-400 animate-bounce';
    if (success) return 'text-green-400 animate-bounce';

    switch (variant) {
      case 'primary': return 'text-blue-500';
      case 'secondary': return 'text-gray-500';
      case 'success': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'danger': return 'text-red-500';
      case 'info': return 'text-cyan-500';
      case 'gradient': return 'text-purple-500';
      default: return 'text-blue-500';
    }
  }, [simple, variant, loading, error, success]);

  // رنگ نشانگر اولویت
  const getPriorityColor = useMemo(() => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      case 'medium': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low': return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-900/30';
    }
  }, [priority]);

  // رنگ نشانگر وضعیت
  const getStatusColor = useMemo(() => {
    switch (status) {
      case 'pending': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
      case 'processing': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30 animate-pulse';
      case 'completed': return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      case 'failed': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      case 'discarded': return 'text-gray-500 bg-gray-100 dark:bg-gray-900/30';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-900/30';
    }
  }, [status]);

  if (simple) {
    return (
      <div
        className={`${cardStyles.base} ${cardStyles.variant} ${cardStyles.shadow} ${className}`}
        onClick={clickable ? onClick : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onKeyDown={(e) => {
          if (clickable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick?.();
          }
        }}
      >
        {(title || description || icon) && (
          <div className={`${compact ? 'pb-2' : 'pb-3'}`}>
            {(title || icon) && (
              <div className={`flex items-center gap-2 ${compact ? 'text-sm' : 'text-base'} font-semibold`}>
                {icon && (
                  <div className={`${getIconColor} ${loading ? 'animate-spin' : ''}`}>
                    {icon}
                  </div>
                )}
                <span className="text-gray-800 dark:text-gray-200">
                  {title}
                </span>
                {priority && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor}`}>
                    {t(`ai_suggestions.priority.${priority}`, priority)}
                  </span>
                )}
                {status && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor}`}>
                    {t(`ai_suggestions.status.${status}`, status)}
                  </span>
                )}
              </div>
            )}
            {description && (
              <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400 mt-1`}>
                {description}
              </p>
            )}
            {showConfidence && confidence && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t('ai_suggestions.confidence', 'اعتماد')}:
                </span>
                <div className="flex items-center gap-1">
                  <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000"
                      style={{ width: `${confidence.score}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-green-600 dark:text-green-400">
                    {confidence.score}%
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        <div className={compact ? 'space-y-2' : 'space-y-3'}>
          {children}
          {actions && (
            <div className={`flex ${compact ? 'gap-1' : 'gap-2'} pt-2`}>
              {actions}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <ModernCard
      variant="glass"
      className={`${cardStyles.base} ${cardStyles.variant} ${cardStyles.gradient} ${cardStyles.shadow} ${cardStyles.hover} ${cardStyles.click} ${cardStyles.animation} ${className}`}
      onClick={clickable ? onClick : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (clickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {(title || description || icon) && (
        <ModernCardHeader className={`${compact ? 'pb-2' : 'pb-4'}`}>
          {(title || icon) && (
            <ModernCardTitle className={`flex items-center gap-2 ${compact ? 'text-base' : 'text-xl'} font-bold`}>
              {icon && (
                <div className={`${getIconColor} ${loading ? 'animate-spin' : ''}`}>
                  {icon}
                </div>
              )}
              <span className="bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-gray-100 bg-clip-text text-transparent">
                {title}
              </span>
              <div className="flex items-center gap-1 ml-auto">
                {priority && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor}`}>
                    {t(`ai_suggestions.priority.${priority}`, priority)}
                  </span>
                )}
                {status && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor}`}>
                    {t(`ai_suggestions.status.${status}`, status)}
                  </span>
                )}
              </div>
            </ModernCardTitle>
          )}
          {description && (
            <ModernCardDescription className={`${compact ? 'text-xs' : 'text-base'} text-gray-600 dark:text-gray-400`}>
              {description}
            </ModernCardDescription>
          )}
          {showConfidence && confidence && (
            <div className="mt-3 p-3 bg-gray-50/60 dark:bg-gray-800/40 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('ai_suggestions.confidence', 'اعتماد')}:
                </span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {confidence.score}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000"
                  style={{ width: `${confidence.score}%` }}
                ></div>
              </div>
              {confidence.factors.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {confidence.factors.map((factor, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                      {factor}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </ModernCardHeader>
      )}
      <ModernCardContent className={compact ? 'space-y-2' : 'space-y-4'}>
        {children}
        {actions && (
          <div className={`flex ${compact ? 'gap-1' : 'gap-3'} pt-1`}>
            {actions}
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};

export default AIBaseCard;
