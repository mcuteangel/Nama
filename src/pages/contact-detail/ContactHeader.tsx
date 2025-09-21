import {
  Users,
  Building,
  Briefcase,
  Edit,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { designTokens } from "@/lib/design-tokens";

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
    <div className="relative w-full max-w-5xl mx-auto mb-6">
      {/* Compact Header Card */}
      <div
        className="relative rounded-2xl overflow-hidden"
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
        <div className="relative z-10 p-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">

            {/* Avatar Section - Smaller */}
            <div className="flex-shrink-0">
              <div className="relative">
                {/* Avatar */}
                <div
                  className="relative h-20 w-20 rounded-full flex items-center justify-center text-xl font-bold overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${designTokens.colors.primary[500]}, ${designTokens.colors.secondary[500]})`,
                    boxShadow: `0 8px 24px -4px rgba(0, 0, 0, 0.3),
                               inset 0 1px 0 0 rgba(255, 255, 255, 0.2)`,
                    border: `3px solid rgba(255, 255, 255, 0.1)`,
                  }}
                >
                  {contact.avatar_url ? (
                    <img
                      src={contact.avatar_url}
                      alt={`${contact.first_name} ${contact.last_name}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span
                      style={{
                        color: 'white',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      {getAvatarInitials()}
                    </span>
                  )}
                </div>

                {/* Status Indicator - Smaller */}
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white"
                  style={{
                    background: designTokens.colors.success[500],
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
                  }}
                />
              </div>
            </div>

            {/* Content Section - Compact */}
            <div className="flex-1 text-center sm:text-right min-w-0">
              {/* Name - Smaller */}
              <h1
                className="text-2xl md:text-3xl font-bold mb-2 tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, white 0%, rgba(255,255,255,0.9) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {contact.first_name} {contact.last_name}
              </h1>

              {/* Badges - Compact */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-3">
                {contact.position && (
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <Briefcase size={12} style={{ color: 'white' }} />
                    <span style={{ color: 'white' }}>{contact.position}</span>
                  </div>
                )}

                {contact.company && (
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <Building size={12} style={{ color: 'white' }} />
                    <span style={{ color: 'white' }}>{contact.company}</span>
                  </div>
                )}

                {assignedGroup && (
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: designTokens.gradients.primary,
                      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)',
                    }}
                  >
                    <Users size={12} />
                    <span>{assignedGroup.name}</span>
                  </div>
                )}
              </div>

              {/* Description - Smaller */}
              <p
                className="text-sm opacity-80"
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                {t('contact_detail.contact_details')}
              </p>
            </div>

            {/* Action Buttons - Compact */}
            <div className="flex gap-2">
              <button
                onClick={() => navigate(-1)}
                className="group p-2 rounded-xl backdrop-blur-md transition-all duration-200 hover:scale-105"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <ArrowLeft size={18} style={{ color: 'white' }} />
              </button>

              <button
                onClick={() => navigate(`/contacts/edit/${contact.id}`)}
                className="group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  color: 'white',
                }}
              >
                <Edit size={16} />
                {t('contact_detail.edit')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};