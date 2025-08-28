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
  gradientType?: 'primary' | 'ocean' | 'sunset' | 'success';
}

/**
 * GradientButton - دکمه با گرادیانت رنگی
 */
export function GradientButton({ 
  gradientType = 'primary', 
  children, 
  className, 
  ...props 
}: GradientButtonProps) {
  const gradientVariant = `gradient-${gradientType}` as const;
  
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
      className={cn('backdrop-blur-md', className)}
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