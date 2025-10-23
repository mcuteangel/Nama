import React from 'react';
import { Phone, Mail } from "lucide-react";
import { designTokens } from '@/lib/design-tokens';

interface ContactInfoProps {
  displayPhoneNumber: string;
  displayEmail?: string;
}

export const ContactInfo: React.FC<ContactInfoProps> = ({
  displayPhoneNumber,
  displayEmail
}) => {
  return (
    <div className="grid grid-cols-1 gap-2">
      <div
        className="flex items-center gap-3 p-2 rounded-xl"
        style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: `1px solid rgba(59, 130, 246, 0.2)`
        }}
      >
        <Phone size={16} style={{ color: designTokens.colors.primary[600] }} />
        <span
          className="text-sm font-medium truncate"
          style={{ color: designTokens.colors.gray[700] }}
        >
          {displayPhoneNumber}
        </span>
      </div>

      {displayEmail && (
        <div
          className="flex items-center gap-3 p-2 rounded-xl"
          style={{
            background: 'rgba(139, 92, 246, 0.1)',
            border: `1px solid rgba(139, 92, 246, 0.2)`
          }}
        >
          <Mail size={16} style={{ color: designTokens.colors.secondary[600] }} />
          <span
            className="text-sm font-medium truncate"
            style={{ color: designTokens.colors.gray[700] }}
          >
            {displayEmail}
          </span>
        </div>
      )}
    </div>
  );
};
