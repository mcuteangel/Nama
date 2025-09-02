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
          <Building size={20} className="text-teal-500" />
          {t('statistics.top_companies')}
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent className="h-64 overflow-y-auto custom-scrollbar space-y-3">
        {data.length > 0 ? (
          data.map((company, index) => (
            <div 
              key={company.company} 
              className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                  {index + 1}
                </div>
                <span className="font-medium">{company.company}</span>
              </div>
              <span className="font-bold text-primary">{company.count}</span>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">{t('statistics.no_company_data')}</p>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};

export default React.memo(TopCompaniesList);