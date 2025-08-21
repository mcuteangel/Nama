import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";

interface GroupData {
  name: string;
  color?: string;
  count: number;
}

interface ContactsByGroupChartProps {
  data: GroupData[];
}

const DEFAULT_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
  '#10B981', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6',
  '#A855F7', '#D946EF', '#EC4899', '#F43F5E', '#6B7280', '#374151',
];

const ContactsByGroupChart: React.FC<ContactsByGroupChartProps> = ({ data }) => {
  const { t } = useTranslation();

  const chartData = data.map(item => ({
    name: item.name,
    value: item.count,
    color: item.color,
  }));

  const hasData = chartData.some(item => item.value > 0);

  return (
    <Card className="glass rounded-xl p-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {t('statistics.contacts_by_group')}
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
                  <Cell key={`cell-${index}`} fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
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

export default ContactsByGroupChart;