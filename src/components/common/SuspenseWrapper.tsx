import React, { Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface SuspenseWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

const DefaultFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center space-y-4">
      <LoadingSpinner size={32} />
      <p className="text-gray-600 dark:text-gray-300">Loading...</p>
    </div>
  </div>
);

const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({ 
  children, 
  fallback = <DefaultFallback />, 
  className 
}) => {
  return (
    <div className={className}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </div>
  );
};

export default SuspenseWrapper;