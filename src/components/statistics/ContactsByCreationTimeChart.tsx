import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";

interface CreationTimeData {
  month_year: string;
  count: number;
}

interface ContactsByCreationTimeChartProps {
  data: CreationTimeData[];
}

const ContactsByCreationTimeChart: React.FC<ContactsByCreationTimeChartProps> = ({ data }) => {
  const { t } = useTranslation();

  // Add a defensive check for data being an array
  const chartData = (data && Array.isArray(data)) ? data.map(item => {
    const [year, month] = item.month_year.split('-');
    // You might want to convert month number to month name based on locale here
    // For simplicity, we'll just use the YYYY-MM format for now
    return {
      name: item.month_year, // Or format to a more readable month name
      [t('statistics.contacts_count')]: item.count,
    };
  }) : []; // If data is not an array, default to an empty array

  const hasData = chartData.some(item => (item[t('statistics.contacts_count')] as number) > 0);

  return (
    <Card className="glass rounded-xl p-4 col-span-1 md:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {t('statistics.contacts_by_creation_time')}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-64 flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem' }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar dataKey={t('statistics.contacts_count')} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
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

export default ContactsByCreationTimeChart;