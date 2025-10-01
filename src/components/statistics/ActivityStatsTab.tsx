import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, User, MessageCircle, Calendar, Clock, Users, Building, Settings, Plus, Edit } from "lucide-react";

interface RecentActivity {
  id: string;
  activity_type: string;
  entity_type: string;
  entity_name: string;
  description: string;
  created_at: string;
}

interface ActivityStatsTabProps {
  recentActivity?: RecentActivity[];
  isLoading?: boolean;
  error?: string | null;
}

const getDayColor = (day: string) => {
  const colors: Record<string, string> = {
    'شنبه': 'bg-red-100 text-red-700',
    'یکشنبه': 'bg-orange-100 text-orange-700',
    'دوشنبه': 'bg-yellow-100 text-yellow-700',
    'سه‌شنبه': 'bg-green-100 text-green-700',
    'چهارشنبه': 'bg-teal-100 text-teal-700',
    'پنج‌شنبه': 'bg-blue-100 text-blue-700',
    'جمعه': 'bg-indigo-100 text-indigo-700',
  };
  return colors[day] || 'bg-slate-100 text-slate-700';
};

const getActivityIcon = (activityType: string, entityType: string) => {
  switch (activityType) {
    case 'created':
      switch (entityType) {
        case 'contact':
          return <User className="h-4 w-4 text-green-500" />;
        case 'group':
          return <Users className="h-4 w-4 text-blue-500" />;
        case 'custom_field':
          return <Settings className="h-4 w-4 text-purple-500" />;
        default:
          return <Plus className="h-4 w-4 text-green-500" />;
      }
    case 'updated':
      switch (entityType) {
        case 'contact':
          return <Edit className="h-4 w-4 text-blue-500" />;
        case 'group':
          return <Edit className="h-4 w-4 text-orange-500" />;
        case 'custom_field':
          return <Settings className="h-4 w-4 text-indigo-500" />;
        default:
          return <Edit className="h-4 w-4 text-blue-500" />;
      }
    case 'deleted':
      return <User className="h-4 w-4 text-red-500" />;
    default:
      return <Activity className="h-4 w-4 text-slate-500" />;
  }
};

const getActivityBadgeColor = (activityType: string) => {
  switch (activityType) {
    case 'created':
      return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200';
    case 'updated':
      return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200';
    case 'deleted':
      return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200';
    default:
      return 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border-slate-200';
  }
};

const formatActivityDescription = (activity: RecentActivity) => {
  const { activity_type, entity_type, entity_name } = activity;

  switch (activity_type) {
    case 'created':
      return `ایجاد ${entity_type === 'contact' ? 'مخاطب' : entity_type === 'group' ? 'گروه' : entity_type === 'custom_field' ? 'فیلد سفارشی' : entity_type} "${entity_name}"`;
    case 'updated':
      return `بروزرسانی ${entity_type === 'contact' ? 'مخاطب' : entity_type === 'group' ? 'گروه' : entity_type === 'custom_field' ? 'فیلد سفارشی' : entity_type} "${entity_name}"`;
    case 'deleted':
      return `حذف ${entity_type === 'contact' ? 'مخاطب' : entity_type === 'group' ? 'گروه' : entity_type === 'custom_field' ? 'فیلد سفارشی' : entity_type} "${entity_name}"`;
    default:
      return activity.description || `${activity_type} ${entity_type}`;
  }
};

