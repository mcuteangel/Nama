import React from 'react';
import { Building } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";

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
    <ModernCard variant="glass" className="rounded-xl p-4 col-span-1">
      <ModernCardHeader className="pb-2">
        <ModernCardTitle className="text-lg font-semibold flex items-center gap-2">
          <Building size={20} className="text-indigo-500" />
          {t('statistics.top_companies')}
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent className="h-64 overflow-y-auto custom-scrollbar">
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
      </ModernCardContent>
    </ModernCard>
  );
};

export default TopCompaniesList;