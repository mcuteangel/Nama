import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "lucide-react";
import { Pie, PieChart as RechartsPieChart, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTranslation } from "react-i18next";

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
    <Card className="rounded-xl p-4 bg-white dark:bg-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <PieChart size={20} className="text-green-500" />
          {t('statistics.contacts_by_gender')}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-64 flex items-center justify-center">
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
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
      </CardContent>
    </Card>
  );
};

export default ContactsByGenderChart;