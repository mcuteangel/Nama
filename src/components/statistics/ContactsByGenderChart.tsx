import React from 'react';
import { PieChart as PieChartIcon } from "lucide-react";
import BasePieChart from './BasePieChart';
import ChartErrorBoundary from './ChartErrorBoundary';
import { GenderData } from './types';

interface ContactsByGenderChartProps {
  data: GenderData[];
}

// Create a wrapper to satisfy the type requirements
const PieChartIconWrapper = (props: { size?: number; className?: string }) => (
  <PieChartIcon {...props} />
);

const ContactsByGenderChart: React.FC<ContactsByGenderChartProps> = ({ data }) => {
  return (
    <ChartErrorBoundary
      title="statistics.contacts_by_gender"
      icon={PieChartIconWrapper}
      iconColor="text-green-500"
    >
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
    </ChartErrorBoundary>
  );
};

export default React.memo(ContactsByGenderChart);