"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { GlassButton } from "@/components/ui/glass-button";
import { useNavigate } from 'react-router-dom';
import { TestTube } from 'lucide-react';

const RTLTestSetting: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleTestClick = () => {
    navigate('/rtl-test');
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/50 dark:border-purple-800/50 transition-all duration-300 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/50">
          <TestTube className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="rtl-test" className="text-gray-800 dark:text-gray-200 font-medium">
            {t('settings.rtl_components_test')}
          </Label>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {t('settings.rtl_components_test_description')}
          </p>
        </div>
      </div>
      <GlassButton
        id="rtl-test"
        onClick={handleTestClick}
        variant="outline"
        className="px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors duration-200"
      >
        {t('settings.test_components')}
      </GlassButton>
    </div>
  );
};

export default RTLTestSetting;