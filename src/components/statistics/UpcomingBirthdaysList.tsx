import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useJalaliCalendar } from "@/hooks/use-jalali-calendar";
import { Link } from "react-router-dom";

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
  const { formatDate } = useJalaliCalendar();

  const hasData = data && data.length > 0;

  return (
    <Card className="glass rounded-xl p-4 col-span-1 md:col-span-2 lg:col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Gift size={24} className="text-purple-600 dark:text-purple-400" />
          {t('statistics.upcoming_birthdays')}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-64 overflow-y-auto custom-scrollbar">
        {hasData ? (
          <ul className="space-y-3">
            {data.map((contact) => (
              <li key={contact.id} className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-800 shadow-sm">
                <Link to={`/contacts/${contact.id}`} className="flex items-center gap-3 flex-grow hover:underline">
                  <User size={20} className="text-blue-500 dark:text-blue-300" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">
                      {contact.first_name} {contact.last_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {formatDate(new Date(contact.birthday), 'jMM/jDD')}
                    </p>
                  </div>
                </Link>
                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 whitespace-nowrap">
                  {contact.days_until_birthday === 0
                    ? t('statistics.today')
                    : t('statistics.days_away', { count: contact.days_until_birthday })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            {t('statistics.no_upcoming_birthdays')}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingBirthdaysList;