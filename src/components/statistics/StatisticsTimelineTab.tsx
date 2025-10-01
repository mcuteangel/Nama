import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { CartesianGrid, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useJalaliCalendar } from "@/hooks/use-jalali-calendar";
import { TrendingUp, Calendar } from "lucide-react";

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
  const { formatDate } = useJalaliCalendar();

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <div className="h-5 w-[180px] bg-muted/50 rounded animate-pulse mb-2" />
          <div className="h-3 w-[220px] bg-muted/50 rounded animate-pulse" />
        </CardHeader>
        <CardContent className="p-4">
          <div className="h-[240px] w-full bg-muted/20 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card">
        <CardContent className="flex items-center justify-center h-[300px] p-4">
          <div className="text-center text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">خطا در بارگذاری روند زمانی</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format dates using Jalali calendar hook
  const formattedData = timelineChartData.map(item => ({
    ...item,
    formattedMonth: formatDate(new Date(item.month + '-01'))
  }));

  return (
    <Card className="glass-card group relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/20 to-transparent" />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <CardHeader className="relative pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              روند اضافه شدن مخاطبین
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 leading-relaxed">
              تعداد مخاطبین جدید در هر ماه بر اساس تاریخ شمسی
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative p-4">
        <ChartContainer config={{ count: { label: "تعداد", color: "hsl(var(--chart-1))" } }} className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis
                dataKey="formattedMonth"
                tick={{ fontSize: 10, fill: '#64748b' }}
                className="text-slate-600"
                height={40}
              />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} className="text-slate-600" width={30} />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="glass-advanced bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-4 shadow-glassStrong">
                        <p className="font-semibold text-slate-800 text-center mb-2">{label}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">تعداد:</span>
                            <span className="font-bold text-emerald-600 text-lg">{data.count}</span>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl pointer-events-none" />
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorCount)"
                className="drop-shadow-sm"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Decorative Elements */}
        <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-br from-emerald-200/10 to-transparent rounded-full opacity-60" />
        <div className="absolute bottom-2 left-2 w-12 h-12 bg-gradient-to-tr from-teal-200/5 to-transparent rounded-full opacity-60" />
      </CardContent>
    </Card>
  );
};

export default StatisticsTimelineTab;
