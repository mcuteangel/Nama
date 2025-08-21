import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/integrations/supabase/auth";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PieChart, CalendarClock, Building, Mail, Phone } from "lucide-react";
import TotalContactsCard from "@/components/statistics/TotalContactsCard";
import ContactsByGenderChart from "@/components/statistics/ContactsByGenderChart";
import ContactsByGroupChart from "@/components/statistics/ContactsByGroupChart";
import ContactsByPreferredMethodChart from "@/components/statistics/ContactsByPreferredMethodChart";
import UpcomingBirthdaysList from "@/components/statistics/UpcomingBirthdaysList";
import { ContactService } from "@/services/contact-service";
import { useTranslation } from "react-i18next";

interface GenderData {
  gender: string;
  count: number;
}

interface GroupData {
  name: string;
  color?: string;
  count: number;
}

interface PreferredMethodData {
  method: string;
  count: number;
}

interface BirthdayContact {
  first_name: string;
  last_name: string;
  birthday: string;
}

const ContactStatisticsDashboard: React.FC = () => {
  const { session, isLoading: isSessionLoading } = useSession();
  const { t } = useTranslation();

  const [totalContacts, setTotalContacts] = useState<number | null>(null);
  const [genderData, setGenderData] = useState<GenderData[]>([]);
  const [groupData, setGroupData] = useState<GroupData[]>([]);
  const [preferredMethodData, setPreferredMethodData] = useState<PreferredMethodData[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<BirthdayContact[]>([]);

  const {
    isLoading: loading,
    executeAsync,
  } = useErrorHandler(null, {
    showToast: true,
    customErrorMessage: t('statistics.error_loading_stats'),
    onError: (error) => {
      ErrorManager.logError(error, { component: 'ContactStatisticsDashboard', action: 'fetchStatistics' });
    }
  });

  const fetchStatistics = useCallback(async () => {
    if (isSessionLoading || !session?.user) {
      setTotalContacts(null);
      setGenderData([]);
      setGroupData([]);
      setPreferredMethodData([]);
      setUpcomingBirthdays([]);
      return;
    }

    await executeAsync(async () => {
      const userId = session.user.id;

      // Fetch total contacts
      const { data: totalData, error: totalError } = await ContactService.getTotalContacts(userId);
      if (totalError) {
        console.error("Error fetching total contacts:", totalError);
        throw new Error(totalError);
      }
      setTotalContacts(totalData);

      // Fetch contacts by gender
      const { data: genderStats, error: genderError } = await ContactService.getContactsByGender(userId);
      if (genderError) {
        console.error("Error fetching gender statistics:", genderError);
        throw new Error(genderError);
      }
      setGenderData(genderStats || []);

      // Fetch contacts by group
      const { data: groupStats, error: groupError } = await ContactService.getContactsByGroup(userId);
      if (groupError) {
        console.error("Error fetching group statistics:", groupError);
        throw new Error(groupError);
      }
      setGroupData(groupStats || []);

      // Fetch contacts by preferred method
      const { data: methodStats, error: methodError } = await ContactService.getContactsByPreferredMethod(userId);
      if (methodError) {
        console.error("Error fetching preferred method statistics:", methodError);
        throw new Error(methodError);
      }
      setPreferredMethodData(methodStats || []);

      // Fetch upcoming birthdays
      const { data: birthdays, error: birthdayError } = await ContactService.getUpcomingBirthdays(userId);
      if (birthdayError) {
        console.error("Error fetching upcoming birthdays:", birthdayError);
        throw new Error(birthdayError);
      }
      setUpcomingBirthdays(birthdays || []);

    }, {
      component: "ContactStatisticsDashboard",
      action: "fetchStatistics"
    });
  }, [session, isSessionLoading, executeAsync, t]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  if (loading) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        {t('statistics.loading_stats')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <TotalContactsCard count={totalContacts} />
      <ContactsByGenderChart data={genderData} />
      <ContactsByGroupChart data={groupData} />
      <ContactsByPreferredMethodChart data={preferredMethodData} />
      <UpcomingBirthdaysList data={upcomingBirthdays} />
      {/* Add more statistics components here */}
    </div>
  );
};

export default ContactStatisticsDashboard;