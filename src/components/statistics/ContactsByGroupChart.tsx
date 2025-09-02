import React, { useMemo } from 'react';
import { Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, TooltipProps, Cell } from 'recharts';
import { useTranslation } from "react-i18next";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface GroupData {
  name: string;
  color?: string;
  count: number;
}

interface ContactsByGroupChartProps {
  data: GroupData[];
}

const ContactsByGroupChart: React.FC<ContactsByGroupChartProps> = ({ data }) => {
  const { t } = useTranslation();

  const formattedData = useMemo(() => data.map(item => ({
    name: item.name,
    count: item.count,
    color: item.color || '#8884d8'
  })), [data]);

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
    <ModernCard variant="glass" className="rounded-xl p-4">
      <ModernCardHeader className="pb-2">
        <ModernCardTitle className="text-lg font-semibold flex items-center gap-2">
          <Users size={20} className="text-purple-500" />
          {t('statistics.contacts_by_group')}
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent className="h-64">
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 40,
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
              <Bar dataKey="count" name={t('common.contacts')}>
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">{t('statistics.no_group_data')}</p>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};

export default React.memo(ContactsByGroupChart);