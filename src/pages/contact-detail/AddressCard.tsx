import { HomeIcon, Map, MapPin, Tag, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { designTokens } from "@/lib/design-tokens";

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
    <div className="relative group">
      {/* Background Glow */}
      <div
        className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${designTokens.colors.warning[500]}20, ${designTokens.colors.error[500]}20)`,
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
                background: designTokens.gradients.warning,
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
              }}
            >
              <Map size={20} style={{ color: 'white' }} />
            </div>
            <span style={{ color: 'white' }}>{t('contact_detail.address')}</span>
          </h2>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {contact.street && (
            <div className="group/field">
              <label className="flex items-center gap-2 mb-3 text-sm font-medium opacity-80">
                <HomeIcon size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
                <span style={{ color: 'rgba(255,255,255,0.9)' }}>{t('contact_detail.street_alley')}</span>
              </label>
              <div
                className="px-4 py-3 rounded-xl transition-all duration-300 group-hover/field:scale-[1.02]"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <span style={{ color: 'white', fontWeight: '500' }}>
                  {contact.street}
                </span>
              </div>
            </div>
          )}

          {contact.city && (
            <div className="group/field">
              <label className="flex items-center gap-2 mb-3 text-sm font-medium opacity-80">
                <Map size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
                <span style={{ color: 'rgba(255,255,255,0.9)' }}>{t('contact_detail.city')}</span>
              </label>
              <div
                className="px-4 py-3 rounded-xl transition-all duration-300 group-hover/field:scale-[1.02]"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <span style={{ color: 'white', fontWeight: '500' }}>
                  {contact.city}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contact.state && (
              <div className="group/field">
                <label className="flex items-center gap-2 mb-3 text-sm font-medium opacity-80">
                  <MapPin size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
                  <span style={{ color: 'rgba(255,255,255,0.9)' }}>{t('contact_detail.state')}</span>
                </label>
                <div
                  className="px-4 py-3 rounded-xl transition-all duration-300 group-hover/field:scale-[1.02]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <span style={{ color: 'white', fontWeight: '500' }}>
                    {contact.state}
                  </span>
                </div>
              </div>
            )}

            {contact.zip_code && (
              <div className="group/field">
                <label className="flex items-center gap-2 mb-3 text-sm font-medium opacity-80">
                  <Tag size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
                  <span style={{ color: 'rgba(255,255,255,0.9)' }}>{t('contact_detail.postal_code')}</span>
                </label>
                <div
                  className="px-4 py-3 rounded-xl transition-all duration-300 group-hover/field:scale-[1.02]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <span style={{ color: 'white', fontWeight: '500' }}>
                    {contact.zip_code}
                  </span>
                </div>
              </div>
            )}
          </div>

          {contact.country && (
            <div className="group/field">
              <label className="flex items-center gap-2 mb-3 text-sm font-medium opacity-80">
                <Globe size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
                <span style={{ color: 'rgba(255,255,255,0.9)' }}>{t('contact_detail.country')}</span>
              </label>
              <div
                className="px-4 py-3 rounded-xl transition-all duration-300 group-hover/field:scale-[1.02]"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <span style={{ color: 'white', fontWeight: '500' }}>
                  {contact.country}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};