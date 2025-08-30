import { ModernCard } from "@/components/ui/modern-card";
import { ModernInput } from "@/components/ui/modern-input";
import { Phone, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

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

interface ContactMethodsCardProps {
  phone_numbers: PhoneNumber[];
  email_addresses: EmailAddress[];
}

export const ContactMethodsCard = ({ phone_numbers, email_addresses }: ContactMethodsCardProps) => {
  const { t } = useTranslation();
  
  // Only render if there's at least one contact method
  if (phone_numbers.length === 0 && email_addresses.length === 0) {
    return null;
  }

  return (
    <ModernCard 
      variant="glass" 
      hover="lift"
      className="h-full"
    >
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Phone size={20} />
        {t('contact_detail.contact_methods')}
      </h2>
      
      {/* Phone Numbers */}
      {phone_numbers.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
            <Phone size={18} />
            {t('contact_detail.phone_numbers')}
          </h3>
          <div className="space-y-2">
            {phone_numbers.map((phone) => (
              <a key={phone.id} href={`tel:${phone.phone_number}`}>
                <ModernInput 
                  value={`${phone.phone_number} (${t(`phone_type.${phone.phone_type}`)})${phone.extension ? ` - ${t('contact_detail.extension')}: ${phone.extension}` : ''}`} 
                  readOnly 
                  variant="glass"
                  className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                />
              </a>
            ))}
          </div>
        </div>
      )}
      
      {/* Email Addresses */}
      {email_addresses.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
            <Mail size={18} />
            {t('contact_detail.email_addresses')}
          </h3>
          <div className="space-y-2">
            {email_addresses.map((email) => (
              <a key={email.id} href={`mailto:${email.email_address}`}>
                <ModernInput 
                  value={`${email.email_address} (${t(`email_type.${email.email_type}`)})`} 
                  readOnly 
                  variant="glass"
                  className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                />
              </a>
            ))}
          </div>
        </div>
      )}
    </ModernCard>
  );
};