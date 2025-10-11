import React from 'react';
import { ContactCard } from '@/components/ui/ContactCard';
import { ContactSection } from '@/components/ui/ContactSection';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Phone, Mail } from 'lucide-react';

interface PhoneNumber {
  id: string;
  phone_type: string;
  phone_number: string;
  extension?: string | null;
}

interface EmailAddress {
  id: string;
  email_type: string;
  email_address: string;
}

interface ContactDetailContactMethodsProps {
  phone_numbers: PhoneNumber[];
  email_addresses: EmailAddress[];
}

export const ContactDetailContactMethods: React.FC<ContactDetailContactMethodsProps> = ({
  phone_numbers,
  email_addresses
}) => {
  const { t } = useTranslation();

  if (phone_numbers.length === 0 && email_addresses.length === 0) {
    return null;
  }

  return (
    <ContactCard
      title={t('contact_detail.contact_methods')}
      icon={MessageCircle}
      iconColor="#10b981"
    >
      <ContactSection variant="simple">
        <div className="space-y-3">
          {phone_numbers.map((phone) => (
            <div key={phone.id} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-slate-500" />
                <div className="bg-slate-50/40 dark:bg-slate-800/20 backdrop-blur-sm p-3 rounded-xl shadow-md border border-slate-200/50 dark:border-slate-700/50">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{phone.phone_type}:</span>
                </div>
              </div>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {phone.phone_number}
                {phone.extension && ` (${phone.extension})`}
              </span>
            </div>
          ))}
          {email_addresses.map((email) => (
            <div key={email.id} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-slate-500" />
                <div className="bg-slate-50/40 dark:bg-slate-800/20 backdrop-blur-sm p-3 rounded-xl shadow-md border border-slate-200/50 dark:border-slate-700/50">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{email.email_type}:</span>
                </div>
              </div>
              <span className="font-medium text-slate-900 dark:text-slate-100">{email.email_address}</span>
            </div>
          ))}
        </div>
      </ContactSection>
    </ContactCard>
  );
};
