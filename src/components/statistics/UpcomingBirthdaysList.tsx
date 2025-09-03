import React from 'react';
import { Cake } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";
import moment from 'moment-jalaali';
import { BirthdayContact } from './types';

interface UpcomingBirthdaysListProps {
  data: BirthdayContact[];
}

const UpcomingBirthdaysList: React.FC<UpcomingBirthdaysListProps> = ({ data }) => {
  const { t, i18n } = useTranslation();

  // Determine calendar type based on current language
  const isJalali = i18n.language === 'fa';

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

  return (
    <ModernCard
      variant="glass"
      className="rounded-2xl p-6 col-span-1 md:col-span-2 lg:col-span-1 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-xl border border-border/50"
      role="region"
      aria-labelledby="upcoming-birthdays-title"
    >
      <ModernCardHeader className="pb-4">
        <ModernCardTitle
          id="upcoming-birthdays-title"
          className="text-xl font-bold flex items-center gap-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
        >
          <div className="p-2 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 shadow-lg">
            <Cake size={24} className="text-white" aria-hidden="true" />
          </div>
          {t('statistics.upcoming_birthdays')}
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent className="h-72 overflow-y-auto custom-scrollbar space-y-3 relative">
        {data.length > 0 ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-rose-500/5 rounded-xl pointer-events-none" />
            <div className="relative space-y-3">
              {data.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-background/80 to-background/60 hover:from-background hover:to-background/80 transition-all duration-300 hover:shadow-md hover:shadow-pink-500/10 hover:scale-[1.02] border border-border/30"
                  role="listitem"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30 flex items-center justify-center">
                      <Cake size={20} className="text-pink-600 dark:text-pink-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{contact.first_name} {contact.last_name}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(contact.birthday)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-pink-600 dark:text-pink-400 px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-900/20">
                      {getDaysText(contact.days_until_birthday)}
                    </span>
                    <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <Cake size={32} className="text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground font-medium" role="status">
                {t('statistics.no_upcoming_birthdays')}
              </p>
            </div>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};

export default React.memo(UpcomingBirthdaysList);