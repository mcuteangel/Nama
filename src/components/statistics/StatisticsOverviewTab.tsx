import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import { Users, MessageCircle } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface StatisticsOverviewTabProps {
  genderChartData: Array<{ name: string; value: number }>;
  contactMethodChartData: Array<{ name: string; value: number }>;
  isLoading?: boolean;
  error?: string | null;
}

const COLORS = {
  gender: ["#8b5cf6", "#ec4899", "#06b6d4"], // رنگ‌های مدرن‌تر: بنفش، صورتی، آبی
  contactMethod: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"],
};

const StatisticsOverviewTab: React.FC<StatisticsOverviewTabProps> = ({
  genderChartData,
  contactMethodChartData,
  isLoading = false,
  error = null,
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50/50 via-white/80 to-blue-50/30 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
          <CardHeader>
            <div className="h-6 w-[150px] bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-[200px] bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg animate-pulse" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[240px] w-full bg-gradient-to-br from-slate-100/50 to-slate-200/30 rounded-xl animate-pulse" />
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden bg-gradient-to-br from-green-50/50 via-white/80 to-green-50/30 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
          <CardHeader>
            <div className="h-6 w-[200px] bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-[250px] bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg animate-pulse" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[240px] w-full bg-gradient-to-br from-slate-100/50 to-slate-200/30 rounded-xl animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="relative overflow-hidden bg-gradient-to-br from-red-50/50 via-white/80 to-red-50/30 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
          <CardContent className="flex items-center justify-center h-[300px] p-4">
            <div className="text-center text-slate-500">
              <p className="text-sm font-medium">{t('contact_list.error_loading_gender_statistics')}</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden bg-gradient-to-br from-red-50/50 via-white/80 to-red-50/30 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
          <CardContent className="flex items-center justify-center h-[300px] p-4">
            <div className="text-center text-slate-500">
              <p className="text-sm font-medium">{t('contact_list.error_loading_contact_methods')}</p>
              <p className="text-xs mt-1">{t('contact_list.no_data_available')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 animate-in fade-in-50 slide-in-from-bottom-4 duration-500" dir={document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'}>
      {/* Gender Distribution Card */}
      <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50/60 via-white/90 to-blue-50/40 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl">
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
                {t('statistics.gender_distribution')}
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 leading-relaxed">
                {t('statistics.gender_distribution_description')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative p-4">
          <ChartContainer config={{ count: { label: t('statistics.count'), color: "hsl(var(--chart-1))" } }} className="h-[240px] w-full">
            <PieChart>
              <Pie
                data={genderChartData}
                cx="50%"
                cy="50%"
                outerRadius={70}
                innerRadius={30}
                dataKey="value"
                label={({ name, percent, value }) => `${name}\n${value} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {genderChartData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS.gender[idx % COLORS.gender.length]} className="hover:opacity-80 transition-opacity duration-300" />
                ))}
              </Pie>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="glass-advanced bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-4 shadow-glassStrong">
                        <p className="font-semibold text-slate-800 text-center mb-2">{data.name}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">{t('statistics.tooltip.count')}</span>
                            <span className="font-bold text-slate-800 text-lg">{data.value}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">{t('statistics.tooltip.percentage')}</span>
                            <span className="font-bold text-slate-800 text-lg">{((data.value / genderChartData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl pointer-events-none" />
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
            </PieChart>
          </ChartContainer>

          {/* Decorative Elements */}
          <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-br from-blue-200/10 to-transparent rounded-full opacity-60" />
          <div className="absolute bottom-2 left-2 w-12 h-12 bg-gradient-to-tr from-purple-200/5 to-transparent rounded-full opacity-60" />
        </CardContent>
      </Card>

      {/* Contact Method Card */}
      <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-50/60 via-white/90 to-emerald-50/40 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl">
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
                {t('statistics.contact_methods_title')}
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 leading-relaxed">
                {t('statistics.contact_methods_description')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative p-4">
          <ChartContainer config={{ value: { label: t('statistics.count'), color: "hsl(var(--chart-2))" } }} className="h-[240px] w-full">
            <BarChart data={contactMethodChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#64748b' }}
                className="text-slate-600"
                height={50}
              />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} className="text-slate-600" width={40} />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="glass-advanced bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-4 shadow-glassStrong">
                        <p className="font-semibold text-slate-800 text-center mb-2">{data.name}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">{t('statistics.tooltip.count')}</span>
                            <span className="font-bold text-slate-800 text-lg">{data.value}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">{t('statistics.tooltip.percentage')}</span>
                            <span className="font-bold text-slate-800 text-lg">{((data.value / contactMethodChartData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl pointer-events-none" />
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} className="hover:opacity-80 transition-opacity duration-300" maxBarSize={50}>
                {contactMethodChartData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS.contactMethod[idx % COLORS.contactMethod.length]} />
                ))}
              </Bar>
              <Legend />
            </BarChart>
          </ChartContainer>

          {/* Decorative Elements */}
          <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-br from-emerald-200/10 to-transparent rounded-full opacity-60" />
          <div className="absolute bottom-2 left-2 w-12 h-12 bg-gradient-to-tr from-teal-200/5 to-transparent rounded-full opacity-60" />
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsOverviewTab;
