import { Link as LinkIcon, Linkedin, Twitter, Instagram, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { designTokens } from "@/lib/design-tokens";

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
    <div className="relative group">
      {/* Background Glow */}
      <div
        className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${designTokens.colors.secondary[500]}20, ${designTokens.colors.accent[500]}20)`,
          filter: 'blur(20px)',
        }}
      />

      {/* Main Card */}
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0.05) 50%,
            rgba(255, 255, 255, 0.02) 100%)`,
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: `0 20px 40px -12px rgba(0, 0, 0, 0.2),
                     0 8px 16px -8px rgba(0, 0, 0, 0.1),
                     inset 0 1px 0 0 rgba(255, 255, 255, 0.1)`,
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 border-b border-white/10"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
          }}
        >
          <h2 className="flex items-center gap-3 text-xl font-bold">
            <div
              className="p-2 rounded-xl"
              style={{
                background: designTokens.gradients.purple,
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
              }}
            >
              <LinkIcon size={20} style={{ color: 'white' }} />
            </div>
            <span style={{ color: 'white' }}>{t('contact_detail.social_networks')}</span>
          </h2>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="grid grid-cols-1 gap-3">
            {social_links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
                style={{
                  textDecoration: 'none',
                }}
              >
                <div
                  className="flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group-hover:scale-[1.02]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <div
                    className="p-3 rounded-xl flex-shrink-0"
                    style={{
                      background: designTokens.gradients.purple,
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                    }}
                  >
                    {getSocialIcon(link.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ color: 'white', fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                      {getSocialLabel(link.type, t)}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {link.url}
                    </div>
                  </div>
                  <div
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '50%',
                      padding: '8px',
                    }}
                  >
                    <LinkIcon size={16} style={{ color: 'white' }} />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};