import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Legend } from "recharts";

interface TimelineStats {
  month: string;
  count: number;
}

interface StatisticsTimelineTabProps {
  timelineChartData: TimelineStats[];
}

const StatisticsTimelineTab: React.FC<StatisticsTimelineTabProps> = ({
  timelineChartData,
}) => {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>روند اضافه شدن مخاطبین</CardTitle>
        <CardDescription>تعداد مخاطبین جدید در هر ماه</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{ count: { label: "تعداد", color: "hsl(var(--chart-1))" } }} className="h-[380px]">
          <LineChart data={timelineChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            <Legend />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default StatisticsTimelineTab;
