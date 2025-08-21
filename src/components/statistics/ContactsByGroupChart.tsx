import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "lucide-react";
import { Pie, PieChart as RechartsPieChart, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTranslation } from "react-i18next";

interface GroupData {
  name: string;
  color?: string;
  count: number;
}

interface ContactsByGroupChartProps {
  data: GroupData[];
}

const DEFAULT_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c', '#d0ed57', '#83a6ed', '#8dd1e1'];

const ContactsByGroupChart: React.FC<ContactsByGroupChartProps> = ({ data }) => {
  const { t } = useTranslation();

  const formattedData = data.map(item => ({
    name: item.name,
    value: item.count,
    color: item.color,
  }));

  return (
    <Card className="rounded-xl p-4 bg-white dark:bg-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <PieChart size={20} className="text-purple-500" />
          {t('statistics.contacts_by_group')}
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
                  <Cell key={`cell-${index}`} fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} ${t('common.contacts')}`, '']} />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">{t('statistics.no_group_data')}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactsByGroupChart;