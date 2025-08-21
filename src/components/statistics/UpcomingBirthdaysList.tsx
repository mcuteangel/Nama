import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift } from "lucide-react";
import { useJalaliCalendar } from "@/hooks/use-jalali-calendar";
import { useTranslation } from "react-i18next";

interface BirthdayContact {
  first_name: string;
  last_name: string;
  birthday: string;
}

interface UpcomingBirthdaysListProps {
  data: BirthdayContact[];
}

const UpcomingBirthdaysList: React.FC<UpcomingBirthdaysListProps> = ({ data }) => {
  const { formatDate } = useJalaliCalendar();
  const { t } = useTranslation();

  return (
    <Card className="glass rounded-xl p-4 col-span-full lg:col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Gift size={24} className="text-pink-600 dark:text-pink-400" />
          {t('statistics.upcoming_birthdays')}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-64 overflow-y-auto custom-scrollbar">
        {data.length > 0 ? (
          <ul className="space-y-3">
            {data.map((contact, index) => (
              <li key={index} className="flex items-center justify-between p-2 rounded-md bg-gray-50/50 dark:bg-gray-800/50">
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  {contact.first_name} {contact.last_name}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {formatDate(new Date(contact.birthday), 'jMM/jDD')}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
            {t('statistics.no_upcoming_birthdays')}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingBirthdaysList;