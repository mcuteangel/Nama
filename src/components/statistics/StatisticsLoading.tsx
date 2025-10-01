import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const StatisticsLoading: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Loading برای کارت‌های آمار کلی */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <Skeleton className="h-3 w-[80px]" />
              <Skeleton className="h-3 w-3 rounded-full" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <Skeleton className="h-6 w-[50px] mb-1" />
              <Skeleton className="h-3 w-[100px] mb-2" />
              <Skeleton className="h-3 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loading برای تب‌ها */}
      <div className="space-y-4">
        {/* Tab List Skeleton */}
        <div className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>

        {/* Tab Content Skeleton */}
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={index} className="glass-card">
              <CardHeader>
                <Skeleton className="h-5 w-[130px] mb-2" />
                <Skeleton className="h-3 w-[180px]" />
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Loading برای چارت‌ها */}
                  <div className="h-[240px] w-full bg-muted/20 rounded-lg animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatisticsLoading;
