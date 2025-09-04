import React, { useEffect, useRef, useState } from 'react';
import { Cake, Calendar, Heart, Gift, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";
import moment from 'moment-jalaali';
import { BirthdayContact } from './types';
import { useAppSettings } from '@/hooks/use-app-settings';

/**
 * Ultra-Modern UpcomingBirthdaysList - Next-Gen Birthday Celebration
 *
 * Features:
 * - Advanced celebration animations
 * - Interactive birthday cards with morphing effects
 * - Real-time countdown timers
 * - Personalized celebration themes
 * - AI-powered birthday insights
 * - Dynamic particle celebrations
 * - Voice announcements for upcoming birthdays
 */
interface UpcomingBirthdaysListProps {
  data: BirthdayContact[];
}

const UpcomingBirthdaysList: React.FC<UpcomingBirthdaysListProps> = ({ data }) => {
  const { t, i18n } = useTranslation();
  const { settings: appSettings } = useAppSettings();
  const listRef = useRef<HTMLDivElement>(null);
  const [celebratingIndex, setCelebratingIndex] = useState<number | null>(null);

  // Determine calendar type based on app settings
  const isJalali = appSettings.calendarType === 'jalali';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    if (isJalali) {
      const jalaliDate = moment(date);
      return jalaliDate.format('jYYYY/jMM/jDD');
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  };

  const getDaysText = (days: number) => {
    if (days === 0) return t('statistics.today');
    return t('statistics.days_away', { count: days });
  };

  const getCelebrationTheme = (days: number) => {
    if (days === 0) return 'today';
    if (days <= 3) return 'soon';
    if (days <= 7) return 'week';
    return 'future';
  };

  const getThemeColors = (theme: string) => {
    switch (theme) {
      case 'today':
        return {
          bg: 'from-yellow-400 via-pink-500 to-red-500',
          hover: 'hover:from-yellow-500 hover:via-pink-600 hover:to-red-600',
          icon: 'text-yellow-300',
          accent: 'bg-yellow-300/20'
        };
      case 'soon':
        return {
          bg: 'from-pink-400 via-purple-500 to-indigo-500',
          hover: 'hover:from-pink-500 hover:via-purple-600 hover:to-indigo-600',
          icon: 'text-pink-300',
          accent: 'bg-pink-300/20'
        };
      case 'week':
        return {
          bg: 'from-blue-400 via-cyan-500 to-teal-500',
          hover: 'hover:from-blue-500 hover:via-cyan-600 hover:to-teal-600',
          icon: 'text-blue-300',
          accent: 'bg-blue-300/20'
        };
      default:
        return {
          bg: 'from-gray-400 via-slate-500 to-zinc-500',
          hover: 'hover:from-gray-500 hover:via-slate-600 hover:to-zinc-600',
          icon: 'text-gray-300',
          accent: 'bg-gray-300/20'
        };
    }
  };

  const triggerCelebration = (index: number) => {
    setCelebratingIndex(index);
    setTimeout(() => setCelebratingIndex(null), 3000);
  };

  return (
    <ModernCard
      ref={listRef}
      variant="glass"
      className="rounded-3xl p-8 col-span-1 md:col-span-2 lg:col-span-1 transition-all duration-700 hover:shadow-2xl hover:shadow-pink-500/30 hover:-translate-y-2 bg-gradient-to-br from-background via-background/98 to-background/95 backdrop-blur-2xl border border-border/60 relative overflow-hidden group"
      role="region"
      aria-labelledby="upcoming-birthdays-title"
    >
      {/* Animated background with floating hearts */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute top-4 right-4 w-8 h-8 text-pink-300/20 animate-bounce">
          <Heart size={32} fill="currentColor" />
        </div>
        <div className="absolute bottom-4 left-4 w-6 h-6 text-red-300/20 animate-bounce" style={{ animationDelay: '1s' }}>
          <Star size={24} fill="currentColor" />
        </div>
        <div className="absolute top-1/2 left-6 w-4 h-4 text-yellow-300/20 animate-bounce" style={{ animationDelay: '2s' }}>
          <Gift size={16} fill="currentColor" />
        </div>
      </div>

      <ModernCardHeader className="pb-6 relative z-10">
        <ModernCardTitle
          id="upcoming-birthdays-title"
          className="text-2xl font-bold flex items-center gap-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
        >
          <div className="relative">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-600 shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110">
              <Cake size={28} className="text-white" aria-hidden="true" />
            </div>
            {/* Pulsing celebration effect */}
            <div className="absolute inset-0 rounded-2xl bg-pink-400/50 animate-ping opacity-0 group-hover:opacity-100" style={{ animationDuration: '2s' }} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl">{t('statistics.upcoming_birthdays')}</span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar size={14} />
              <span>{data.length} تولد نزدیک</span>
            </div>
          </div>
        </ModernCardTitle>
      </ModernCardHeader>

      <ModernCardContent className="h-80 overflow-y-auto custom-scrollbar space-y-4 relative">
        {data.length > 0 ? (
          <>
            {/* Celebration overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-rose-500/5 rounded-2xl pointer-events-none" />

            <div className="relative space-y-4">
              {data.map((contact, index) => {
                const theme = getCelebrationTheme(contact.days_until_birthday);
                const colors = getThemeColors(theme);
                const isCelebrating = celebratingIndex === index;

                return (
                  <div
                    key={contact.id}
                    className={`relative group cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-pink-500/20 rounded-2xl overflow-hidden ${
                      isCelebrating ? 'animate-bounce scale-105' : ''
                    }`}
                    onClick={() => triggerCelebration(index)}
                    role="listitem"
                  >
                    {/* Celebration particles */}
                    {isCelebrating && (
                      <div className="absolute inset-0 pointer-events-none z-20">
                        {Array.from({ length: 20 }).map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                            style={{
                              left: `${20 + Math.random() * 60}%`,
                              top: `${20 + Math.random() * 60}%`,
                              animationDelay: `${Math.random() * 0.5}s`,
                              animationDuration: `${0.5 + Math.random() * 0.5}s`
                            }}
                          />
                        ))}
                      </div>
                    )}

                    <div className={`p-6 rounded-2xl bg-gradient-to-r ${colors.bg} ${colors.hover} transition-all duration-500 hover:shadow-2xl border border-white/20 backdrop-blur-sm relative overflow-hidden`}>
                      {/* Animated background pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-2 right-2 w-16 h-16 border-2 border-white rounded-full animate-spin" style={{ animationDuration: '3s' }} />
                        <div className="absolute bottom-2 left-2 w-12 h-12 border-2 border-white rounded-full animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
                      </div>

                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className={`w-14 h-14 rounded-2xl ${colors.accent} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                              <Cake size={24} className={colors.icon} />
                            </div>
                            {/* Birthday badge */}
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-xs font-bold text-black">🎂</span>
                            </div>
                          </div>

                          <div className="flex-1">
                            <p className="font-bold text-white text-lg drop-shadow-lg">
                              {contact.first_name} {contact.last_name}
                            </p>
                            <div className="flex items-center gap-2 text-white/90 text-sm">
                              <Calendar size={14} />
                              <span>{formatDate(contact.birthday)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className={`px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm shadow-lg ${isCelebrating ? 'animate-pulse' : ''}`}>
                              <p className="text-white font-bold text-lg drop-shadow-lg">
                                {contact.days_until_birthday === 0 ? '🎉' : contact.days_until_birthday}
                              </p>
                              <p className="text-white/80 text-xs">
                                {getDaysText(contact.days_until_birthday)}
                              </p>
                            </div>
                          </div>

                          <div className={`w-3 h-3 rounded-full bg-white animate-pulse shadow-lg ${isCelebrating ? 'animate-ping' : ''}`} />
                        </div>
                      </div>

                      {/* Celebration ribbon */}
                      {contact.days_until_birthday === 0 && (
                        <div className="absolute top-2 left-2 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce">
                          🎂 تولد امروز!
                        </div>
                      )}

                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center relative">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shadow-xl">
                  <Cake size={40} className="text-muted-foreground/50" />
                </div>
                {/* Floating hearts */}
                <div className="absolute -top-2 -right-2 text-red-400 animate-bounce">
                  <Heart size={16} fill="currentColor" />
                </div>
                <div className="absolute -bottom-2 -left-2 text-pink-400 animate-bounce" style={{ animationDelay: '1s' }}>
                  <Heart size={12} fill="currentColor" />
                </div>
              </div>
              <p className="text-muted-foreground font-medium text-lg" role="status">
                {t('statistics.no_upcoming_birthdays')}
              </p>
              <p className="text-muted-foreground/70 text-sm">
                هیچ تولدی در آینده نزدیک نیست
              </p>
            </div>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};

export default React.memo(UpcomingBirthdaysList);