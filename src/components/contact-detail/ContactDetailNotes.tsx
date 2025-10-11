import React from 'react';
import { ContactCard } from '@/components/ui/ContactCard';
import { ContactSection } from '@/components/ui/ContactSection';
import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';

interface ContactDetailNotesProps {
  notes?: string | null;
}

export const ContactDetailNotes: React.FC<ContactDetailNotesProps> = ({ notes }) => {
  const { t } = useTranslation();

  if (!notes) {
    return null;
  }

  return (
    <div
      className="col-span-full"
      style={{
        gridColumn: '1 / -1',
      }}
    >
      <ContactCard
        title={t('contact_detail.notes')}
        icon={BookOpen}
        iconColor="#06b6d4"
      >
        <ContactSection variant="simple">
          <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/40 dark:bg-slate-800/20 backdrop-blur-sm p-4 rounded-xl shadow-md border border-slate-200/50 dark:border-slate-700/50">
            {notes}
          </div>
        </ContactSection>
      </ContactCard>
    </div>
  );
};
