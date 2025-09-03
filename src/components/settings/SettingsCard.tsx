import React from 'react';
import { cn } from '@/lib/utils';

interface SettingsCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  gradient?: 'blue' | 'green' | 'purple' | 'orange' | 'cyan' | 'pink';
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  icon,
  children,
  className,
  gradient = 'blue'
}) => {
  const gradientClasses = {
    blue: 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50 dark:border-blue-800/50',
    green: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50 dark:border-green-800/50',
    purple: 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200/50 dark:border-purple-800/50',
    orange: 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200/50 dark:border-orange-800/50',
    cyan: 'bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border-cyan-200/50 dark:border-cyan-800/50',
    pink: 'bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 border-pink-200/50 dark:border-pink-800/50'
  };

  const iconColors = {
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50',
    green: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50',
    orange: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/50',
    cyan: 'text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/50',
    pink: 'text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/50'
  };

  return (
    <div className={cn(
      'p-4 rounded-lg border transition-all duration-300 hover:shadow-md backdrop-blur-sm',
      gradientClasses[gradient],
      className
    )}>
      <div className="flex flex-col gap-3">
        {(title || icon) && (
          <div className="flex items-start gap-3">
            {icon && (
              <div className={cn('p-2 rounded-full', iconColors[gradient])}>
                {icon}
              </div>
            )}
            <div className="flex-1">
              {title && (
                <h3 className="font-medium text-gray-800 dark:text-gray-200">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>
        )}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SettingsCard;