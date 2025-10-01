import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ModernSelect, ModernSelectContent, ModernSelectItem, ModernSelectTrigger, ModernSelectValue } from "@/components/ui/modern-select";
import { ModernDatePicker } from "@/components/ui/modern-date-picker";
import { useSession } from "@/integrations/supabase/auth";
import { ContactStatisticsService } from "@/services/contact-statistics-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Filter, Calendar, Building, Briefcase, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

interface StatisticsFiltersProps {
  quickRange: string;
  onQuickRangeChange: (value: string) => void;
  fromDate: string | undefined;
  onFromDateChange: (value: string | undefined) => void;
  toDate: string | undefined;
  onToDateChange: (value: string | undefined) => void;

  // فیلترهای پیشرفته
  selectedCompany?: string;
  onCompanyChange?: (value: string | undefined) => void;
  selectedPosition?: string;
  onPositionChange?: (value: string | undefined) => void;
  selectedContactMethod?: string;
  onContactMethodChange?: (value: string | undefined) => void;
}

const StatisticsFilters: React.FC<StatisticsFiltersProps> = ({
  quickRange,
  onQuickRangeChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  selectedCompany,
  onCompanyChange,
  selectedPosition,
  onPositionChange,
  selectedContactMethod,
  onContactMethodChange,
}) => {
  const { session } = useSession();
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);

  // دریافت لیست شرکت‌ها
  const { data: companies } = useQuery({
    queryKey: ["companies", session?.user?.id],
    queryFn: () => ContactStatisticsService.getUniqueCompanies(session?.user?.id || ""),
    enabled: !!session?.user?.id,
  });

  // دریافت لیست موقعیت‌های شغلی
  const { data: positions } = useQuery({
    queryKey: ["positions", session?.user?.id],
    queryFn: () => ContactStatisticsService.getUniquePositions(session?.user?.id || ""),
    enabled: !!session?.user?.id,
  });

  const quickRangeOptions = [
    { value: "3m", label: "۳ ماه اخیر", color: "from-blue-500 to-cyan-500" },
    { value: "6m", label: "۶ ماه اخیر", color: "from-purple-500 to-pink-500" },
    { value: "12m", label: "۱۲ ماه اخیر", color: "from-emerald-500 to-teal-500" },
    { value: "all", label: "تمام دوره", color: "from-slate-500 to-gray-500" },
  ];

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50/90 via-white/95 to-slate-50/70 backdrop-blur-xl border-0 shadow-2xl">
      <CardContent className="p-6">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-purple-50/30 rounded-2xl" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-transparent rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-200/30 to-transparent rounded-full translate-y-12 -translate-x-12" />

        <CardHeader className="relative pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Filter className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                فیلترهای هوشمند آمار
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                فیلترهای پیشرفته برای تحلیل دقیق و شخصی‌سازی شده داده‌ها
              </p>
            </div>
          </div>
        </CardHeader>

        <div className="relative space-y-8">
          {/* Quick Range Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-blue-500" />
              <label className="text-sm font-semibold text-slate-700">بازه زمانی سریع:</label>
              <div className="flex gap-2">
                {quickRangeOptions.map((option, index) => (
                  <button
                    key={option.value}
                    onClick={() => onQuickRangeChange(option.value)}
                    className={`group relative px-3 py-2 rounded-xl border transition-all duration-300 hover:scale-105 animate-in fade-in-50 slide-in-from-bottom-4 glass-3d-hover ${
                      quickRange === option.value
                        ? `border-transparent bg-gradient-to-r ${option.color} text-white shadow-lg shadow-blue-500/25`
                        : 'border-slate-200/80 bg-white/60 backdrop-blur-sm hover:border-slate-300 hover:bg-white/80 hover:shadow-md'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <span className="text-xs font-medium">{option.label}</span>
                    {quickRange === option.value && (
                      <div className="absolute inset-0 bg-white/10 rounded-xl animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Custom Date Range */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-purple-500" />
              <label className="text-sm font-semibold text-slate-700">بازه زمانی سفارشی:</label>
              <div className="flex gap-4 flex-1">
                <div className="flex items-center gap-3 flex-1">
                  <label className="text-xs font-medium text-slate-600 whitespace-nowrap w-16">از تاریخ:</label>
                  <ModernDatePicker
                    value={fromDate}
                    onChange={onFromDateChange}
                    placeholder="انتخاب تاریخ شروع"
                    variant="glass"
                    inputSize="md"
                    className="flex-1 bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  />
                </div>
                <div className="flex items-center gap-3 flex-1">
                  <label className="text-xs font-medium text-slate-600 whitespace-nowrap w-16">تا تاریخ:</label>
                  <ModernDatePicker
                    value={toDate}
                    onChange={onToDateChange}
                    placeholder="انتخاب تاریخ پایان"
                    variant="glass"
                    inputSize="md"
                    className="flex-1 bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <Collapsible open={isAdvancedFiltersOpen} onOpenChange={setIsAdvancedFiltersOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center justify-between w-full p-4 rounded-xl bg-gradient-to-r from-slate-50/80 to-slate-100/50 hover:from-slate-100/80 hover:to-slate-50/80 border border-slate-200/50 hover:border-slate-300/80 transition-all duration-300 group glass-3d-hover">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-emerald-500 group-hover:text-emerald-600 transition-colors duration-300" />
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-800 transition-colors duration-300">
                    فیلترهای پیشرفته
                  </span>
                  {(selectedCompany && selectedCompany !== "all") || (selectedPosition && selectedPosition !== "all") || (selectedContactMethod && selectedContactMethod !== "all") || (fromDate || toDate) ? (
                    <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                      فعال
                    </span>
                  ) : null}
                </div>
                {isAdvancedFiltersOpen ? (
                  <ChevronUp className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors duration-300" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors duration-300" />
                )}
              </button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* فیلتر شرکت */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Building className="h-4 w-4 text-blue-500" />
                    <label className="text-xs font-medium text-slate-600 whitespace-nowrap">شرکت:</label>
                  </div>
                  <ModernSelect
                    value={selectedCompany}
                    onValueChange={(value) => onCompanyChange?.(value === "all" ? undefined : value)}
                  >
                    <ModernSelectTrigger
                      variant="glass"
                      size="md"
                      className="w-full bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                    >
                      <ModernSelectValue placeholder="انتخاب شرکت" />
                    </ModernSelectTrigger>
                    <ModernSelectContent variant="glass">
                      <ModernSelectItem value="all">همه شرکت‌ها</ModernSelectItem>
                      {companies?.data?.map((company: string) => (
                        <ModernSelectItem key={company} value={company}>
                          {company}
                        </ModernSelectItem>
                      ))}
                    </ModernSelectContent>
                  </ModernSelect>
                </div>

                {/* فیلتر موقعیت شغلی */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Briefcase className="h-4 w-4 text-purple-500" />
                    <label className="text-xs font-medium text-slate-600 whitespace-nowrap">موقعیت شغلی:</label>
                  </div>
                  <ModernSelect
                    value={selectedPosition}
                    onValueChange={(value) => onPositionChange?.(value === "all" ? undefined : value)}
                  >
                    <ModernSelectTrigger
                      variant="glass"
                      size="md"
                      className="w-full bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                    >
                      <ModernSelectValue placeholder="انتخاب موقعیت شغلی" />
                    </ModernSelectTrigger>
                    <ModernSelectContent variant="glass">
                      <ModernSelectItem value="all">همه موقعیت‌ها</ModernSelectItem>
                      {positions?.data?.map((position: string) => (
                        <ModernSelectItem key={position} value={position}>
                          {position}
                        </ModernSelectItem>
                      ))}
                    </ModernSelectContent>
                  </ModernSelect>
                </div>

                {/* فیلتر روش ارتباط */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <MessageSquare className="h-4 w-4 text-emerald-500" />
                    <label className="text-xs font-medium text-slate-600 whitespace-nowrap">روش ارتباط:</label>
                  </div>
                  <ModernSelect
                    value={selectedContactMethod}
                    onValueChange={(value) => onContactMethodChange?.(value === "all" ? undefined : value)}
                  >
                    <ModernSelectTrigger
                      variant="glass"
                      size="md"
                      className="w-full bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                    >
                      <ModernSelectValue placeholder="روش ارتباط ترجیحی" />
                    </ModernSelectTrigger>
                    <ModernSelectContent variant="glass">
                      <ModernSelectItem value="all">همه روش‌ها</ModernSelectItem>
                      <ModernSelectItem value="email">ایمیل</ModernSelectItem>
                      <ModernSelectItem value="phone">تلفن</ModernSelectItem>
                      <ModernSelectItem value="sms">پیامک</ModernSelectItem>
                      <ModernSelectItem value="any">هر روشی</ModernSelectItem>
                    </ModernSelectContent>
                  </ModernSelect>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Filter Summary & Actions */}
          <div className="pt-6 border-t border-slate-200/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                فیلترهای فعال:
                {quickRange !== "all" && <span className="text-blue-600 font-medium"> بازه زمانی،</span>}
                {(fromDate || toDate) && <span className="text-blue-600 font-medium"> تاریخ سفارشی،</span>}
                {(selectedCompany && selectedCompany !== "all") && <span className="text-blue-600 font-medium"> شرکت،</span>}
                {(selectedPosition && selectedPosition !== "all") && <span className="text-purple-600 font-medium"> موقعیت شغلی،</span>}
                {(selectedContactMethod && selectedContactMethod !== "all") && <span className="text-emerald-600 font-medium"> روش ارتباط،</span>}
                {quickRange === "all" && !fromDate && !toDate && !selectedCompany && !selectedPosition && !selectedContactMethod && (
                  <span className="text-slate-400"> بدون فیلتر</span>
                )}
                {(quickRange !== "all" || fromDate || toDate) && (selectedCompany === "all" || !selectedCompany) && (selectedPosition === "all" || !selectedPosition) && (selectedContactMethod === "all" || !selectedContactMethod) && (
                  <span className="text-slate-400"> فقط فیلترهای زمانی</span>
                )}
              </div>
              <button
                onClick={() => {
                  onQuickRangeChange("all");
                  onFromDateChange(undefined);
                  onToDateChange(undefined);
                  onCompanyChange?.(undefined);
                  onPositionChange?.(undefined);
                  onContactMethodChange?.(undefined);
                }}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-300 glass-3d-hover"
              >
                پاک کردن فیلترها
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticsFilters;
