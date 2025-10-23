import React from 'react';
import { cn } from '@/lib/utils';

export interface ModernGridProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'auto' | 'masonry' | 'flex' | 'staggered' | 'dynamic';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
  cols?: number;
  minWidth?: string;
  children: React.ReactNode;
}

/**
 * ModernGrid - سیستم Grid مدرن و responsive
 * @param variant - نوع Grid (auto-fit, masonry, flex, staggered, dynamic)
 * @param size - اندازه minimum width برای آیتم‌ها
 * @param gap - فاصله بین آیتم‌ها
 * @param padding - padding کانتینر
 * @param cols - تعداد ستون‌ها برای dynamic grid
 * @param minWidth - حداقل عرض آیتم‌ها برای dynamic grid
 * @param children - آیتم‌های Grid
 */
export function ModernGrid({
  variant = 'auto',
  size = 'md',
  gap = 'md',
  padding = 'md',
  cols,
  minWidth = '300px',
  children,
  className,
  style,
  ...props
}: ModernGridProps) {
  const variants = {
    auto: `grid-cols-auto-${size}`,
    masonry: 'masonry-grid',
    flex: 'flex-grid',
    staggered: 'staggered-grid',
    dynamic: 'dynamic-grid'
  };

  const gaps = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12'
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12'
  };

  const dynamicStyle = variant === 'dynamic' ? {
    '--grid-cols': cols || 'auto-fit',
    '--grid-min-width': minWidth,
    '--grid-gap': gap === 'sm' ? '1rem' : gap === 'md' ? '1.5rem' : gap === 'lg' ? '2rem' : '3rem',
    '--grid-padding': padding === 'sm' ? '1rem' : padding === 'md' ? '1.5rem' : padding === 'lg' ? '2rem' : padding === 'xl' ? '3rem' : '0',
    ...style
  } : style;

  return (
    <div
      className={cn(
        'grid',
        variant !== 'dynamic' && variants[variant],
        variant === 'dynamic' && 'dynamic-grid',
        variant !== 'masonry' && variant !== 'flex' && variant !== 'dynamic' && gaps[gap],
        variant !== 'masonry' && variant !== 'flex' && variant !== 'dynamic' && paddings[padding],
        className
      )}
      style={dynamicStyle}
      {...props}
    >
      {children}
    </div>
  );
}

export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6;
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
}

/**
 * GridItem - آیتم Grid با قابلیت تنظیم colspan و rowspan
 */
export function GridItem({
  colSpan,
  rowSpan,
  children,
  className,
  style,
  ...props
}: GridItemProps) {
  const colSpanClass = colSpan ? `col-span-${colSpan}` : '';
  const rowSpanClass = rowSpan ? `row-span-${rowSpan}` : '';

  return (
    <div
      className={cn(colSpanClass, rowSpanClass, className)}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

export interface MasonryGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4 | 5;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

/**
 * MasonryGrid - Grid masonry برای لایوت Pinterest-style
 */
export function MasonryGrid({
  columns = 3,
  gap = 'md',
  children,
  className,
  style,
  ...props
}: MasonryGridProps) {
  const gapValues = {
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem'
  };

  const masonryStyle = {
    columns: columns,
    columnGap: gapValues[gap],
    columnFill: 'balance' as const,
    ...style
  };

  return (
    <div
      className={cn('masonry-grid', className)}
      style={masonryStyle}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <div key={index} style={{ breakInside: 'avoid', marginBottom: gapValues[gap] }}>
          {child}
        </div>
      ))}
    </div>
  );
}

export interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  breakpoints?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  children: React.ReactNode;
}

/**
 * ResponsiveGrid - Grid responsive با breakpoint‌های سفارشی
 */
export function ResponsiveGrid({
  breakpoints = { sm: 1, md: 2, lg: 3, xl: 4 },
  children,
  className,
  ...props
}: ResponsiveGridProps) {
  const responsiveClasses = [
    `grid-cols-${breakpoints.sm || 1}`,
    `md:grid-cols-${breakpoints.md || 2}`,
    `lg:grid-cols-${breakpoints.lg || 3}`,
    `xl:grid-cols-${breakpoints.xl || 4}`
  ].join(' ');

  return (
    <div
      className={cn('grid gap-4 items-stretch', responsiveClasses, className)}
      {...props}
    >
      {children}
    </div>
  );
}