import React from 'react';
import { motion } from 'framer-motion';
import { ModernCard } from '@/components/ui/modern-card';
import { LucideIcon } from 'lucide-react';

interface FormSectionProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'card' | 'simple' | 'inline';
}

export const FormSection: React.FC<FormSectionProps> = ({
  icon: Icon,
  title,
  description,
  children,
  className = '',
  variant = 'card'
}) => {
  if (variant === 'simple') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`space-y-4 ${className}`}
      >
        <ModernCard
          variant="3d-card"
          className="w-full"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              {Icon && <Icon size={16} className="text-slate-500" />}
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {title}
              </h3>
            </div>
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                {description}
              </p>
            )}
            <div>
              {children}
            </div>
          </div>
        </ModernCard>
      </motion.div>
    );
  }

  if (variant === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`flex items-center gap-4 ${className}`}
      >
        {Icon && <Icon size={16} className="text-slate-500 flex-shrink-0" />}
        <div className="flex-1">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {title}
          </div>
          {description && (
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {description}
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          {children}
        </div>
      </motion.div>
    );
  }

  // For 'card' variant, just return the children directly since FormCard handles the card structure
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default FormSection;
