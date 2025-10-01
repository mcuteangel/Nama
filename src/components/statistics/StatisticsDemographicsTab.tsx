import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface CompanyStats {
  company: string;
  count: number;
}

interface PositionStats {
  position: string;
  count: number;
}

interface StatisticsDemographicsTabProps {
  companyStats?: CompanyStats[];
  positionStats?: PositionStats[];
  isLoading?: boolean;
  error?: string | null;
}

const COLORS = {
  primary: ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"],
};

const StatisticsDemographicsTab: React.FC<StatisticsDemographicsTabProps> = ({
  companyStats = [],
  positionStats = [],
  isLoading = false,
  error = null,
}) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <div className="h-6 w-[150px] bg-muted/50 rounded animate-pulse mb-2" />
            <div className="h-4 w-[200px] bg-muted/50 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-muted/50 rounded-full animate-pulse" />
                    <div className="h-4 w-[120px] bg-muted/50 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-[40px] bg-muted/50 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader>
            <div className="h-6 w-[180px] bg-muted/50 rounded animate-pulse mb-2" />
            <div className="h-4 w-[220px] bg-muted/50 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-muted/50 rounded-full animate-pulse" />
                    <div className="h-4 w-[100px] bg-muted/50 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-[40px] bg-muted/50 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card">
          <CardContent className="flex items-center justify-center h-[300px]">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">خطا در بارگذاری آمار شرکت‌ها</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="flex items-center justify-center h-[300px]">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">خطا در بارگذاری آمار موقعیت‌ها</p>
              <p className="text-xs mt-1">داده‌ای برای نمایش وجود ندارد</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>شرکت‌های برتر</CardTitle>
          <CardDescription>پنج شرکت با بیشترین مخاطب</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {companyStats.map((c, idx) => (
              <div key={c.company + idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS.primary[idx % COLORS.primary.length] }}
                  />
                  <span className="text-sm">{c.company || "نامشخص"}</span>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-muted">{c.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>موقعیت‌های شغلی برتر</CardTitle>
          <CardDescription>پنج موقعیت با بیشترین تعداد</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {positionStats.map((p, idx) => (
              <div key={p.position + idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS.primary[idx % COLORS.primary.length] }}
                  />
                  <span className="text-sm">{p.position || "نامشخص"}</span>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-muted">{p.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsDemographicsTab;
