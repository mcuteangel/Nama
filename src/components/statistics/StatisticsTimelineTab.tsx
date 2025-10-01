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
  isLoading?: boolean;
  error?: string | null;
}

const StatisticsTimelineTab: React.FC<StatisticsTimelineTabProps> = ({
  timelineChartData,
  isLoading = false,
  error = null,
}) => {
  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <div className="h-6 w-[200px] bg-muted/50 rounded animate-pulse mb-2" />
          <div className="h-4 w-[250px] bg-muted/50 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-[380px] w-full bg-muted/20 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card">
        <CardContent className="flex items-center justify-center h-[380px]">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">خطا در بارگذاری روند زمانی</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
