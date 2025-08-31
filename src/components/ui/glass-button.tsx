import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { modernButtonVariants } from '@/lib/modern-button-variants';

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof modernButtonVariants> {
  asChild?: boolean;
}

/**
 * GlassButton - A modern button component with glassmorphism effect
 * This is the unified glassmorphism button component that consolidates all button methods
 * @param variant - Button appearance variant (defaults to 'glass')
 * @param size - Button size
 * @param effect - Hover effect (defaults to 'lift')
 * @param asChild - Whether to render as child
 */
const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = 'glass', size, effect = 'lift', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(
          modernButtonVariants({ variant, size, effect }),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
GlassButton.displayName = 'GlassButton';

// Specialized glass button components

export interface FloatingActionButtonProps extends GlassButtonProps {
  icon: React.ReactNode;
}

/**
 * FloatingActionButton - A floating action button with glassmorphism effect
 */
export function FloatingActionButton({ icon, className, ...props }: FloatingActionButtonProps) {
  return (
    <GlassButton
      variant="glass"
      size="icon"
      effect="glow"
      className={cn(
        'fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl floating',
        className
      )}
      {...props}
    >
      {icon}
    </GlassButton>
  );
}

export interface GradientGlassButtonProps extends GlassButtonProps {
  gradientType?: 'primary' | 'ocean' | 'sunset' | 'success' | 'warning' | 'danger' | 'info' | 'forest';
}

/**
 * GradientGlassButton - A glass button with gradient effect
 */
export function GradientGlassButton({ 
  gradientType = 'primary', 
  children, 
  className, 
  ...props 
}: GradientGlassButtonProps) {
  // Construct the variant based on gradient type
  const gradientVariant = `glass-gradient-${gradientType}` as 
    | 'glass-gradient-primary' 
    | 'glass-gradient-ocean' 
    | 'glass-gradient-sunset' 
    | 'glass-gradient-success' 
    | 'glass-gradient-warning' 
    | 'glass-gradient-danger' 
    | 'glass-gradient-info' 
    | 'glass-gradient-forest';
  
  return (
    <GlassButton
      variant={gradientVariant}
      effect="scale"
      className={cn('font-semibold', className)}
      {...props}
    >
      {children}
    </GlassButton>
  );
}

export { GlassButton };

// Alias for backward compatibility
export const GradientButton = GradientGlassButton;

export type NeomorphismButtonProps = GlassButtonProps;

/**
 * NeomorphismButton - A button with neomorphism effect
 */
export function NeomorphismButton({ children, className, ...props }: NeomorphismButtonProps) {
  return (
    <GlassButton
      variant="neomorphism"
      effect="none"
      className={className}
      {...props}
    >
      {children}
    </GlassButton>
  );
}