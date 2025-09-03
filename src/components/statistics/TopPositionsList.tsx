import React from 'react';
import { Briefcase } from "lucide-react";
import BaseList from './BaseList';
import { PositionData } from './types';

interface TopPositionsListProps {
  data: PositionData[];
}

const TopPositionsList: React.FC<TopPositionsListProps> = ({ data }) => {
  return (
    <BaseList
      data={data}
      title="statistics.top_positions"
      icon={Briefcase}
      iconColor="text-orange-500"
      emptyMessageKey="statistics.no_position_data"
      nameKey="position"
      countKey="count"
    />
  );
};

export default React.memo(TopPositionsList);