import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Gift, Clock, TrendingUp } from "lucide-react";

interface UpcomingBirthday {
  id: string;
  first_name: string;
  last_name: string;
  birthday: string;
  days_until_birthday: number;
}

interface BirthdaysByMonth {
  month: string;
  count: number;
}

interface BirthdaysTabProps {
  upcomingBirthdays?: UpcomingBirthday[];
  birthdaysByMonth?: BirthdaysByMonth[];
  isLoading?: boolean;
  error?: string | null;
}

const BirthdaysTab: React.FC<BirthdaysTabProps> = ({
  upcomingBirthdays = [],
  birthdaysByMonth = [],
  isLoading = false,
  error = null,
}) => {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <div className="h-5 w-[150px] bg-muted/50 rounded animate-pulse mb-2" />
            <div className="h-3 w-[200px] bg-muted/50 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
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
            <div className="h-[200px] w-full bg-muted/20 rounded-lg animate-pulse" />
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
              <Gift className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">خطا در بارگذاری تولدهای پیش رو</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="flex items-center justify-center h-[300px] p-4">
            <div className="text-center text-muted-foreground">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">آمار تولدها</p>
              <p className="text-xs mt-1">داده‌ای برای نمایش وجود ندارد</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* تولدهای پیش رو */}
      <Card className="glass-card group relative overflow-hidden">
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

        <CardContent className="relative p-4">
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
          <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-br from-pink-200/10 to-transparent rounded-full opacity-60" />
          <div className="absolute bottom-2 left-2 w-12 h-12 bg-gradient-to-tr from-rose-200/5 to-transparent rounded-full opacity-60" />
        </CardContent>
      </Card>

      {/* آمار تولدها در ماه‌های مختلف */}
      <Card className="glass-card group relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-200/20 to-transparent" />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className="relative pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                توزیع تولدها در ماه‌ها
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 leading-relaxed">
                تعداد تولدها در هر ماه از سال شمسی
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative p-4">
          <div className="space-y-3">
            {birthdaysByMonth.length > 0 ? (
              birthdaysByMonth.map((item, idx) => {
                // تعریف رنگ‌ها برای هر ماه
                const monthColors: Record<string, string> = {
                  'فروردین': 'bg-red-100 text-red-700',
                  'اردیبهشت': 'bg-orange-100 text-orange-700',
                  'خرداد': 'bg-yellow-100 text-yellow-700',
                  'تیر': 'bg-green-100 text-green-700',
                  'مرداد': 'bg-teal-100 text-teal-700',
                  'شهریور': 'bg-blue-100 text-blue-700',
                  'مهر': 'bg-indigo-100 text-indigo-700',
                  'آبان': 'bg-purple-100 text-purple-700',
                  'آذر': 'bg-pink-100 text-pink-700',
                  'دی': 'bg-rose-100 text-rose-700',
                  'بهمن': 'bg-slate-100 text-slate-700',
                  'اسفند': 'bg-cyan-100 text-cyan-700',
                };

                return (
                  <div
                    key={item.month}
                    className="group/item flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-slate-50/80 to-slate-100/50 hover:from-slate-100/80 hover:to-slate-50/80 border border-slate-200/50 hover:border-slate-300/80 transition-all duration-300 hover:scale-[1.02] animate-in fade-in-50 slide-in-from-left-4"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${monthColors[item.month] || 'bg-gray-100 text-gray-700'} shadow-sm`} />
                      <span className="text-sm font-medium text-slate-700 group-hover/item:text-slate-800 transition-colors duration-300">
                        {item.month}
                      </span>
                    </div>
                    <Badge className={`text-xs font-semibold transition-all duration-300 ${monthColors[item.month] || 'bg-gray-100 text-gray-700'} border-current`}>
                      {item.count}
                    </Badge>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 font-medium">داده‌ای برای نمایش وجود ندارد</p>
                <p className="text-xs text-slate-400 mt-1">مخاطبینی با تاریخ تولد اضافه کنید</p>
              </div>
            )}
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-br from-purple-200/10 to-transparent rounded-full opacity-60" />
          <div className="absolute bottom-2 left-2 w-12 h-12 bg-gradient-to-tr from-pink-200/5 to-transparent rounded-full opacity-60" />
        </CardContent>
      </Card>
    </div>
  );
};

export default BirthdaysTab;
