import React from 'react';
import { Building } from "lucide-react";
import BaseList from './BaseList';
import { CompanyData } from './types';

interface TopCompaniesListProps {
  data: CompanyData[];
}

const TopCompaniesList: React.FC<TopCompaniesListProps> = ({ data }) => {
  return (
    <BaseList
      data={data}
      title="statistics.top_companies"
      icon={Building}
      iconColor="text-teal-500"
      emptyMessageKey="statistics.no_company_data"
      nameKey="company"
      countKey="count"
    />
  );
};

export default React.memo(TopCompaniesList);