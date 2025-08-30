import { ModernCard } from "@/components/ui/modern-card";
import { ModernButton, GradientButton } from "@/components/ui/modern-button";
import { ModernAvatar, ModernAvatarFallback, ModernAvatarImage } from "@/components/ui/modern-avatar";
import { ModernBadge } from "@/components/ui/modern-badge";
import { 
  Users, 
  Building, 
  Briefcase,
  Edit,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface GroupData {
  name: string;
  color?: string;
}

interface ContactHeaderProps {
  contact: {
    id: string;
    first_name: string;
    last_name: string;
    position?: string | null;
    company?: string | null;
    avatar_url?: string | null;
    contact_groups?: Array<{
      group_id: string;
      groups: GroupData | null;
    }>;
  };
}

export const ContactHeader = ({ contact }: ContactHeaderProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const assignedGroup = contact?.contact_groups?.[0]?.groups || null;

  // Create avatar initials with proper spacing for Persian text
  const getAvatarInitials = () => {
    const firstInitial = contact.first_name ? contact.first_name[0] : "?";
    const lastInitial = contact.last_name ? contact.last_name[0] : "";
    
    // Add space between initials if both exist
    if (contact.first_name && contact.last_name) {
      return `${firstInitial} ${lastInitial}`;
    }
    
    return firstInitial + lastInitial;
  };

  return (
    <ModernCard 
      variant="glass" 
      hover="lift" 
      className="w-full max-w-4xl mx-auto mb-6"
    >
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-6">
        <ModernAvatar 
          glassEffect="strong"
          className="h-24 w-24 ring-4 ring-primary/30"
        >
          <ModernAvatarImage 
            src={contact.avatar_url || undefined} 
            alt={`${contact.first_name} ${contact.last_name}`} 
          />
          <ModernAvatarFallback 
            glassEffect="strong"
            className="text-2xl font-bold"
          >
            {getAvatarInitials()}
          </ModernAvatarFallback>
        </ModernAvatar>
        
        <div className="flex-1 text-center md:text-right">
          <h1 className="text-3xl font-bold text-gradient mb-2">
            {contact.first_name} {contact.last_name}
          </h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
            {contact.position && (
              <ModernBadge 
                variant="glass"
                glassEffect="strong"
                className="text-sm"
              >
                <Briefcase size={14} className="ml-1" />
                {contact.position}
              </ModernBadge>
            )}
            {contact.company && (
              <ModernBadge 
                variant="glass"
                glassEffect="strong"
                className="text-sm"
              >
                <Building size={14} className="ml-1" />
                {contact.company}
              </ModernBadge>
            )}
            {assignedGroup && (
              <ModernBadge 
                variant="gradient"
                gradientType="primary"
                className="text-sm"
              >
                <Users size={14} className="ml-1" />
                {assignedGroup.name}
              </ModernBadge>
            )}
          </div>
          <p className="text-muted-foreground">
            {t('contact_detail.contact_details')}
          </p>
        </div>
        
        <div className="flex gap-2">
          <ModernButton
            onClick={() => navigate(-1)}
            variant="glass"
            size="icon"
            className="rounded-full"
          >
            <ArrowLeft size={20} />
          </ModernButton>
          <GradientButton
            onClick={() => navigate(`/contacts/edit/${contact.id}`)}
            className="rounded-full"
          >
            <Edit size={20} className="ml-1" />
            {t('contact_detail.edit')}
          </GradientButton>
        </div>
      </div>
    </ModernCard>
  );
};