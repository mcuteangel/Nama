import React from 'react';
import { cn } from '@/lib/utils';

export interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'neomorphism' | 'gradient-primary' | 'gradient-ocean' | 'gradient-sunset' | 'gradient-success' | 'gradient-info' | 'minimal';
  hover?: 'lift' | 'glow' | 'scale' | 'none';
  children: React.ReactNode;
}

/**
 * ModernCard - یک کامپوننت کارت مدرن با افکت‌های بصری مختلف
 * @param variant - نوع افکت بصری کارت
 * @param hover - نوع افکت hover
 * @param children - محتوای کارت
 * @param className - کلاس‌های اضافی CSS
 */
export function ModernCard({ 
  variant = 'glass', 
  hover = 'lift',
  children, 
  className,
  ...props 
}: ModernCardProps) {
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

export interface ModernCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ModernCardHeader({ children, className, ...props }: ModernCardHeaderProps) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export interface ModernCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  gradient?: boolean;
}

export function ModernCardTitle({ children, gradient = false, className, ...props }: ModernCardTitleProps) {
  return (
    <h3 
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

export interface ModernCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function ModernCardDescription({ children, className, ...props }: ModernCardDescriptionProps) {
  return (
    <p className={cn('text-muted-foreground body-regular', className)} {...props}>
      {children}
    </p>
  );
}

export interface ModernCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ModernCardContent({ children, className, ...props }: ModernCardContentProps) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {children}
    </div>
  );
}

export interface ModernCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ModernCardFooter({ children, className, ...props }: ModernCardFooterProps) {
  return (
    <div className={cn('mt-6 flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  );
}