import React from 'react';
import { cn } from '@/lib/utils';

export interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'neomorphism' | 'gradient-primary' | 'gradient-ocean' | 'gradient-sunset' | 'gradient-success' | 'gradient-info' | 'minimal';
  hover?: 'lift' | 'glow' | 'scale' | 'none';
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
      glass: 'glass-advanced',
      neomorphism: 'neomorphism',
      'gradient-primary': 'bg-gradient-primary text-white',
      'gradient-ocean': 'bg-gradient-ocean text-white',
      'gradient-sunset': 'bg-gradient-sunset text-white',
      'gradient-success': 'bg-gradient-success text-white',
      'gradient-info': 'bg-gradient-info text-white',
      minimal: 'bg-background border border-border shadow-sm'
    };

    const hoverEffects = {
      lift: 'hover-lift',
      glow: 'hover-glow',
      scale: 'hover:scale-105',
      none: ''
    };

    return (
      <div
        ref={ref}
        className={cn(
          'p-6 rounded-xl transition-all duration-300',
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
      <div ref={ref} className={cn('mb-4', className)} {...props}>
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
          'heading-3 font-semibold',
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
      <p ref={ref} className={cn('text-muted-foreground body-regular', className)} {...props}>
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
      <div ref={ref} className={cn('space-y-4', className)} {...props}>
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
      <div ref={ref} className={cn('mt-6 flex items-center justify-between', className)} {...props}>
        {children}
      </div>
    );
  }
);

ModernCardFooter.displayName = 'ModernCardFooter';