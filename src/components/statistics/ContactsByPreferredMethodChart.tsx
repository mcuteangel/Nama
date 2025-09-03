import React from 'react';
import { MessageCircle } from "lucide-react";
import BasePieChart from './BasePieChart';
import { PreferredMethodData } from './types';

interface ContactsByPreferredMethodChartProps {
  data: PreferredMethodData[];
}

// Chart component for displaying contacts by preferred method
const ContactsByPreferredMethodChart: React.FC<ContactsByPreferredMethodChartProps> = ({ data }) => {
  return (
    <BasePieChart
      data={data}
      title="statistics.contacts_by_preferred_method"
      icon={MessageCircle}
      iconColor="text-blue-500"
      emptyMessageKey="statistics.no_preferred_method_data"
      translationPrefix="contact_method"
      nameKey="method"
      valueKey="count"
    />
  );
};

export default React.memo(ContactsByPreferredMethodChart);