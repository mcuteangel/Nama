import React, { useMemo } from 'react';
import { Users, TrendingUp, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";
import { cn } from '@/lib/utils';

interface TotalContactsCardProps {
  count: number | null;
}

/**
 * Refactored TotalContactsCard - Improved Performance and Clean Code
 *
 * Features:
 * - Simplified animation system
 * - Better performance with useMemo
 * - Cleaner code structure
 * - Improved RTL support
 * - Better accessibility
 */
const TotalContactsCard: React.FC<TotalContactsCardProps> = React.memo(({ count }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  // Memoized number formatting
  const formattedCount = useMemo(() => {
    if (count === null) return '...';
    return new Intl.NumberFormat(isRTL ? 'fa-IR' : undefined).format(count);
  }, [count, isRTL]);

  // Memoized animation styles
  const animationStyles = useMemo(() => ({
    particle1: { left: '20%', top: '30%', animationDelay: '0s' },
    particle2: { left: '70%', top: '20%', animationDelay: '0.5s' },
    particle3: { left: '40%', top: '70%', animationDelay: '1s' },
    particle4: { left: '80%', top: '60%', animationDelay: '1.5s' },
    sparkle1: { left: '25%', top: '25%', animationDelay: '0s' },
    sparkle2: { left: '75%', top: '35%', animationDelay: '0.7s' },
    sparkle3: { left: '45%', top: '75%', animationDelay: '1.4s' },
    sparkle4: { left: '85%', top: '65%', animationDelay: '2.1s' },
  }), []);

  // Memoized percentage calculation
  const percentage = useMemo(() => {
    return count ? `${Math.min(Math.round((count / 1000) * 100), 100)}%` : '0%';
  }, [count]);

  // Memoized width calculation for progress bar
  const progressBarWidth = useMemo(() => {
    return count ? `${Math.min((count / 1000) * 100, 100)}%` : '0%';
  }, [count]);

  return (
    <ModernCard
      variant="gradient-primary"
      className={cn(
        "rounded-3xl p-8 flex flex-col items-center justify-center text-center min-h-[360px] relative overflow-hidden group cursor-pointer",
        "bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700",
        "hover:from-blue-600 hover:via-purple-700 hover:to-indigo-800",
        "transition-all duration-700 ease-out",
        "hover:shadow-2xl hover:shadow-blue-500/50",
        "hover:-translate-y-3 hover:scale-105",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:via-transparent before:to-black/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
        "after:absolute after:inset-0 after:bg-gradient-to-t after:from-black/20 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-500"
      )}
      role="region"
      aria-labelledby="total-contacts-title"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
            style={animationStyles[`particle${i}` as keyof typeof animationStyles] as React.CSSProperties}
          />
        ))}
        <div className="absolute inset-0 pointer-events-none">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-ping"
              style={animationStyles[`sparkle${i}` as keyof typeof animationStyles] as React.CSSProperties}
            />
          ))}
        </div>
      </div>

      {/* Morphing gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-purple-600/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Floating geometric shapes */}
      <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse`} />
      <div className={`absolute bottom-4 ${isRTL ? 'right-4' : 'left-4'} w-12 h-12 bg-white/5 rounded-full blur-lg animate-pulse`} style={{ animationDelay: '1s' }} />
      <div className={`absolute top-1/2 ${isRTL ? 'right-6' : 'left-6'} w-8 h-8 bg-white/5 rounded-full blur-md animate-pulse`} style={{ animationDelay: '2s' }} />

      <ModernCardHeader className="pb-8 relative z-10">
        <ModernCardTitle
          id="total-contacts-title"
          className="text-2xl font-bold flex items-center gap-4 justify-center mb-4"
        >
          <div className="relative">
            <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110">
              <Users size={32} className="text-white drop-shadow-lg" aria-hidden="true" />
            </div>
            {/* Pulsing ring effect */}
            <div className="absolute inset-0 rounded-2xl bg-white/30 animate-ping opacity-0 group-hover:opacity-100" style={{ animationDuration: '2s' }} />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-white drop-shadow-lg text-xl">{t('statistics.total_contacts')}</span>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <TrendingUp size={14} className={isRTL ? 'rotate-180' : ''} />
              <span>{t('statistics.monthly_growth')}</span>
            </div>
          </div>
        </ModernCardTitle>
      </ModernCardHeader>

      <ModernCardContent className="relative z-10 flex-1 flex flex-col justify-center">
        <div className="relative mb-6">
          {/* Main number with morphing effect */}
          <p
            className={cn(
              "text-8xl font-black transition-all duration-1000 ease-out transform",
              count === null ? "text-white/60 scale-95" : "text-white drop-shadow-2xl scale-100 group-hover:scale-110",
              "bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent",
              "group-hover:from-yellow-200 group-hover:via-white group-hover:to-yellow-200"
            )}
            aria-label={count !== null ? `${t('statistics.total_contacts')}: ${count}` : t('common.loading')}
          >
            {formattedCount}
          </p>

          {/* Animated underline */}
          {count !== null && (
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full animate-pulse" />
          )}

          {/* Floating indicators */}
          <div className={`absolute -top-2 ${isRTL ? 'left-2' : 'right-2'} flex gap-1`}>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>

        {/* Enhanced stats section */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-4 text-white/90">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm">
              <Sparkles size={14} className="text-yellow-300" />
              <span className="text-sm font-medium">{t('statistics.active')}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium">{t('statistics.online')}</span>
            </div>
          </div>

          <p className="text-white/80 text-lg font-medium drop-shadow-sm">
            {t('statistics.contacts')}
          </p>

          {/* Progress indicator */}
          <div className="w-full max-w-xs mx-auto">
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-green-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: progressBarWidth }}
              />
            </div>
            <p className="text-xs text-white/70 mt-1 text-center">
              {count ? `${percentage} ${t('statistics.of_goal')}` : t('common.loading')}
            </p>
          </div>
        </div>
      </ModernCardContent>

      {/* Interactive ripple effect on click */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-white/5 scale-0 group-active:scale-100 transition-transform duration-300 rounded-3xl" />
      </div>
    </ModernCard>
  );
});

export default TotalContactsCard;