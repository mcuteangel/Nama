import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Tag, Building, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatisticsOverviewCardsProps {
  totalContacts?: number;
  groupCount?: number;
  companyCount?: number;
  monthlyAverage?: number;

  // مقایسه با دوره قبلی
  previousTotalContacts?: number;
  previousGroupCount?: number;
  previousCompanyCount?: number;
  previousMonthlyAverage?: number;
}

const StatisticsOverviewCards: React.FC<StatisticsOverviewCardsProps> = ({
  totalContacts = 0,
  groupCount = 0,
  companyCount = 0,
  monthlyAverage = 0,
  previousTotalContacts = 0,
  previousGroupCount = 0,
  previousCompanyCount = 0,
  previousMonthlyAverage = 0,
}) => {
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { value: current, percentage: 0, isPositive: true };
    const change = current - previous;
    const percentage = Math.round((change / previous) * 100);
    return { value: change, percentage, isPositive: change >= 0 };
  };

  const totalChange = calculateChange(totalContacts, previousTotalContacts);
  const groupChange = calculateChange(groupCount, previousGroupCount);
  const companyChange = calculateChange(companyCount, previousCompanyCount);
  const averageChange = calculateChange(monthlyAverage, previousMonthlyAverage);

  const ChangeIcon = ({ isPositive, value }: { isPositive: boolean; value: number }) => {
    if (value === 0) return <Minus className="w-4 h-4 text-slate-400 transition-colors duration-300" />;
    return isPositive ?
      <TrendingUp className="w-4 h-4 text-emerald-500 transition-colors duration-300" /> :
      <TrendingDown className="w-4 h-4 text-red-500 transition-colors duration-300" />;
  };

  const cards = [
    {
      title: "کل مخاطبین",
      value: totalContacts,
      change: totalChange,
      icon: Users,
      gradient: "from-blue-500 via-blue-600 to-indigo-600",
      bgGradient: "from-blue-50/50 via-blue-100/30 to-indigo-100/20",
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
      description: "تعداد کل مخاطبین ثبت شده",
    },
    {
      title: "تعداد گروه‌ها",
      value: groupCount,
      change: groupChange,
      icon: Tag,
      gradient: "from-purple-500 via-purple-600 to-pink-600",
      bgGradient: "from-purple-50/50 via-purple-100/30 to-pink-100/20",
      iconBg: "bg-gradient-to-br from-purple-500 to-pink-600",
      description: "گروه‌های ایجاد شده",
    },
    {
      title: "شرکت‌های برتر",
      value: companyCount,
      change: companyChange,
      icon: Building,
      gradient: "from-emerald-500 via-emerald-600 to-teal-600",
      bgGradient: "from-emerald-50/50 via-emerald-100/30 to-teal-100/20",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
      description: "شرکت‌های ثبت شده",
    },
    {
      title: "میانگین ماهانه",
      value: monthlyAverage,
      change: averageChange,
      icon: TrendingUp,
      gradient: "from-amber-500 via-orange-500 to-red-500",
      bgGradient: "from-amber-50/50 via-orange-100/30 to-red-100/20",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
      description: "میانگین مخاطبین جدید در ماه",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          className={`group relative overflow-hidden bg-gradient-to-br ${card.bgGradient} backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 animate-in fade-in-50 slide-in-from-bottom-4`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          </div>

          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 group-hover:text-slate-800 transition-colors duration-300">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-xl ${card.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <card.icon className="h-5 w-5 text-white" />
            </div>
          </CardHeader>

          <CardContent className="relative">
            <div className="text-3xl font-bold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors duration-300">
              {card.value.toLocaleString()}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <ChangeIcon isPositive={card.change.isPositive} value={card.change.value} />
              <p className={`text-sm font-medium ${
                card.change.isPositive ? 'text-emerald-600' : card.change.value === 0 ? 'text-slate-400' : 'text-red-600'
              }`}>
                {card.change.percentage !== 0 && `${card.change.isPositive ? '+' : ''}${card.change.percentage}%`}
              </p>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {card.description}
            </p>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-8 -translate-x-8 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-500" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatisticsOverviewCards;
