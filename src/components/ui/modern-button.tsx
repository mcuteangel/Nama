import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { modernButtonVariants } from '@/lib/modern-button-variants';

export interface ModernButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof modernButtonVariants> {
  asChild?: boolean;
}

/**
 * ModernButton - یک کامپوننت دکمه مدرن با افکت‌های بصری پیشرفته
 * @param variant - نوع ظاهری دکمه
 * @param size - اندازه دکمه
 * @param effect - افکت hover دکمه
 * @param asChild - آیا به عنوان فرزند عمل کند
 */
const ModernButton = React.forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({ className, variant, size, effect, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(modernButtonVariants({ variant, size, effect, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
ModernButton.displayName = 'ModernButton';

// Export the ModernButton component
export { ModernButton };

// کامپوننت‌های خاص برای استفاده آسان‌تر

export interface FloatingActionButtonProps extends ModernButtonProps {
  icon: React.ReactNode;
}

/**
 * FloatingActionButton - دکمه شناور برای اکشن‌های اصلی
 */
export function FloatingActionButton({ icon, className, ...props }: FloatingActionButtonProps) {
  return (
    <ModernButton
      variant="gradient-primary"
      size="icon"
      effect="glow"
      className={cn(
        'fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl floating',
        className
      )}
      {...props}
    >
      {icon}
    </ModernButton>
  );
}

export interface GradientButtonProps extends ModernButtonProps {
  gradientType?: 'primary' | 'ocean' | 'sunset' | 'success' | 'warning' | 'danger' | 'info' | 'forest';
  styleVariant?: 'default' | 'glass' | '3d';
}

/**
 * GradientButton - دکمه با گرادیانت رنگی
 */
export function GradientButton({ 
  gradientType = 'primary', 
  styleVariant = 'default',
  children, 
  className, 
  ...props 
}: GradientButtonProps) {
  // Construct the variant based on gradient type and style
  let gradientVariant: 
    | 'gradient-primary' | 'gradient-ocean' | 'gradient-sunset' | 'gradient-success' | 'gradient-warning' | 'gradient-danger' | 'gradient-info' | 'gradient-forest'
    | 'glass-gradient-primary' | 'glass-gradient-ocean' | 'glass-gradient-sunset' | 'glass-gradient-success' | 'glass-gradient-warning' | 'glass-gradient-danger' | 'glass-gradient-info' | 'glass-gradient-forest'
    | '3d-gradient-primary' | '3d-gradient-ocean' | '3d-gradient-sunset' | '3d-gradient-success' | '3d-gradient-warning' | '3d-gradient-danger' | '3d-gradient-info' | '3d-gradient-forest';
  
  switch (styleVariant) {
    case 'glass':
      gradientVariant = `glass-gradient-${gradientType}` as 
        | 'glass-gradient-primary' | 'glass-gradient-ocean' | 'glass-gradient-sunset' | 'glass-gradient-success' | 'glass-gradient-warning' | 'glass-gradient-danger' | 'glass-gradient-info' | 'glass-gradient-forest';
      break;
    case '3d':
      gradientVariant = `3d-gradient-${gradientType}` as 
        | '3d-gradient-primary' | '3d-gradient-ocean' | '3d-gradient-sunset' | '3d-gradient-success' | '3d-gradient-warning' | '3d-gradient-danger' | '3d-gradient-info' | '3d-gradient-forest';
      break;
    default:
      gradientVariant = `gradient-${gradientType}` as 
        | 'gradient-primary' | 'gradient-ocean' | 'gradient-sunset' | 'gradient-success' | 'gradient-warning' | 'gradient-danger' | 'gradient-info' | 'gradient-forest';
  }
  
  return (
    <ModernButton
      variant={gradientVariant}
      effect="scale"
      className={cn('font-semibold', className)}
      {...props}
    >
      {children}
    </ModernButton>
  );
}

export type GlassButtonProps = ModernButtonProps;

/**
 * GlassButton - دکمه با افکت شیشه‌ای
 */
export function GlassButton({ children, className, ...props }: GlassButtonProps) {
  return (
    <ModernButton
      variant="glass"
      effect="lift"
      className={className}
      {...props}
    >
      {children}
    </ModernButton>
  );
}

export type NeomorphismButtonProps = ModernButtonProps;

/**
 * NeomorphismButton - دکمه با افکت نئومورفیسم
 */
export function NeomorphismButton({ children, className, ...props }: NeomorphismButtonProps) {
  return (
    <ModernButton
      variant="neomorphism"
      effect="none"
      className={className}
      {...props}
    >
      {children}
    </ModernButton>
  );
}