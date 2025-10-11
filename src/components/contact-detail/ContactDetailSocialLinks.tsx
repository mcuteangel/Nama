import React from 'react';
import { ContactCard } from '@/components/ui/ContactCard';
import { ContactSection } from '@/components/ui/ContactSection';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Link } from 'lucide-react';

interface SocialLink {
  id: string;
  type: string;
  url: string;
}

interface ContactDetailSocialLinksProps {
  social_links: SocialLink[];
}

export const ContactDetailSocialLinks: React.FC<ContactDetailSocialLinksProps> = ({ social_links }) => {
  const { t } = useTranslation();

  if (social_links.length === 0) {
    return null;
  }

  return (
    <ContactCard
      title={t('contact_detail.social_links')}
      icon={ExternalLink}
      iconColor="#8b5cf6"
    >
      <ContactSection variant="simple">
        <div className="space-y-3">
          {social_links.map((social) => (
            <div key={social.id} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Link size={16} className="text-slate-500" />
                <div className="bg-slate-50/40 dark:bg-slate-800/20 backdrop-blur-sm p-3 rounded-xl shadow-md border border-slate-200/50 dark:border-slate-700/50">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{social.type}:</span>
                </div>
              </div>
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                {social.url}
              </a>
            </div>
          ))}
        </div>
      </ContactSection>
    </ContactCard>
  );
};
