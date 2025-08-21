import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";

interface PreferredMethodData {
  method: string;
  count: number;
}

interface ContactsByPreferredMethodChartProps {
  data: PreferredMethodData[];
}

const COLORS = ['#0EA5E9', '#22C55E', '#F97316', '#6B7280']; // Colors for email, phone, sms, any

const getPreferredContactMethodLabel = (method: string, t: any) => {
  switch (method) {
    case 'email': return t('statistics.email');
    case 'phone': return t('statistics.phone');
    case 'sms': return t('statistics.sms');
    case 'any': return t('statistics.any');
    default: return t('statistics.not_specified');
  }
};

const ContactsByPreferredMethodChart: React.FC<ContactsByPreferredMethodChartProps> = ({ data }) => {
  const { t } = useTranslation();

  const chartData = data.map(item => ({
    name: getPreferredContactMethodLabel(item.method, t),
    value: item.count,
  }));

  const hasData = chartData.some(item => item.value > 0);

  return (
    <Card className="glass rounded-xl p-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {t('statistics.contacts_by_preferred_method')}
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

export default ContactsByPreferredMethodChart;