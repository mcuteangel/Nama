import React from 'react';
import { ContactCard } from '@/components/ui/ContactCard';
import { ContactSection } from '@/components/ui/ContactSection';
import { useTranslation } from 'react-i18next';
import { Home, MapPin } from 'lucide-react';

interface ContactDetailAddressProps {
  contact: {
    street?: string | null;
    city?: string | null;
    state?: string | null;
    zip_code?: string | null;
    country?: string | null;
  };
}

export const ContactDetailAddress: React.FC<ContactDetailAddressProps> = ({ contact }) => {
  const { t } = useTranslation();

  if (!contact.street && !contact.city && !contact.state && !contact.zip_code && !contact.country) {
    return null;
  }

  return (
    <ContactCard
      title={t('contact_detail.address')}
      icon={Home}
      iconColor="#f59e0b"
    >
      <ContactSection variant="simple">
        <div className="space-y-2">
          {contact.street && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Home size={16} className="text-slate-500" />
                <div className="bg-slate-50/40 dark:bg-slate-800/20 backdrop-blur-sm p-3 rounded-xl shadow-md border border-slate-200/50 dark:border-slate-700/50">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{t('contact_detail.street_alley')}:</span>
                </div>
              </div>
              <span className="font-medium text-slate-900 dark:text-slate-100">{contact.street}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-1 text-sm text-slate-600 dark:text-slate-400">
            {contact.city && (
              <div className="flex items-center gap-1">
                <MapPin size={14} className="text-slate-500" />
                <span>{contact.city}</span>
              </div>
            )}
            {contact.state && (
              <div className="flex items-center gap-1">
                <MapPin size={14} className="text-slate-500" />
                <span>{contact.state}</span>
              </div>
            )}
            {contact.zip_code && (
              <div className="flex items-center gap-1">
                <MapPin size={14} className="text-slate-500" />
                <span>{contact.zip_code}</span>
              </div>
            )}
          </div>
          {contact.country && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-slate-500" />
                <div className="bg-slate-50/40 dark:bg-slate-800/20 backdrop-blur-sm p-3 rounded-xl shadow-md border border-slate-200/50 dark:border-slate-700/50">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{t('contact_detail.country')}:</span>
                  </div>
              </div>
              <span className="font-medium text-slate-900 dark:text-slate-100">{contact.country}</span>
            </div>
          )}
        </div>
      </ContactSection>
    </ContactCard>
  );
};
