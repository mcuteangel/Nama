import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "lucide-react";
import { Pie, PieChart as RechartsPieChart, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTranslation } from "react-i18next";

interface PreferredMethodData {
  method: string;
  count: number;
}

interface ContactsByPreferredMethodChartProps {
  data: PreferredMethodData[];
}

const COLORS = ['#FFBB28', '#00C49F', '#0088FE', '#FF8042', '#AF19FF'];

const ContactsByPreferredMethodChart: React.FC<ContactsByPreferredMethodChartProps> = ({ data }) => {
  const { t } = useTranslation();

  const formattedData = data.map(item => ({
    name: t(`contact_method.${item.method}`),
    value: item.count,
  }));

  return (
    <Card className="rounded-xl p-4 bg-white dark:bg-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <PieChart size={20} className="text-yellow-500" />
          {t('statistics.contacts_by_preferred_method')}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-64 flex items-center justify-center">
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
                {formattedData.map((_, index) => ( /* Removed 'entry' */
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} ${t('common.contacts')}`, '']} />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">{t('statistics.no_preferred_method_data')}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactsByPreferredMethodChart;