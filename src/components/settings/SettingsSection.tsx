import React from 'react';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '@/components/ui/modern-card';
import { cn } from '@/lib/utils';

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  variant?: 'glass' | 'neomorphism' | 'minimal';
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  icon,
  children,
  className,
  variant = 'glass'
}) => {
  return (
    <ModernCard 
      variant={variant} 
      hover="lift"
      className={cn('rounded-xl shadow-lg', className)}
    >
      <ModernCardHeader className="pb-4">
        <ModernCardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-3">
          {icon && (
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50">
              {icon}
            </div>
          )}
          {title}
        </ModernCardTitle>
        {description && (
          <ModernCardDescription className="text-gray-600 dark:text-gray-400 mt-2">
            {description}
          </ModernCardDescription>
        )}
      </ModernCardHeader>
      <ModernCardContent className="space-y-4">
        {children}
      </ModernCardContent>
    </ModernCard>
  );
};

export default SettingsSection;