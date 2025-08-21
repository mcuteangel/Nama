import React from 'react';
import { useTranslation } from 'react-i18next';

interface LoadingMessageProps {
  message?: string;
}

const LoadingMessage: React.FC<LoadingMessageProps> = ({ message }) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center h-full w-full">
      <p className="text-gray-700 dark:text-gray-300">
        {message || t('common.loading')}
      </p>
    </div>
  );
};

export default LoadingMessage;