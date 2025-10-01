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
}

const COLORS = {
  primary: ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"],
};

const StatisticsDemographicsTab: React.FC<StatisticsDemographicsTabProps> = ({
  companyStats = [],
  positionStats = [],
}) => {
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
