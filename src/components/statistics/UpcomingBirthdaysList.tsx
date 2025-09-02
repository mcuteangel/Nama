import React from 'react';
import { Cake } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";
import moment from 'moment-jalaali';

interface BirthdayContact {
  id: string;
  first_name: string;
  last_name: string;
  birthday: string;
  days_until_birthday: number;
}

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
    <ModernCard variant="glass" className="rounded-xl p-4 col-span-1 md:col-span-2 lg:col-span-1">
      <ModernCardHeader className="pb-2">
        <ModernCardTitle className="text-lg font-semibold flex items-center gap-2">
          <Cake size={20} className="text-pink-500" />
          {t('statistics.upcoming_birthdays')}
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent className="h-64 overflow-y-auto custom-scrollbar space-y-3">
        {data.length > 0 ? (
          data.map((contact) => (
            <div 
              key={contact.id} 
              className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
            >
              <div>
                <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                <p className="text-sm text-muted-foreground">{formatDate(contact.birthday)}</p>
              </div>
              <span className="text-sm font-medium text-primary">
                {getDaysText(contact.days_until_birthday)}
              </span>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">{t('statistics.no_upcoming_birthdays')}</p>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};

export default React.memo(UpcomingBirthdaysList);