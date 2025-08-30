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
 * @param variant - Button appearance variant
 * @param size - Button size
 * @param effect - Hover effect
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

export { GlassButton };