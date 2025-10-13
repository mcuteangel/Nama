import React from 'react';
import { ContactCard } from '@/components/ui/ContactCard';
import { useTranslation } from 'react-i18next';
import { User, Briefcase, Building, Heart, Star, Users } from 'lucide-react';

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
      <div className="space-y-4">
        {/* نام و نام خانوادگی - همیشه نمایش داده می‌شن */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <User size={16} className="text-slate-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('form_labels.first_name')}</span>
            </div>
            <div className="text-base font-semibold text-slate-900 dark:text-slate-100 bg-slate-50/40 dark:bg-slate-800/20 backdrop-blur-sm p-3 rounded-xl shadow-md">
              {contact.first_name}
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-slate-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('form_labels.last_name')}</span>
            </div>
            <div className="text-base font-semibold text-slate-900 dark:text-slate-100 bg-slate-50/40 dark:bg-slate-800/20 backdrop-blur-sm p-3 rounded-xl shadow-md">
              {contact.last_name}
            </div>
          </div>
        </div>

        {/* گروه مخاطب - اگر وجود داشته باشه */}
        {assignedGroup && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('form_labels.group')}</span>
            <div
              className="flex items-center gap-2 p-3 rounded-xl shadow-md w-fit"
              style={{
                backgroundColor: assignedGroup.color ? `${assignedGroup.color}20` : 'rgba(59, 130, 246, 0.12)',
              }}
            >
              <span
                className="text-base font-medium"
                style={{ color: assignedGroup.color || '#3b82f6' }}
              >
                {assignedGroup.name}
              </span>
            </div>
          </div>
        )}

        {/* اطلاعات شغلی - در یک ردیف اگر هر دو وجود داشته باشن */}
        {(contact.position || contact.company) && (
          <div className="space-y-3">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('form_labels.job_info')}</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contact.position && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-slate-500" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{t('form_labels.position')}</span>
                  </div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50/40 dark:bg-slate-800/20 backdrop-blur-sm p-3 rounded-xl shadow-md">
                    {contact.position}
                  </div>
                </div>
              )}

              {contact.company && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building size={16} className="text-slate-500" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{t('form_labels.company')}</span>
                  </div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50/40 dark:bg-slate-800/20 backdrop-blur-sm p-3 rounded-xl shadow-md">
                    {contact.company}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* اطلاعات شخصی - جنسیت و روش تماس ترجیحی */}
        <div className="space-y-3">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('form_labels.personal_info')}</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-slate-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">{t('form_labels.gender')}</span>
              </div>
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50/40 dark:bg-slate-800/20 backdrop-blur-sm p-3 rounded-xl shadow-md">
                {getGenderLabel(contact.gender, t)}
              </div>
            </div>

            {contact.preferred_contact_method && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-slate-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">{t('form_labels.preferred_contact_method')}</span>
                </div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50/40 dark:bg-slate-800/20 backdrop-blur-sm p-3 rounded-xl shadow-md">
                  {getPreferredContactMethodLabel(contact.preferred_contact_method, t)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ContactCard>
  );
};
