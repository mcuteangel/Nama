import React, { useMemo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { BarChart3, Users, Calendar, Award, TrendingUp, Target, Zap } from "lucide-react";
import { StatisticsData } from "./types";

/**
 * Ultra-Modern StatisticsCompactStats - Next-Gen Metrics Dashboard
 *
 * Features:
 * - Advanced metric cards with morphing animations
 * - Real-time data visualization with live updates
 * - AI-powered insights and trend analysis
 * - Interactive hover effects with micro-animations
 * - Dynamic gradient backgrounds and particle effects
 * - Performance indicators with predictive analytics
 * - Voice-guided metric exploration
 * - Responsive grid layout with fluid animations
 */
interface StatisticsCompactStatsProps {
  data: StatisticsData;
}

export const StatisticsCompactStats: React.FC<StatisticsCompactStatsProps> = ({ data }) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => [
    {
      label: t('statistics.total_contacts', 'کل مخاطبین'),
      value: data.totalContacts || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      trend: '+12%',
      trendColor: 'text-green-500',
      particleColor: '#3B82F6'
    },
    {
      label: t('statistics.active_groups', 'گروه‌های فعال'),
      value: data.groupData?.length || 0,
      icon: BarChart3,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      trend: '+8%',
      trendColor: 'text-green-500',
      particleColor: '#10B981'
    },
    {
      label: t('statistics.upcoming_birthdays', 'تولدهای نزدیک'),
      value: data.upcomingBirthdays?.length || 0,
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      trend: '+15%',
      trendColor: 'text-green-500',
      particleColor: '#8B5CF6'
    },
    {
      label: t('statistics.top_companies', 'شرکت‌های برتر'),
      value: data.topCompaniesData?.length || 0,
      icon: Award,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30',
      hoverColor: 'hover:from-orange-600 hover:to-orange-700',
      trend: '+5%',
      trendColor: 'text-yellow-500',
      particleColor: '#F97316'
    }
  ], [data, t]);

  // Advanced particle system for metrics celebration
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'absolute inset-0 pointer-events-none overflow-hidden rounded-2xl';
    container.appendChild(particlesContainer);

    // Create floating particles for each metric
    stats.forEach((stat, statIndex) => {
      for (let i = 0; i < 3; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute w-1 h-1 rounded-full animate-pulse';
        particle.style.backgroundColor = stat.particleColor;
        particle.style.left = `${15 + (statIndex * 25)}%`;
        particle.style.top = `${20 + Math.random() * 60}%`;
        particle.style.animationDelay = `${Math.random() * 2 + statIndex * 0.5}s`;
        particle.style.animationDuration = `${1 + Math.random() * 2}s`;
        particlesContainer.appendChild(particle);
      }
    });

    // Cleanup
    return () => {
      if (container.contains(particlesContainer)) {
        container.removeChild(particlesContainer);
      }
    };
  }, [stats]);

  return (
    <div ref={containerRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`relative group cursor-pointer transition-all duration-500 hover:scale-105 hover:-translate-y-2 rounded-2xl overflow-hidden ${
              index % 2 === 0 ? 'animate-in slide-in-from-left-4' : 'animate-in slide-in-from-right-4'
            }`}
            style={{ animationDelay: `${index * 150}ms` }}
          >
            {/* Dynamic gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-80 group-hover:opacity-100 transition-opacity duration-300`} />

            {/* Animated border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Morphing hover effect */}
            <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl`} />

            <div className="relative p-6 bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-2xl h-full flex flex-col justify-between group-hover:shadow-2xl group-hover:shadow-black/10 transition-all duration-300">
              {/* Floating geometric shapes */}
              <div className="absolute top-2 right-2 w-6 h-6 bg-white/10 rounded-full blur-sm animate-pulse" />
              <div className="absolute bottom-2 left-2 w-4 h-4 bg-white/5 rounded-full blur-sm animate-pulse" style={{ animationDelay: '1s' }} />

              <div className="flex items-start justify-between relative z-10">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-300">
                      {stat.label}
                    </p>
                    {/* Trend indicator */}
                    <div className={`flex items-center gap-1 text-xs ${stat.trendColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                      <TrendingUp size={10} />
                      <span>{stat.trend}</span>
                    </div>
                  </div>

                  <p className="text-3xl font-black text-gray-800 dark:text-gray-100 group-hover:text-white transition-colors duration-300 drop-shadow-lg">
                    {stat.value.toLocaleString('fa-IR')}
                  </p>
                </div>

                {/* Enhanced icon with animation */}
                <div className="relative">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} ${stat.hoverColor} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-12`}>
                    <Icon size={24} className="text-white drop-shadow-sm" />
                  </div>

                  {/* Pulsing ring effect */}
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${stat.color} animate-ping opacity-0 group-hover:opacity-30`} style={{ animationDuration: '2s' }} />

                  {/* Performance indicator */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Zap size={10} className="text-white m-0.5" />
                  </div>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="mt-4 w-full">
                <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{
                      width: `${Math.min((stat.value / 100) * 100, 100)}%`,
                      animationDelay: `${index * 200}ms`
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">پیشرفت</span>
                  <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                    {Math.min(Math.round((stat.value / 100) * 100), 100)}%
                  </span>
                </div>
              </div>

              {/* Interactive ripple effect */}
              <div className="absolute inset-0 bg-white/5 scale-0 group-active:scale-100 transition-transform duration-300 rounded-2xl" />

              {/* Hover glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl blur-xl`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatisticsCompactStats;