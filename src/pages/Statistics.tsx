import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import ContactStatisticsDashboard from "@/components/ContactStatisticsDashboard";
import { useTranslation } from "react-i18next";

const Statistics = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full">
      <ModernCard variant="glass" className="w-full max-w-4xl rounded-xl p-6">
        <ModernCardHeader className="text-center">
          <ModernCardTitle className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {t('statistics.title')}
          </ModernCardTitle>
          <ModernCardDescription className="text-lg text-gray-600 dark:text-gray-300">
            {t('statistics.description')}
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent className="space-y-6">
          <ContactStatisticsDashboard />
        </ModernCardContent>
      </ModernCard>
      <MadeWithDyad />
    </div>
  );
};

export default Statistics;