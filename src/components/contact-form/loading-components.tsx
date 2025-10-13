import React from 'react';
import { useTranslation } from 'react-i18next';

// Loading component for sections
export const SectionLoader: React.FC = () => (
  <div className="flex justify-center items-center p-4">
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
  </div>
);

// Skeleton for the entire form
export const FormSkeleton: React.FC = () => (
  <div className="space-y-6 p-6">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
        <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
            <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Loading overlay for form submission
export const FormSubmissionLoader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="absolute inset-0 bg-slate-900/5 dark:bg-slate-100/5 z-10 flex items-center justify-center rounded-2xl">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        <p className="text-sm text-slate-600 dark:text-slate-400">{t('loading_messages.saving_changes')}</p>
      </div>
    </div>
  );
};
