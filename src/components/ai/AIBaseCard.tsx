import React, { useState } from 'react';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardDescription, ModernCardContent } from '@/components/ui/modern-card';
import { useTranslation } from 'react-i18next';

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
}) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  if (simple) {
    return (
      <div
        className={`rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
        onClick={clickable ? onClick : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
      >
        {(title || description || icon) && (
          <div className={`${compact ? 'pb-2' : 'pb-3'}`}>
            {(title || icon) && (
              <div className={`flex items-center gap-2 ${compact ? 'text-sm' : 'text-base'} font-semibold`}>
                {icon && (
                  <div className="text-gray-500">
                    {icon}
                  </div>
                )}
                <span className="text-gray-800 dark:text-gray-200">
                  {title}
                </span>
              </div>
            )}
            {description && (
              <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400 mt-1`}>
                {description}
              </p>
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
      className={`rounded-lg ${className}`}
      onClick={clickable ? onClick : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {(title || description || icon) && (
        <ModernCardHeader className={`${compact ? 'pb-2' : 'pb-4'}`}>
          {(title || icon) && (
            <ModernCardTitle className={`flex items-center gap-2 ${compact ? 'text-base' : 'text-xl'} font-bold`}>
              {icon && (
                <div className="text-gray-500">
                  {icon}
                </div>
              )}
              <span className="text-gray-800 dark:text-gray-200">
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
