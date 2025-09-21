import { User, Gift, Mail } from "lucide-react";
import { useJalaliCalendar } from "@/hooks/use-jalali-calendar";
import { useTranslation } from "react-i18next";
import { designTokens } from "@/lib/design-tokens";

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
    <div className="relative group">
      {/* Background Glow */}
      <div
        className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${designTokens.colors.primary[500]}20, ${designTokens.colors.secondary[500]}20)`,
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
                background: designTokens.gradients.primary,
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              }}
            >
              <User size={20} style={{ color: 'white' }} />
            </div>
            <span style={{ color: 'white' }}>{t('contact_detail.basic_info')}</span>
          </h2>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Gender */}
          <div className="group/field">
            <label className="flex items-center gap-2 mb-3 text-sm font-medium opacity-80">
              <User size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
              <span style={{ color: 'rgba(255,255,255,0.9)' }}>{t('contact_detail.gender')}</span>
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
                {getGenderLabel(contact.gender)}
              </span>
            </div>
          </div>

          {/* Position */}
          {contact.position && (
            <div className="group/field">
              <label className="flex items-center gap-2 mb-3 text-sm font-medium opacity-80">
                <User size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
                <span style={{ color: 'rgba(255,255,255,0.9)' }}>{t('contact_detail.position_expertise')}</span>
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
                  {contact.position}
                </span>
              </div>
            </div>
          )}

          {/* Company */}
          {contact.company && (
            <div className="group/field">
              <label className="flex items-center gap-2 mb-3 text-sm font-medium opacity-80">
                <User size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
                <span style={{ color: 'rgba(255,255,255,0.9)' }}>{t('contact_detail.company')}</span>
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
                  {contact.company}
                </span>
              </div>
            </div>
          )}

          {/* Birthday */}
          {contact.birthday && (
            <div className="group/field">
              <label className="flex items-center gap-2 mb-3 text-sm font-medium opacity-80">
                <Gift size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
                <span style={{ color: 'rgba(255,255,255,0.9)' }}>{t('contact_detail.birth_date')}</span>
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
                  {formatDate(new Date(contact.birthday), 'jYYYY/jMM/jDD')}
                </span>
              </div>
            </div>
          )}

          {/* Preferred Contact Method */}
          {contact.preferred_contact_method && (
            <div className="group/field">
              <label className="flex items-center gap-2 mb-3 text-sm font-medium opacity-80">
                <Mail size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
                <span style={{ color: 'rgba(255,255,255,0.9)' }}>{t('contact_detail.preferred_contact_method')}</span>
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
                  {getPreferredContactMethodLabel(contact.preferred_contact_method)}
                </span>
              </div>
            </div>
          )}

          {/* Group */}
          <div className="group/field">
            <label className="flex items-center gap-2 mb-3 text-sm font-medium opacity-80">
              <User size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
              <span style={{ color: 'rgba(255,255,255,0.9)' }}>{t('contact_detail.group')}</span>
            </label>
            {assignedGroup ? (
              <div
                className="px-4 py-3 rounded-xl transition-all duration-300 group-hover/field:scale-[1.02]"
                style={{
                  background: assignedGroup.color || 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <span style={{ color: 'white', fontWeight: '500' }}>
                  {assignedGroup.name}
                </span>
              </div>
            ) : (
              <div
                className="px-4 py-3 rounded-xl transition-all duration-300 group-hover/field:scale-[1.02]"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>
                  {t('contact_detail.no_group')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};