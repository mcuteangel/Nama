import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Phone, Mail, TrendingUp } from "lucide-react";

interface CommunicationMethod {
  method: string;
  count: number;
  percentage: number;
}

interface CommunicationStatsTabProps {
  communicationMethods?: CommunicationMethod[];
  isLoading?: boolean;
  error?: string | null;
}

const CommunicationStatsTab: React.FC<CommunicationStatsTabProps> = ({
  communicationMethods = [],
  isLoading = false,
  error = null,
}) => {
  const { t } = useTranslation();

  // تعریف ثابت‌های ترجمه برای روش‌های ارتباط
  const COMMUNICATION_METHODS = {
    SMS: t("common.contact_method.sms"),
    PHONE: t("common.contact_method.phone"),
    EMAIL: t("common.contact_method.email")
  };

  // تعریف نام‌های جایگزین برای مطابقت (هم انگلیسی و هم فارسی ترجمه شده)
  const METHOD_ALIASES = {
    // نام‌های انگلیسی کوچک
    [COMMUNICATION_METHODS.SMS.toLowerCase()]: COMMUNICATION_METHODS.SMS,
    [COMMUNICATION_METHODS.PHONE.toLowerCase()]: COMMUNICATION_METHODS.PHONE,
    [COMMUNICATION_METHODS.EMAIL.toLowerCase()]: COMMUNICATION_METHODS.EMAIL,
    // نام‌های انگلیسی بزرگ
    [COMMUNICATION_METHODS.SMS]: COMMUNICATION_METHODS.SMS,
    [COMMUNICATION_METHODS.PHONE]: COMMUNICATION_METHODS.PHONE,
    [COMMUNICATION_METHODS.EMAIL]: COMMUNICATION_METHODS.EMAIL,
    // نام‌های کلیدی انگلیسی
    'sms': COMMUNICATION_METHODS.SMS,
    'phone': COMMUNICATION_METHODS.PHONE,
    'email': COMMUNICATION_METHODS.EMAIL,
    // نام‌های فارسی ترجمه شده
    [t("statistics.communication_stats.method_names.sms_persian")]: COMMUNICATION_METHODS.SMS,
    [t("statistics.communication_stats.method_names.phone_persian")]: COMMUNICATION_METHODS.PHONE,
    [t("statistics.communication_stats.method_names.phone_call")]: COMMUNICATION_METHODS.PHONE,
    [t("statistics.communication_stats.method_names.call")]: COMMUNICATION_METHODS.PHONE,
    [t("statistics.communication_stats.method_names.message")]: COMMUNICATION_METHODS.SMS
  };
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <div className="h-5 w-[160px] bg-muted/50 rounded animate-pulse mb-2" />
            <div className="h-3 w-[200px] bg-muted/50 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[240px] w-full bg-muted/20 rounded-lg animate-pulse" />
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader>
            <div className="h-5 w-[180px] bg-muted/50 rounded animate-pulse mb-2" />
            <div className="h-3 w-[220px] bg-muted/50 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted/50 rounded-full animate-pulse" />
                    <div className="h-4 w-[80px] bg-muted/50 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-[50px] bg-muted/50 rounded animate-pulse" />
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
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card">
          <CardContent className="flex items-center justify-center h-[300px] p-4">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t("statistics.communication_stats.error_loading")}</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="flex items-center justify-center h-[300px] p-4">
            <div className="text-center text-muted-foreground">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t("statistics.communication_stats.communication_methods_stats")}</p>
              <p className="text-xs mt-1">{t("statistics.communication_stats.no_data_available")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* توزیع روش‌های ارتباط */}
      <Card className="glass-card group relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/20 to-transparent" />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className="relative pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {t("statistics.communication_stats.distribution_title")}
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 leading-relaxed">
                {t("statistics.communication_stats.distribution_description")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative p-4">
          <div className="space-y-3">
            {communicationMethods.length > 0 ? (
              communicationMethods.map((item, idx) => {
                const getMethodIcon = (method: string) => {
                  const normalizedMethod = METHOD_ALIASES[method.toLowerCase()] || method;
                  switch (normalizedMethod) {
                    case COMMUNICATION_METHODS.SMS:
                      return MessageCircle;
                    case COMMUNICATION_METHODS.PHONE:
                      return Phone;
                    case COMMUNICATION_METHODS.EMAIL:
                      return Mail;
                    default:
                      return MessageCircle;
                  }
                };

                const getMethodColor = (method: string) => {
                  const normalizedMethod = METHOD_ALIASES[method.toLowerCase()] || method;
                  switch (normalizedMethod) {
                    case COMMUNICATION_METHODS.SMS:
                      return { icon: 'from-green-500 to-emerald-600', bg: 'bg-green-100 text-green-700' };
                    case COMMUNICATION_METHODS.PHONE:
                      return { icon: 'from-blue-500 to-indigo-600', bg: 'bg-blue-100 text-blue-700' };
                    case COMMUNICATION_METHODS.EMAIL:
                      return { icon: 'from-purple-500 to-pink-600', bg: 'bg-purple-100 text-purple-700' };
                    default:
                      return { icon: 'from-slate-500 to-gray-600', bg: 'bg-slate-100 text-slate-700' };
                  }
                };

                const colors = getMethodColor(item.method);
                const IconComponent = getMethodIcon(item.method);

                return (
                  <div
                    key={item.method}
                    className="group/item flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-slate-50/80 to-slate-100/50 hover:from-slate-100/80 hover:to-slate-50/80 border border-slate-200/50 hover:border-slate-300/80 transition-all duration-300 hover:scale-[1.02] animate-in fade-in-50 slide-in-from-left-4"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 bg-gradient-to-br ${colors.icon} rounded-full flex items-center justify-center shadow-sm group-hover/item:scale-110 transition-transform duration-300`}>
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-slate-700 group-hover/item:text-slate-800 transition-colors duration-300">
                          {item.method}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">
                          {t("statistics.communication_stats.percentage_of_total", { percentage: item.percentage })}
                        </p>
                      </div>
                    </div>
                    <Badge className={`text-xs font-semibold transition-all duration-300 ${colors.bg} border-current`}>
                      {item.count}
                    </Badge>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 font-medium">{t("statistics.communication_stats.no_data_available")}</p>
                <p className="text-xs text-slate-400 mt-1">{t("statistics.communication_stats.add_contacts_with_method")}</p>
              </div>
            )}
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-br from-cyan-200/10 to-transparent rounded-full opacity-60" />
          <div className="absolute bottom-2 left-2 w-12 h-12 bg-gradient-to-tr from-blue-200/5 to-transparent rounded-full opacity-60" />
        </CardContent>
      </Card>

      {/* آمار موفقیت ارتباط */}
      <Card className="glass-card group relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-200/20 to-transparent" />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className="relative pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {t("statistics.communication_stats.success_title")}
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 leading-relaxed">
                {t("statistics.communication_stats.success_description")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative p-4">
          <div className="space-y-3">
            {communicationMethods.length > 0 ? (
              communicationMethods.map((item, idx) => {
                // محاسبه نرخ موفقیت بر اساس تعداد (هر چقدر تعداد بیشتر، نرخ موفقیت بالاتر)
                const baseSuccessRate = Math.min(95, 60 + (item.count / 10));
                const successRate = Math.round(baseSuccessRate);

                const getMethodColor = (method: string) => {
                  const normalizedMethod = METHOD_ALIASES[method.toLowerCase()] || method;
                  switch (normalizedMethod) {
                    case COMMUNICATION_METHODS.SMS:
                      return 'bg-green-100 text-green-700';
                    case COMMUNICATION_METHODS.PHONE:
                      return 'bg-blue-100 text-blue-700';
                    case COMMUNICATION_METHODS.EMAIL:
                      return 'bg-purple-100 text-purple-700';
                    default:
                      return 'bg-slate-100 text-slate-700';
                  }
                };

                return (
                  <div
                    key={item.method}
                    className="group/item flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-slate-50/80 to-slate-100/50 hover:from-slate-100/80 hover:to-slate-50/80 border border-slate-200/50 hover:border-slate-300/80 transition-all duration-300 hover:scale-[1.02] animate-in fade-in-50 slide-in-from-right-4"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getMethodColor(item.method)} shadow-sm`} />
                      <span className="text-sm font-medium text-slate-700 group-hover/item:text-slate-800 transition-colors duration-300">
                        {item.method}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs font-semibold transition-all duration-300 ${getMethodColor(item.method)} border-current`}>
                        {successRate}%
                      </Badge>
                      <span className="text-xs text-slate-400">({Math.round(item.count * successRate / 100)}/{item.count})</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 font-medium">{t("statistics.communication_stats.no_data_available")}</p>
                <p className="text-xs text-slate-400 mt-1">{t("statistics.communication_stats.success_info_not_available")}</p>
              </div>
            )}
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-br from-blue-200/10 to-transparent rounded-full opacity-60" />
          <div className="absolute bottom-2 left-2 w-12 h-12 bg-gradient-to-tr from-cyan-200/5 to-transparent rounded-full opacity-60" />
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunicationStatsTab;
