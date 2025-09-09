import React from 'react';
import { cn } from '@/lib/utils';
import { getGradient, getShadow, getSpacing, getBorderRadius, getColor, designTokens } from '@/lib/design-tokens';

export interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'neomorphism' | 'gradient-primary' | 'gradient-ocean' | 'gradient-sunset' | 'gradient-success' | 'gradient-info' | 'minimal' | 'glass-3d';
  hover?: 'lift' | 'glow' | 'scale' | 'none' | 'glass-3d';
  children?: React.ReactNode;
}

/**
 * ModernCard - یک کامپوننت کارت مدرن با افکت‌های بصری مختلف
 * @param variant - نوع افکت بصری کارت
 * @param hover - نوع افکت hover
 * @param children - محتوای کارت
 * @param className - کلاس‌های اضافی CSS
 */
export const ModernCard = React.forwardRef<HTMLDivElement, ModernCardProps>(
  ({ variant = 'glass', hover = 'lift', children, className, ...props }, ref) => {
    const variants = {
      glass: `backdrop-blur-lg border border-white/30 dark:border-gray-600/30 ${getShadow('glass')}`,
      neomorphism: getShadow('neomorphism'),
      'gradient-primary': getGradient('primary'),
      'gradient-ocean': getGradient('ocean'),
      'gradient-sunset': getGradient('sunset'),
      'gradient-success': getGradient('success'),
      'gradient-info': getGradient('info'),
      minimal: 'bg-background border border-border shadow-sm',
      'glass-3d': `backdrop-blur-xl border border-white/20 dark:border-gray-500/30 ${getShadow('glass3d')} transform-gpu`,
    };

    const hoverEffects = {
      lift: 'hover-lift transition-all duration-300',
      glow: 'hover-glow transition-all duration-300',
      scale: 'hover:scale-105 transition-all duration-300',
      none: '',
      'glass-3d': 'hover:shadow-glass3dHover hover:transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-500 ease-out',
    };

    return (
      <div
        ref={ref}
        className={cn(
          `p-${getSpacing(6)} rounded-${getBorderRadius('2xl')}`,
          variants[variant],
          hoverEffects[hover],
          'fade-in-up',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ModernCard.displayName = 'ModernCard';

export interface ModernCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ModernCardHeader = React.forwardRef<HTMLDivElement, ModernCardHeaderProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(`mb-${getSpacing(4)}`, className)} {...props}>
        {children}
      </div>
    );
  }
);

ModernCardHeader.displayName = 'ModernCardHeader';

export interface ModernCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  gradient?: boolean;
}

export const ModernCardTitle = React.forwardRef<HTMLHeadingElement, ModernCardTitleProps>(
  ({ children, gradient = false, className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          `text-${designTokens.typography.sizes['2xl']} font-bold text-gray-800 dark:text-gray-100`,
          gradient && 'text-gradient',
          className
        )}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

ModernCardTitle.displayName = 'ModernCardTitle';

export interface ModernCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const ModernCardDescription = React.forwardRef<HTMLParagraphElement, ModernCardDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <p ref={ref} className={cn(`text-gray-600 dark:text-gray-300 ${designTokens.typography.sizes.base}`, className)} {...props}>
        {children}
      </p>
    );
  }
);

ModernCardDescription.displayName = 'ModernCardDescription';

export interface ModernCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ModernCardContent = React.forwardRef<HTMLDivElement, ModernCardContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(`space-y-${getSpacing(4)}`, className)} {...props}>
        {children}
      </div>
    );
  }
);

ModernCardContent.displayName = 'ModernCardContent';

export interface ModernCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ModernCardFooter = React.forwardRef<HTMLDivElement, ModernCardFooterProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(`mt-${getSpacing(6)} flex items-center justify-between gap-${getSpacing(3)}`, className)} {...props}>
        {children}
      </div>
    );
  }
);

ModernCardFooter.displayName = 'ModernCardFooter';