import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TotalContactsCardProps {
  count: number | null;
}

const TotalContactsCard: React.FC<TotalContactsCardProps> = ({ count }) => {
  const { t } = useTranslation();
  return (
    <Card className="rounded-xl p-4 flex flex-col items-center justify-center text-center bg-white dark:bg-gray-800 min-h-[256px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Users size={20} className="text-blue-500" />
          {t('statistics.total_contacts')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-5xl font-bold text-gray-900 dark:text-gray-100">
          {count !== null ? count : '...'}
        </p>
      </CardContent>
    </Card>
  );
};

export default TotalContactsCard;