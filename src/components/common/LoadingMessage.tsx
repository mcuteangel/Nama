import React from 'react';
import { useTranslation } from 'react-i18next';
import { ModernCard } from '@/components/ui/modern-card';

interface LoadingMessageProps {
  message?: string;
}

const LoadingMessage: React.FC<LoadingMessageProps> = ({ message }) => {
  const { t } = useTranslation();
  return (
    <ModernCard variant="glass" className="flex items-center justify-center h-full w-full p-8">
      <p className="text-gray-700 dark:text-gray-300">
        {message || t('common.loading')}
      </p>
    </ModernCard>
  );
};

export default LoadingMessage;