"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { ModernButton } from '@/components/ui/modern-button';
import { useNavigate } from 'react-router-dom';

const RTLTestSetting: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleTestClick = () => {
    navigate('/rtl-test');
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <Label htmlFor="rtl-test" className="text-gray-700 dark:text-gray-200">
          {t('settings.rtl_components_test')}
        </Label>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('settings.rtl_components_test_description')}
        </p>
      </div>
      <ModernButton
        id="rtl-test"
        onClick={handleTestClick}
        variant="outline"
        className="px-4 py-2"
      >
        {t('settings.test_components')}
      </ModernButton>
    </div>
  );
};

export default RTLTestSetting;