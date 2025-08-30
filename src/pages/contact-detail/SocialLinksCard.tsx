import { ModernCard } from "@/components/ui/modern-card";
import { Link as LinkIcon, Linkedin, Twitter, Instagram, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SocialLink {
  id: string;
  type: string;
  url: string;
}

interface SocialLinksCardProps {
  social_links: SocialLink[];
}

const getSocialIcon = (type: string) => {
  switch (type) {
    case 'linkedin': return <Linkedin size={16} />;
    case 'twitter': return <Twitter size={16} />;
    case 'instagram': return <Instagram size={16} />;
    case 'telegram': return <Send size={16} />;
    case 'website': return <LinkIcon size={16} />;
    default: return <LinkIcon size={16} />;
  }
};

const getSocialLabel = (type: string, t: (key: string) => string) => {
  switch (type) {
    case 'linkedin': return t('contact_detail.linkedin');
    case 'twitter': return t('contact_detail.twitter');
    case 'instagram': return t('contact_detail.instagram');
    case 'telegram': return t('contact_detail.telegram');
    case 'website': return t('contact_detail.website');
    default: return t('contact_detail.other');
  }
};

export const SocialLinksCard = ({ social_links }: SocialLinksCardProps) => {
  const { t } = useTranslation();
  
  // Only render if there are social links
  if (social_links.length === 0) {
    return null;
  }

  return (
    <ModernCard 
      variant="glass" 
      hover="lift"
      className="h-full"
    >
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <LinkIcon size={20} />
        {t('contact_detail.social_networks')}
      </h2>
      <div className="grid grid-cols-1 gap-3">
        {social_links.map((link) => (
          <a 
            key={link.id} 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
          >
            <ModernCard 
              variant="glass"
              hover="lift"
              className="flex items-center gap-3 p-3 cursor-pointer transition-all"
            >
              <div className="p-2 rounded-lg bg-white/20">
                {getSocialIcon(link.type)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {getSocialLabel(link.type, t)}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {link.url}
                </p>
              </div>
              <LinkIcon size={16} className="text-muted-foreground" />
            </ModernCard>
          </a>
        ))}
      </div>
    </ModernCard>
  );
};