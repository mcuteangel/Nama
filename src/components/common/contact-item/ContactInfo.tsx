import React from 'react';
import { Phone, Mail, MapPin, Building, User } from "lucide-react";
import { designTokens } from '@/lib/design-tokens';
import { ContactDisplayData } from './types';

export const ContactInfo: React.FC<ContactDisplayData> = ({
  displayPhoneNumber,
  displayEmail,
  displayPosition,
  displayCompany,
  displayAddress,
  displayGroups,
  fullName
}) => {
  return (
    <div className="min-w-0 flex-grow space-y-4">
      {/* Name and groups in same row */}
      <div className="flex items-center gap-3 mb-2">
        <h3
          className="font-semibold text-base truncate"
          style={{
            fontFamily: designTokens.typography.fonts.primary,
            color: designTokens.colors.gray[800]
          }}
        >
          {fullName}
        </h3>

        {/* Groups inline with name */}
        {displayGroups.length > 0 && (
          <div className="flex gap-2">
            {displayGroups.slice(0, 2).map((group, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold text-white"
                style={{
                  background: group.color || designTokens.colors.gray[600],
                  fontFamily: designTokens.typography.fonts.secondary
                }}
                title={group.name}
              >
                {group.name}
              </span>
            ))}
            {displayGroups.length > 2 && (
              <span
                className="text-xs text-gray-500 font-medium"
                style={{ fontFamily: designTokens.typography.fonts.secondary }}
              >
                +{displayGroups.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Contact details in a compact horizontal layout */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Phone size={16} style={{ color: designTokens.colors.primary[600] }} />
          <span className="font-medium" style={{ color: designTokens.colors.gray[700] }}>
            {displayPhoneNumber}
          </span>
        </div>

        {displayEmail && (
          <>
            <span className="text-gray-400">•</span>
            <div className="flex items-center gap-2">
              <Mail size={16} style={{ color: designTokens.colors.secondary[600] }} />
              <span className="font-medium" style={{ color: designTokens.colors.gray[700] }}>
                {displayEmail}
              </span>
            </div>
          </>
        )}

        {(displayPosition || displayCompany) && (
          <>
            <span className="text-gray-400">•</span>
            <div className="flex items-center gap-3">
              {displayPosition && (
                <div className="flex items-center gap-1">
                  <User size={14} style={{ color: designTokens.colors.success[600] }} />
                  <span className="font-medium" style={{ color: designTokens.colors.gray[700] }}>
                    {displayPosition}
                  </span>
                </div>
              )}
              {displayCompany && (
                <>
                  {displayPosition && <span className="text-gray-400 mx-1">@</span>}
                  <div className="flex items-center gap-1">
                    <Building size={14} style={{ color: designTokens.colors.warning[600] }} />
                    <span className="font-medium" style={{ color: designTokens.colors.gray[700] }}>
                      {displayCompany}
                    </span>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {displayAddress && (
          <>
            <span className="text-gray-400">•</span>
            <div className="flex items-center gap-2">
              <MapPin size={16} style={{ color: designTokens.colors.error[600] }} />
              <span className="font-medium" style={{ color: designTokens.colors.gray[700] }}>
                {displayAddress}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
