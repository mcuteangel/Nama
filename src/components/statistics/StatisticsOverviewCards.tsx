import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Tag, Building, TrendingUp } from "lucide-react";

interface StatisticsOverviewCardsProps {
  totalContacts?: number;
  groupCount?: number;
  companyCount?: number;
  monthlyAverage?: number;
}

const StatisticsOverviewCards: React.FC<StatisticsOverviewCardsProps> = ({
  totalContacts = 0,
  groupCount = 0,
  companyCount = 0,
  monthlyAverage = 0,
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">کل مخاطبین</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalContacts}</div>
          <p className="text-xs text-muted-foreground">تعداد کل مخاطبین ثبت شده</p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">تعداد گروه‌ها</CardTitle>
          <Tag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{groupCount}</div>
          <p className="text-xs text-muted-foreground">گروه‌های ایجاد شده</p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">شرکت‌های برتر</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{companyCount}</div>
          <p className="text-xs text-muted-foreground">شرکت‌های ثبت شده</p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">میانگین ماهانه</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{monthlyAverage}</div>
          <p className="text-xs text-muted-foreground">میانگین مخاطبین جدید در ماه</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsOverviewCards;
