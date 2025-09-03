import React, { useMemo } from 'react';
import { Calendar } from "lucide-react";
import BaseLineChart from './BaseLineChart';
import { CreationTimeData } from './types';
import { useTranslation } from "react-i18next";
import moment from 'moment-jalaali';

interface ContactsByCreationTimeChartProps {
  data: CreationTimeData[];
}

const ContactsByCreationTimeChart: React.FC<ContactsByCreationTimeChartProps> = ({ data }) => {
  const { t, i18n } = useTranslation();

  // Determine calendar type based on current language
  const isJalali = i18n.language === 'fa';

  const formattedData = useMemo(() => {
    return data.map(item => {
      // Parse the date string (assumed to be in YYYY-MM format)
      const [year, month] = item.month_year.split('-').map(Number);

      // Create a date object for the first day of the month
      if (isJalali) {
        // For Jalali calendar, we need to convert Gregorian date to Jalali
        const gregorianDate = new Date(year, month - 1, 1);
        const jalaliDate = moment(gregorianDate);
        // Format as Jalali month/year
        const formattedDate = jalaliDate.format('jYYYY/jMM');
        return {
          name: formattedDate,
          count: item.count,
        };
      } else {
        // For Gregorian calendar, format as YYYY/MM
        const formattedDate = `${year}/${month.toString().padStart(2, '0')}`;
        return {
          name: formattedDate,
          count: item.count,
        };
      }
    });
  }, [data, isJalali]);

  return (
    <BaseLineChart
      data={formattedData}
      title="statistics.contacts_by_creation_time"
      icon={Calendar}
      iconColor="text-indigo-500"
      emptyMessageKey="statistics.no_creation_time_data"
      className="col-span-1 md:col-span-2"
      nameKey="name"
      valueKey="count"
    />
  );
};

export default React.memo(ContactsByCreationTimeChart);