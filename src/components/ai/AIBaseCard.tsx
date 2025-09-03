import React from 'react';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardDescription, ModernCardContent } from "@/components/ui/modern-card";
import { useTranslation } from "react-i18next";

interface AIBaseCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

const AIBaseCard: React.FC<AIBaseCardProps> = ({
  title,
  description,
  icon,
  variant = 'primary',
  children,
  actions,
  className = '',
  compact = false
}) => {
  const { t } = useTranslation();

  const getVariantStyles = () => {
    const baseStyles = "rounded-xl shadow-lg backdrop-blur-xl border transition-all duration-300 hover:shadow-xl";

    switch (variant) {
      case 'primary':
        return `${baseStyles} border-white/30 bg-gradient-to-br from-white/20 via-blue-50/30 to-purple-50/30 dark:from-white/10 dark:via-blue-900/20 dark:to-purple-900/20`;
      case 'secondary':
        return `${baseStyles} border-white/30 bg-gradient-to-br from-white/20 via-gray-50/30 to-slate-50/30 dark:from-white/10 dark:via-gray-800/20 dark:to-slate-800/20`;
      case 'success':
        return `${baseStyles} border-white/30 bg-gradient-to-br from-white/20 via-green-50/30 to-emerald-50/30 dark:from-white/10 dark:via-green-900/20 dark:to-emerald-900/20`;
      case 'warning':
        return `${baseStyles} border-white/30 bg-gradient-to-br from-white/20 via-yellow-50/30 to-orange-50/30 dark:from-white/10 dark:via-yellow-900/20 dark:to-orange-900/20`;
      case 'danger':
        return `${baseStyles} border-white/30 bg-gradient-to-br from-white/20 via-red-50/30 to-pink-50/30 dark:from-white/10 dark:via-red-900/20 dark:to-pink-900/20`;
      default:
        return baseStyles;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'primary': return 'text-blue-400';
      case 'secondary': return 'text-gray-400';
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'danger': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <ModernCard
      variant="glass"
      className={`${getVariantStyles()} ${compact ? 'p-3' : 'p-6'} ${className}`}
    >
      {(title || description || icon) && (
        <ModernCardHeader className={`${compact ? 'pb-2' : 'pb-4'}`}>
          {(title || icon) && (
            <ModernCardTitle className={`flex items-center gap-2 ${compact ? 'text-base' : 'text-xl'} font-bold`}>
              {icon && (
                <div className={`${getIconColor()} ${compact ? '' : 'animate-pulse'}`}>
                  {icon}
                </div>
              )}
              <span className="bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-gray-100 bg-clip-text text-transparent">
                {title}
              </span>
            </ModernCardTitle>
          )}
          {description && (
            <ModernCardDescription className={`${compact ? 'text-xs' : 'text-base'} text-gray-600 dark:text-gray-400`}>
              {description}
            </ModernCardDescription>
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