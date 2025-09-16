import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const FormSectionSkeleton = () => {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-white/50 to-white/30 dark:from-neutral-800/50 dark:to-neutral-900/30 border-2 border-white/40 dark:border-neutral-700/40 backdrop-blur-sm shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const FormFieldSkeleton = () => {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24 rounded-full" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
};

export default FormSectionSkeleton;
