import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaMale, FaFemale, FaGenderless } from 'react-icons/fa';
import { designTokens } from '@/lib/design-tokens';
import { GenderDisplay } from '@/types/contact.types';

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
        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-xs"
        style={{
          background: displayGender.color,
          boxShadow: designTokens.shadows.md
        }}
        title={displayGender.label}
      >
        {displayGender.icon === 'male' && <FaMale className="w-3 h-3 text-white" />}
        {displayGender.icon === 'female' && <FaFemale className="w-3 h-3 text-white" />}
        {displayGender.icon === 'neutral' && <FaGenderless className="w-3 h-3 text-white" />}
      </div>
    </div>
  );
};
