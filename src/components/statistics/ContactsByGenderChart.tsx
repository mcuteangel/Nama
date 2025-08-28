import React from 'react';
import { PieChart } from "lucide-react";
import { Pie, PieChart as RechartsPieChart, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTranslation } from "react-i18next";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";

interface GenderData {
  gender: string;
  count: number;
}

interface ContactsByGenderChartProps {
  data: GenderData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const ContactsByGenderChart: React.FC<ContactsByGenderChartProps> = ({ data }) => {
  const { t } = useTranslation();

  const formattedData = data.map(item => ({
    name: t(`gender.${item.gender}`),
    value: item.count,
  }));

  return (
    <ModernCard variant="glass" className="rounded-xl p-4">
      <ModernCardHeader className="pb-2">
        <ModernCardTitle className="text-lg font-semibold flex items-center gap-2">
          <PieChart size={20} className="text-green-500" />
          {t('statistics.contacts_by_gender')}
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent className="h-64 flex items-center justify-center">
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height={256}>
            <RechartsPieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} ${t('common.contacts')}`, '']} />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">{t('statistics.no_gender_data')}</p>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};

export default ContactsByGenderChart;