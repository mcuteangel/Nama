import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PositionData {
  position: string;
  count: number;
}

interface TopPositionsListProps {
  data: PositionData[];
}

const TopPositionsList: React.FC<TopPositionsListProps> = ({ data }) => {
  const { t } = useTranslation();
  const hasData = data && data.length > 0;

  return (
    <Card className="glass rounded-xl p-4 col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Briefcase size={24} className="text-orange-600 dark:text-orange-400" />
          {t('statistics.top_positions')}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-64 overflow-y-auto custom-scrollbar">
        {hasData ? (
          <ul className="space-y-3">
            {data.map((item, index) => (
              <li key={item.position || `no-position-${index}`} className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-800 shadow-sm">
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  {item.position || t('statistics.not_specified')}
                </span>
                <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                  {item.count}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            {t('statistics.no_data_available')}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default TopPositionsList;