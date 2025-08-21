import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CompanyData {
  company: string;
  count: number;
}

interface TopCompaniesListProps {
  data: CompanyData[];
}

const TopCompaniesList: React.FC<TopCompaniesListProps> = ({ data }) => {
  const { t } = useTranslation();

  return (
    <Card className="rounded-xl p-4 col-span-1 bg-white dark:bg-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Building size={20} className="text-indigo-500" />
          {t('statistics.top_companies')}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-64 overflow-y-auto custom-scrollbar">
        {data.length > 0 ? (
          <ul className="space-y-3">
            {data.map((item, index) => (
              <li key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
                <p className="font-medium text-gray-800 dark:text-gray-100">{item.company}</p>
                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {item.count} {t('common.contacts')}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">{t('statistics.no_company_data')}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TopCompaniesList;