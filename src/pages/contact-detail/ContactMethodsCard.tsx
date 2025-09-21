import { Phone, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { designTokens } from "@/lib/design-tokens";

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
    <div className="relative group">
      {/* Background Glow */}
      <div
        className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${designTokens.colors.success[500]}20, ${designTokens.colors.info[500]}20)`,
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
                background: designTokens.gradients.success,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              }}
            >
              <Phone size={20} style={{ color: 'white' }} />
            </div>
            <span style={{ color: 'white' }}>{t('contact_detail.contact_methods')}</span>
          </h2>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Phone Numbers */}
          {phone_numbers.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold">
                <div
                  className="p-1.5 rounded-lg"
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                  }}
                >
                  <Phone size={16} style={{ color: designTokens.colors.success[400] }} />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.9)' }}>
                  {t('contact_detail.phone_numbers')}
                </span>
              </h3>
              <div className="space-y-3">
                {phone_numbers.map((phone) => (
                  <a
                    key={phone.id}
                    href={`tel:${phone.phone_number}`}
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
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{
                          background: designTokens.gradients.success,
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        <Phone size={16} style={{ color: 'white' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div style={{ color: 'white', fontWeight: '500', fontSize: '14px' }}>
                          {phone.phone_number}
                          {phone.extension && (
                            <span style={{ color: 'rgba(255,255,255,0.6)', marginRight: '8px' }}>
                              ({t('contact_detail.extension')}: {phone.extension})
                            </span>
                          )}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                          {t(`phone_type.${phone.phone_type}`)}
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Email Addresses */}
          {email_addresses.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold">
                <div
                  className="p-1.5 rounded-lg"
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                  }}
                >
                  <Mail size={16} style={{ color: designTokens.colors.info[400] }} />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.9)' }}>
                  {t('contact_detail.email_addresses')}
                </span>
              </h3>
              <div className="space-y-3">
                {email_addresses.map((email) => (
                  <a
                    key={email.id}
                    href={`mailto:${email.email_address}`}
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
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{
                          background: designTokens.gradients.info,
                          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                        }}
                      >
                        <Mail size={16} style={{ color: 'white' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div style={{ color: 'white', fontWeight: '500', fontSize: '14px' }}>
                          {email.email_address}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                          {t(`email_type.${email.email_type}`)}
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};