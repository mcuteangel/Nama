import React from 'react';

interface AIBaseCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'gradient';
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  clickable?: boolean;
  onClick?: () => void;
  
  // Additional props from AISuggestionCard
  suggestionType?: string;
  priority?: string | number;
  status?: string;
  confidence?: number;
  showConfidence?: boolean;
  showStats?: boolean;
  loading?: boolean;
}

const AIBaseCard: React.FC<AIBaseCardProps> = ({
  title,
  description,
  icon,
  variant = 'primary',
  children,
  actions,
  className = '',
  headerClassName = '',
  clickable = false,
  onClick,
}) => {
  // Default header classes
  const defaultHeaderClasses = 'px-6 pt-4 pb-2';
  const headerClasses = `${defaultHeaderClasses} ${headerClassName}`.trim();

  // Get variant-specific styles
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-50/80 dark:bg-blue-900/30 border-blue-200/70 dark:border-blue-800/70';
      case 'secondary':
        return 'bg-white/80 dark:bg-gray-800/70 border-gray-200/70 dark:border-gray-700/70';
      case 'success':
        return 'bg-green-50/80 dark:bg-green-900/25 border-green-200/70 dark:border-green-800/70';
      case 'warning':
        return 'bg-amber-50/80 dark:bg-amber-900/25 border-amber-200/70 dark:border-amber-800/70';
      case 'danger':
        return 'bg-red-50/80 dark:bg-red-900/25 border-red-200/70 dark:border-red-800/70';
      case 'info':
        return 'bg-cyan-50/80 dark:bg-cyan-900/25 border-cyan-200/70 dark:border-cyan-800/70';
      case 'gradient':
        return 'bg-gradient-to-br from-purple-50/90 to-blue-50/90 dark:from-purple-900/25 dark:to-blue-900/25 border-purple-200/70 dark:border-purple-800/70';
      default:
        return 'bg-white/80 dark:bg-gray-800/70 border-gray-200/70 dark:border-gray-700/70';
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 backdrop-blur-lg shadow-sm ${getVariantClasses()} hover:shadow-lg hover:-translate-y-0.5 ${className}`}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {/* Header */}
      {(title || description || icon || actions) && (
        <div className={`${headerClasses} border-b border-inherit`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {icon && (
                <div className="mt-0.5 flex-shrink-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/60 dark:bg-gray-700/60 shadow-sm border border-white/30 dark:border-gray-600/50">
                    {icon}
                  </div>
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
                {description && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{description}</p>
                )}
              </div>
            </div>
            {actions && <div className="flex-shrink-0">{actions}</div>}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">{children}</div>
    </div>
  );
};

export default AIBaseCard;
