import React, { useMemo, useState } from "react";
import { useSession } from "@/integrations/supabase/auth";
import { useQuery } from "@tanstack/react-query";
import { ContactStatisticsService } from "@/services/contact-statistics-service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModernLoader } from "@/components/ui/modern-loader";
import PageHeader from "@/components/ui/PageHeader";
import {
  StatisticsFilters,
  StatisticsOverviewCards,
  StatisticsOverviewTab,
  StatisticsDemographicsTab,
  StatisticsTimelineTab,
  StatisticsDetailsTab,
  StatisticsLoading,
} from "@/components/statistics";

function toDateStr(d: Date) {
  // Use UTC to avoid timezone issues completely
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const addMonths = (date: Date, months: number) => {
  // Avoid timezone issues by creating new date with local components
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
};

const Statistics: React.FC = () => {
  const { session } = useSession();

  const [quickRange, setQuickRange] = useState<string>("12m");
  const [fromDate, setFromDate] = useState<string | undefined>(() => {
    const today = new Date();
    return toDateStr(today);
  });
  const [toDate, setToDate] = useState<string | undefined>(() => {
    const today = new Date();
    return toDateStr(today);
  });

  // فیلترهای پیشرفته جدید
  const [selectedPosition, setSelectedPosition] = useState<string>("all");
  const [selectedContactMethod, setSelectedContactMethod] = useState<string>("all");

  // Sync quick ranges to from/to
  const onChangeQuickRange = (val: string) => {
    setQuickRange(val);
    const today = new Date();
    if (val === "3m") {
      setFromDate(toDateStr(addMonths(today, -3)));
      setToDate(toDateStr(today));
    } else if (val === "6m") {
      setFromDate(toDateStr(addMonths(today, -6)));
      setToDate(toDateStr(today));
    } else if (val === "12m") {
      setFromDate(toDateStr(addMonths(today, -12)));
      setToDate(toDateStr(today));
    } else if (val === "all") {
      setFromDate(undefined);
      setToDate(undefined);
    }
  };

  const dateRange = useMemo(() => ({ startDate: fromDate ?? null, endDate: toDate ?? null }), [fromDate, toDate]);

  // Queries
  const { data: totalContacts, isLoading: isLoadingTotal } = useQuery({
    queryKey: ["totalContacts", session?.user?.id, dateRange],
    queryFn: () =>
      ContactStatisticsService.getTotalContacts(
        session?.user?.id || "",
        dateRange.startDate,
        dateRange.endDate,
      ),
    enabled: !!session?.user?.id,
  });

  const { data: genderStats, isLoading: isLoadingGender } = useQuery({
    queryKey: ["genderStats", session?.user?.id, dateRange],
    queryFn: () =>
      ContactStatisticsService.getContactsByGender(
        session?.user?.id || "",
        dateRange.startDate,
        dateRange.endDate,
      ),
    enabled: !!session?.user?.id,
  });

  const { data: groupStats, isLoading: isLoadingGroups } = useQuery({
    queryKey: ["groupStats", session?.user?.id, dateRange],
    queryFn: () =>
      ContactStatisticsService.getContactsByGroup(
        session?.user?.id || "",
        dateRange.startDate,
        dateRange.endDate,
      ),
    enabled: !!session?.user?.id,
  });

  const { data: contactMethodStats, isLoading: isLoadingContactMethods } = useQuery({
    queryKey: ["contactMethodStats", session?.user?.id, dateRange],
    queryFn: () =>
      ContactStatisticsService.getContactsByPreferredMethod(
        session?.user?.id || "",
        dateRange.startDate,
        dateRange.endDate,
      ),
    enabled: !!session?.user?.id,
  });

  const { data: timelineStats, isLoading: isLoadingTimeline } = useQuery({
    queryKey: ["timelineStats", session?.user?.id, dateRange],
    queryFn: () =>
      ContactStatisticsService.getContactsByCreationMonth(
        session?.user?.id || "",
        dateRange.startDate,
        dateRange.endDate,
      ),
    enabled: !!session?.user?.id,
  });

  const { data: companyStats, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["companyStats", session?.user?.id, dateRange],
    queryFn: () =>
      ContactStatisticsService.getTopCompanies(
        session?.user?.id || "",
        5,
        dateRange.startDate,
        dateRange.endDate,
      ),
    enabled: !!session?.user?.id,
  });

  const { data: positionStats, isLoading: isLoadingPositions } = useQuery({
    queryKey: ["positionStats", session?.user?.id, dateRange],
    queryFn: () =>
      ContactStatisticsService.getTopPositions(
        session?.user?.id || "",
        5,
        dateRange.startDate,
        dateRange.endDate,
      ),
    enabled: !!session?.user?.id,
  });

  // مقایسه با دوره قبلی
  const previousDateRange = useMemo(() => {
    if (!fromDate || !toDate) return null;

    // Parse dates without timezone issues
    const fromDateObj = new Date(fromDate + 'T00:00:00');
    const toDateObj = new Date(toDate + 'T00:00:00');
    const diffMs = toDateObj.getTime() - fromDateObj.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const previousToDate = new Date(fromDateObj);
    previousToDate.setDate(previousToDate.getDate() - 1);
    const previousFromDate = new Date(previousToDate);
    previousFromDate.setDate(previousFromDate.getDate() - diffDays);

    return {
      startDate: toDateStr(previousFromDate),
      endDate: toDateStr(previousToDate),
    };
  }, [fromDate, toDate]);

  const { data: previousTotalContacts } = useQuery({
    queryKey: ["previousTotalContacts", session?.user?.id, previousDateRange],
    queryFn: () =>
      ContactStatisticsService.getTotalContacts(
        session?.user?.id || "",
        previousDateRange?.startDate,
        previousDateRange?.endDate,
      ),
    enabled: !!session?.user?.id && !!previousDateRange,
  });

  const { data: previousGroupStats } = useQuery({
    queryKey: ["previousGroupStats", session?.user?.id, previousDateRange],
    queryFn: () =>
      ContactStatisticsService.getContactsByGroup(
        session?.user?.id || "",
        previousDateRange?.startDate,
        previousDateRange?.endDate,
      ),
    enabled: !!session?.user?.id && !!previousDateRange,
  });

  const { data: previousCompanyStats } = useQuery({
    queryKey: ["previousCompanyStats", session?.user?.id, previousDateRange],
    queryFn: () =>
      ContactStatisticsService.getTopCompanies(
        session?.user?.id || "",
        5,
        previousDateRange?.startDate,
        previousDateRange?.endDate,
      ),
    enabled: !!session?.user?.id && !!previousDateRange,
  });

  const { data: previousTimelineStats } = useQuery({
    queryKey: ["previousTimelineStats", session?.user?.id, previousDateRange],
    queryFn: () =>
      ContactStatisticsService.getContactsByCreationMonth(
        session?.user?.id || "",
        previousDateRange?.startDate,
        previousDateRange?.endDate,
      ),
    enabled: !!session?.user?.id && !!previousDateRange,
  });

  // Transforms
  const genderChartData = useMemo(() => {
    const src = genderStats?.data || [];
    const labels: Record<string, string> = { male: "مرد", female: "زن", not_specified: "نامشخص" };
    return src.map((g) => ({ name: labels[g.gender] ?? g.gender, value: g.count }));
  }, [genderStats]);

  const contactMethodChartData = useMemo(() => {
    const src = contactMethodStats?.data || [];
    const labels: Record<string, string> = { email: "ایمیل", phone: "تلفن", sms: "پیامک", any: "هر روشی" };
    return src.map((m) => ({ name: labels[m.method] ?? m.method, value: m.count }));
  }, [contactMethodStats]);

  const timelineChartData = useMemo(() => {
    const src = timelineStats?.data || [];
    // Keep month_year as label; can be mapped to fa later if needed
    return src.map((i) => ({ month: i.month_year, count: i.count }));
  }, [timelineStats]);

  const isLoading =
    isLoadingTotal ||
    isLoadingGender ||
    isLoadingGroups ||
    isLoadingContactMethods ||
    isLoadingTimeline ||
    isLoadingCompanies ||
    isLoadingPositions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/50">
      <div className="container mx-auto p-6 space-y-8">
        <PageHeader
          title="آمار و گزارش‌ها"
          description="تحلیل جامع اطلاعات مخاطبین شما"
          showBackButton={true}
        />

        <StatisticsFilters
          quickRange={quickRange}
          onQuickRangeChange={onChangeQuickRange}
          fromDate={fromDate}
          onFromDateChange={setFromDate}
          toDate={toDate}
          onToDateChange={setToDate}
          selectedPosition={selectedPosition}
          onPositionChange={(value: string | undefined) => setSelectedPosition(value || "all")}
          selectedContactMethod={selectedContactMethod}
          onContactMethodChange={(value: string | undefined) => setSelectedContactMethod(value || "all")}
        />

        {isLoading ? (
          <StatisticsLoading />
        ) : (
          <>
            <StatisticsOverviewCards
              totalContacts={totalContacts?.data ?? 0}
              groupCount={groupStats?.data?.length ?? 0}
              companyCount={companyStats?.data?.length ?? 0}
              monthlyAverage={
                timelineChartData.length > 0
                  ? Math.round(timelineChartData.reduce((a, c) => a + (c.count || 0), 0) / timelineChartData.length)
                  : 0
              }
              previousTotalContacts={previousTotalContacts?.data ?? 0}
              previousGroupCount={previousGroupStats?.data?.length ?? 0}
              previousCompanyCount={previousCompanyStats?.data?.length ?? 0}
              previousMonthlyAverage={
                previousTimelineStats?.data && previousTimelineStats.data.length > 0
                  ? Math.round(previousTimelineStats.data.reduce((a, c) => a + (c.count || 0), 0) / previousTimelineStats.data.length)
                  : 0
              }
            />
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 h-14 bg-white/80 backdrop-blur-sm border-0 shadow-lg glass-3d-hover">
                <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white glass-3d-hover">نمای کلی</TabsTrigger>
                <TabsTrigger value="demographics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white glass-3d-hover">جمعیت شناسی</TabsTrigger>
                <TabsTrigger value="timeline" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white glass-3d-hover">روند زمانی</TabsTrigger>
                <TabsTrigger value="details" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-600 data-[state=active]:text-white glass-3d-hover">جزئیات</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <StatisticsOverviewTab
                  genderChartData={genderChartData}
                  contactMethodChartData={contactMethodChartData}
                  isLoading={isLoadingGender || isLoadingContactMethods}
                />
              </TabsContent>

              <TabsContent value="demographics" className="space-y-6">
                <StatisticsDemographicsTab
                  companyStats={companyStats?.data || []}
                  positionStats={positionStats?.data || []}
                  isLoading={isLoadingCompanies || isLoadingPositions}
                />
              </TabsContent>

              <TabsContent value="timeline" className="space-y-6">
                <StatisticsTimelineTab
                  timelineChartData={timelineChartData}
                  isLoading={isLoadingTimeline}
                />
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                <StatisticsDetailsTab
                  groupStats={groupStats?.data || []}
                  isLoading={isLoadingGroups}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default Statistics;