const ActivityStatsTab: React.FC<ActivityStatsTabProps> = ({
  recentActivity = [],
  isLoading = false,
  error = null,
}) => {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <div className="h-5 w-[170px] bg-muted/50 rounded animate-pulse mb-2" />
            <div className="h-3 w-[210px] bg-muted/50 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted/50 rounded-full animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-[100px] bg-muted/50 rounded animate-pulse" />
                      <div className="h-3 w-[80px] bg-muted/50 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-6 w-[60px] bg-muted/50 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader>
            <div className="h-5 w-[180px] bg-muted/50 rounded animate-pulse mb-2" />
            <div className="h-3 w-[220px] bg-muted/50 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[240px] w-full bg-muted/20 rounded-lg animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card">
          <CardContent className="flex items-center justify-center h-[300px] p-4">
            <div className="text-center text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">خطا در بارگذاری فعالیت‌ها</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="flex items-center justify-center h-[300px] p-4">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">آمار فعالیت</p>
              <p className="text-xs mt-1">داده‌ای برای نمایش وجود ندارد</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* فعالیت‌های اخیر */}
      <Card className="glass-card group relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-200/20 to-transparent" />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className="relative pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                فعالیت‌های اخیر
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 leading-relaxed">
                آخرین فعالیت‌های سیستم
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative p-4">
          <div className="space-y-4">
            {recentActivity.slice(0, 6).map((activity: RecentActivity, idx: number) => (
              <div
                key={activity.id}
                className="group/item flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50/80 to-slate-100/50 hover:from-slate-100/80 hover:to-slate-50/80 border border-slate-200/50 hover:border-slate-300/80 transition-all duration-300 hover:scale-[1.02] animate-in fade-in-50 slide-in-from-left-4"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center group-hover:item:scale-110 transition-transform duration-300">
                    {getActivityIcon(activity.activity_type, activity.entity_type)}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-700 group-hover/item:text-slate-800 transition-colors duration-300">
                      {formatActivityDescription(activity)}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <p className="text-xs text-slate-500">
                        {new Date(activity.created_at).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                  </div>
                </div>
                <Badge className={`text-xs font-semibold transition-all duration-300 ${getActivityBadgeColor(activity.activity_type)}`}>
                  {activity.activity_type}
                </Badge>
              </div>
            ))}
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-br from-amber-200/10 to-transparent rounded-full opacity-60" />
          <div className="absolute bottom-2 left-2 w-12 h-12 bg-gradient-to-tr from-orange-200/5 to-transparent rounded-full opacity-60" />
        </CardContent>
      </Card>

      {/* آمار فعالیت روزانه */}
      <Card className="glass-card group relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-200/20 to-transparent" />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className="relative pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                فعالیت روزانه
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 leading-relaxed">
                توزیع فعالیت‌ها در روزهای هفته
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative p-4">
          <div className="space-y-3">
            {(() => {
              // گروه‌بندی فعالیت‌ها بر اساس روز هفته
              const dailyActivity = recentActivity.reduce((acc: Record<string, { count: number; activities: number }>, activity: RecentActivity) => {
                const dayOfWeek = new Date(activity.created_at).toLocaleDateString('fa-IR', { weekday: 'long' });
                if (!acc[dayOfWeek]) {
                  acc[dayOfWeek] = { count: 0, activities: 0 };
                }
                acc[dayOfWeek].count++;
                return acc;
              }, {} as Record<string, { count: number; activities: number }>);

              // تبدیل به آرایه و مرتب‌سازی بر اساس روز هفته
              const weekDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
              const sortedDailyActivity = weekDays.map(day => ({
                day,
                count: dailyActivity[day]?.count || 0,
                activity: dailyActivity[day]?.activities || 0,
                color: getDayColor(day)
              })).filter(item => item.count > 0);

              return sortedDailyActivity.length > 0 ? (
                sortedDailyActivity.map((item, idx: number) => (
                  <div
                    key={item.day}
                    className="group/item flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-slate-50/80 to-slate-100/50 hover:from-slate-100/80 hover:to-slate-50/80 border border-slate-200/50 hover:border-slate-300/80 transition-all duration-300 hover:scale-[1.02] animate-in fade-in-50 slide-in-from-right-4"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color} shadow-sm`} />
                      <span className="text-sm font-medium text-slate-700 group-hover/item:text-slate-800 transition-colors duration-300">
                        {item.day}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs font-semibold transition-all duration-300 ${item.color} border-current`}>
                        {item.count}
                      </Badge>
                      <span className="text-xs text-slate-400">({item.activity} فعالیت)</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 font-medium">داده‌ای برای نمایش وجود ندارد</p>
                  <p className="text-xs text-slate-400 mt-1">فعالیت‌هایی با مخاطبین ایجاد کنید</p>
                </div>
              );
            })()}
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-br from-orange-200/10 to-transparent rounded-full opacity-60" />
          <div className="absolute bottom-2 left-2 w-12 h-12 bg-gradient-to-tr from-red-200/5 to-transparent rounded-full opacity-60" />
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityStatsTab;
