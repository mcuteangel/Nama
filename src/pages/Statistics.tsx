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
} from "@/components/statistics";

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

const addMonths = (date: Date, months: number) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const Statistics: React.FC = () => {
  const { session } = useSession();

  const [quickRange, setQuickRange] = useState<string>("12m");
  const [fromDate, setFromDate] = useState<string | undefined>(() => toDateStr(addMonths(new Date(), -12)));
  const [toDate, setToDate] = useState<string | undefined>(() => toDateStr(new Date()));

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
    <div className="container mx-auto p-6 space-y-6">
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
      />

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <ModernLoader variant="ring" size="lg" />
        </div>
      ) : (
        <>
          <StatisticsOverviewCards
            totalContacts={totalContacts?.data ?? 0}
            groupCount={groupStats?.data?.length ?? 0}
            companyCount={companyStats?.data?.length ?? 0}
            monthlyAverage={
              timelineChartData.length > 0
                ? Math.round(
                    timelineChartData.reduce((a, c) => a + (c.count || 0), 0) /
                      timelineChartData.length,
                  )
                : 0
            }
          />

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              <TabsTrigger value="overview">نمای کلی</TabsTrigger>
              <TabsTrigger value="demographics">جمعیت‌شناسی</TabsTrigger>
              <TabsTrigger value="timeline">روند زمانی</TabsTrigger>
              <TabsTrigger value="details">جزئیات</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <StatisticsOverviewTab
                genderChartData={genderChartData}
                contactMethodChartData={contactMethodChartData}
              />
            </TabsContent>

            <TabsContent value="demographics" className="space-y-4">
              <StatisticsDemographicsTab
                companyStats={companyStats?.data || []}
                positionStats={positionStats?.data || []}
              />
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <StatisticsTimelineTab
                timelineChartData={timelineChartData}
              />
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <StatisticsDetailsTab
                groupStats={groupStats?.data || []}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Statistics;
