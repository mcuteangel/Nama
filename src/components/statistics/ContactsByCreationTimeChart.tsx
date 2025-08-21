import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart as BarChartIcon } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
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

  return (
    <Card className="rounded-xl p-4 col-span-1 md:col-span-2 bg-white dark:bg-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <BarChartIcon size={20} className="text-teal-500" />
          {t('statistics.contacts_by_creation_time')}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-64 flex items-center justify-center">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={256}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
              <XAxis dataKey="month_year" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [`${value} ${t('common.contacts')}`, '']}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: 'none', borderRadius: '0.5rem' }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">{t('statistics.no_creation_time_data')}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactsByCreationTimeChart;