import { ModernCard } from "@/components/ui/modern-card";
import { ModernInput } from "@/components/ui/modern-input";
import { Label } from "@/components/ui/label";
import { User, Gift, Mail } from "lucide-react";
import { useJalaliCalendar } from "@/hooks/use-jalali-calendar";
import { useTranslation } from "react-i18next";

interface BasicInfoCardProps {
  contact: {
    gender: string;
    position?: string | null;
    company?: string | null;
    birthday?: string | null;
    preferred_contact_method?: 'email' | 'phone' | 'sms' | 'any' | null;
    contact_groups?: Array<{
      groups: {
        name: string;
        color?: string;
      } | null;
    }>;
  };
  getGenderLabel: (gender: string) => string;
  getPreferredContactMethodLabel: (method: string | null | undefined) => string;
}

export const BasicInfoCard = ({ contact, getGenderLabel, getPreferredContactMethodLabel }: BasicInfoCardProps) => {
  const { formatDate } = useJalaliCalendar();
  const { t } = useTranslation();
  const assignedGroup = contact?.contact_groups?.[0]?.groups || null;

  return (
    <ModernCard 
      variant="glass" 
      hover="lift"
      className="h-full"
    >
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <User size={20} />
        {t('contact_detail.basic_info')}
      </h2>
      <div className="space-y-4">
        <div>
          <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-2">
            <User size={16} /> {t('contact_detail.gender')}
          </Label>
          <ModernInput 
            value={getGenderLabel(contact.gender)} 
            readOnly 
            variant="glass"
          />
        </div>
        
        {contact.position && (
          <div>
            <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-2">
              <User size={16} /> {t('contact_detail.position_expertise')}
            </Label>
            <ModernInput 
              value={contact.position} 
              readOnly 
              variant="glass"
            />
          </div>
        )}
        
        {contact.company && (
          <div>
            <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-2">
              <User size={16} /> {t('contact_detail.company')}
            </Label>
            <ModernInput 
              value={contact.company} 
              readOnly 
              variant="glass"
            />
          </div>
        )}
        
        {contact.birthday && (
          <div>
            <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-2">
              <Gift size={16} /> {t('contact_detail.birth_date')}
            </Label>
            <ModernInput 
              value={formatDate(new Date(contact.birthday), 'jYYYY/jMM/jDD')} 
              readOnly 
              variant="glass"
            />
          </div>
        )}
        
        {contact.preferred_contact_method && (
          <div>
            <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-2">
              <Mail size={16} /> {t('contact_detail.preferred_contact_method')}
            </Label>
            <ModernInput 
              value={getPreferredContactMethodLabel(contact.preferred_contact_method)} 
              readOnly 
              variant="glass"
            />
          </div>
        )}
        
        <div>
          <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-2">
            <User size={16} /> {t('contact_detail.group')}
          </Label>
          {assignedGroup ? (
            <ModernInput 
              value={assignedGroup.name} 
              readOnly 
              variant="glass"
              style={{ backgroundColor: assignedGroup.color || 'transparent' }} 
            />
          ) : (
            <ModernInput 
              value={t('contact_detail.no_group')} 
              readOnly 
              variant="glass"
            />
          )}
        </div>
      </div>
    </ModernCard>
  );
};