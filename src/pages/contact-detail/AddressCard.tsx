import { ModernCard } from "@/components/ui/modern-card";
import { ModernInput } from "@/components/ui/modern-input";
import { Label } from "@/components/ui/label";
import { HomeIcon, Map, MapPin, Tag, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AddressCardProps {
  contact: {
    street?: string | null;
    city?: string | null;
    state?: string | null;
    zip_code?: string | null;
    country?: string | null;
  };
}

export const AddressCard = ({ contact }: AddressCardProps) => {
  const { t } = useTranslation();
  
  // Only render if there's at least one address field
  if (!contact.street && !contact.city && !contact.state && !contact.zip_code && !contact.country) {
    return null;
  }

  return (
    <ModernCard 
      variant="glass" 
      hover="lift"
      className="h-full"
    >
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Map size={20} />
        {t('contact_detail.address')}
      </h2>
      <div className="space-y-4">
        {contact.street && (
          <div>
            <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-2">
              <HomeIcon size={16} /> {t('contact_detail.street_alley')}
            </Label>
            <ModernInput 
              value={contact.street} 
              readOnly 
              variant="glass"
            />
          </div>
        )}
        
        {contact.city && (
          <div>
            <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-2">
              <Map size={16} /> {t('contact_detail.city')}
            </Label>
            <ModernInput 
              value={contact.city} 
              readOnly 
              variant="glass"
            />
          </div>
        )}
        
        {contact.state && (
          <div>
            <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-2">
              <MapPin size={16} /> {t('contact_detail.state')}
            </Label>
            <ModernInput 
              value={contact.state} 
              readOnly 
              variant="glass"
            />
          </div>
        )}
        
        {contact.zip_code && (
          <div>
            <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-2">
              <Tag size={16} /> {t('contact_detail.postal_code')}
            </Label>
            <ModernInput 
              value={contact.zip_code} 
              readOnly 
              variant="glass"
            />
          </div>
        )}
        
        {contact.country && (
          <div>
            <Label className="text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-2">
              <Globe size={16} /> {t('contact_detail.country')}
            </Label>
            <ModernInput 
              value={contact.country} 
              readOnly 
              variant="glass"
            />
          </div>
        )}
      </div>
    </ModernCard>
  );
};