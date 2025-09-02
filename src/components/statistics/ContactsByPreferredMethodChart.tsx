import React, { useMemo } from 'react';
import { MessageCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, TooltipProps } from 'recharts';
import { useTranslation } from "react-i18next";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface PreferredMethodData {
  method: string;
  count: number;
}

interface ContactsByPreferredMethodChartProps {
  data: PreferredMethodData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const ContactsByPreferredMethodChart: React.FC<ContactsByPreferredMethodChartProps> = ({ data }) => {
  const { t } = useTranslation();

  const formattedData = useMemo(() => data.map(item => ({
    name: t(`contact_method.${item.method}`),
    value: item.count,
  })), [data, t]);

  const CustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-2 shadow-lg">
          <p className="font-semibold">{`${payload[0].name}`}</p>
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
          <MessageCircle size={20} className="text-blue-500" />
          {t('statistics.contacts_by_preferred_method')}
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent className="h-64 flex items-center justify-center">
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">{t('statistics.no_preferred_method_data')}</p>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};

export default React.memo(ContactsByPreferredMethodChart);