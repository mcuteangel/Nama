import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ContactStatisticsDashboard from "@/components/ContactStatisticsDashboard";
import { useTranslation } from "react-i18next";
import React from "react";

const Statistics = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full">
      <Card className="w-full max-w-4xl glass rounded-xl p-6">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {t('statistics.title')}
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
            {t('statistics.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ContactStatisticsDashboard />
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default Statistics;