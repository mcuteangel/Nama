import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";

interface GenderData {
  gender: string;
  count: number;
}

interface ContactsByGenderChartProps {
  data: GenderData[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658']; // Colors for male, female, not_specified

const ContactsByGenderChart: React.FC<ContactsByGenderChartProps> = ({ data }) => {
  const { t } = useTranslation();

  const chartData = data.map(item => ({
    name: t(`statistics.${item.gender}`),
    value: item.count,
  }));

  const hasData = chartData.some(item => item.value > 0);

  return (
    <Card className="glass rounded-xl p-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {t('statistics.contacts_by_gender')}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-64 flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value} (${((value / data.reduce((sum, d) => sum + d.count, 0)) * 100).toFixed(1)}%)`}/>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            {t('statistics.no_data_available')}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactsByGenderChart;