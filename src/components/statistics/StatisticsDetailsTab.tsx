import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Gift, Users, Clock } from "lucide-react";

interface GroupStats {
  name: string;
  count: number;
  color?: string;
}

interface UpcomingBirthday {
  id: string;
  first_name: string;
  last_name: string;
  birthday: string;
  days_until_birthday: number;
}

interface StatisticsDetailsTabProps {
  groupStats?: GroupStats[];
  upcomingBirthdays?: UpcomingBirthday[];
  isLoading?: boolean;
  error?: string | null;
}

const StatisticsDetailsTab: React.FC<StatisticsDetailsTabProps> = ({
  groupStats = [],
  upcomingBirthdays = [],
  isLoading = false,
  error = null,
}) => {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50/50 via-white/80 to-purple-50/30 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <div className="h-6 w-[150px] bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-[220px] bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-slate-200 rounded-full animate-pulse" />
                    <div className="h-4 w-[100px] bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-[40px] bg-slate-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden bg-gradient-to-br from-pink-50/50 via-white/80 to-pink-50/30 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <div className="h-6 w-[130px] bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-[200px] bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-16 w-full bg-gradient-to-br from-slate-100/50 to-slate-200/30 rounded-lg animate-pulse" />
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
              <p className="text-sm font-medium">خطا در بارگذاری آمار گروه‌ها</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden bg-gradient-to-br from-red-50/50 via-white/80 to-red-50/30 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="flex items-center justify-center h-[300px]">
            <div className="text-center text-slate-500">
              <p className="text-sm font-medium">تولدهای پیش رو</p>
              <p className="text-xs mt-1">این بخش به زودی تکمیل خواهد شد</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
      {/* Groups Statistics Card */}
      <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-50/60 via-white/90 to-purple-50/40 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-200/20 to-transparent" />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className="relative pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                گروه‌های پرمخاطب
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 leading-relaxed">
                گروه‌هایی با بیشترین تعداد مخاطب
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative">
          <div className="space-y-4">
            {groupStats.slice(0, 10).map((g, idx) => (
              <div
                key={g.name + idx}
                className="group/item flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50/80 to-slate-100/50 hover:from-slate-100/80 hover:to-slate-50/80 border border-slate-200/50 hover:border-slate-300/80 transition-all duration-300 hover:scale-[1.02] animate-in fade-in-50 slide-in-from-left-4"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shadow-sm ring-2 ring-white/50 group-hover/item:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: g.color || "#6b7280" }}
                  />
                  <span className="text-sm font-semibold text-slate-700 group-hover/item:text-slate-800 transition-colors duration-300">
                    {g.name}
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 hover:from-purple-200 hover:to-pink-200 transition-all duration-300"
                >
                  {g.count}
                </Badge>
              </div>
            ))}
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200/10 to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform duration-500" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-pink-200/5 to-transparent rounded-full translate-y-8 -translate-x-8 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-500" />
        </CardContent>
      </Card>

      {/* Upcoming Birthdays Card */}
      <Card className="group relative overflow-hidden bg-gradient-to-br from-pink-50/60 via-white/90 to-pink-50/40 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-200/20 to-transparent" />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className="relative pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Gift className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                تولدهای پیش رو
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 leading-relaxed">
                مخاطبینی که تولدشان نزدیک است
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative">
          <div className="space-y-4">
            {upcomingBirthdays.length > 0 ? (
              upcomingBirthdays.slice(0, 5).map((birthday, idx) => (
                <div
                  key={birthday.id}
                  className="group/item flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50/80 to-slate-100/50 hover:from-slate-100/80 hover:to-slate-50/80 border border-slate-200/50 hover:border-slate-300/80 transition-all duration-300 hover:scale-[1.02] animate-in fade-in-50 slide-in-from-right-4"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 via-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                      {birthday.first_name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-700 group-hover/item:text-slate-800 transition-colors duration-300">
                        {birthday.first_name} {birthday.last_name}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <p className="text-xs text-slate-500">
                          {new Date(birthday.birthday).toLocaleDateString('fa-IR')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <Badge
                      className={`text-xs font-semibold transition-all duration-300 ${
                        birthday.days_until_birthday <= 7
                          ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200 hover:from-red-200 hover:to-pink-200'
                          : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-200 hover:from-blue-200 hover:to-cyan-200'
                      }`}
                    >
                      {birthday.days_until_birthday} روز دیگر
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 font-medium">تولدی در ۳۰ روز آینده وجود ندارد</p>
                <p className="text-xs text-slate-400 mt-1">مخاطبین جدیدی با تاریخ تولد اضافه کنید</p>
              </div>
            )}
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-200/10 to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform duration-500" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-rose-200/5 to-transparent rounded-full translate-y-8 -translate-x-8 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-500" />
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsDetailsTab;
