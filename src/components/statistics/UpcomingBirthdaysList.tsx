import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock } from "lucide-react";
import { format } from 'date-fns';
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return (
    <Card className="rounded-xl p-4 col-span-1 md:col-span-2 lg:col-span-1 bg-white dark:bg-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <CalendarClock size={20} className="text-orange-500" />
          {t('statistics.upcoming_birthdays')}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-64 overflow-y-auto custom-scrollbar">
        {data.length > 0 ? (
          <ul className="space-y-3">
            {data.map((contact) => (
              <li key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">
                    {contact.first_name} {contact.last_name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {format(new Date(contact.birthday), 'MMM dd')}
                  </p>
                </div>
                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {contact.days_until_birthday === 0
                    ? t('statistics.today')
                    : t('statistics.days_away', { count: contact.days_until_birthday })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">{t('statistics.no_upcoming_birthdays')}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingBirthdaysList;