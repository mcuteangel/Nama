import React from 'react';
import { useTranslation } from 'react-i18next';

const TestTranslations: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Translation Test</h1>
      <div className="space-y-2">
        <p>Common Refresh: {t('common.refresh')}</p>
        <p>Statistics No Preferred Method Data: {t('statistics.no_preferred_method_data')}</p>
      </div>
    </div>
  );
};

export default TestTranslations;