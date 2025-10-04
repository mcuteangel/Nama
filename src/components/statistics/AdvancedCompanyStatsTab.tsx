import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface CompanyStats {
  company: string;
  count: number;
}

interface CompanyGrowth {
  company: string;
  current_count: number;
  previous_count: number;
  growth: number;
}

interface AdvancedCompanyStatsTabProps {
  companyGrowth?: CompanyGrowth[];
  companyStats?: CompanyStats[];
  isLoading?: boolean;
  error?: string | null;
}

const AdvancedCompanyStatsTab: React.FC<AdvancedCompanyStatsTabProps> = ({
  companyGrowth = [],
  companyStats = [],
  isLoading = false,
  error = null,
}) => {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <div className="h-5 w-[180px] bg-muted/50 rounded animate-pulse mb-2" />
            <div className="h-3 w-[220px] bg-muted/50 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-muted/50 rounded-full animate-pulse" />
                    <div className="h-4 w-[100px] bg-muted/50 rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-muted/50 rounded animate-pulse" />
                    <div className="h-6 w-[40px] bg-muted/50 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader>
            <div className="h-5 w-[200px] bg-muted/50 rounded animate-pulse mb-2" />
            <div className="h-3 w-[250px] bg-muted/50 rounded animate-pulse" />
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
              <Building className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t("statistics.advanced_company_stats.error_loading")}</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="flex items-center justify-center h-[300px] p-4">
            <div className="text-center text-muted-foreground">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t("statistics.advanced_company_stats.growth_stats")}</p>
              <p className="text-xs mt-1">{t("statistics.advanced_company_stats.no_data_available")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* شرکت‌های با رشد ماهانه */}
      <Card className="glass-card group relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-200/20 to-transparent" />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className="relative pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Building className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {t("statistics.advanced_company_stats.growth_title")}
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 leading-relaxed">
                {t("statistics.advanced_company_stats.growth_description")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative p-4">
          <div className="space-y-4">
            {companyGrowth.slice(0, 8).map((company, idx) => {
              const GrowthIcon = company.growth > 0 ? TrendingUp : company.growth < 0 ? TrendingDown : Minus;

              return (
                <div
                  key={company.company}
                  className="group/item flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50/80 to-slate-100/50 hover:from-slate-100/80 hover:to-slate-50/80 border border-slate-200/50 hover:border-slate-300/80 transition-all duration-300 hover:scale-[1.02] animate-in fade-in-50 slide-in-from-left-4"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full shadow-sm group-hover/item:scale-110 transition-transform duration-300" />
                    <div>
                      <span className="text-sm font-semibold text-slate-700 group-hover/item:text-slate-800 transition-colors duration-300">
                        {company.company}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">
                          {t("statistics.advanced_company_stats.previous_count", { count: company.previous_count })}
                        </span>
                        <span className="text-xs text-slate-400">→</span>
                        <span className="text-xs text-slate-500">
                          {t("statistics.advanced_company_stats.current_count", { count: company.current_count })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <GrowthIcon className={`w-4 h-4 transition-colors duration-300 ${
                      company.growth > 0 ? 'text-emerald-500' :
                      company.growth < 0 ? 'text-red-500' : 'text-slate-400'
                    }`} />
                    <Badge
                      className={`text-xs font-semibold transition-all duration-300 ${
                        company.growth > 0
                          ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200'
                          : company.growth < 0
                          ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200'
                          : 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {company.growth > 0 ? '+' : ''}{company.growth}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-br from-blue-200/10 to-transparent rounded-full opacity-60" />
          <div className="absolute bottom-2 left-2 w-12 h-12 bg-gradient-to-tr from-indigo-200/5 to-transparent rounded-full opacity-60" />
        </CardContent>
      </Card>

      {/* آمار شرکت‌های برتر جدید */}
      <Card className="glass-card group relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-200/20 to-transparent" />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className="relative pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {t("statistics.advanced_company_stats.top_companies_title")}
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 leading-relaxed">
                {t("statistics.advanced_company_stats.top_companies_description")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative p-4">
          <div className="space-y-3">
            {companyGrowth.length > 0 ? (
              companyGrowth.slice(0, 8).map((company, idx) => {
                const GrowthIcon = company.growth > 0 ? TrendingUp : company.growth < 0 ? TrendingDown : Minus;

                return (
                  <div
                    key={company.company}
                    className="group/item flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-slate-50/80 to-slate-100/50 hover:from-slate-100/80 hover:to-slate-50/80 border border-slate-200/50 hover:border-slate-300/80 transition-all duration-300 hover:scale-[1.02] animate-in fade-in-50 slide-in-from-right-4"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full shadow-sm" />
                      <span className="text-sm font-medium text-slate-700 group-hover/item:text-slate-800 transition-colors duration-300">
                        {company.company}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GrowthIcon className={`w-3 h-3 transition-colors duration-300 ${
                        company.growth > 0 ? 'text-emerald-500' :
                        company.growth < 0 ? 'text-red-500' : 'text-slate-400'
                      }`} />
                      <Badge className={`text-xs font-semibold transition-all duration-300 ${
                        company.growth > 0
                          ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200'
                          : company.growth < 0
                          ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200'
                          : 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border-slate-200'
                      }`}>
                        {company.current_count}
                      </Badge>
                    </div>
                  </div>
                );
              })
            ) : companyStats.length > 0 ? (
              companyStats.slice(0, 8).map((company, idx) => (
                <div
                  key={company.company + idx}
                  className="group/item flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-slate-50/80 to-slate-100/50 hover:from-slate-100/80 hover:to-slate-50/80 border border-slate-200/50 hover:border-slate-300/80 transition-all duration-300 hover:scale-[1.02] animate-in fade-in-50 slide-in-from-right-4"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full shadow-sm" />
                    <span className="text-sm font-medium text-slate-700 group-hover/item:text-slate-800 transition-colors duration-300">
                      {company.company}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Minus className="w-3 h-3 text-slate-400" />
                    <Badge className="text-xs font-semibold bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border-slate-200">
                      {company.count}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 font-medium">{t("statistics.advanced_company_stats.no_data_available")}</p>
                <p className="text-xs text-slate-400 mt-1">{t("statistics.advanced_company_stats.add_companies")}</p>
              </div>
            )}
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-br from-indigo-200/10 to-transparent rounded-full opacity-60" />
          <div className="absolute bottom-2 left-2 w-12 h-12 bg-gradient-to-tr from-purple-200/5 to-transparent rounded-full opacity-60" />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedCompanyStatsTab;
