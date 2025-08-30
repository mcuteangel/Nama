"use client";

import React from 'react';
import { Frown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  icon?: React.ElementType;
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Frown,
  title,
  description,
  className,
  children,
}) => {
  const { t } = useTranslation();
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center rounded-lg glass-advanced border border-white/20 backdrop-blur-md",
      className
    )}>
      <Icon size={48} className="text-gray-400 dark:text-gray-600 mb-4" />
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
        {title || t('common.no_data_found')}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        {description || t('common.no_data_description')}
      </p>
      {children}
    </div>
  );
};

export default EmptyState;