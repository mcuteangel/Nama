import React from 'react';
import { motion } from 'framer-motion';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from '@/components/ui/modern-card';
import { ModernLoader } from '@/components/ui/modern-loader';
import { ModernTooltip, ModernTooltipContent, ModernTooltipTrigger } from '@/components/ui/modern-tooltip';
import { LucideIcon, HelpCircle } from 'lucide-react';
import { t } from 'i18next';

interface ContactCardProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  loading?: boolean;
  error?: string | null;
  data?: Record<string, unknown>; // برای اطلاعات مخاطب
}

export const ContactCard: React.FC<ContactCardProps> = ({
  title,
  description,
  icon: Icon,
  iconColor = '#3b82f6',
  children,
  className = '',
  headerClassName = '',
  contentClassName = '',
  loading = false,
  error = null}) => {
  // Generate simple background color based on icon color
  const getBackgroundFromColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      '#3b82f6': 'bg-sky-100 dark:bg-sky-900/60', // Sky blue - شاد و جذاب
      '#10b981': 'bg-emerald-100 dark:bg-emerald-900/60', // Emerald green - شاد و طبیعی
      '#f59e0b': 'bg-yellow-100 dark:bg-yellow-900/60', // Yellow - شاد و درخشان
      '#ef4444': 'bg-rose-100 dark:bg-rose-900/60', // Rose - شاد و گرم
      '#8b5cf6': 'bg-fuchsia-100 dark:bg-fuchsia-900/60', // Fuchsia - شاد و براق
      '#06b6d4': 'bg-cyan-100 dark:bg-cyan-900/60', // Cyan - شاد و آبی
      '#f97316': 'bg-orange-100 dark:bg-orange-900/60', // Orange - شاد و انرژیک
      '#84cc16': 'bg-lime-100 dark:bg-lime-900/60', // Lime - شاد و تازه
    };

    return colorMap[color] || 'bg-slate-100 dark:bg-slate-900/60';
  };

  // Generate icon background color based on icon color
  const getIconBackgroundFromColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      '#3b82f6': 'bg-sky-200/70 dark:bg-sky-800/60', // Sky blue - شادتر
      '#10b981': 'bg-emerald-200/70 dark:bg-emerald-800/60', // Emerald green - شادتر
      '#f59e0b': 'bg-yellow-200/70 dark:bg-yellow-800/60', // Yellow - شادتر
      '#ef4444': 'bg-rose-200/70 dark:bg-rose-800/60', // Rose - شادتر
      '#8b5cf6': 'bg-fuchsia-200/70 dark:bg-fuchsia-800/60', // Fuchsia - شادتر
      '#06b6d4': 'bg-cyan-200/70 dark:bg-cyan-800/60', // Cyan - شادتر
      '#f97316': 'bg-orange-200/70 dark:bg-orange-800/60', // Orange - شادتر
      '#84cc16': 'bg-lime-200/70 dark:bg-lime-800/60', // Lime - شادتر
    };

    return colorMap[color] || 'bg-slate-200/70 dark:bg-slate-800/60';
  };

  // Generate icon color based on icon color
  const getIconColorFromColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      '#3b82f6': 'text-sky-700 dark:text-sky-300', // Sky blue - شاد
      '#10b981': 'text-emerald-700 dark:text-emerald-300', // Emerald green - شاد
      '#f59e0b': 'text-yellow-700 dark:text-yellow-300', // Yellow - شاد
      '#ef4444': 'text-rose-700 dark:text-rose-300', // Rose - شاد
      '#8b5cf6': 'text-fuchsia-700 dark:text-fuchsia-300', // Fuchsia - شاد
      '#06b6d4': 'text-cyan-700 dark:text-cyan-300', // Cyan - شاد
      '#f97316': 'text-orange-700 dark:text-orange-300', // Orange - شاد
      '#84cc16': 'text-lime-700 dark:text-lime-300', // Lime - شاد
    };

    return colorMap[color] || 'text-slate-700 dark:text-slate-300';
  };

  const cardContent = (
    <>
      {/* Header */}
      <ModernCardHeader className={`${headerClassName}`}>
        <div className="flex items-center gap-2">
          {Icon && (
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${getIconBackgroundFromColor(iconColor)} flex items-center justify-center`}>
              <Icon size={18} className={getIconColorFromColor(iconColor)} />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <ModernCardTitle className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
                {title}
              </ModernCardTitle>
              {description && (
                <ModernTooltip>
                  <ModernTooltipTrigger asChild>
                    <HelpCircle size={16} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-help transition-colors transform scale-x-[-1]" />
                  </ModernTooltipTrigger>
                  <ModernTooltipContent>
                    <p className="max-w-xs text-sm">{description}</p>
                  </ModernTooltipContent>
                </ModernTooltip>
              )}
            </div>
          </div>
        </div>
      </ModernCardHeader>

      {/* Content */}
      <ModernCardContent className={`p-2 sm:p-3 space-y-2 ${contentClassName}`}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <ModernLoader variant="spinner" size="sm" />
            <span className="mr-3 text-sm text-slate-600 dark:text-slate-400">
              {t('common.loading')}
            </span>
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
        className={`w-full ${getBackgroundFromColor(iconColor)}`}
      >
        {cardContent}
      </ModernCard>
    </motion.div>
  );
};

export default ContactCard;
