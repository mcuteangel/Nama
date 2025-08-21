import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TotalContactsCardProps {
  count: number | null;
}

const TotalContactsCard: React.FC<TotalContactsCardProps> = ({ count }) => {
  const { t } = useTranslation();
  return (
    <Card className="glass rounded-xl p-4 flex flex-col items-center justify-center text-center">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Users size={24} className="text-blue-600 dark:text-blue-400" />
          {t('statistics.total_contacts')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-5xl font-extrabold text-blue-700 dark:text-blue-300">
          {count !== null ? count : '...'}
        </div>
      </CardContent>
    </Card>
  );
};

export default TotalContactsCard;