import React from 'react';
import { cn } from '@/lib/utils';

export interface ModernLoaderProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'ring';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'accent' | 'muted';
  className?: string;
}

/**
 * ModernLoader - کامپوننت لودر مدرن با انیمیشن‌های مختلف
 * @param variant - نوع انیمیشن لودر
 * @param size - اندازه لودر
 * @param color - رنگ لودر
 * @param className - کلاس‌های اضافی CSS
 */
export function ModernLoader({ 
  variant = 'spinner', 
  size = 'md', 
  color = 'primary',
  className 
}: ModernLoaderProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'primary',
    secondary: 'secondary',
    accent: 'accent',
    muted: 'muted-foreground'
  };

  if (variant === 'spinner') {
    return (
      <div 
        className={cn(
          'animate-spin rounded-full border-2 border-transparent',
          sizes[size],
          `border-t-${colorClasses[color]}`,
          className
        )}
        role="status"
        aria-label="در حال بارگذاری"
      >
        <span className="sr-only">در حال بارگذاری...</span>
      </div>
    );
  }

  if (variant === 'dots') {
    const dotSize = size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4';
    
    return (
      <div className={cn('flex space-x-1', className)} role="status" aria-label="در حال بارگذاری">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'rounded-full animate-pulse',
              dotSize,
              `bg-${colorClasses[color]}`
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1.4s'
            }}
          />
        ))}
        <span className="sr-only">در حال بارگذاری...</span>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div 
        className={cn(
          'rounded-full animate-pulse',
          sizes[size],
          `bg-${colorClasses[color]}`,
          className
        )}
        role="status"
        aria-label="در حال بارگذاری"
      >
        <span className="sr-only">در حال بارگذاری...</span>
      </div>
    );
  }

  if (variant === 'bars') {
    const barHeight = size === 'sm' ? 'h-3' : size === 'md' ? 'h-6' : size === 'lg' ? 'h-9' : 'h-12';
    
    return (
      <div className={cn('flex items-end space-x-1', className)} role="status" aria-label="در حال بارگذاری">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'w-1 animate-pulse',
              barHeight,
              `bg-${colorClasses[color]}`
            )}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '1s'
            }}
          />
        ))}
        <span className="sr-only">در حال بارگذاری...</span>
      </div>
    );
  }

  if (variant === 'ring') {
    return (
      <div 
        className={cn(
          'relative animate-spin',
          sizes[size],
          className
        )}
        role="status"
        aria-label="در حال بارگذاری"
      >
        <div 
          className={cn(
            'absolute inset-0 rounded-full border-2 border-transparent',
            `border-t-${colorClasses[color]}`,
            `border-r-${colorClasses[color]}`
          )}
        />
        <span className="sr-only">در حال بارگذاری...</span>
      </div>
    );
  }

  return null;
}

export interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  loaderProps?: ModernLoaderProps;
  overlayClassName?: string;
}

/**
 * LoadingOverlay - کامپوننت overlay برای نمایش حالت بارگذاری
 */
export function LoadingOverlay({ 
  isLoading, 
  children, 
  loaderProps = {},
  overlayClassName 
}: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div 
          className={cn(
            'absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg',
            overlayClassName
          )}
        >
          <ModernLoader {...loaderProps} />
        </div>
      )}
    </div>
  );
}

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

/**
 * Skeleton - کامپوننت اسکلتون برای نمایش placeholder
 */
export function Skeleton({ 
  className, 
  variant = 'rectangular',
  width,
  height,
  lines = 1,
  ...props 
}: SkeletonProps) {
  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'animate-pulse bg-muted rounded',
              i === lines - 1 ? 'w-3/4' : 'w-full',
              'h-4',
              className
            )}
            style={{ 
              width: i === lines - 1 ? '75%' : width,
              height: height || '1rem'
            }}
            {...props}
          />
        ))}
      </div>
    );
  }

  const variants = {
    text: 'h-4 w-full',
    circular: 'rounded-full aspect-square',
    rectangular: 'rounded'
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-muted',
        variants[variant],
        className
      )}
      style={{ width, height }}
      {...props}
    />
  );
}