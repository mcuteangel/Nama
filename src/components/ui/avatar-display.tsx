import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface AvatarDisplayProps {
  src?: string | null;
  alt?: string;
  fallback?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showBorder?: boolean;
  borderColor?: string;
  onClick?: () => void;
}

const sizeClasses = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
  '2xl': 'h-20 w-20',
};

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  src,
  alt = 'Avatar',
  fallback,
  size = 'md',
  className,
  showBorder = true,
  borderColor = 'border-blue-400 dark:border-blue-600',
  onClick,
}) => {
  const sizeClass = sizeClasses[size];

  return (
    <Avatar
      className={cn(
        sizeClass,
        showBorder && `border-2 ${borderColor}`,
        'shadow-lg hover-lift transition-all duration-300',
        onClick && 'cursor-pointer hover:scale-105',
        className
      )}
      onClick={onClick}
    >
      <AvatarImage src={src || undefined} alt={alt} />
      <AvatarFallback className="bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-gray-600 dark:text-gray-300">
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
};

AvatarDisplay.displayName = 'AvatarDisplay';

export default AvatarDisplay;