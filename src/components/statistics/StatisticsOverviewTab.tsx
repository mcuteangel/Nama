import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import { Users, MessageCircle } from "lucide-react";

interface StatisticsOverviewTabProps {
  genderChartData: Array<{ name: string; value: number }>;
  contactMethodChartData: Array<{ name: string; value: number }>;
  isLoading?: boolean;
  error?: string | null;
}

const COLORS = {
  gender: ["#3b82f6", "#ec4899", "#6b7280"],
  contactMethod: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"],
};

const StatisticsOverviewTab: React.FC<StatisticsOverviewTabProps> = ({
  genderChartData,
  contactMethodChartData,
  isLoading = false,
  error = null,
}) => {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50/50 via-white/80 to-blue-50/30 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <div className="h-6 w-[150px] bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-[200px] bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full bg-gradient-to-br from-slate-100/50 to-slate-200/30 rounded-xl animate-pulse" />
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden bg-gradient-to-br from-green-50/50 via-white/80 to-green-50/30 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <div className="h-6 w-[200px] bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-[250px] bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full bg-gradient-to-br from-slate-100/50 to-slate-200/30 rounded-xl animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="relative overflow-hidden bg-gradient-to-br from-red-50/50 via-white/80 to-red-50/30 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="flex items-center justify-center h-[300px]">
            <div className="text-center text-slate-500">
              <p className="text-sm font-medium">خطا در بارگذاری آمار جنسیت</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden bg-gradient-to-br from-red-50/50 via-white/80 to-red-50/30 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="flex items-center justify-center h-[300px]">
            <div className="text-center text-slate-500">
              <p className="text-sm font-medium">خطا در بارگذاری روش‌های ارتباط</p>
              <p className="text-xs mt-1">داده‌ای برای نمایش وجود ندارد</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
      {/* Gender Distribution Card */}
      <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50/60 via-white/90 to-blue-50/40 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-200/20 to-transparent" />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className="relative pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                توزیع جنسیت
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 leading-relaxed">
                توزیع مخاطبین بر اساس جنسیت ثبت شده
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative">
          <ChartContainer config={{ count: { label: "تعداد", color: "hsl(var(--chart-1))" } }} className="h-[280px]">
            <PieChart>
              <Pie
                data={genderChartData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {genderChartData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS.gender[idx % COLORS.gender.length]} className="hover:opacity-80 transition-opacity duration-300" />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
            </PieChart>
          </ChartContainer>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-200/10 to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform duration-500" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-200/5 to-transparent rounded-full translate-y-8 -translate-x-8 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-500" />
        </CardContent>
      </Card>

      {/* Contact Method Card */}
      <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-50/60 via-white/90 to-emerald-50/40 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/20 to-transparent" />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className="relative pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                روش‌های ارتباط ترجیحی
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 leading-relaxed">
                توزیع مخاطبین بر اساس روش ارتباط مورد علاقه
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative">
          <ChartContainer config={{ value: { label: "تعداد", color: "hsl(var(--chart-2))" } }} className="h-[280px]">
            <BarChart data={contactMethodChartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#64748b' }}
                className="text-slate-600"
              />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} className="text-slate-600" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} className="hover:opacity-80 transition-opacity duration-300">
                {contactMethodChartData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS.contactMethod[idx % COLORS.contactMethod.length]} />
                ))}
              </Bar>
              <Legend />
            </BarChart>
          </ChartContainer>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-200/10 to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform duration-500" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-teal-200/5 to-transparent rounded-full translate-y-8 -translate-x-8 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-500" />
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsOverviewTab;
