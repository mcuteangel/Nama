import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, XAxis, YAxis, Legend } from "recharts";

interface StatisticsOverviewTabProps {
  genderChartData: Array<{ name: string; value: number }>;
  contactMethodChartData: Array<{ name: string; value: number }>;
}

const COLORS = {
  gender: ["#3b82f6", "#ec4899", "#6b7280"],
  contactMethod: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"],
};

const StatisticsOverviewTab: React.FC<StatisticsOverviewTabProps> = ({
  genderChartData,
  contactMethodChartData,
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>توزیع جنسیت</CardTitle>
          <CardDescription>توزیع مخاطبین بر اساس جنسیت</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ count: { label: "تعداد", color: "hsl(var(--chart-1))" } }} className="h-[300px]">
            <PieChart>
              <Pie data={genderChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                {genderChartData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS.gender[idx % COLORS.gender.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>روش‌های ارتباط ترجیحی</CardTitle>
          <CardDescription>توزیع مخاطبین بر اساس روش ارتباط</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ value: { label: "تعداد", color: "hsl(var(--chart-2))" } }} className="h-[300px]">
            <BarChart data={contactMethodChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {contactMethodChartData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS.contactMethod[idx % COLORS.contactMethod.length]} />
                ))}
              </Bar>
              <Legend />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsOverviewTab;
