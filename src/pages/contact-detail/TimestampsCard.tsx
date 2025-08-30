import { ModernCard } from "@/components/ui/modern-card";
import { ModernInput } from "@/components/ui/modern-input";
import { Label } from "@/components/ui/label";
import { CalendarClock } from "lucide-react";
import { useJalaliCalendar } from "@/hooks/use-jalali-calendar";
import { useTranslation } from "react-i18next";

interface TimestampsCardProps {
  created_at: string;
  updated_at: string;
}

export const TimestampsCard = ({ created_at, updated_at }: TimestampsCardProps) => {
  const { formatDate } = useJalaliCalendar();
  const { t } = useTranslation();

  return (
    <ModernCard 
      variant="glass" 
      hover="lift"
      className="h-full"
    >
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <CalendarClock size={20} />
        {t('contact_detail.important_times')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-2">
            <CalendarClock size={16} /> {t('contact_detail.creation_date')}
          </Label>
          <ModernInput 
            value={formatDate(new Date(created_at), 'jYYYY/jMM/jDD HH:mm')} 
            readOnly 
            variant="glass"
          />
        </div>
        <div>
          <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-2">
            <CalendarClock size={16} /> {t('contact_detail.last_edit')}
          </Label>
          <ModernInput 
            value={formatDate(new Date(updated_at), 'jYYYY/jMM/jDD HH:mm')} 
            readOnly 
            variant="glass"
          />
        </div>
      </div>
    </ModernCard>
  );
};