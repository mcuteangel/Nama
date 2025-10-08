import React from 'react';
import { motion } from 'framer-motion';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardDescription, ModernCardContent } from '@/components/ui/modern-card';
import { ModernLoader } from '@/components/ui/modern-loader';
import { LucideIcon } from 'lucide-react';

interface FormCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  loading?: boolean;
  error?: string | null;
}

export const FormCard: React.FC<FormCardProps> = ({
  title,
  description,
  icon: Icon,
  iconColor = '#3b82f6',
  children,
  className = '',
  headerClassName = '',
  contentClassName = '',
  loading = false,
  error = null
}) => {
  // Generate gradient based on icon color
  const getGradientFromColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      '#3b82f6': 'from-blue-500/10 to-blue-600/5', // Blue - کمرنگ‌تر
      '#10b981': 'from-emerald-500/10 to-emerald-600/5', // Green - کمرنگ‌تر
      '#f59e0b': 'from-amber-500/10 to-amber-600/5', // Yellow - کمرنگ‌تر
      '#ef4444': 'from-red-500/10 to-red-600/5', // Red - کمرنگ‌تر
      '#8b5cf6': 'from-violet-500/10 to-violet-600/5', // Purple - کمرنگ‌تر
      '#06b6d4': 'from-cyan-500/10 to-cyan-600/5', // Cyan - کمرنگ‌تر
      '#f97316': 'from-orange-500/10 to-orange-600/5', // Orange - کمرنگ‌تر
      '#84cc16': 'from-lime-500/10 to-lime-600/5', // Lime - کمرنگ‌تر
    };

    return colorMap[color] || 'from-slate-500/10 to-slate-600/5';
  };

  const cardContent = (
    <>
      {/* Header */}
      <ModernCardHeader className={`p-4 sm:p-6 ${headerClassName}`}>
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary-500/10 flex items-center justify-center">
              <Icon size={20} className="text-primary-600 dark:text-primary-400" />
            </div>
          )}
          <div className="flex-1">
            <ModernCardTitle className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </ModernCardTitle>
            {description && (
              <ModernCardDescription className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
                {description}
              </ModernCardDescription>
            )}
          </div>
        </div>
      </ModernCardHeader>

      {/* Content */}
      <ModernCardContent className={`p-4 sm:p-6 space-y-4 ${contentClassName}`}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <ModernLoader variant="spinner" size="sm" />
            <span className="mr-3 text-sm text-slate-600 dark:text-slate-400">در حال بارگذاری...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <span className="text-sm">{error}</span>
            </div>
          </div>
        ) : (
          children
        )}
      </ModernCardContent>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <ModernCard
        variant="3d-card"
        className={`w-full bg-gradient-to-br ${getGradientFromColor(iconColor)}`}
      >
        {cardContent}
      </ModernCard>
    </motion.div>
  );
};

export default FormCard;
