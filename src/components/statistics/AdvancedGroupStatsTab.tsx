import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface GroupStats {
  name: string;
  color?: string;
  count: number;
}

interface GroupGrowth {
  name: string;
  color?: string;
  count: number;
  growth: number;
}

interface AdvancedGroupStatsTabProps {
  groupGrowth?: GroupGrowth[];
  groupStats?: GroupStats[];
  isLoading?: boolean;
  error?: string | null;
}

const AdvancedGroupStatsTab: React.FC<AdvancedGroupStatsTabProps> = ({
  groupGrowth = [],
  groupStats = [],
  isLoading = false,
  error = null,
}) => {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <div className="h-5 w-[160px] bg-muted/50 rounded animate-pulse mb-2" />
            <div className="h-3 w-[200px] bg-muted/50 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-muted/50 rounded-full animate-pulse" />
                    <div className="h-4 w-[90px] bg-muted/50 rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-muted/50 rounded animate-pulse" />
                    <div className="h-6 w-[35px] bg-muted/50 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader>
            <div className="h-5 w-[190px] bg-muted/50 rounded animate-pulse mb-2" />
            <div className="h-3 w-[230px] bg-muted/50 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[240px] w-full bg-muted/20 rounded-lg animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card">
          <CardContent className="flex items-center justify-center h-[300px] p-4">
            <div className="text-center text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t("statistics.advanced_group_stats.error_loading")}</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="flex items-center justify-center h-[300px] p-4">
            <div className="text-center text-muted-foreground">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t("statistics.advanced_group_stats.growth_stats")}</p>
              <p className="text-xs mt-1">{t("statistics.advanced_group_stats.no_data_available")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* گروه‌های با رشد ماهانه */}
      <Card className="glass-card group relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/20 to-transparent" />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className="relative pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {t("statistics.advanced_group_stats.growth_title")}
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 leading-relaxed">
                {t("statistics.advanced_group_stats.growth_description")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative p-4">
          <div className="space-y-4">
            {groupGrowth.slice(0, 8).map((group, idx) => {
              const GrowthIcon = group.growth > 0 ? TrendingUp : group.growth < 0 ? TrendingDown : Minus;

              return (
                <div
                  key={group.name}
                  className="group/item flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50/80 to-slate-100/50 hover:from-slate-100/80 hover:to-slate-50/80 border border-slate-200/50 hover:border-slate-300/80 transition-all duration-300 hover:scale-[1.02] animate-in fade-in-50 slide-in-from-left-4"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full shadow-sm group-hover/item:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: group.color || "#6b7280" }}
                    />
                    <div>
                      <span className="text-sm font-semibold text-slate-700 group-hover/item:text-slate-800 transition-colors duration-300">
                        {group.name}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">
                          {t("statistics.advanced_group_stats.members_count", { count: group.count })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <GrowthIcon className={`w-4 h-4 transition-colors duration-300 ${
                      group.growth > 0 ? 'text-emerald-500' :
                      group.growth < 0 ? 'text-red-500' : 'text-slate-400'
                    }`} />
                    <Badge
                      className={`text-xs font-semibold transition-all duration-300 ${
                        group.growth > 0
                          ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200'
                          : group.growth < 0
                          ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200'
                          : 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {group.growth > 0 ? '+' : ''}{group.growth}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-br from-emerald-200/10 to-transparent rounded-full opacity-60" />
          <div className="absolute bottom-2 left-2 w-12 h-12 bg-gradient-to-tr from-green-200/5 to-transparent rounded-full opacity-60" />
        </CardContent>
      </Card>

      {/* گروه‌های بزرگ جدید */}
      <Card className="glass-card group relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-green-200/20 to-transparent" />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className="relative pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {t("statistics.advanced_group_stats.large_groups_title")}
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 leading-relaxed">
                {t("statistics.advanced_group_stats.large_groups_description")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative p-4">
          <div className="space-y-3">
            {groupGrowth.length > 0 ? (
              groupGrowth.slice(0, 8).map((group, idx) => {
                const GrowthIcon = group.growth > 0 ? TrendingUp : group.growth < 0 ? TrendingDown : Minus;

                return (
                  <div
                    key={group.name}
                    className="group/item flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-slate-50/80 to-slate-100/50 hover:from-slate-100/80 hover:to-slate-50/80 border border-slate-200/50 hover:border-slate-300/80 transition-all duration-300 hover:scale-[1.02] animate-in fade-in-50 slide-in-from-right-4"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full shadow-sm group-hover/item:scale-110 transition-transform duration-300"
                        style={{ backgroundColor: group.color || "#6b7280" }}
                      />
                      <span className="text-sm font-medium text-slate-700 group-hover/item:text-slate-800 transition-colors duration-300">
                        {group.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GrowthIcon className={`w-3 h-3 transition-colors duration-300 ${
                        group.growth > 0 ? 'text-emerald-500' :
                        group.growth < 0 ? 'text-red-500' : 'text-slate-400'
                      }`} />
                      <Badge className={`text-xs font-semibold transition-all duration-300 ${
                        group.growth > 0
                          ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200'
                          : group.growth < 0
                          ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200'
                          : 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border-slate-200'
                      }`}>
                        {group.count}
                      </Badge>
                    </div>
                  </div>
                );
              })
            ) : groupStats.length > 0 ? (
              groupStats.slice(0, 8).map((group, idx) => (
                <div
                  key={group.name + idx}
                  className="group/item flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-slate-50/80 to-slate-100/50 hover:from-slate-100/80 hover:to-slate-50/80 border border-slate-200/50 hover:border-slate-300/80 transition-all duration-300 hover:scale-[1.02] animate-in fade-in-50 slide-in-from-right-4"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full shadow-sm group-hover/item:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: group.color || "#6b7280" }}
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover/item:text-slate-800 transition-colors duration-300">
                      {group.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Minus className="w-3 h-3 text-slate-400" />
                    <Badge className="text-xs font-semibold bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border-slate-200">
                      {group.count}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 font-medium">{t("statistics.advanced_group_stats.no_data_available")}</p>
                <p className="text-xs text-slate-400 mt-1">{t("statistics.advanced_group_stats.add_groups")}</p>
              </div>
            )}
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-br from-green-200/10 to-transparent rounded-full opacity-60" />
          <div className="absolute bottom-2 left-2 w-12 h-12 bg-gradient-to-tr from-emerald-200/5 to-transparent rounded-full opacity-60" />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedGroupStatsTab;
