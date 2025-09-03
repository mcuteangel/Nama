import React from 'react';
import { PieChart as PieChartIcon } from "lucide-react";
import BasePieChart from './BasePieChart';
import { GenderData } from './types';

interface ContactsByGenderChartProps {
  data: GenderData[];
}

const ContactsByGenderChart: React.FC<ContactsByGenderChartProps> = ({ data }) => {
  return (
    <BasePieChart
      data={data}
      title="statistics.contacts_by_gender"
      icon={PieChartIcon}
      iconColor="text-green-500"
      emptyMessageKey="statistics.no_gender_data"
      translationPrefix="gender"
      nameKey="gender"
      valueKey="count"
    />
  );
};

export default React.memo(ContactsByGenderChart);