import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    <div className="relative group/avatar">
      <div className="relative">
        <Avatar
          className="h-16 w-16 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 transition-all duration-500 ease-out group-hover:ring-4 group-hover:ring-primary-400/50"
          style={{
            border: `2px solid ${designTokens.colors.primary[300]}`,
            boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.1)',
            transform: 'translateZ(0)',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <AvatarImage
            src={contact?.avatar_url || undefined}
            alt={contact?.first_name}
            className="transition-transform duration-700 group-hover/avatar:scale-110"
          />
          <AvatarFallback
            className="transition-all duration-500 group-hover/avatar:scale-110"
            style={{
              background: designTokens.gradients.primary,
              color: 'white',
              fontSize: designTokens.typography.sizes.xl,
              fontWeight: designTokens.typography.weights.bold,
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            {avatarFallback}
          </AvatarFallback>
        </Avatar>

        {/* Animated gender indicator */}
        <div
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold transform transition-all duration-300 group-hover/avatar:scale-110 group-hover/avatar:-translate-y-1"
          style={{
            background: displayGender.color,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
            zIndex: 10
          }}
        >
          <span className="transition-transform duration-300 group-hover/avatar:scale-125">
            {displayGender.icon}
          </span>
        </div>

        {/* Subtle pulse effect */}
        <div
          className="absolute inset-0 rounded-full bg-primary-100/30 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-700"
          style={{
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            transform: 'scale(1.1)'
          }}
        />
      </div>
    </div>
  );
};
