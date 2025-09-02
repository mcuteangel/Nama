import React, { useMemo } from 'react';
import { Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, TooltipProps } from 'recharts';
import { useTranslation } from "react-i18next";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import moment from 'moment-jalaali';

interface CreationTimeData {
  month_year: string;
  count: number;
}

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

  const CustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-2 shadow-lg">
          <p className="font-semibold">{`${payload[0].payload.name}`}</p>
          <p className="text-primary">{`${payload[0].value} ${t('common.contacts')}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ModernCard variant="glass" className="rounded-xl p-4 col-span-1 md:col-span-2">
      <ModernCardHeader className="pb-2">
        <ModernCardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar size={20} className="text-indigo-500" />
          {t('statistics.contacts_by_creation_time')}
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent className="h-64">
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={60}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                name={t('common.contacts')} 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">{t('statistics.no_creation_time_data')}</p>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};

export default React.memo(ContactsByCreationTimeChart);