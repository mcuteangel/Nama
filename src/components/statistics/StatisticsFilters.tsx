import React from "react";
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from "@/components/ui/modern-select";
import { ModernDatePicker } from "@/components/ui/modern-date-picker";

interface StatisticsFiltersProps {
  quickRange: string;
  onQuickRangeChange: (value: string) => void;
  fromDate: string | undefined;
  onFromDateChange: (value: string | undefined) => void;
  toDate: string | undefined;
  onToDateChange: (value: string | undefined) => void;
}

const StatisticsFilters: React.FC<StatisticsFiltersProps> = ({
  quickRange,
  onQuickRangeChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <ModernSelect value={quickRange} onValueChange={onQuickRangeChange}>
        <ModernSelectTrigger className="w-[180px]">
          <ModernSelectValue placeholder="انتخاب بازه زمانی" />
        </ModernSelectTrigger>
        <ModernSelectContent>
          <ModernSelectItem value="3m">۳ ماه اخیر</ModernSelectItem>
          <ModernSelectItem value="6m">۶ ماه اخیر</ModernSelectItem>
          <ModernSelectItem value="12m">۱۲ ماه اخیر</ModernSelectItem>
          <ModernSelectItem value="all">تمام دوره</ModernSelectItem>
        </ModernSelectContent>
      </ModernSelect>
      <div className="flex gap-2">
        <ModernDatePicker
          value={fromDate}
          onChange={onFromDateChange}
          placeholder="از تاریخ"
          variant="glass"
          inputSize="md"
          className="w-[160px]"
        />
        <ModernDatePicker
          value={toDate}
          onChange={onToDateChange}
          placeholder="تا تاریخ"
          variant="glass"
          inputSize="md"
          className="w-[160px]"
        />
      </div>
    </div>
  );
};

export default StatisticsFilters;
