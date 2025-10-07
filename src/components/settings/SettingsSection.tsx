import React from 'react';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '@/components/ui/modern-card';
import { cn } from '@/lib/utils';
import i18n from '@/integrations/i18n';

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
        <div 
          dir={i18n.language === 'fa' ? 'rtl' : 'ltr'}
          className="flex items-center"
        >
          {icon && (
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50">
              {icon}
            </div>
          )}
          <ModernCardTitle className={i18n.language === 'fa' ? 'mr-3' : 'ml-3'}>
            {title}
          </ModernCardTitle>
        </div>
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