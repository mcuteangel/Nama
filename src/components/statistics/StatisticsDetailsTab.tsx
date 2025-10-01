import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface GroupStats {
  name: string;
  count: number;
  color?: string;
}

interface StatisticsDetailsTabProps {
  groupStats?: GroupStats[];
}

const StatisticsDetailsTab: React.FC<StatisticsDetailsTabProps> = ({
  groupStats = [],
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>گروه‌های پرمخاطب</CardTitle>
          <CardDescription>گروه‌هایی با بیشترین تعداد مخاطب</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {groupStats.slice(0, 10).map((g, idx) => (
              <div key={g.name + idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: g.color || "#6b7280" }}
                  />
                  <span className="text-sm">{g.name}</span>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-muted">{g.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>تولدهای پیش رو</CardTitle>
          <CardDescription>مخاطبینی که تولدشان نزدیک است</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">این بخش به زودی تکمیل خواهد شد</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsDetailsTab;
