import React from 'react';
import { Users } from "lucide-react";
import BaseBarChart from './BaseBarChart';
import { GroupData } from './types';

interface ContactsByGroupChartProps {
  data: GroupData[];
}

const ContactsByGroupChart: React.FC<ContactsByGroupChartProps> = ({ data }) => {
  return (
    <BaseBarChart
      data={data}
      title="statistics.contacts_by_group"
      icon={Users}
      iconColor="text-purple-500"
      emptyMessageKey="statistics.no_group_data"
      nameKey="name"
      valueKey="count"
      colorKey="color"
    />
  );
};

export default React.memo(ContactsByGroupChart);