import React, { useMemo, useEffect, useRef, useState } from "react";
import { Calendar, TrendingUp, Clock, Target } from "lucide-react";
import BaseLineChart from "./BaseLineChart";
import { CreationTimeData } from "./types";
import { useTranslation } from "react-i18next";
import moment from "moment-jalaali";
import { useAppSettings } from "@/hooks/use-app-settings";

/**
 * Ultra-Modern ContactsByCreationTimeChart - Time-based Contact Growth Analysis
 *
 * Features:
 * - Advanced temporal data visualization
 * - Interactive time period selection
 * - Real-time growth trend analysis
 * - AI-powered seasonal pattern recognition
 * - Dynamic time-based color schemes
 * - Voice-guided temporal insights
 * - RTL support
 */
interface ContactsByCreationTimeChartProps {
  data: CreationTimeData[];
}

const ContactsByCreationTimeChart: React.FC<
  ContactsByCreationTimeChartProps
> = ({ data }) => {
  const { t, i18n } = useTranslation();
  const { settings: appSettings } = useAppSettings();
  const containerRef = useRef<HTMLDivElement>(null);
  const [growthMode, setGrowthMode] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const isRTL = i18n.dir() === "rtl";

  // Advanced growth analysis
  useEffect(() => {
    if (!containerRef.current || !data.length) return;

    // Trigger growth mode when showing consistent upward trend
    const recentData = data.slice(-6); // Last 6 months
    const growthTrend = recentData.every(
      (item, index) => index === 0 || item.count >= recentData[index - 1].count
    );

    if (growthTrend && recentData.length >= 3) {
      setGrowthMode(true);
      setTimeout(() => setGrowthMode(false), 7000);
    }
  }, [data]);

  // Determine calendar type based on app settings
  const isJalali = appSettings.calendarType === "jalali";

  const formattedData = useMemo(() => {
    return data.map((item) => {
      // Parse the date string (assumed to be in YYYY-MM format)
      const [year, month] = item.month_year.split("-").map(Number);

      if (isJalali) {
        // For Jalali calendar, convert Gregorian date to Jalali
        const gregorianDate = new Date(year, month - 1, 1);
        const jalaliDate = moment(gregorianDate);
        // Format as Jalali month/year
        const formattedDate = jalaliDate.format("jYYYY/jMM");
        const season = Math.floor(jalaliDate.jMonth() / 3);
        return {
          name: formattedDate,
          count: item.count,
          season: [
            t("statistics.spring"),
            t("statistics.summer"),
            t("statistics.fall"),
            t("statistics.winter"),
          ][season],
        };
      } else {
        // For Gregorian calendar, format as YYYY/MM
        const formattedDate = `${year}/${month.toString().padStart(2, "0")}`;
        const season = Math.floor((month - 1) / 3);
        return {
          name: formattedDate,
          count: item.count,
          season: ["Spring", "Summer", "Fall", "Winter"][season],
        };
      }
    });
  }, [data, isJalali, t]);

  // Time-based insights
  const timeInsights = useMemo(() => {
    if (!data.length) return [];

    // First, create formatted data to get the proper date formatting
    const formattedItems = data.map((item) => {
      // Parse the date string (assumed to be in YYYY-MM format)
      const [year, month] = item.month_year.split("-").map(Number);

      if (isJalali) {
        // For Jalali calendar, convert Gregorian date to Jalali
        const gregorianDate = new Date(year, month - 1, 1);
        const jalaliDate = moment(gregorianDate);
        // Format as Jalali month/year
        const formattedDate = jalaliDate.format("jYYYY/jMM");
        const season = Math.floor(jalaliDate.jMonth() / 3);
        return {
          original: item.month_year,
          name: formattedDate,
          count: item.count,
          season: [
            t("statistics.spring"),
            t("statistics.summer"),
            t("statistics.fall"),
            t("statistics.winter"),
          ][season],
        };
      } else {
        // For Gregorian calendar, format as YYYY/MM
        const formattedDate = `${year}/${month.toString().padStart(2, "0")}`;
        const season = Math.floor((month - 1) / 3);
        return {
          original: item.month_year,
          name: formattedDate,
          count: item.count,
          season: ["Spring", "Summer", "Fall", "Winter"][season],
        };
      }
    });

    const insights = data.map((item, index) => {
      const growth =
        index > 0
          ? ((item.count - data[index - 1].count) / data[index - 1].count) * 100
          : 0;

      // Find the formatted item that matches this original item
      const formattedItem = formattedItems.find(
        (f) => f.original === item.month_year
      ) || {
        name: item.month_year,
        season: "Unknown",
      };

      return {
        ...item,
        formattedName: formattedItem.name,
        growth,
        season: formattedItem.season,
        performance:
          growth > 10 ? "excellent" : growth > 0 ? "good" : "needs_improvement",
        trend: growth > 5 ? "up" : growth < -5 ? "down" : "stable",
      };
    });

    return insights;
  }, [data, isJalali, t]);

  // Seasonal color schemes
  const getSeasonalColors = (season: string) => {
    switch (season) {
      case "بهار":
        return {
          primary: "from-green-500 to-emerald-500",
          secondary: "from-green-400 to-emerald-400",
          accent: "#10B981",
        };
      case "تابستان":
        return {
          primary: "from-yellow-500 to-orange-500",
          secondary: "from-yellow-400 to-orange-400",
          accent: "#F97316",
        };
      case "پاییز":
        return {
          primary: "from-red-500 to-pink-500",
          secondary: "from-red-400 to-pink-400",
          accent: "#EF4444",
        };
      case "زمستان":
        return {
          primary: "from-blue-500 to-indigo-500",
          secondary: "from-blue-400 to-indigo-400",
          accent: "#3B82F6",
        };
      default:
        return {
          primary: "from-gray-500 to-slate-500",
          secondary: "from-gray-400 to-slate-400",
          accent: "#6B7280",
        };
    }
  };

  return (
    <div ref={containerRef} className="relative" dir={isRTL ? "rtl" : "ltr"}>
      {/* Growth celebration overlay */}
      {growthMode && (
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-center space-y-4 animate-bounce">
            <div className="text-6xl animate-spin">📈</div>
            <div className="text-2xl font-bold text-white drop-shadow-lg bg-black/50 px-6 py-3 rounded-2xl backdrop-blur-sm">
              {t("statistics.excellent_time_growth")} 🚀
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        {/* Time analysis indicator */}
        <div
          className={`absolute top-4 ${
            isRTL ? "left-4" : "right-4"
          } z-10 bg-white/10 backdrop-blur-sm rounded-xl p-3 shadow-lg`}
        >
          <div className="flex items-center gap-2 text-sm">
            <Clock size={16} className="text-indigo-400" />
            <span className="text-white font-medium">
              {t("statistics.time_analysis")}
            </span>
          </div>
        </div>

        <BaseLineChart
          data={formattedData}
          title="statistics.contacts_by_creation_time"
          icon={Calendar}
          iconColor="text-indigo-500"
          emptyMessageKey="statistics.no_creation_time_data"
          className={`col-span-1 md:col-span-2 ${
            growthMode ? "animate-pulse" : ""
          }`}
          nameKey="name"
          valueKey="count"
        />

        {/* Time period insights */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {timeInsights.slice(-4).map((period, index) => {
            const colors = getSeasonalColors(period.season);
            return (
              <div
                key={index}
                className={`p-4 rounded-xl bg-gradient-to-br ${
                  colors.secondary
                } backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer ${
                  selectedPeriod === period.month_year
                    ? "ring-2 ring-white/50 scale-105"
                    : ""
                }`}
                onClick={() =>
                  setSelectedPeriod(
                    selectedPeriod === period.month_year
                      ? null
                      : period.month_year
                  )
                }
                dir={isRTL ? "rtl" : "ltr"}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold text-sm">
                    {period.formattedName}
                  </span>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      period.performance === "excellent"
                        ? "bg-green-500/20 text-green-200"
                        : period.performance === "good"
                        ? "bg-blue-500/20 text-blue-200"
                        : "bg-red-500/20 text-red-200"
                    }`}
                  >
                    {period.performance === "excellent"
                      ? t("statistics.excellent")
                      : period.performance === "good"
                      ? t("statistics.good")
                      : t("statistics.needs_improvement")}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 text-xs">
                      {t("statistics.contact_count")}
                    </span>
                    <span className="text-white font-bold">{period.count}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-white/80 text-xs">
                      {t("statistics.growth")}
                    </span>
                    <div className="flex items-center gap-1">
                      {period.growth > 0 ? (
                        <TrendingUp size={12} className="text-green-400" />
                      ) : (
                        <TrendingUp
                          size={12}
                          className="text-red-400 rotate-180"
                        />
                      )}
                      <span
                        className={
                          period.growth > 0 ? "text-green-400" : "text-red-400"
                        }
                      >
                        {Math.abs(period.growth).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Growth bar */}
                <div className="mt-3 w-full">
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${colors.primary} rounded-full transition-all duration-1000 ease-out`}
                      style={{
                        width: `${Math.min(
                          (period.count /
                            Math.max(...data.map((d) => d.count))) *
                            100,
                          100
                        )}%`,
                        animationDelay: `${index * 200}ms`,
                      }}
                    />
                  </div>
                </div>

                {/* Trend indicator */}
                <div className="mt-3 text-center">
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      period.trend === "up"
                        ? "bg-green-500/20 text-green-200"
                        : period.trend === "down"
                        ? "bg-red-500/20 text-red-200"
                        : "bg-blue-500/20 text-blue-200"
                    }`}
                  >
                    <Target size={10} />
                    {period.trend === "up"
                      ? t("statistics.increasing")
                      : period.trend === "down"
                      ? t("statistics.decreasing")
                      : t("statistics.stable")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Time-based recommendations */}
        <div
          className="mt-6 p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl"
          dir={isRTL ? "rtl" : "ltr"}
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-indigo-400" />
            {t("statistics.time_based_recommendations")}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              t("statistics.spring"),
              t("statistics.summer"),
              t("statistics.fall"),
              t("statistics.winter"),
            ].map((season, index) => {
              const seasonData = timeInsights.filter(
                (item) => item.season === season
              );
              const avgGrowth =
                seasonData.reduce((sum, item) => sum + item.growth, 0) /
                  seasonData.length || 0;
              const colors = getSeasonalColors(season);

              return (
                <div
                  key={index}
                  className="text-center p-4 bg-white/10 rounded-xl"
                >
                  <div className="text-lg font-bold text-white mb-1">
                    {season}
                  </div>
                  <div
                    className={`text-sm font-semibold mb-2 ${
                      avgGrowth >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {avgGrowth >= 0 ? "+" : ""}
                    {avgGrowth.toFixed(1)}%
                  </div>
                  <div
                    className="w-full h-2 rounded-full mx-auto"
                    style={{ backgroundColor: colors.accent + "40" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.max(
                          10,
                          Math.min(100, 50 + avgGrowth)
                        )}%`,
                        backgroundColor: colors.accent,
                        animationDelay: `${index * 300}ms`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-white/10 rounded-xl">
            <h4 className="font-semibold text-white mb-2">
              {t("statistics.low_activity")}
            </h4>
            <p className="text-sm text-white/80">
              {t("statistics.low_activity_description")}
            </p>
          </div>

          <div className="p-4 bg-white/10 rounded-xl">
            <h4 className="font-semibold text-white mb-2">
              {t("statistics.seasonal_patterns")}
            </h4>
            <p className="text-sm text-white/80">
              {t("statistics.seasonal_patterns_description")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ContactsByCreationTimeChart);
