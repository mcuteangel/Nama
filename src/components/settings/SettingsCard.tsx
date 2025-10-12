import React from 'react';
import { cn } from '@/lib/utils';
import i18n from '@/integrations/i18n';

interface SettingsCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  gradient?: 'blue' | 'green' | 'purple' | 'orange' | 'cyan' | 'pink' | 'red';
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
    blue: 'bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200/60 dark:border-blue-800/30',
    green: 'bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200/60 dark:border-green-800/30',
    purple: 'bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200/60 dark:border-purple-800/30',
    orange: 'bg-gradient-to-br from-orange-50/80 to-red-50/80 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200/60 dark:border-orange-800/30',
    cyan: 'bg-gradient-to-br from-cyan-50/80 to-blue-50/80 dark:from-cyan-950/30 dark:to-blue-950/30 border-cyan-200/60 dark:border-cyan-800/30',
    pink: 'bg-gradient-to-br from-pink-50/80 to-rose-50/80 dark:from-pink-950/30 dark:to-rose-950/30 border-pink-200/60 dark:border-pink-800/30',
    red: 'bg-gradient-to-br from-red-50/80 to-rose-50/80 dark:from-red-950/30 dark:to-rose-950/30 border-red-200/60 dark:border-red-800/30'
  };

  const iconColors = {
    blue: 'text-blue-600 dark:text-blue-300 bg-white/80 dark:bg-blue-900/40 shadow-sm',
    green: 'text-green-600 dark:text-green-300 bg-white/80 dark:bg-green-900/40 shadow-sm',
    purple: 'text-purple-600 dark:text-purple-300 bg-white/80 dark:bg-purple-900/40 shadow-sm',
    orange: 'text-orange-600 dark:text-orange-300 bg-white/80 dark:bg-orange-900/40 shadow-sm',
    cyan: 'text-cyan-600 dark:text-cyan-300 bg-white/80 dark:bg-cyan-900/40 shadow-sm',
    pink: 'text-pink-600 dark:text-pink-300 bg-white/80 dark:bg-pink-900/40 shadow-sm',
    red: 'text-red-600 dark:text-red-300 bg-white/80 dark:bg-red-900/40 shadow-sm'
  };

  const isRTL = i18n.language === 'fa';

  return (
    <div 
      dir={isRTL ? 'rtl' : 'ltr'}
      className={cn(
        'group relative p-5 rounded-xl border transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-0.5',
        'backdrop-blur-sm hover:backdrop-blur-md',
        'transform-gpu',
        gradientClasses[gradient],
        'hover:border-opacity-60 dark:hover:border-opacity-40',
        className,
        isRTL ? 'rtl' : 'ltr',
        'overflow-visible', // Changed from 'overflow-hidden' to 'overflow-visible'
        'before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0',
        'hover:before:opacity-100 before:transition-opacity before:duration-300',
        'after:absolute after:inset-0 after:bg-gradient-to-br after:from-white/5 after:to-transparent after:opacity-0',
        'hover:after:opacity-100 after:transition-opacity after:duration-500',
        'z-0' // Ensure the card is behind interactive elements
      )}
      style={{
        boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div className="flex flex-col gap-3 relative z-10">
        {(title || icon) && (
          <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            {icon && (
              <div 
                className={cn(
                  'p-2.5 rounded-xl transition-all duration-300',
                  'group-hover:scale-105 group-hover:shadow-sm',
                  iconColors[gradient]
                )}
              >
                {React.cloneElement(icon as React.ReactElement, {
                  size: 18,
                })}
              </div>
            )}
            <div className="flex-1">
              {title && (
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                  <span className="group-hover:underline decoration-dotted decoration-2">
                    {title}
                  </span>
                </h3>
              )}
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                  {description}
                </p>
              )}
            </div>
          </div>
        )}
        <div className="flex-1 mt-2 relative z-10">
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsCard;