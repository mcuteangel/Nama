import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { designTokens } from '@/lib/design-tokens';
import { GenderDisplay } from './types';

interface ContactAvatarProps {
  contact: {
    avatar_url?: string | null;
    first_name?: string;
  };
  avatarFallback: string;
  displayGender: GenderDisplay;
}

export const ContactAvatar: React.FC<ContactAvatarProps> = ({
  contact,
  avatarFallback,
  displayGender
}) => {
  return (
    <div className="relative flex-shrink-0">
      <Avatar className="h-12 w-12 ring-2 transition-all duration-300 group-hover:ring-4"
        style={{
          border: `2px solid ${designTokens.colors.secondary[300]}`,
          boxShadow: designTokens.shadows.lg
        }}
      >
        <AvatarImage src={contact?.avatar_url || undefined} alt={contact?.first_name} />
        <AvatarFallback
          style={{
            background: designTokens.gradients.purple,
            color: 'white',
            fontSize: designTokens.typography.sizes.lg,
            fontWeight: designTokens.typography.weights.bold
          }}
        >
          {avatarFallback}
        </AvatarFallback>
      </Avatar>
      {/* Gender indicator */}
      <div
        className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full border-3 border-white flex items-center justify-center text-sm font-bold"
        style={{
          background: displayGender.icon === '♂' ? designTokens.colors.primary[500] : designTokens.colors.secondary[500],
          boxShadow: designTokens.shadows.lg
        }}
        title={displayGender.label}
      >
        {typeof displayGender.icon === 'string' ? displayGender.icon : '⚲'}
      </div>
    </div>
  );
};
