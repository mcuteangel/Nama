import React from 'react';
import { ContactCard } from '@/components/ui/ContactCard';
import { ContactSection } from '@/components/ui/ContactSection';
import { useTranslation } from 'react-i18next';
import { User, Users, Briefcase, Building, Heart, Star } from 'lucide-react';

interface ContactDetailBasicInfoProps {
  contact: {
    first_name: string;
    last_name: string;
    position?: string | null;
    company?: string | null;
    gender: string;
    preferred_contact_method?: 'email' | 'phone' | 'sms' | 'any' | null;
    contact_groups?: Array<{
      group_id: string;
      groups: { name: string; color?: string } | null;
    }>;
  };
  getGenderLabel: (gender: string, t: (key: string) => string) => string;
  getPreferredContactMethodLabel: (method: string | null | undefined, t: (key: string) => string) => string;
}

export const ContactDetailBasicInfo: React.FC<ContactDetailBasicInfoProps> = ({
  contact,
  getGenderLabel,
  getPreferredContactMethodLabel
}) => {
  const { t } = useTranslation();
  const assignedGroup = contact?.contact_groups?.[0]?.groups || null;

  return (
    <ContactCard
      title={t('contact_detail.basic_info')}
      icon={User}
      iconColor="#3b82f6"
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User size={16} className="text-slate-500" />
            <span className="text-xs text-slate-600 dark:text-slate-400">{t('contact.first_name')}</span>
          </div>
          <div className="text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50 p-2 rounded">
            {contact.first_name}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-slate-500" />
            <span className="text-xs text-slate-600 dark:text-slate-400">{t('contact.last_name')}</span>
          </div>
          <div className="text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50 p-2 rounded">
            {contact.last_name}
          </div>
        </div>

        {contact.position && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-slate-500" />
              <span className="text-xs text-slate-600 dark:text-slate-400">{t('contact.position')}</span>
            </div>
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50 p-2 rounded">
              {contact.position}
            </div>
          </div>
        )}

        {contact.company && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building size={16} className="text-slate-500" />
              <span className="text-xs text-slate-600 dark:text-slate-400">{t('contact.company')}</span>
            </div>
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50 p-2 rounded">
              {contact.company}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-slate-500" />
            <span className="text-xs text-slate-600 dark:text-slate-400">{t('contact.gender')}</span>
          </div>
          <div className="text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50 p-2 rounded">
            {getGenderLabel(contact.gender, t)}
          </div>
        </div>

        {contact.preferred_contact_method && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-slate-500" />
              <span className="text-xs text-slate-600 dark:text-slate-400">{t('contact.preferred_contact_method')}</span>
            </div>
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50 p-2 rounded">
              {getPreferredContactMethodLabel(contact.preferred_contact_method, t)}
            </div>
          </div>
        )}
      </div>
    </ContactCard>
  );
};
