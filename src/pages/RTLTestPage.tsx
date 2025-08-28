import React from 'react';
import RTLTestComponent from '@/components/RTLTestComponent';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from '@/components/ui/modern-card';

const RTLTestPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full">
      <ModernCard variant="glass" className="w-full max-w-3xl rounded-xl p-6">
        <ModernCardHeader>
          <ModernCardTitle className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100">
            RTL Component Test
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent>
          <RTLTestComponent />
        </ModernCardContent>
      </ModernCard>
    </div>
  );
};

export default RTLTestPage;