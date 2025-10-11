import React from 'react';
import { ContactCard } from '@/components/ui/ContactCard';
import { ContactSection } from '@/components/ui/ContactSection';
import { useTranslation } from 'react-i18next';
import { CalendarDays } from 'lucide-react';

interface ContactDetailTimestampsProps {
  created_at: string;
  updated_at: string;
}

export const ContactDetailTimestamps: React.FC<ContactDetailTimestampsProps> = ({
  created_at,
  updated_at
}) => {
  const { t } = useTranslation();

  return (
    <ContactCard
      title={t('contact_detail.timestamps')}
      icon={CalendarDays}
      iconColor="#84cc16"
    >
      <ContactSection variant="simple">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">{t('contact.created_at')}:</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {new Date(created_at).toLocaleDateString('fa-IR')}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">{t('contact.updated_at')}:</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {new Date(updated_at).toLocaleDateString('fa-IR')}
            </span>
          </div>
        </div>
      </ContactSection>
    </ContactCard>
  );
};
